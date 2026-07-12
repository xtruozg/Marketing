import { User, Transaction, Bet, Room, SystemState } from './models';

export type BetCategory = 'Tăng tương tác' | 'Tăng doanh số' | 'Quảng bá sản phẩm' | 'Thu hút đầu tư';

const ALL_CATEGORIES: BetCategory[] = ['Tăng tương tác', 'Tăng doanh số', 'Quảng bá sản phẩm', 'Thu hút đầu tư'];
const TAI_CATEGORIES: BetCategory[] = ['Tăng tương tác', 'Tăng doanh số'];
const XIU_CATEGORIES: BetCategory[] = ['Quảng bá sản phẩm', 'Thu hút đầu tư'];

export const PAYOUT_RATE = 1.3;

/**
 * Sinh mã kỳ theo mốc thời gian phút (đồng bộ với giao diện hiện tại).
 * Giữ nguyên đúng thuật toán frontend: YYYYMMDDHHmm + roomCode.
 */
export function generatePeriodNumber(room: string, offsetSec = 0): string {
  const now = new Date();
  now.setSeconds(now.getSeconds() + offsetSec);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const roomCode = room === 'Facebook' ? '1' : '2';
  return `${year}${month}${day}${hh}${mm}${roomCode}`;
}

/** Số giây còn lại của kỳ hiện tại (đồng bộ đồng hồ hệ thống, khớp giao diện) */
export function secondsRemaining(): number {
  return 59 - (new Date().getSeconds() % 60);
}

function genTxId(prefix: string) {
  return `${prefix}-` + Math.floor(100000 + Math.random() * 900000);
}

/** Khởi tạo tài khoản admin + phòng mặc định nếu chưa có */
export async function seedSystem() {
  const adminExists = await User.findOne({ username: 'admin' }).lean();
  if (!adminExists) {
    await User.create({
      username: 'admin',
      fullName: 'Quản Trị Viên Hệ Thống',
      id: '1000',
      balance: 999999999,
      phone: '0999999999',
      bankName: 'Hệ Thống',
      accountNumber: 'ADMIN_VTEC',
      accountHolder: 'VTEC GLOBAL',
      referralCode: '',
      accumulatedSupport: 0,
      accumulatedInterest: 0,
      accumulatedWins: 0,
      accumulationCount: 0,
      isLocked: false,
      password: 'admin',
      role: 'admin',
      status: 'active',
      lastActive: new Date().toISOString(),
    });
    console.log('[SEED] Đã tạo tài khoản admin (admin/admin)');
  }

  const defaults = [
    { name: 'Facebook', id: '#3', icon: 'thumb_up' },
    { name: 'Youtube', id: '#4', icon: 'smart_display' },
  ];
  for (const rm of defaults) {
    const exists = await Room.findOne({ name: rm.name }).lean();
    if (!exists) {
      await Room.create({
        name: rm.name,
        id: rm.id,
        icon: rm.icon,
        cycle: 60,
        forcedNextResult: null,
        periodsHistory: [
          { period: generatePeriodNumber(rm.name, -60), result: 'Tăng doanh số' },
          { period: generatePeriodNumber(rm.name, -120), result: 'Tăng tương tác' },
          { period: generatePeriodNumber(rm.name, -180), result: 'Thu hút đầu tư' },
        ],
      });
    }
  }

  const sys = await SystemState.findById('state').lean();
  if (!sys) await SystemState.create({ _id: 'state', forcedNextResult: null });
}

/** Chọn kết quả thắng dựa trên ép của admin (global > room) hoặc ngẫu nhiên */
function decideWinningCategory(globalForced: string | null, roomForced: string | null): BetCategory {
  const finalForced = globalForced || roomForced;
  if (finalForced === 'TAI' || finalForced === 'Tài') {
    return TAI_CATEGORIES[Math.floor(Math.random() * TAI_CATEGORIES.length)];
  }
  if (finalForced === 'XIU' || finalForced === 'Xỉu') {
    return XIU_CATEGORIES[Math.floor(Math.random() * XIU_CATEGORIES.length)];
  }
  if (finalForced && ALL_CATEGORIES.includes(finalForced as BetCategory)) {
    return finalForced as BetCategory;
  }
  return ALL_CATEGORIES[Math.floor(Math.random() * ALL_CATEGORIES.length)];
}

