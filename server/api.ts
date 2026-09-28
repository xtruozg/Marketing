import express, { Router } from 'express';
import { User, Transaction, Bet, Room, SystemState } from './models';
import {
  signToken,
  requireAuth,
  requireAdmin,
  sanitizeUser,
  type AuthedRequest,
} from './auth';
import { generatePeriodNumber, secondsRemaining } from './engine';

const CATEGORIES = ['Tăng tương tác', 'Tăng doanh số', 'Quảng bá sản phẩm', 'Thu hút đầu tư'];

const isUppercaseNoAccent = (str: string) => /^[A-Z\s]+$/.test(str);
const genId = (p: string) => `${p}-` + Math.floor(100000 + Math.random() * 900000);

function currentPeriods() {
  return {
    Facebook: generatePeriodNumber('Facebook'),
    Youtube: generatePeriodNumber('Youtube'),
  };
}

async function buildRoomsView() {
  const rooms = await Room.find({}).lean();
  const secs = secondsRemaining();
  const view = rooms.map((r) => ({
    id: r.id,
    name: r.name,
    icon: r.icon,
    cycle: r.cycle,
    currentCycle: secs,
    session: generatePeriodNumber(r.name),
  }));
  const periodsHistory: Record<string, any[]> = {};
  rooms.forEach((r) => {
    periodsHistory[r.name] = r.periodsHistory || [];
  });
  return { rooms: view, periodsHistory };
}