/**
 * Quyết toán toàn bộ phòng cho kỳ vừa kết thúc.
 * Đây là bộ máy AUTHORITATIVE: chỉ chạy trên server, đảm bảo đồng bộ tuyệt đối.
 */
export async function settleAllRooms() {
  const rooms = await Room.find({}).lean();
  const sys = await SystemState.findById('state').lean();
  const globalForced: string | null = sys?.forcedNextResult || null;
  let globalConsumed = false;

  for (const room of rooms) {
    try {
      const name = room.name;
      const activePeriod = generatePeriodNumber(name, -5); // kỳ vừa kết thúc

      const roomForced: string | null = room.forcedNextResult || null;
      const winningCategory = decideWinningCategory(globalForced, roomForced);

      // Lưu lịch sử kỳ (tránh trùng), giữ tối đa 15 kỳ gần nhất
      let history = Array.isArray(room.periodsHistory) ? room.periodsHistory : [];
      if (!history.some((h: any) => h.period === activePeriod)) {
        history = [{ period: activePeriod, result: winningCategory }, ...history].slice(0, 15);
      }
      await Room.updateOne(
        { name },
        { $set: { periodsHistory: history, forcedNextResult: null } }
      );
      if (globalForced) globalConsumed = true;

      // Quyết toán mọi vé đang chờ của kỳ này
      const pendingBets = await Bet.find({ room: name, period: activePeriod, result: 'Chờ kết quả' });
      for (const bet of pendingBets) {
        const isWin = bet.choice === winningCategory;
        const payout = isWin ? Math.floor(bet.amount * PAYOUT_RATE) : 0;
        bet.result = isWin ? 'Thắng' : 'Thua';
        bet.payout = payout;
        await bet.save();

        if (isWin) {
          await User.updateOne(
            { username: bet.username },
            {
              $inc: {
                balance: payout,
                accumulatedWins: payout,
                accumulationCount: 1,
              },
            }
          );
          const txId = genTxId('WT');
          await Transaction.create({
            id: txId,
            username: bet.username,
            fullName: bet.fullName || '',
            type: 'Tiền thắng cược',
            amount: payout,
            status: 'Thành công',
            timestamp: new Date().toISOString(),
            details: `Thắng cược phòng ${name} kỳ ${activePeriod} (${winningCategory})`,
          });
        }
      }
    } catch (err) {
      console.error(`[ENGINE] Lỗi quyết toán phòng ${room.name}:`, err);
    }
  }

  // Xóa ép toàn hệ thống sau khi đã áp dụng
  if (globalForced && globalConsumed) {
    await SystemState.updateOne({ _id: 'state' }, { $set: { forcedNextResult: null } });
  }
}

let engineStarted = false;

/**
 * Khởi động vòng lặp nền: mỗi giây kiểm tra mốc phút.
 * Khi đồng hồ đếm ngược về 0 (chuyển phút) -> quyết toán kỳ vừa kết thúc.
 */
export function startEngine() {
  if (engineStarted) return;
  engineStarted = true;

  let lastMinute = new Date().getMinutes();
  let settling = false;

  setInterval(async () => {
    const nowMin = new Date().getMinutes();
    if (nowMin !== lastMinute) {
      lastMinute = nowMin;
      if (settling) return; // tránh chồng lệnh quyết toán
      settling = true;
      try {
        await settleAllRooms();
      } catch (err) {
        console.error('[ENGINE] settleAllRooms error:', err);
      } finally {
        settling = false;
      }
    }
  }, 1000);

  console.log('[ENGINE] Bộ máy chu kỳ thời gian thực đã khởi động (quyết toán theo mốc phút).');
}