export function createApiRouter(): Router {
  const router = express.Router();
  router.use(express.json({ limit: '8mb' }));

  /* ============================ AUTH ============================ */
  router.post('/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body || {};
      if (!username || !password) return res.status(400).json({ message: 'Thiếu thông tin đăng nhập!' });

      const user = await User.findOne({ username }).lean();
      if (!user) return res.status(404).json({ message: 'Tên đăng nhập không tồn tại!' });
      if (user.password !== password) return res.status(401).json({ message: 'Mật khẩu không chính xác!' });
      if (user.isLocked && user.role !== 'admin')
        return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!' });

      await User.updateOne({ username }, { $set: { lastActive: new Date().toISOString() } });
      const token = signToken({ username: user.username, role: user.role });
      return res.json({ token, role: user.role, user: sanitizeUser(user) });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi kết nối máy chủ!' });
    }
  });

  router.post('/auth/register', async (req, res) => {
    try {
      const { phone, fullName, password, refCode } = req.body || {};
      const cleanPhone = String(phone || '').trim();
      if (!cleanPhone || !fullName || !password)
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin!' });

      const exists = await User.findOne({ username: cleanPhone }).lean();
      if (exists) return res.status(409).json({ message: 'Số điện thoại này đã được đăng ký!' });

      const newId = String(Math.floor(1000 + Math.random() * 9000));
      const created = await User.create({
        username: cleanPhone,
        fullName: String(fullName).trim(),
        phone: cleanPhone,
        id: newId,
        balance: 0,
        password,
        role: 'user',
        status: 'active',
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        referralCode: refCode || '',
        accumulatedSupport: 0,
        accumulatedInterest: 0,
        accumulatedWins: 0,
        accumulationCount: 0,
        isLocked: false,
        lastActive: new Date().toISOString(),
      });
      const token = signToken({ username: created.username, role: 'user' });
      return res.json({ token, role: 'user', user: sanitizeUser(created.toObject()) });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi kết nối máy chủ khi đăng ký!' });
    }
  });

  router.post('/auth/change-password', requireAuth, async (req: AuthedRequest, res) => {
    const { oldPassword, newPassword } = req.body || {};
    const u = req.authUser;
    if (u.password !== oldPassword) return res.status(400).json({ message: 'Mật khẩu cũ không đúng!' });
    await User.updateOne({ username: u.username }, { $set: { password: newPassword } });
    return res.json({ message: 'Đổi mật khẩu thành công!' });
  });

  /* ============================ CLIENT STATE (polling) ============================ */
  router.get('/state', requireAuth, async (req: AuthedRequest, res) => {
    const username = req.authUser.username;
    const [user, bets, transactions, roomsView] = await Promise.all([
      User.findOne({ username }).lean(),
      Bet.find({ username }).sort({ timestamp: -1 }).lean(),
      Transaction.find({ username }).sort({ timestamp: -1 }).lean(),
      buildRoomsView(),
    ]);
    if (!user) return res.status(401).json({ message: 'Tài khoản không tồn tại!' });
    if (user.isLocked) return res.status(403).json({ locked: true, message: 'Tài khoản đã bị khóa!' });

    return res.json({
      user: sanitizeUser(user),
      bets,
      transactions,
      rooms: roomsView.rooms,
      periodsHistory: roomsView.periodsHistory,
      secondsRemaining: secondsRemaining(),
      currentPeriod: currentPeriods(),
      serverTime: new Date().toISOString(),
    });
  });

  /* ============================ PROFILE ============================ */
  router.post('/me/bank', requireAuth, async (req: AuthedRequest, res) => {
    const { bankName, accountNumber, accountHolder } = req.body || {};
    const cleanHolder = String(accountHolder || '')
      .toUpperCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/Đ/g, 'D')
      .trim();
    await User.updateOne(
      { username: req.authUser.username },
      { $set: { bankName: String(bankName || '').trim(), accountNumber: String(accountNumber || '').trim(), accountHolder: cleanHolder } }
    );
    return res.json({ message: 'Liên kết tài khoản ngân hàng thành công!' });
  });

  router.post('/me/avatar', requireAuth, async (req: AuthedRequest, res) => {
    const { avatarUrl } = req.body || {};
    await User.updateOne({ username: req.authUser.username }, { $set: { avatarUrl } });
    return res.json({ message: 'Cập nhật ảnh đại diện thành công!' });
  });

  /* ============================ BETTING ============================ */
  router.post('/bets', requireAuth, async (req: AuthedRequest, res) => {
    const { room, choice, amount, bets } = req.body || {};
    if (secondsRemaining() <= 3)
      return res.status(400).json({ message: 'Đã khóa cổng đặt cược phiên này! Vui lòng chờ phiên sau.' });

    const user = await User.findOne({ username: req.authUser.username });
    if (!user) return res.status(401).json({ message: 'Vui lòng đăng nhập lại!' });

    const list: { choice: string; amount: number }[] =
      Array.isArray(bets) && bets.length > 0 ? bets : choice && amount ? [{ choice, amount }] : [];
    if (list.length === 0) return res.status(400).json({ message: 'Vui lòng chọn hạng mục và số tiền!' });
    for (const b of list) {
      if (!CATEGORIES.includes(b.choice) || !(b.amount > 0))
        return res.status(400).json({ message: 'Dữ liệu cược không hợp lệ!' });
    }

    const total = list.reduce((s, b) => s + b.amount, 0);
    if (user.balance < total) return res.status(400).json({ message: 'Số dư tài khoản không đủ để đặt cược!' });

    const activePeriod = generatePeriodNumber(room);
    const timestamp = new Date().toISOString();

    user.balance -= total;
    await user.save();

    const docs = list.map((b) => ({
      id: genId('B'),
      room,
      period: activePeriod,
      choice: b.choice,
      amount: b.amount,
      result: 'Chờ kết quả',
      payout: 0,
      timestamp,
      username: user.username,
      fullName: user.fullName,
    }));
    await Bet.insertMany(docs);
    return res.json({ message: 'Đặt cược thành công!' });
  });

  /* ============================ DEPOSIT / WITHDRAW ============================ */
  router.post('/deposit', requireAuth, async (req: AuthedRequest, res) => {
    const { amount } = req.body || {};
    if (!(amount >= 100000)) return res.status(400).json({ message: 'Số tiền nạp tối thiểu là 100.000đ!' });
    const u = req.authUser;
    await Transaction.create({
      id: genId('DP'),
      username: u.username,
      fullName: u.fullName,
      type: 'Nạp tiền',
      amount,
      status: 'Đang xử lý',
      timestamp: new Date().toISOString(),
      details: 'Gửi yêu cầu nạp tiền hệ thống',
    });
    return res.json({ message: 'Đã gửi lệnh nạp tiền! Vui lòng chuyển khoản và chờ hệ thống duyệt.' });
  });

  router.post('/withdraw', requireAuth, async (req: AuthedRequest, res) => {
    const { amount, bankName, accountNumber, accountHolder } = req.body || {};
    if (!(amount >= 200000)) return res.status(400).json({ message: 'Hạn mức rút tiền tối thiểu là 200,000đ!' });
    if (!isUppercaseNoAccent(String(accountHolder || '')))
      return res.status(400).json({
        message: 'Tên chủ tài khoản bắt buộc viết bằng CHỮ IN HOA KHÔNG DẤU (Ví dụ: NGUYEN VAN A)!',
      });

    const user = await User.findOne({ username: req.authUser.username });
    if (!user) return res.status(401).json({ message: 'Vui lòng đăng nhập lại!' });
    if (user.balance < amount) return res.status(400).json({ message: 'Số dư tài khoản không đủ để rút!' });

    // Khấu trừ ngay khi tạo yêu cầu (chuyển vào danh sách chờ admin duyệt)
    user.balance -= amount;
    await user.save();

    await Transaction.create({
      id: genId('WR'),
      username: user.username,
      fullName: user.fullName,
      type: 'Rút tiền',
      amount,
      status: 'Đang xử lý',
      timestamp: new Date().toISOString(),
      details: `Rút về: ${String(bankName).trim()} - ${String(accountNumber).trim()} - ${String(accountHolder).toUpperCase().trim()}`,
    });
    return res.json({ success: true, message: 'Gửi lệnh rút tiền thành công! Hệ thống đang xử lý.' });
  });

  /* ================================================================= */
  /* ============================== ADMIN ============================ */
  /* ================================================================= */
  router.post('/admin/login', async (req, res) => {
    const { password } = req.body || {};
    const admin = await User.findOne({ username: 'admin' }).lean();
    if (!admin || admin.password !== password)
      return res.status(401).json({ success: false, message: 'Mật khẩu quản trị viên không chính xác!' });
    const token = signToken({ username: 'admin', role: 'admin' });
    return res.json({ success: true, token, message: 'Đăng nhập thành công' });
  });

  // Đổi mật khẩu quản trị viên
  router.post('/admin/change-password', requireAdmin, async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin mật khẩu!' });
    if (String(newPassword).length < 6)
      return res.status(400).json({ message: 'Mật khẩu mới phải có tối thiểu 6 kí tự!' });
    const admin = await User.findOne({ username: 'admin' });
    if (!admin) return res.status(404).json({ message: 'Không tìm thấy tài khoản quản trị!' });
    if (admin.password !== currentPassword)
      return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác!' });
    admin.password = String(newPassword);
    await admin.save();
    return res.json({ success: true, message: 'Đổi mật khẩu quản trị thành công!' });
  });

  router.get('/admin/state', requireAdmin, async (_req, res) => {
    const [users, transactions, bets, rooms, sys] = await Promise.all([
      User.find({}).lean(),
      Transaction.find({}).lean(),
      Bet.find({}).lean(),
      Room.find({}).lean(),
      SystemState.findById('state').lean(),
    ]);

    transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const accounts: Record<string, any> = {};
    users.forEach((usr) => {
      accounts[usr.username] = {
        profile: usr,
        password: usr.password || '',
        bets: bets.filter((b) => b.username === usr.username),
        transactions: transactions.filter((t) => t.username === usr.username),
      };
    });

    const roomsView = rooms.map((r) => ({
      id: r.id,
      name: r.name,
      icon: r.icon,
      cycle: r.cycle,
      currentCycle: secondsRemaining(),
      session: generatePeriodNumber(r.name),
      forcedNextResult: r.forcedNextResult || null,
    }));

    return res.json({
      accounts,
      allTransactions: transactions,
      rooms: roomsView,
      globalForcedResult: sys?.forcedNextResult || null,
      secondsRemaining: secondsRemaining(),
      currentPeriod: currentPeriods(),
    });
  });

  // Duyệt / từ chối giao dịch
  router.post('/admin/transactions/:id', requireAdmin, async (req, res) => {
    const { action } = req.body || {};
    const tx = await Transaction.findOne({ id: req.params.id });
    if (!tx) return res.status(404).json({ message: 'Giao dịch không tồn tại!' });
    if (tx.status !== 'Đang xử lý') return res.status(400).json({ message: 'Giao dịch này đã được xử lý từ trước!' });

    if (action === 'approve') {
      if (tx.type === 'Nạp tiền') {
        await User.updateOne(
          { username: tx.username },
          { $inc: { balance: tx.amount, accumulatedSupport: tx.amount } }
        );
      }
      tx.status = 'Thành công';
    } else {
      // Từ chối: hoàn tiền cho lệnh rút (đã bị trừ trước đó)
      if (tx.type === 'Rút tiền') {
        await User.updateOne({ username: tx.username }, { $inc: { balance: tx.amount } });
      }
      tx.status = 'Thất bại';
    }
    await tx.save();
    return res.json({ message: action === 'approve' ? 'Đã duyệt yêu cầu thành công!' : 'Đã từ chối giao dịch thành công!' });
  });

  // Điều chỉnh số dư trực tiếp
  router.post('/admin/users/:username/balance', requireAdmin, async (req, res) => {
    const { amount, isAddition } = req.body || {};
    const inc = isAddition ? Number(amount) : -Number(amount);
    const r = await User.updateOne({ username: req.params.username }, { $inc: { balance: inc } });
    if (r.matchedCount === 0) return res.status(404).json({ message: 'Không tìm thấy tài khoản!' });
    return res.json({ message: `Đã ${isAddition ? 'cộng' : 'trừ'} số dư thành công!` });
  });

  // Cập nhật hồ sơ thành viên
  router.put('/admin/users/:username', requireAdmin, async (req, res) => {
    const { updates, password } = req.body || {};
    const payload: any = { ...(updates || {}) };
    if (password) payload.password = password;
    delete payload.username; // không cho đổi khóa chính
    const r = await User.updateOne({ username: req.params.username }, { $set: payload });
    if (r.matchedCount === 0) return res.status(404).json({ message: 'Không tìm thấy tài khoản!' });
    return res.json({ message: 'Cập nhật thông tin thành viên thành công!' });
  });

  // Xóa tài khoản (trừ admin)
  router.delete('/admin/users/:username', requireAdmin, async (req, res) => {
    if (req.params.username === 'admin') return res.status(400).json({ message: 'Không thể xóa tài khoản admin chính!' });
    // Xóa kèm lịch sử để user mới đăng ký trùng username không nhận lại dữ liệu cũ
    await Transaction.deleteMany({ username: req.params.username });
    await Bet.deleteMany({ username: req.params.username });
    await User.deleteOne({ username: req.params.username });
    return res.json({ message: `Đã xóa tài khoản @${req.params.username} thành công!` });
  });

  // Tạo thành viên mới trực tiếp từ trang quản trị
  router.post('/admin/users', requireAdmin, async (req, res) => {
    const { username, password, fullName, phone, bankName, accountNumber, accountHolder, initialBalance } =
      req.body || {};
    const uname = String(username || '').trim().toLowerCase();
    if (!uname) return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập / số điện thoại!' });

    const exists = await User.findOne({ username: uname }).lean();
    if (exists) return res.status(409).json({ message: 'Tài khoản này đã tồn tại trên hệ thống!' });

    const bal = Math.max(0, Number(initialBalance) || 0);
    const holder = String(accountHolder || '').toUpperCase().trim();
    const created = await User.create({
      username: uname,
      fullName: String(fullName || '').trim(),
      phone: String(phone || uname).trim(),
      id: String(Math.floor(1000 + Math.random() * 9000)),
      balance: bal,
      password: password || uname,
      role: 'user',
      status: 'active',
      bankName: String(bankName || '').trim(),
      accountNumber: String(accountNumber || '').trim(),
      accountHolder: holder,
      referralCode: '',
      accumulatedSupport: bal,
      accumulatedInterest: 0,
      accumulatedWins: 0,
      accumulationCount: 0,
      isLocked: false,
      lastActive: new Date().toISOString(),
    });

    // Ghi nhận giao dịch nạp khởi tạo nếu có số dư ban đầu
    if (bal > 0) {
      await Transaction.create({
        id: genId('DP'),
        username: uname,
        fullName: created.fullName,
        type: 'Nạp tiền',
        amount: bal,
        status: 'Thành công',
        timestamp: new Date().toISOString(),
        details: 'Quản trị viên tạo tài khoản kèm số dư khởi tạo',
      });
    }

    return res.json({ message: 'Đã tạo thành viên mới thành công!', user: sanitizeUser(created.toObject()) });
  });

  // Ép kết quả kỳ sau cho 1 phòng
  router.post('/admin/force-room', requireAdmin, async (req, res) => {
    const { room, category } = req.body || {};
    await Room.updateOne({ name: room }, { $set: { forcedNextResult: category || null } });
    return res.json({ message: category ? `Đã gán kết quả kỳ sau phòng ${room}: ${category}` : `Đã hủy can thiệp phòng ${room}` });
  });

  // Bẻ cầu toàn hệ thống
  router.post('/admin/force-global', requireAdmin, async (req, res) => {
    const { result } = req.body || {}; // 'TAI' | 'XIU' | null
    await SystemState.updateOne({ _id: 'state' }, { $set: { forcedNextResult: result || null } }, { upsert: true });
    return res.json({ message: result ? `Đã bẻ cầu toàn hệ thống về [${result}]!` : 'Đã hủy can thiệp bẻ cầu toàn hệ thống' });
  });

  // Tạo phòng
  router.post('/admin/rooms', requireAdmin, async (req, res) => {
    const { name, cycle, icon } = req.body || {};
    if (!name) return res.status(400).json({ message: 'Thiếu tên phòng!' });
    const exists = await Room.findOne({ name }).lean();
    if (exists) return res.status(409).json({ message: 'Tên phòng đã tồn tại!' });
    await Room.create({
      name,
      id: '#' + Math.floor(10 + Math.random() * 90),
      icon: icon || 'thumb_up',
      cycle: Number(cycle) || 60,
      forcedNextResult: null,
      periodsHistory: [{ period: generatePeriodNumber(name, -60), result: 'Tăng doanh số' }],
    });
    return res.json({ message: 'Đã tạo phòng chơi mới thành công!' });
  });

  // Cập nhật phòng (theo tên)
  router.put('/admin/rooms/:id', requireAdmin, async (req, res) => {
    const { name, cycle, icon } = req.body || {};
    const key = name || req.params.id;
    const set: any = {};
    if (cycle !== undefined) set.cycle = Number(cycle);
    if (icon !== undefined) set.icon = icon;
    await Room.updateOne({ name: key }, { $set: set });
    return res.json({ message: 'Cập nhật phòng chơi thành công!' });
  });

  // Xóa phòng (theo tên hoặc id)
  router.delete('/admin/rooms/:id', requireAdmin, async (req, res) => {
    await Room.deleteOne({ $or: [{ name: req.params.id }, { id: req.params.id }] });
    return res.json({ message: 'Đã xóa phòng chơi thành công!' });
  });

  // Dọn dẹp
  router.delete('/admin/bets', requireAdmin, async (_req, res) => {
    await Bet.deleteMany({});
    return res.json({ message: 'Đã xóa sạch toàn bộ lịch sử cược!' });
  });
  router.delete('/admin/transactions', requireAdmin, async (_req, res) => {
    await Transaction.deleteMany({});
    return res.json({ message: 'Đã xóa sạch toàn bộ sao kê nạp rút!' });
  });

  // Giả lập nạp/rút
  router.post('/admin/simulate-deposit', requireAdmin, async (req, res) => {
    const { targetUsername, amount, txCode, phone } = req.body || {};
    const u = await User.findOne({ username: targetUsername }).lean();
    const fullName = u ? u.fullName : 'Khách vãng lai';
    await Transaction.create({
      id: genId('DP'),
      username: targetUsername,
      fullName,
      type: 'Nạp tiền',
      amount: Number(amount),
      status: 'Đang xử lý',
      timestamp: new Date().toISOString(),
      details: `Simulated: Mã chuyển khoản ${txCode}, sđt ${phone}`,
    });
    return res.json({ message: `Đã gửi lệnh nạp giả định cho @${targetUsername}!` });
  });

  router.post('/admin/simulate-withdraw', requireAdmin, async (req, res) => {
    const { targetUsername, amount, bankName, accountNumber, accountOwner } = req.body || {};
    const user = await User.findOne({ username: targetUsername });
    const fullName = user ? user.fullName : 'Khách vãng lai';
    if (user) {
      user.balance -= Number(amount);
      await user.save();
    }
    await Transaction.create({
      id: genId('WR'),
      username: targetUsername,
      fullName,
      type: 'Rút tiền',
      amount: Number(amount),
      status: 'Đang xử lý',
      timestamp: new Date().toISOString(),
      details: `Simulated: Rút về ${bankName} (${accountNumber}) - CHỦ: ${accountOwner}`,
    });
    return res.json({ message: `Đã gửi lệnh rút giả định cho @${targetUsername}!` });
  });

  return router;
}
