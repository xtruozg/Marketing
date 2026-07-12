import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { BetCategory, UserProfile } from '../types';
import {
  Users,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Edit3,
  Check,
  X,
  Search,
  Plus,
  LogOut,
  Sliders,
  Save,
  Clock,
  Key,
  Trash2,
  Lock,
  Unlock,
  Bell,
  Settings,
  ChevronRight,
  Eye,
  EyeOff,
  Download,
  Target,
  Wallet,
  History,
  Send,
  CheckCheck,
} from 'lucide-react';

const BET_CATEGORIES: BetCategory[] = [
  'Tăng tương tác',
  'Tăng doanh số',
  'Quảng bá sản phẩm',
  'Thu hút đầu tư',
];

const getActivityStatus = (lastActive?: string) => {
  if (!lastActive) {
    return {
      text: 'Chưa hoạt động',
      color: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
      dot: 'bg-slate-500',
    };
  }

  const now = new Date();
  const activeDate = new Date(lastActive);
  const diffMs = now.getTime() - activeDate.getTime();

  if (diffMs < 40000) {
    return {
      text: 'Đang hoạt động',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      dot: 'bg-emerald-400 animate-pulse',
    };
  }

  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let text = '';
  if (diffMin <= 4) text = 'Hoạt động 1 phút trước';
  else if (diffMin <= 15) text = 'Hoạt động 5 phút trước';
  else if (diffMin <= 59) text = 'Hoạt động 30 phút trước';
  else if (diffHours <= 4) text = 'Hoạt động 2 giờ trước';
  else if (diffDays === 0) text = 'Hoạt động hôm nay';
  else if (diffDays === 1) text = 'Hoạt động hôm qua';
  else if (diffDays <= 7) text = 'Hoạt động 3 ngày trước';
  else if (diffDays <= 20) text = 'Hoạt động 2 tuần trước';
  else if (diffDays <= 180) text = 'Hoạt động 3 tháng trước';
  else text = 'Hoạt động 1 năm trước';

  const isRecent = diffMin < 60;
  return {
    text,
    color: isRecent
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : 'text-slate-400 bg-slate-500/10 border-slate-500/20',
    dot: isRecent ? 'bg-amber-400' : 'bg-slate-500',
  };
};

// Nhận diện nền tảng phòng để tô màu / icon (Youtube = đỏ, Facebook = xanh)
const getRoomTheme = (name: string) => {
  const n = (name || '').toLowerCase();
  if (n.includes('youtube'))
    return { border: 'border-l-rose-500', badge: 'bg-rose-500/15 text-rose-400 border-rose-500/25', icon: '▶', iconBg: 'bg-rose-500/15 text-rose-400', pill: 'bg-rose-600/20 text-rose-400' };
  if (n.includes('facebook'))
    return { border: 'border-l-blue-500', badge: 'bg-blue-500/15 text-blue-400 border-blue-500/25', icon: 'f', iconBg: 'bg-blue-500/15 text-blue-400', pill: 'bg-blue-600/20 text-blue-400' };
  if (n.includes('tiktok'))
    return { border: 'border-l-fuchsia-500', badge: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/25', icon: '♪', iconBg: 'bg-fuchsia-500/15 text-fuchsia-400', pill: 'bg-fuchsia-600/20 text-fuchsia-400' };
  return { border: 'border-l-purple-500', badge: 'bg-purple-500/15 text-purple-400 border-purple-500/25', icon: '◆', iconBg: 'bg-purple-500/15 text-purple-400', pill: 'bg-purple-600/20 text-purple-400' };
};

const parseWithdrawDetails = (details?: string) => {
  // Định dạng: "Rút về: <bank> - <stk> - <chủ tk>"
  if (!details) return { bank: 'N/A', account: 'N/A', holder: 'N/A' };
  const cleaned = details.replace(/^Rút về:\s*/i, '');
  const parts = cleaned.split(' - ');
  return {
    bank: parts[0]?.trim() || 'N/A',
    account: parts[1]?.trim() || 'N/A',
    holder: parts[2]?.trim() || 'N/A',
  };
};

export const AdminScreen: React.FC = () => {
  const {
    adminLogout: logout,
    accounts,
    allTransactions,
    updateTransactionStatus,
    adminModifyUserBalance,
    adminUpdateUserProfile,
    adminCreateUser,
    adminForceGameResult,
    adminDeleteUser,
    secondsRemaining,
    currentPeriod,
    rooms,
    addRoom,
    updateRoom,
    deleteRoom,
    adminClearAllBets,
    adminClearAllTransactions,
    simulateDepositRequest,
    simulateWithdrawRequest,
    showToast,
    adminChangePassword,
    notifications,
    unreadNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    sendNotificationToUser,
  } = useAdmin();

  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifTarget, setNotifTarget] = useState('');
  const [notifText, setNotifText] = useState('');
  const [notifSending, setNotifSending] = useState(false);

  const handleAdminSendNotif = async () => {
    const target = notifTarget.trim();
    const msg = notifText.trim();
    if (!target || !msg || notifSending) return;
    setNotifSending(true);
    const ok = await sendNotificationToUser(target, 'Thông báo từ quản trị viên', msg);
    setNotifSending(false);
    if (ok) {
      setNotifText('');
      setNotifTarget('');
    }
  };

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'users' | 'bets' | 'deposits' | 'withdrawals' | 'rooms' | 'control'
  >('dashboard');

  const [searchTerm, setSearchTerm] = useState('');

  const [filterRoom, setFilterRoom] = useState<string>('Tất cả');
  const [filterStatus, setFilterStatus] = useState<string>('Tất cả');
  const [filterWithdrawStatus, setFilterWithdrawStatus] = useState<string>('Tất cả');

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showAdjustBalanceModal, setShowAdjustBalanceModal] = useState(false);
  const [showChangeUserPasswordModal, setShowChangeUserPasswordModal] = useState(false);
  const [showSimulateDepositModal, setShowSimulateDepositModal] = useState(false);
  const [showSimulateWithdrawModal, setShowSimulateWithdrawModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string>('');
  const [showHistoryLookupModal, setShowHistoryLookupModal] = useState(false);
  const [lookupSubTab, setLookupSubTab] = useState<'bets' | 'transactions'>('bets');
  const [showChangeAdminPasswordModal, setShowChangeAdminPasswordModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState<string>('');

  // Hiển thị mật khẩu thành viên trên thẻ
  const [revealedPw, setRevealedPw] = useState<Record<string, boolean>>({});

  const [newUserForm, setNewUserForm] = useState({
    username: '',
    password: '',
    fullName: '',
    phone: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    initialBalance: 0,
  });

  const [editUserForm, setEditUserForm] = useState({
    username: '',
    fullName: '',
    phone: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    accumulatedSupport: 0,
    password: '',
  });

  const [adjustAmount, setAdjustAmount] = useState<number>(500000);
  const [adjustIsAddition, setAdjustIsAddition] = useState<boolean>(true);
  const [singleUserNewPassword, setSingleUserNewPassword] = useState('');

  const [adminPwForm, setAdminPwForm] = useState({ current: '', next: '', confirm: '' });

  const [simDeposit, setSimDeposit] = useState({
    username: '',
    amount: 15000000,
    txCode: 'VT-TRX-99812A',
    phone: '0901234567',
  });

  const [simWithdraw, setSimWithdraw] = useState({
    username: '',
    amount: 5000000,
    bankName: 'Vietcombank',
    accountNumber: '0123456789',
    accountOwner: 'NGUYEN VAN PHONG',
  });

  // Lựa chọn cưỡng chế kết quả cho từng phòng (chưa gán)
  const [controlSelections, setControlSelections] = useState<Record<string, BetCategory>>({});

  // Form thêm / sửa phòng dùng chung
  const [roomForm, setRoomForm] = useState({ id: '' as string, name: '', cycle: 45, icon: 'smart_display' });

  // Chu kỳ mặc định hệ thống (lưu localStorage)
  const [defaultCycle, setDefaultCycle] = useState<number>(() => {
    const saved = localStorage.getItem('vt-default-cycle');
    return saved ? Number(saved) : 45;
  });

  const roomList = rooms.map((r) => ({
    ...r,
    currentCycle: secondsRemaining,
    session: currentPeriod[r.name] || (r as any).session || 'N/A',
  }));

  // Metrics
  const userList = (Object.values(accounts) as any[])
    .map((a) => a.profile)
    .filter((u) => u && u.username !== 'admin');
  const totalUsers = userList.length;

  const totalDeposits = allTransactions
    .filter((t) => t.type === 'Nạp tiền' && t.status === 'Thành công')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = allTransactions
    .filter((t) => t.type === 'Rút tiền' && t.status === 'Thành công')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingCount = allTransactions.filter(
    (t) => t.type === 'Rút tiền' && t.status === 'Đang xử lý'
  ).length;

  // Chuông + nhấp nháy tiêu đề khi có lệnh chờ
  useEffect(() => {
    if (pendingCount > 0) {
      const playChime = () => {
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioContextClass) return;
          const audioCtx = new AudioContextClass();
          const now = audioCtx.currentTime;
          const synthNote = (freq: number, start: number, duration: number) => {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);
            gainNode.gain.setValueAtTime(0.12, start);
            gainNode.gain.exponentialRampToValueAtTime(0.01, start + duration);
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            osc.start(start);
            osc.stop(start + duration);
          };
          synthNote(784, now, 0.25);
          synthNote(987, now + 0.12, 0.4);
        } catch (e) {
          console.warn('Audio Context block:', e);
        }
      };
      playChime();

      const originalTitle = document.title;
      let isAlt = false;
      const titleTimer = setInterval(() => {
        document.title = isAlt ? `⚠️ CÓ LỆNH CHỜ DUYỆT (${pendingCount})!` : `🔔 Kiểm tra giao dịch mới!`;
        isAlt = !isAlt;
      }, 1200);

      return () => {
        clearInterval(titleTimer);
        document.title = originalTitle;
      };
    }
  }, [pendingCount]);

  const formatVND = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v).replace('₫', 'đ');

  // Biểu đồ 7 ngày
  const getLast7DaysLabels = () => {
    const labels = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      labels.push({ label: `${day}/${month}`, rawDate: d });
    }
    return labels;
  };

  const chartData = getLast7DaysLabels().map((day) => {
    const sameDay = (ts: string) => {
      const t = new Date(ts);
      return (
        t.getDate() === day.rawDate.getDate() &&
        t.getMonth() === day.rawDate.getMonth() &&
        t.getFullYear() === day.rawDate.getFullYear()
      );
    };
    const deposits = allTransactions
      .filter((t) => t.type === 'Nạp tiền' && t.status === 'Thành công' && sameDay(t.timestamp))
      .reduce((sum, t) => sum + t.amount, 0);
    const withdrawals = allTransactions
      .filter((t) => t.type === 'Rút tiền' && t.status === 'Thành công' && sameDay(t.timestamp))
      .reduce((sum, t) => sum + t.amount, 0);
    return { label: day.label, deposits, withdrawals };
  });

  const hasChartData = chartData.some((d) => d.deposits > 0 || d.withdrawals > 0);
  const chartMaxVal = Math.max(...chartData.map((d) => Math.max(d.deposits, d.withdrawals)), 100000);

  const chartWidth = 500;
  const chartHeight = 140;
  const chartLeftMargin = 70;
  const chartBottomY = 170;

  const depositPoints = chartData.map((d, i) => ({
    x: chartLeftMargin + i * (chartWidth / 6),
    y: chartBottomY - (d.deposits / chartMaxVal) * chartHeight,
  }));
  const withdrawPoints = chartData.map((d, i) => ({
    x: chartLeftMargin + i * (chartWidth / 6),
    y: chartBottomY - (d.withdrawals / chartMaxVal) * chartHeight,
  }));

  const depositPath = depositPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const depositAreaPath =
    depositPoints.length > 0
      ? `${depositPath} L ${depositPoints[depositPoints.length - 1].x} ${chartBottomY} L ${depositPoints[0].x} ${chartBottomY} Z`
      : '';
  const withdrawPath = withdrawPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const withdrawAreaPath =
    withdrawPoints.length > 0
      ? `${withdrawPath} L ${withdrawPoints[withdrawPoints.length - 1].x} ${chartBottomY} L ${withdrawPoints[0].x} ${chartBottomY} Z`
      : '';

  // Filters
  const filteredUsers = userList.filter((user) => {
    const s = searchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(s) ||
      user.fullName.toLowerCase().includes(s) ||
      user.phone.includes(s) ||
      (user.accountNumber && user.accountNumber.includes(s))
    );
  });

  const depositTransactions = allTransactions.filter((t) => t.type === 'Nạp tiền');
  const filteredDeposits = depositTransactions.filter((t) => {
    const s = searchTerm.toLowerCase();
    return (
      !s ||
      t.id.toLowerCase().includes(s) ||
      (t.username && t.username.toLowerCase().includes(s)) ||
      (t.fullName && t.fullName.toLowerCase().includes(s)) ||
      (t.details && t.details.toLowerCase().includes(s))
    );
  });

  const withdrawTransactions = allTransactions.filter((t) => t.type === 'Rút tiền');
  const filteredWithdrawals = withdrawTransactions.filter((t) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      !s ||
      t.id.toLowerCase().includes(s) ||
      (t.username && t.username.toLowerCase().includes(s)) ||
      (t.fullName && t.fullName.toLowerCase().includes(s)) ||
      (t.details && t.details.toLowerCase().includes(s));
    const matchesStatus =
      filterWithdrawStatus === 'Tất cả' ||
      (filterWithdrawStatus === 'Chờ xử lý' && t.status === 'Đang xử lý') ||
      (filterWithdrawStatus === 'Đã duyệt' && t.status === 'Thành công') ||
      (filterWithdrawStatus === 'Đã từ chối' && t.status === 'Thất bại');
    return matchesSearch && matchesStatus;
  });

  const allUsersBets = Object.keys(accounts)
    .flatMap((username) => {
      const acc = accounts[username];
      const userBets = acc.bets || [];
      return userBets.map((b: any) => ({
        ...b,
        username: b.username || username,
        fullName: acc.profile?.fullName || '',
      }));
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredBets = allUsersBets.filter((b) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      !s ||
      b.id.toLowerCase().includes(s) ||
      b.period.includes(s) ||
      b.choice.toLowerCase().includes(s) ||
      b.username.toLowerCase().includes(s) ||
      b.fullName.toLowerCase().includes(s);
    const matchesRoom = filterRoom === 'Tất cả' || b.room === filterRoom;
    const matchesStatus =
      filterStatus === 'Tất cả' ||
      (filterStatus === 'Thắng' && b.result === 'Thắng') ||
      (filterStatus === 'Thua' && b.result === 'Thua') ||
      (filterStatus === 'Chờ kết quả' && b.result === 'Chờ kết quả');
    return matchesSearch && matchesRoom && matchesStatus;
  });

  // Lịch sử của thành viên đang tra cứu
  const lookupAcc = selectedUser ? accounts[selectedUser] : null;
  const lookupBets = (lookupAcc?.bets || []).slice().sort(
    (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const lookupTx = (lookupAcc?.transactions || []).slice().sort(
    (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // ============ HANDLERS ============
  const handleForceGame = async (roomName: string, category: BetCategory | null) => {
    const success = await adminForceGameResult(roomName, category);
    return success;
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const usernameClean = newUserForm.username.trim().toLowerCase();
    if (!usernameClean) return;
    if (accounts[usernameClean]) {
      alert('Tên tài khoản đã tồn tại trên hệ thống!');
      return;
    }
    const success = await adminCreateUser({
      username: usernameClean,
      password: newUserForm.password || usernameClean,
      fullName: newUserForm.fullName.trim(),
      phone: newUserForm.phone.trim(),
      bankName: newUserForm.bankName.trim(),
      accountNumber: newUserForm.accountNumber.trim(),
      accountHolder: newUserForm.accountHolder.trim().toUpperCase(),
      initialBalance: Number(newUserForm.initialBalance) || 0,
    });
    if (success) {
      setShowAddUserModal(false);
      setNewUserForm({
        username: '',
        password: '',
        fullName: '',
        phone: '',
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        initialBalance: 0,
      });
    }
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const profileUpdates: Partial<UserProfile> = {
      fullName: editUserForm.fullName.trim(),
      phone: editUserForm.phone.trim(),
      bankName: editUserForm.bankName.trim(),
      accountNumber: editUserForm.accountNumber.trim(),
      accountHolder: editUserForm.accountHolder.trim().toUpperCase(),
      accumulatedSupport: Number(editUserForm.accumulatedSupport) || 0,
    };
    const success = await adminUpdateUserProfile(
      editUserForm.username,
      profileUpdates,
      editUserForm.password || undefined
    );
    if (success) setShowEditUserModal(false);
  };

  const openEditUser = (user: any) => {
    setEditUserForm({
      username: user.username,
      fullName: user.fullName,
      phone: user.phone,
      bankName: user.bankName || '',
      accountNumber: user.accountNumber || '',
      accountHolder: user.accountHolder || '',
      accumulatedSupport: user.accumulatedSupport || 0,
      password: '',
    });
    setShowEditUserModal(true);
  };

  const handleToggleLockUser = async (username: string) => {
    const userAcc = accounts[username];
    if (!userAcc) return;
    const isLockedCurrently = userAcc.profile.isLocked || false;
    const success = await adminUpdateUserProfile(username, { isLocked: !isLockedCurrently });
    if (success) showToast(`Đã ${!isLockedCurrently ? 'khóa' : 'mở khóa'} tài khoản @${username}!`, 'info');
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    const success = await adminDeleteUser(userToDelete);
    if (success) {
      setShowDeleteUserModal(false);
      setUserToDelete('');
    }
  };

  const handleAdjustBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (adjustAmount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ!');
      return;
    }
    const success = await adminModifyUserBalance(selectedUser, adjustAmount, adjustIsAddition);
    if (success) setShowAdjustBalanceModal(false);
  };

  const handleResetUserPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !singleUserNewPassword.trim()) return;
    const success = await adminUpdateUserProfile(selectedUser, {}, singleUserNewPassword.trim());
    if (success) {
      setShowChangeUserPasswordModal(false);
      setSingleUserNewPassword('');
    }
  };

  const handleAdminChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPwForm.current || !adminPwForm.next) {
      showToast('Vui lòng nhập đầy đủ thông tin!', 'error');
      return;
    }
    if (adminPwForm.next.length < 6) {
      showToast('Mật khẩu mới phải có tối thiểu 6 kí tự!', 'error');
      return;
    }
    if (adminPwForm.next !== adminPwForm.confirm) {
      showToast('Xác nhận mật khẩu mới không khớp!', 'error');
      return;
    }
    const success = await adminChangePassword(adminPwForm.current, adminPwForm.next);
    if (success) {
      setShowChangeAdminPasswordModal(false);
      setAdminPwForm({ current: '', next: '', confirm: '' });
    }
  };

  const handleSimulateDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = simDeposit.username.trim().toLowerCase();
    if (!accounts[target]) {
      alert('Không tìm thấy tài khoản này!');
      return;
    }
    const success = await simulateDepositRequest(
      target,
      Number(simDeposit.amount),
      simDeposit.txCode,
      simDeposit.phone
    );
    if (success) setShowSimulateDepositModal(false);
  };

  const handleSimulateWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = simWithdraw.username.trim().toLowerCase();
    if (!accounts[target]) {
      alert('Không tìm thấy tài khoản này!');
      return;
    }
    const success = await simulateWithdrawRequest(
      target,
      Number(simWithdraw.amount),
      simWithdraw.bankName,
      simWithdraw.accountNumber,
      simWithdraw.accountOwner
    );
    if (success) setShowSimulateWithdrawModal(false);
  };

  const handleRoomFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.name.trim()) return;
    const success = roomForm.id
      ? await updateRoom(roomForm.id, roomForm.name.trim(), roomForm.cycle, roomForm.icon.trim() || 'smart_display')
      : await addRoom(roomForm.name.trim(), roomForm.cycle, roomForm.icon.trim() || 'smart_display');
    if (success) setRoomForm({ id: '', name: '', cycle: 45, icon: 'smart_display' });
  };

  const handleDeleteRoom = async (id: string, name: string) => {
    if (name === 'Facebook' || name === 'Youtube') {
      alert('Không thể xóa các phòng chơi mặc định!');
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa phòng chơi "${name}"?`)) {
      await deleteRoom(id);
      if (roomForm.id === id) setRoomForm({ id: '', name: '', cycle: 45, icon: 'smart_display' });
    }
  };

  const handleSaveDefaultCycle = () => {
    localStorage.setItem('vt-default-cycle', String(defaultCycle));
    showToast(`Đã lưu chu kỳ mặc định: ${defaultCycle} giây`, 'success');
  };

  const handleApplyDefaultCycleToAll = async () => {
    if (!window.confirm(`Áp dụng chu kỳ ${defaultCycle} giây cho TẤT CẢ ${rooms.length} phòng?`)) return;
    for (const r of rooms) {
      await updateRoom(r.id, r.name, defaultCycle, r.icon);
    }
    showToast('Đã áp dụng chu kỳ mặc định cho tất cả phòng!', 'success');
  };

  const handleClearAllBets = async () => {
    if (window.confirm('Bạn có chắc chắn muốn XÓA SẠCH toàn bộ lịch sử cược trên hệ thống?')) {
      await adminClearAllBets();
    }
  };

  const handleClearAllTransactions = async () => {
    if (window.confirm('Bạn có chắc chắn muốn XÓA SẠCH tất cả lịch sử giao dịch nạp/rút tiền?')) {
      await adminClearAllTransactions();
    }
  };

  // Xuất Excel (CSV UTF-8 BOM, mở được bằng Excel)
  const exportDepositsToExcel = () => {
    const header = ['ID Giao dịch', 'Người dùng', 'Họ tên', 'Số tiền', 'Loại hình', 'Trạng thái', 'Thời gian', 'Chi tiết'];
    const rowsCsv = filteredDeposits.map((t) => [
      t.id,
      t.username || '',
      t.fullName || '',
      t.amount,
      t.type,
      t.status,
      new Date(t.timestamp).toLocaleString('vi-VN'),
      (t.details || '').replace(/[\r\n]+/g, ' '),
    ]);
    const escape = (v: any) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [header, ...rowsCsv].map((r) => r.map(escape).join(',')).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `giao-dich-nap-tien-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Đã xuất danh sách giao dịch nạp ra file Excel (CSV)!', 'success');
  };

  // ============ NAV CONFIG ============
  const navItems: { key: typeof activeTab; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Tổng quan', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'users', label: 'Thành viên', icon: <Users className="w-4 h-4" /> },
    { key: 'bets', label: 'Lịch sử cược', icon: <Clock className="w-4 h-4" /> },
    { key: 'deposits', label: 'Giao dịch nạp', icon: <ArrowDownCircle className="w-4 h-4" /> },
    { key: 'withdrawals', label: 'Giao dịch rút', icon: <ArrowUpCircle className="w-4 h-4" /> },
    { key: 'rooms', label: 'Quản lý phòng', icon: <Sliders className="w-4 h-4" /> },
    { key: 'control', label: 'Can thiệp kết quả', icon: <Settings className="w-4 h-4" /> },
  ];

  const navBtnClass = (active: boolean) =>
    `w-full text-left flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wide cursor-pointer transition-all duration-300 relative group ${
      active
        ? 'bg-gradient-to-r from-blue-600/15 via-blue-500/5 to-transparent text-blue-400 border-l-[3.5px] border-blue-500 shadow-md shadow-blue-900/10'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-l-[3.5px] border-transparent hover:translate-x-1'
    }`;

  return (
    <div className="min-h-screen bg-[#070F1E] text-slate-100 flex font-sans w-full">
      {/* SIDEBAR */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0B1528] border-r border-[#1E293B] flex flex-col py-6 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="px-6 mb-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1D5CFF] flex items-center justify-center font-bold text-xl text-white shadow-[0_4px_12px_rgba(29,92,255,0.3)]">
              VT
            </div>
            <div>
              <h1 className="font-extrabold text-white text-md tracking-wide leading-tight">Việt Tiến</h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Quản trị hệ thống</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  setSidebarOpen(false);
                }}
                className={navBtnClass(active)}
              >
                <span
                  className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                    active ? 'text-blue-400' : 'text-slate-400'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.key === 'withdrawals' && pendingCount > 0 ? (
                  <span className="ml-auto bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black px-2 py-0.5 rounded-full text-[9px]">
                    {pendingCount}
                  </span>
                ) : (
                  active && (
                    <span className="absolute right-4 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(29,92,255,0.8)] animate-pulse" />
                  )
                )}
              </button>
            );
          })}

          <div className="border-t border-[#1E293B]/60 my-4" />

          <button
            onClick={() => {
              setAdminPwForm({ current: '', next: '', confirm: '' });
              setShowChangeAdminPasswordModal(true);
              setSidebarOpen(false);
            }}
            className="w-full text-left flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 cursor-pointer transition-all duration-300 hover:translate-x-1 group border-l-[3.5px] border-transparent"
          >
            <Key className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
            <span>Đổi mật khẩu</span>
          </button>

          <button
            onClick={logout}
            className="w-full text-left flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-all duration-300 hover:translate-x-1 group border-l-[3.5px] border-transparent"
          >
            <LogOut className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
            <span>Đăng xuất</span>
          </button>
        </nav>

        <div className="mt-auto px-6 text-center text-[10px] text-slate-500 pt-4">VT-SYS Control Panel v2.5</div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* MAIN */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* HEADER */}
        <header className="h-16 border-b border-[#1E293B] bg-[#0B1528]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-400 hover:text-white p-1 font-bold text-xs">
              ☰
            </button>
            <div className="relative hidden sm:block w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm kiếm giao dịch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#070F1E] border border-[#1D293E] text-xs text-white rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-[#1D5CFF] transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifPanel((v) => !v)}
                title="Hộp thư thông báo"
                className="text-slate-400 hover:text-white relative p-1 cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center border border-[#0B1528]">
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </span>
                )}
              </button>

              {showNotifPanel && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifPanel(false)} />
                  <div className="absolute right-0 mt-2 w-[340px] max-w-[92vw] max-h-[75vh] flex flex-col bg-[#0B1528] border border-[#1E293B] rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E293B]">
                      <span className="font-extrabold text-sm text-white">Hộp thư thông báo</span>
                      <div className="flex items-center gap-1">
                        {unreadNotifications > 0 && (
                          <button onClick={markAllNotificationsRead} title="Đánh dấu tất cả đã đọc" className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-[#1E293B] transition-colors cursor-pointer">
                            <CheckCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => setShowNotifPanel(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-[#1E293B] transition-colors cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">Chưa có thông báo nào.</div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`px-4 py-3 border-b border-[#131F33] flex gap-3 ${n.isRead ? 'opacity-60' : 'bg-blue-950/20'}`}
                          >
                            <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.isRead ? 'bg-slate-600' : 'bg-amber-400'}`} />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-white truncate">{n.title}</p>
                              {n.message && <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{n.message}</p>}
                              <div className="flex items-center gap-2 mt-1.5">
                                {n.sender && n.sender !== 'admin' && n.sender !== 'system' && (
                                  <button
                                    onClick={() => { setNotifTarget(n.sender); if (!n.isRead) markNotificationRead(n.id); }}
                                    className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                                  >
                                    Trả lời @{n.sender}
                                  </button>
                                )}
                                {!n.isRead && (
                                  <button onClick={() => markNotificationRead(n.id)} className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer">
                                    Đánh dấu đã đọc
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Gửi thông báo tới 1 khách hàng */}
                    <div className="p-3 border-t border-[#1E293B] bg-[#070F1E] space-y-2">
                      <input
                        type="text"
                        value={notifTarget}
                        onChange={(e) => setNotifTarget(e.target.value)}
                        placeholder="Tài khoản người nhận (vd: 0912...)"
                        className="w-full bg-[#0B1528] border border-[#1D293E] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#1D5CFF]"
                      />
                      <div className="flex items-end gap-2">
                        <textarea
                          value={notifText}
                          onChange={(e) => setNotifText(e.target.value)}
                          placeholder="Nội dung thông báo gửi khách hàng..."
                          rows={1}
                          className="flex-1 resize-none bg-[#0B1528] border border-[#1D293E] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#1D5CFF]"
                        />
                        <button
                          onClick={handleAdminSendNotif}
                          disabled={notifSending || !notifTarget.trim() || !notifText.trim()}
                          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0"
                          title="Gửi tới khách hàng"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => {
                setAdminPwForm({ current: '', next: '', confirm: '' });
                setShowChangeAdminPasswordModal(true);
              }}
              title="Cài đặt / Đổi mật khẩu"
              className="text-slate-400 hover:text-white p-1"
            >
              <Settings className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-l border-[#1E293B] pl-3 sm:pl-4">
              <div className="w-8 h-8 rounded-full bg-[#1E293B] border border-[#1D293E] flex items-center justify-center font-bold text-xs text-blue-400">
                AD
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-white leading-tight">admin</p>
                <p className="text-[9px] text-slate-400 leading-none">Super Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-grow p-4 sm:p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {pendingCount > 0 && (
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white px-5 py-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-amber-500/30 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-amber-100" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider">Có yêu cầu giao dịch chờ xét duyệt!</h4>
                  <p className="text-xs text-white/95 mt-0.5">
                    Hiện đang có <span className="font-black font-mono text-yellow-300 text-sm">{pendingCount}</span> yêu cầu rút tiền chờ xử lý. Vui lòng duyệt ngay.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTab('withdrawals');
                  setFilterWithdrawStatus('Chờ xử lý');
                }}
                className="bg-white text-orange-700 hover:bg-slate-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer shrink-0"
              >
                Xử lý ngay
              </button>
            </div>
          )}

          {/* ============ TAB: DASHBOARD ============ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight uppercase">Tổng quan hệ thống</h2>
                  <p className="text-xs text-slate-400 mt-1">Bảng điều khiển giám sát hoạt động tài chính & đặt cược thời gian thực.</p>
                </div>
                <span className="text-xs font-bold text-slate-300 bg-[#0B1528] px-4 py-2.5 border border-slate-800 rounded-xl font-mono flex items-center gap-2 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  Đếm ngược: <span className="text-red-500 font-extrabold">{secondsRemaining} giây</span>
                </span>
              </div>

              {/* KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0B1528]/80 hover:bg-[#0F1D36]/80 border border-slate-800 p-5 rounded-2xl flex items-center justify-between transition-all duration-300 hover:scale-[1.02] shadow-md group">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Tổng thành viên</span>
                    <h3 className="text-2xl font-black text-white font-mono">{totalUsers}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-[#1D5CFF] flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#0B1528]/80 hover:bg-[#0F1D36]/80 border border-slate-800 p-5 rounded-2xl flex items-center justify-between transition-all duration-300 hover:scale-[1.02] shadow-md group">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Tổng nạp thành công</span>
                    <h3 className="text-xl font-black text-emerald-400 font-mono">{formatVND(totalDeposits)}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <ArrowDownCircle className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#0B1528]/80 hover:bg-[#0F1D36]/80 border border-slate-800 p-5 rounded-2xl flex items-center justify-between transition-all duration-300 hover:scale-[1.02] shadow-md group">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Tổng rút thành công</span>
                    <h3 className="text-xl font-black text-rose-500 font-mono">{formatVND(totalWithdrawals)}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all">
                    <ArrowUpCircle className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#0B1528]/80 hover:bg-[#0F1D36]/80 border border-slate-800 p-5 rounded-2xl flex items-center justify-between transition-all duration-300 hover:scale-[1.02] shadow-md group">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Phòng hoạt động</span>
                    <h3 className="text-2xl font-black text-purple-400 font-mono">{roomList.length}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all">
                    <Sliders className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* CHART + QUICK ACTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-[#0B1528]/80 border border-slate-800/80 rounded-2xl p-5 lg:col-span-2 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-white">Thống kê Giao dịch thành công (7 ngày gần nhất)</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Dữ liệu doanh số giao dịch đã duyệt thành công.</p>
                    </div>
                    {hasChartData && (
                      <div className="flex items-center gap-3 text-[10px] bg-slate-950/40 p-2 rounded-xl border border-slate-800">
                        <span className="flex items-center gap-1.5 font-bold"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Nạp tiền</span>
                        <span className="flex items-center gap-1.5 font-bold"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Rút tiền</span>
                      </div>
                    )}
                  </div>

                  <div className="h-64 relative w-full pt-4 bg-slate-950/20 rounded-xl border border-slate-900/60 p-2">
                    {!hasChartData ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                        <TrendingUp className="w-10 h-10 stroke-1 text-slate-600 animate-pulse" />
                        <p className="text-xs font-semibold text-slate-400">Chưa có dữ liệu</p>
                        <p className="text-[10px] text-slate-500">Các yêu cầu nạp hoặc rút tiền được duyệt thành công sẽ hiển thị tại đây.</p>
                      </div>
                    ) : (
                      <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                        <line x1="70" y1="30" x2="570" y2="30" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
                        <line x1="70" y1="100" x2="570" y2="100" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
                        <line x1="70" y1="170" x2="570" y2="170" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
                        <text x="60" y="34" fill="#64748B" fontSize="9" fontWeight="bold" textAnchor="end" className="font-mono">{formatVND(chartMaxVal)}</text>
                        <text x="60" y="104" fill="#64748B" fontSize="9" fontWeight="bold" textAnchor="end" className="font-mono">{formatVND(chartMaxVal / 2)}</text>
                        <text x="60" y="174" fill="#64748B" fontSize="9" fontWeight="bold" textAnchor="end" className="font-mono">0 đ</text>
                        <path d={depositAreaPath} fill="url(#depositGlow)" opacity="0.1" />
                        <path d={depositPath} fill="none" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
                        <path d={withdrawAreaPath} fill="url(#withdrawGlow)" opacity="0.08" />
                        <path d={withdrawPath} fill="none" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round" />
                        {depositPoints.map((p, idx) => chartData[idx].deposits > 0 && (
                          <circle key={`dep-${idx}`} cx={p.x} cy={p.y} r="4" fill="#10B981" stroke="#070F1E" strokeWidth="1.5" />
                        ))}
                        {withdrawPoints.map((p, idx) => chartData[idx].withdrawals > 0 && (
                          <circle key={`with-${idx}`} cx={p.x} cy={p.y} r="4" fill="#EF4444" stroke="#070F1E" strokeWidth="1.5" />
                        ))}
                        {chartData.map((d, i) => (
                          <text key={i} x={70 + i * (500 / 6)} y={195} fill="#64748B" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono">{d.label}</text>
                        ))}
                        <defs>
                          <linearGradient id="depositGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="withdrawGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                    )}
                  </div>
                </div>

                <div className="bg-[#0B1528]/80 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
                  <h4 className="font-bold text-sm text-white">Lối tắt & Khuyên dùng</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Bạn có thể giám sát tất cả các phòng trò chơi đồng thời, can thiệp kết quả cược hoặc xử lý trực tiếp các yêu cầu thanh toán.
                  </p>
                  <div className="space-y-3.5 pt-2">
                    <button onClick={() => setActiveTab('control')} className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-white text-xs font-bold transition-all text-left cursor-pointer active:scale-[0.98]">
                      <span className="flex items-center gap-2">🎯 Can thiệp kết quả phòng cược</span>
                      <ChevronRight className="w-4 h-4 text-blue-400" />
                    </button>
                    <button onClick={() => setShowAddUserModal(true)} className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-white text-xs font-bold transition-all text-left cursor-pointer active:scale-[0.98]">
                      <span className="flex items-center gap-2">➕ Thêm thành viên mới</span>
                      <ChevronRight className="w-4 h-4 text-emerald-400" />
                    </button>
                    <button onClick={() => { setActiveTab('withdrawals'); setFilterWithdrawStatus('Chờ xử lý'); }} className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-white text-xs font-bold transition-all text-left cursor-pointer active:scale-[0.98]">
                      <span className="flex items-center gap-2">⌛ {pendingCount} giao dịch chờ duyệt</span>
                      <ChevronRight className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ TAB: MEMBERS (CARDS) ============ */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">Quản lý thành viên</h2>
                  <p className="text-xs text-slate-400 mt-1">Danh sách và thông tin chi tiết người dùng hệ thống.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-slate-300 bg-[#0B1528] px-4 py-2.5 border border-slate-800 rounded-xl uppercase tracking-wider">
                    Tổng thành viên: <span className="text-white font-black">{totalUsers}</span>
                  </span>
                  <button onClick={() => setShowAddUserModal(true)} className="bg-[#1D5CFF] hover:bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer">
                    <Plus className="w-4 h-4" /> Thêm thành viên
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Tìm người dùng theo Tên, Số TK, ID, SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0B1528] border border-[#1E293B] text-xs text-white rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:border-[#1D5CFF] transition-all"
                />
              </div>

              {filteredUsers.length === 0 ? (
                <div className="bg-[#0B1528] border border-[#1E293B] rounded-2xl py-16 text-center text-slate-500 text-sm">
                  Không có kết quả thành viên nào trùng khớp.
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  {filteredUsers.map((user) => {
                    const status = getActivityStatus(user.lastActive);
                    const acc = accounts[user.username];
                    const pw = acc?.password || '';
                    const revealed = revealedPw[user.username];
                    return (
                      <div key={user.username} className="bg-[#0B1528] border border-[#1E293B] rounded-2xl p-5 shadow-lg space-y-4">
                        {/* header */}
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-[10px] font-mono font-bold bg-[#1D5CFF]/15 text-blue-400 px-2 py-1 rounded-md shrink-0">#{user.id}</span>
                            <h4 className="font-black text-white text-lg truncate">{user.username}</h4>
                            <button onClick={() => openEditUser(user)} title="Sửa thông tin" className="text-slate-500 hover:text-teal-400 shrink-0">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {user.isLocked && <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0">
                            <span className="uppercase font-bold text-slate-500">Pass:</span>
                            <span className="font-mono text-slate-300">{revealed ? pw || '(trống)' : '••••••'}</span>
                            <button onClick={() => setRevealedPw((p) => ({ ...p, [user.username]: !p[user.username] }))} className="text-slate-500 hover:text-white">
                              {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* info rows */}
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between"><span className="text-slate-400">Họ tên:</span><span className="font-bold text-slate-100 text-right">{user.fullName || 'N/A'}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">SĐT:</span><span className="font-mono text-slate-200">{user.phone || 'N/A'}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">Mã mới:</span><span className="font-mono text-blue-400">{user.referralCode || '—'}</span></div>
                        </div>

                        {/* balance */}
                        <div className="bg-[#070F1E] border border-[#1E293B] rounded-xl px-4 py-3 flex items-center justify-between">
                          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Số dư:</span>
                          <span className="font-mono font-black text-emerald-400 text-lg tracking-wide">{user.balance.toLocaleString('vi-VN')} đ</span>
                        </div>

                        {/* doanh số tích lũy */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-[#070F1E] border border-[#1E293B] rounded-xl px-3 py-2">
                            <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider block">Doanh số hỗ trợ</span>
                            <span className="font-mono font-black text-cyan-400 text-sm">{(user.accumulatedSupport || 0).toLocaleString('vi-VN')} đ</span>
                          </div>
                          <div className="bg-[#070F1E] border border-[#1E293B] rounded-xl px-3 py-2">
                            <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider block">Tiền thắng</span>
                            <span className="font-mono font-black text-blue-400 text-sm">{(user.accumulatedWins || 0).toLocaleString('vi-VN')} đ</span>
                          </div>
                        </div>

                        {/* bank */}
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between"><span className="text-slate-400">Ngân hàng:</span><span className="font-bold text-slate-200 text-right">{user.bankName || 'N/A'}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">Số tài khoản:</span><span className="font-mono text-slate-200">{user.accountNumber || 'N/A'}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">Chủ tài khoản:</span><span className="font-bold text-slate-200 text-right uppercase text-[11px]">{user.accountHolder || 'N/A'}</span></div>
                        </div>

                        {/* activity */}
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-block w-2 h-2 rounded-full ${status.dot}`} />
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${status.color}`}>{status.text}</span>
                        </div>

                        {/* actions */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button onClick={() => { setSelectedUser(user.username); setAdjustAmount(500000); setAdjustIsAddition(true); setShowAdjustBalanceModal(true); }} className="py-2.5 rounded-xl bg-teal-600/10 hover:bg-teal-600/20 text-teal-300 border border-teal-500/25 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                            <Wallet className="w-3.5 h-3.5" /> Số dư
                          </button>
                          <button onClick={() => { setSelectedUser(user.username); setSingleUserNewPassword(''); setShowChangeUserPasswordModal(true); }} className="py-2.5 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 text-slate-200 border border-slate-600/40 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-amber-400" /> Mật khẩu
                          </button>
                          <button onClick={() => handleToggleLockUser(user.username)} className="py-2.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 border border-rose-500/25 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                            {user.isLocked ? <><Unlock className="w-3.5 h-3.5" /> Mở khóa</> : <><Lock className="w-3.5 h-3.5" /> Khóa</>}
                          </button>
                          <button onClick={() => { setUserToDelete(user.username); setShowDeleteUserModal(true); }} className="py-2.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 border border-rose-500/25 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                            <Trash2 className="w-3.5 h-3.5" /> Xóa
                          </button>
                          <button onClick={() => { setSelectedUser(user.username); setLookupSubTab('bets'); setShowHistoryLookupModal(true); }} className="col-span-2 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/25 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                            <History className="w-3.5 h-3.5" /> Tra cứu Lịch sử (Cược / Ví)
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============ TAB: BET HISTORY ============ */}
          {activeTab === 'bets' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">Lịch sử đặt cược</h2>
                  <p className="text-xs text-slate-400 mt-1">Xem chi tiết các giao dịch cược trên hệ thống.</p>
                </div>
                <button onClick={handleClearAllBets} className="bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/35 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0">
                  🧹 Xóa lịch sử cược
                </button>
              </div>

              <div className="bg-[#0B1528] border border-[#1E293B] rounded-2xl p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" placeholder="Tìm mã đơn, người chơi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#070F1E] border border-[#1D293E] text-xs text-white rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-[#1D5CFF]" />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 whitespace-nowrap">Phòng:</span>
                  <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)} className="bg-[#070F1E] border border-[#1D293E] p-2 rounded-lg text-white font-bold cursor-pointer">
                    <option value="Tất cả">Tất cả phòng</option>
                    {rooms.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 whitespace-nowrap">Trạng thái:</span>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-[#070F1E] border border-[#1D293E] p-2 rounded-lg text-white font-bold cursor-pointer">
                    <option value="Tất cả">Tất cả trạng thái</option>
                    <option value="Thắng">Thắng</option>
                    <option value="Thua">Thua</option>
                    <option value="Chờ kết quả">Chờ kết quả</option>
                  </select>
                </div>
                <span className="text-[11px] font-bold text-slate-300 bg-[#070F1E] border border-[#1D293E] px-3 py-2 rounded-lg uppercase tracking-wider whitespace-nowrap">
                  Tổng: <span className="text-white font-black">{filteredBets.length}</span> bản ghi
                </span>
              </div>

              <div className="bg-[#0B1528] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0F1D36] text-slate-400 font-bold border-b border-[#1E293B] uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-4 px-5">Mã ID</th>
                        <th>Người chơi</th>
                        <th>Phòng</th>
                        <th>Chu kỳ (Session ID)</th>
                        <th>Cửa cược (Option)</th>
                        <th>Mức cược (Amount)</th>
                        <th>Thời gian đặt cược</th>
                        <th className="pr-5">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]/60 font-mono">
                      {filteredBets.length === 0 ? (
                        <tr><td colSpan={8} className="py-12 text-center text-slate-500 font-sans">Chưa có bản ghi đặt cược nào.</td></tr>
                      ) : (
                        filteredBets.map((bet) => {
                          const theme = getRoomTheme(bet.room);
                          return (
                            <tr key={bet.id} className="hover:bg-[#0F1D36]/40 transition-colors">
                              <td className="py-4 px-5 text-white font-bold">{bet.id}</td>
                              <td className="font-sans"><span className="font-bold text-slate-100 block">{bet.fullName || 'Hệ thống'}</span><span className="text-[10px] text-slate-500">@{bet.username}</span></td>
                              <td><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${theme.pill}`}>{bet.room}</span></td>
                              <td className="text-slate-400">{bet.period}</td>
                              <td className="font-semibold text-white font-sans">{bet.choice}</td>
                              <td className="font-bold">{bet.amount.toLocaleString('vi-VN')} đ</td>
                              <td className="text-slate-500">{new Date(bet.timestamp).toLocaleString('vi-VN')}</td>
                              <td className="pr-5">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${bet.result === 'Thắng' ? 'bg-emerald-500/20 text-emerald-400' : bet.result === 'Thua' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                  {bet.result === 'Thắng' ? `Thắng (+${(bet.payout || Math.floor(bet.amount * 1.3)).toLocaleString('vi-VN')}đ)` : bet.result}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============ TAB: DEPOSITS ============ */}
          {activeTab === 'deposits' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">Danh sách giao dịch nạp tiền</h2>
                  <p className="text-xs text-slate-400 mt-1">Quản lý và xét duyệt các yêu cầu nạp tiền từ người dùng.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setShowSimulateDepositModal(true)} className="bg-[#1D5CFF] hover:bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer">
                    <Plus className="w-4 h-4" /> Mô phỏng Nạp tiền
                  </button>
                  <button onClick={exportDepositsToExcel} className="bg-[#0B1528] hover:bg-[#0F1D36] text-slate-200 border border-[#1E293B] text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer">
                    <Download className="w-4 h-4" /> Xuất Excel
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Tìm theo Mã đơn, người dùng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#0B1528] border border-[#1E293B] text-xs text-white rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:border-[#1D5CFF]" />
              </div>

              <div className="bg-[#0B1528] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0F1D36] text-slate-400 font-bold border-b border-[#1E293B] uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-4 px-5">ID Giao dịch</th>
                        <th>Mã đơn</th>
                        <th>Người dùng</th>
                        <th>Số điện thoại</th>
                        <th>Số tiền</th>
                        <th>Loại hình</th>
                        <th>Thời gian</th>
                        <th>Trạng thái</th>
                        <th className="text-right pr-5">Xử lý</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]/60 font-mono">
                      {filteredDeposits.length === 0 ? (
                        <tr><td colSpan={9} className="py-12 text-center text-slate-500 font-sans">Không tìm thấy yêu cầu nạp tiền nào.</td></tr>
                      ) : (
                        filteredDeposits.map((tx) => {
                          const phone = accounts[tx.username || '']?.profile?.phone || '—';
                          return (
                            <tr key={tx.id} className="hover:bg-[#0F1D36]/40 transition-colors">
                              <td className="py-4 px-5 text-white font-bold">{tx.id}</td>
                              <td className="text-slate-400">#{tx.id.slice(-6).toUpperCase()}</td>
                              <td className="font-sans"><span className="font-bold text-slate-100 block">{tx.fullName || '—'}</span><span className="text-[10px] text-slate-500">@{tx.username}</span></td>
                              <td className="text-slate-400">{phone}</td>
                              <td className="font-bold text-emerald-400 text-sm">+{tx.amount.toLocaleString('vi-VN')} đ</td>
                              <td><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600/15 text-emerald-400 font-sans">Nạp tiền</span></td>
                              <td className="text-slate-500">{new Date(tx.timestamp).toLocaleString('vi-VN')}</td>
                              <td>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tx.status === 'Thành công' ? 'bg-emerald-500/20 text-emerald-400' : tx.status === 'Đang xử lý' ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-rose-500/20 text-rose-400'}`}>{tx.status}</span>
                              </td>
                              <td className="text-right pr-5 font-sans">
                                {tx.status === 'Đang xử lý' ? (
                                  <div className="flex justify-end gap-1.5">
                                    <button onClick={() => updateTransactionStatus(tx.id, 'approve')} className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Duyệt</button>
                                    <button onClick={() => updateTransactionStatus(tx.id, 'reject')} className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"><X className="w-3.5 h-3.5" /> Từ chối</button>
                                  </div>
                                ) : (
                                  <span className="text-slate-500 italic text-[11px]">Đã giải quyết</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============ TAB: WITHDRAWALS ============ */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">Danh sách rút tiền</h2>
                  <p className="text-xs text-slate-400 mt-1">Quản lý và xét duyệt các yêu cầu rút tiền từ người chơi. Đảm bảo kiểm tra kỹ thông tin trước khi duyệt lệnh.</p>
                </div>
                <button onClick={() => setShowSimulateWithdrawModal(true)} className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer shrink-0">
                  <Plus className="w-4 h-4" /> Mô phỏng Giao dịch Rút
                </button>
              </div>

              <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" placeholder="Tìm theo tên người dùng, STK..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#0B1528] border border-[#1E293B] text-xs text-white rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:border-[#1D5CFF]" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {['Tất cả', 'Chờ xử lý', 'Đã duyệt', 'Đã từ chối'].map((f) => (
                    <button key={f} onClick={() => setFilterWithdrawStatus(f)} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${filterWithdrawStatus === f ? 'bg-rose-600/20 text-rose-400 border-rose-500/40' : 'bg-[#0B1528] text-slate-400 border-[#1E293B] hover:text-slate-200'}`}>{f}</button>
                  ))}
                </div>
              </div>

              <div className="bg-[#0B1528] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0F1D36] text-slate-400 font-bold border-b border-[#1E293B] uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-4 px-5">Yêu cầu ID</th>
                        <th>Người dùng</th>
                        <th>Số tiền rút</th>
                        <th>Ngày yêu cầu</th>
                        <th>Ngân hàng</th>
                        <th>Số tài khoản</th>
                        <th>Chủ tài khoản</th>
                        <th>Trạng thái</th>
                        <th className="text-right pr-5">Xử lý lệnh</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]/60 font-mono">
                      {filteredWithdrawals.length === 0 ? (
                        <tr><td colSpan={9} className="py-12 text-center text-slate-500 font-sans">Không tìm thấy yêu cầu rút tiền nào.</td></tr>
                      ) : (
                        filteredWithdrawals.map((tx) => {
                          const bank = parseWithdrawDetails(tx.details);
                          return (
                            <tr key={tx.id} className="hover:bg-[#0F1D36]/40 transition-colors">
                              <td className="py-4 px-5 text-white font-bold">{tx.id}</td>
                              <td className="font-sans"><span className="font-bold text-slate-100 block">{tx.fullName || '—'}</span><span className="text-[10px] text-slate-500">@{tx.username}</span></td>
                              <td className="font-bold text-rose-500 text-sm">-{tx.amount.toLocaleString('vi-VN')} đ</td>
                              <td className="text-slate-500">{new Date(tx.timestamp).toLocaleString('vi-VN')}</td>
                              <td className="text-slate-200 font-sans font-semibold">{bank.bank}</td>
                              <td className="text-slate-300">{bank.account}</td>
                              <td className="text-slate-200 font-sans uppercase text-[11px]">{bank.holder}</td>
                              <td>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tx.status === 'Thành công' ? 'bg-emerald-500/20 text-emerald-400' : tx.status === 'Đang xử lý' ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-rose-500/20 text-rose-400'}`}>{tx.status === 'Đang xử lý' ? 'Đang chờ' : tx.status}</span>
                              </td>
                              <td className="text-right pr-5 font-sans">
                                {tx.status === 'Đang xử lý' ? (
                                  <div className="flex justify-end gap-1.5">
                                    <button onClick={() => updateTransactionStatus(tx.id, 'approve')} className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Duyệt</button>
                                    <button onClick={() => updateTransactionStatus(tx.id, 'reject')} className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"><X className="w-3.5 h-3.5" /> Từ chối</button>
                                  </div>
                                ) : (
                                  <span className="text-slate-500 italic text-[11px]">Đã giải quyết</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============ TAB: ROOMS ============ */}
          {activeTab === 'rooms' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* LEFT: forms */}
              <div className="space-y-6">
                {/* THÊM / SỬA PHÒNG */}
                <form onSubmit={handleRoomFormSubmit} className="bg-[#0B1528] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="flex items-center gap-2 font-black text-white text-base uppercase tracking-wide">
                    <span className="w-1 h-5 bg-[#1D5CFF] rounded-full" /> {roomForm.id ? 'Sửa phòng' : 'Thêm/Sửa phòng'}
                  </h3>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Tên phòng</label>
                    <input type="text" required placeholder="Nhập tên phòng (ví dụ: Youtube, Facebook...)" value={roomForm.name} onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} className="w-full bg-[#070F1E] border border-[#1D293E] text-xs text-white rounded-xl p-3 outline-none focus:border-[#1D5CFF]" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Chu kỳ thời gian (giây)</label>
                    <input type="number" required value={roomForm.cycle} onChange={(e) => setRoomForm({ ...roomForm, cycle: Number(e.target.value) })} className="w-full bg-[#070F1E] border border-[#1D293E] text-xs text-white rounded-xl p-3 outline-none focus:border-[#1D5CFF] font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Ảnh đại diện (Tên icon)</label>
                    <input type="text" placeholder="smart_display" value={roomForm.icon} onChange={(e) => setRoomForm({ ...roomForm, icon: e.target.value })} className="w-full bg-[#070F1E] border border-[#1D293E] text-xs text-white rounded-xl p-3 outline-none focus:border-[#1D5CFF] font-mono" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-3 bg-[#1D5CFF] hover:bg-blue-600 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" /> {roomForm.id ? 'Cập nhật phòng' : 'Lưu phòng chơi'}
                    </button>
                    {roomForm.id && (
                      <button type="button" onClick={() => setRoomForm({ id: '', name: '', cycle: 45, icon: 'smart_display' })} className="px-4 py-3 bg-slate-700/40 hover:bg-slate-700/60 text-slate-200 font-bold text-sm rounded-xl transition-all cursor-pointer">Hủy</button>
                    )}
                  </div>
                </form>

                {/* CHU KỲ MẶC ĐỊNH */}
                <div className="bg-[#0B1528] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="flex items-center gap-2 font-black text-white text-base uppercase tracking-wide">
                    <span className="w-1 h-5 bg-emerald-500 rounded-full" /> Chu kỳ mặc định hệ thống
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">Cấu hình chu kỳ thời gian chạy mặc định cho tất cả phòng hoặc áp dụng trực tiếp.</p>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Thời gian mặc định (giây)</label>
                    <input type="number" value={defaultCycle} onChange={(e) => setDefaultCycle(Number(e.target.value))} className="w-full bg-[#070F1E] border border-[#1D293E] text-xs text-white rounded-xl p-3 outline-none focus:border-[#1D5CFF] font-mono" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveDefaultCycle} className="px-5 py-2.5 bg-slate-700/40 hover:bg-slate-700/60 text-slate-100 font-bold text-xs rounded-xl transition-all cursor-pointer">Lưu mặc định</button>
                    <button onClick={handleApplyDefaultCycleToAll} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer">Áp dụng tất cả</button>
                  </div>
                </div>
              </div>

              {/* RIGHT: list */}
              <div className="bg-[#0B1528] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <h3 className="font-bold text-white text-base">Danh sách phòng hiện có</h3>
                  <div className="relative sm:w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input type="text" placeholder="Tìm phòng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#070F1E] border border-[#1D293E] text-xs text-white rounded-lg py-2 pl-9 pr-3 outline-none focus:border-[#1D5CFF]" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="text-slate-400 font-bold border-b border-[#1E293B] uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 pr-2">ID</th>
                        <th>Tên phòng</th>
                        <th>Ảnh Icon</th>
                        <th>Mã chu kỳ</th>
                        <th>Đếm ngược (s)</th>
                        <th className="text-right">Lựa chọn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]/60">
                      {roomList.filter((r) => r.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                        <tr><td colSpan={6} className="py-10 text-center text-slate-500 font-sans">Không có phòng nào.</td></tr>
                      ) : (
                        roomList.filter((r) => r.name.toLowerCase().includes(searchTerm.toLowerCase())).map((room) => (
                          <tr key={room.id} className="hover:bg-[#0F1D36]/40 transition-colors">
                            <td className="py-3.5 pr-2 font-mono font-bold text-blue-400">{room.id}</td>
                            <td className="font-bold text-white font-sans">{room.name}</td>
                            <td className="font-mono text-blue-400">{room.icon}</td>
                            <td className="font-mono text-slate-400">{room.session}</td>
                            <td className="font-mono"><span className="text-emerald-400 font-bold">{secondsRemaining}s</span> <span className="text-slate-500">/ {room.cycle}s</span></td>
                            <td>
                              <div className="flex justify-end gap-1.5">
                                <button onClick={() => setRoomForm({ id: room.id, name: room.name, cycle: room.cycle, icon: room.icon })} title="Sửa" className="p-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 transition-colors cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDeleteRoom(room.id, room.name)} disabled={room.name === 'Facebook' || room.name === 'Youtube'} title="Xóa" className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============ TAB: CONTROL ============ */}
          {activeTab === 'control' && (
            <div className="space-y-6">
              <div className="bg-[#0B1528] border border-[#1E293B] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Bảng điều khiển kết quả sự kiện</h2>
                  <p className="text-xs text-slate-400 mt-1">Can thiệp kết quả mở từng kỳ cho từng phòng. Kết quả cưỡng chế sẽ tự động áp dụng khi bộ đếm ngược kết thúc.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 shrink-0">
                  <span className="text-slate-400">Thời gian đếm ngược:</span>
                  <span className="bg-rose-600/15 text-rose-400 border border-rose-500/30 px-4 py-2 rounded-xl font-mono font-black flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {secondsRemaining} giây
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roomList.map((room) => {
                  const theme = getRoomTheme(room.name);
                  const forced = (room as any).forcedNextResult as string | null;
                  const selection = controlSelections[room.name] || (forced as BetCategory) || BET_CATEGORIES[0];
                  return (
                    <div key={room.id} className={`bg-[#0B1528] border border-[#1E293B] border-l-[5px] ${theme.border} rounded-2xl p-6 space-y-5 shadow-xl`}>
                      <div className="flex justify-between items-start">
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border ${theme.badge}`}>PHÒNG ID: {room.id}</span>
                        <span className={`w-9 h-9 rounded-full flex items-center justify-center font-black ${theme.iconBg}`}>{theme.icon}</span>
                      </div>

                      <h3 className="font-black text-white text-xl">Phòng Sự Kiện {room.name}</h3>

                      <div className="bg-[#070F1E] border border-[#1E293B] rounded-xl p-4 space-y-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Mã kỳ hiện tại:</span>
                          <span className="font-mono font-bold text-blue-400">{room.session}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Trạng thái kết quả:</span>
                          {forced ? (
                            <span className="font-bold px-2.5 py-1 rounded-md text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/25">🎯 {forced}</span>
                          ) : (
                            <span className="font-bold px-2.5 py-1 rounded-md text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/25">🎲 Ngẫu nhiên</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs text-slate-400">Chọn kết quả muốn cưỡng chế hiển thị:</label>
                        <select
                          value={selection}
                          onChange={(e) => setControlSelections((p) => ({ ...p, [room.name]: e.target.value as BetCategory }))}
                          className="w-full bg-[#070F1E] border border-[#1D293E] text-sm text-white rounded-xl p-3 outline-none focus:border-[#1D5CFF] cursor-pointer font-semibold"
                        >
                          {BET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => handleForceGame(room.name, selection)} className="py-3 rounded-xl bg-[#1D5CFF] hover:bg-blue-600 text-white text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2">
                          <Target className="w-4 h-4" /> Gán kết quả
                        </button>
                        <button
                          onClick={async () => {
                            const ok = await handleForceGame(room.name, null);
                            if (ok) setControlSelections((p) => { const n = { ...p }; delete n[room.name]; return n; });
                          }}
                          disabled={!forced}
                          className="py-3 rounded-xl bg-[#070F1E] border border-[#1D293E] text-slate-300 hover:bg-[#0F1D36] text-sm font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" /> Hủy cưỡng chế
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* ADD MEMBER */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <form onSubmit={handleAddUserSubmit} className="bg-[#0B1528] border border-[#1E293B] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-[#1E293B]">
              <h3 className="font-bold text-white text-base">Thêm thành viên mới</h3>
              <button type="button" onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div><label className="block text-slate-400 mb-1">Tên đăng nhập (viết liền không dấu)</label><input type="text" required placeholder="Vd: user123" value={newUserForm.username} onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none" /></div>
              <div><label className="block text-slate-400 mb-1">Mật khẩu khởi tạo</label><input type="text" required placeholder="Mật khẩu" value={newUserForm.password} onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none font-mono" /></div>
              <div><label className="block text-slate-400 mb-1">Họ và tên khách hàng</label><input type="text" required placeholder="Vd: NGUYỄN THỊ HUYỀN" value={newUserForm.fullName} onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none" /></div>
              <div><label className="block text-slate-400 mb-1">Số điện thoại liên hệ</label><input type="text" required placeholder="Vd: 0912345678" value={newUserForm.phone} onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none" /></div>
              <div><label className="block text-slate-400 mb-1">Ngân hàng liên kết</label><input type="text" placeholder="Vd: Vietcombank" value={newUserForm.bankName} onChange={(e) => setNewUserForm({ ...newUserForm, bankName: e.target.value })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-slate-400 mb-1">Số tài khoản</label><input type="text" placeholder="STK" value={newUserForm.accountNumber} onChange={(e) => setNewUserForm({ ...newUserForm, accountNumber: e.target.value })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none" /></div>
                <div><label className="block text-slate-400 mb-1">Chủ tài khoản</label><input type="text" placeholder="CHỦ TK" value={newUserForm.accountHolder} onChange={(e) => setNewUserForm({ ...newUserForm, accountHolder: e.target.value.toUpperCase() })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none" /></div>
              </div>
              <div><label className="block text-slate-400 mb-1">Số dư khởi tạo ban đầu (đ)</label><input type="number" placeholder="Vd: 5000000" value={newUserForm.initialBalance} onChange={(e) => setNewUserForm({ ...newUserForm, initialBalance: Number(e.target.value) })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none font-mono" /></div>
            </div>
            <button type="submit" className="w-full py-3 bg-[#1D5CFF] hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer">Thêm thành viên mới</button>
          </form>
        </div>
      )}

      {/* EDIT MEMBER */}
      {showEditUserModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <form onSubmit={handleEditUserSubmit} className="bg-[#0B1528] border border-[#1E293B] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-[#1E293B]">
              <h3 className="font-bold text-white text-base">Chỉnh sửa thành viên @{editUserForm.username}</h3>
              <button type="button" onClick={() => setShowEditUserModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div><label className="block text-slate-400 mb-1">Họ và tên</label><input type="text" required value={editUserForm.fullName} onChange={(e) => setEditUserForm({ ...editUserForm, fullName: e.target.value })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none" /></div>
              <div><label className="block text-slate-400 mb-1">Số điện thoại</label><input type="text" required value={editUserForm.phone} onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none" /></div>
              <div><label className="block text-slate-400 mb-1">Ngân hàng</label><input type="text" value={editUserForm.bankName} onChange={(e) => setEditUserForm({ ...editUserForm, bankName: e.target.value })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-slate-400 mb-1">STK</label><input type="text" value={editUserForm.accountNumber} onChange={(e) => setEditUserForm({ ...editUserForm, accountNumber: e.target.value })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none" /></div>
                <div><label className="block text-slate-400 mb-1">Chủ TK</label><input type="text" value={editUserForm.accountHolder} onChange={(e) => setEditUserForm({ ...editUserForm, accountHolder: e.target.value.toUpperCase() })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none" /></div>
              </div>
              <div><label className="block text-slate-400 mb-1">Doanh số hỗ trợ tích lũy (đ)</label><input type="number" value={editUserForm.accumulatedSupport} onChange={(e) => setEditUserForm({ ...editUserForm, accumulatedSupport: Number(e.target.value) })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none font-mono" /></div>
              <div><label className="block text-slate-400 mb-1">Mật khẩu mới (bỏ trống nếu không đổi)</label><input type="text" placeholder="Mật khẩu mới" value={editUserForm.password} onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none font-mono" /></div>
            </div>
            <button type="submit" className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer">Lưu thay đổi thành viên</button>
          </form>
        </div>
      )}

      {/* ADJUST BALANCE */}
      {showAdjustBalanceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <form onSubmit={handleAdjustBalanceSubmit} className="bg-[#0B1528] border border-[#1E293B] rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#1E293B]">
              <h3 className="font-bold text-white text-base">Cộng / Trừ tiền @{selectedUser}</h3>
              <button type="button" onClick={() => setShowAdjustBalanceModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-4 text-xs">
              <div className="flex gap-2">
                <button type="button" onClick={() => setAdjustIsAddition(true)} className={`flex-1 py-3 font-bold rounded-xl border text-center cursor-pointer ${adjustIsAddition ? 'bg-emerald-600 border-emerald-500 text-white shadow' : 'bg-[#070F1E] border-[#1D293E] text-slate-400'}`}>➕ Cộng tiền</button>
                <button type="button" onClick={() => setAdjustIsAddition(false)} className={`flex-1 py-3 font-bold rounded-xl border text-center cursor-pointer ${!adjustIsAddition ? 'bg-rose-600 border-rose-500 text-white shadow' : 'bg-[#070F1E] border-[#1D293E] text-slate-400'}`}>➖ Trừ tiền</button>
              </div>
              <div><label className="block text-slate-400 mb-1.5">Số tiền điều chỉnh (đ)</label><input type="number" required value={adjustAmount} onChange={(e) => setAdjustAmount(Number(e.target.value))} className="w-full bg-[#070F1E] border border-[#1D293E] p-3 text-base rounded-xl text-white outline-none font-mono font-black" /></div>
            </div>
            <button type="submit" className="w-full py-3 bg-[#1D5CFF] hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer">Xác nhận thay đổi số dư</button>
          </form>
        </div>
      )}

      {/* RESET MEMBER PASSWORD */}
      {showChangeUserPasswordModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <form onSubmit={handleResetUserPasswordSubmit} className="bg-[#0B1528] border border-[#1E293B] rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#1E293B]">
              <h3 className="font-bold text-white text-base">Đổi mật khẩu @{selectedUser}</h3>
              <button type="button" onClick={() => setShowChangeUserPasswordModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div><label className="block text-slate-400 mb-1.5 text-xs">Mật khẩu mới của thành viên</label><input type="text" required placeholder="Nhập mật khẩu mới" value={singleUserNewPassword} onChange={(e) => setSingleUserNewPassword(e.target.value)} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none font-mono text-xs" /></div>
            <button type="submit" className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer">Xác nhận đổi mật khẩu</button>
          </form>
        </div>
      )}

      {/* DELETE MEMBER */}
      {showDeleteUserModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-[#0B1528] border border-[#1E293B] rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#1E293B]">
              <h3 className="font-bold text-white text-base">Xóa thành viên @{userToDelete}</h3>
              <button type="button" onClick={() => setShowDeleteUserModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản thành viên này không? Thao tác này KHÔNG THỂ khôi phục.</p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowDeleteUserModal(false)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">Hủy bỏ</button>
              <button onClick={handleConfirmDeleteUser} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow">Xác nhận xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* SIMULATE DEPOSIT */}
      {showSimulateDepositModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <form onSubmit={handleSimulateDepositSubmit} className="bg-[#0B1528] border border-[#1E293B] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#1E293B]">
              <h3 className="font-bold text-white text-base">Mô phỏng yêu cầu nạp tiền</h3>
              <button type="button" onClick={() => setShowSimulateDepositModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div><label className="block text-slate-400 mb-1">Tài khoản thụ hưởng</label><input type="text" required placeholder="Vd: user123" value={simDeposit.username} onChange={(e) => setSimDeposit({ ...simDeposit, username: e.target.value })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none" /></div>
              <div><label className="block text-slate-400 mb-1">Số tiền nạp (đ)</label><input type="number" required value={simDeposit.amount} onChange={(e) => setSimDeposit({ ...simDeposit, amount: Number(e.target.value) })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none font-mono" /></div>
              <div><label className="block text-slate-400 mb-1">Mã tham chiếu ngân hàng (Tx Code)</label><input type="text" required value={simDeposit.txCode} onChange={(e) => setSimDeposit({ ...simDeposit, txCode: e.target.value })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none font-mono" /></div>
              <div><label className="block text-slate-400 mb-1">Số điện thoại giao dịch</label><input type="text" required value={simDeposit.phone} onChange={(e) => setSimDeposit({ ...simDeposit, phone: e.target.value })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none font-mono" /></div>
            </div>
            <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer">Gửi yêu cầu nạp tiền</button>
          </form>
        </div>
      )}

      {/* SIMULATE WITHDRAW */}
      {showSimulateWithdrawModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <form onSubmit={handleSimulateWithdrawSubmit} className="bg-[#0B1528] border border-[#1E293B] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#1E293B]">
              <h3 className="font-bold text-white text-base">Mô phỏng yêu cầu rút tiền</h3>
              <button type="button" onClick={() => setShowSimulateWithdrawModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div><label className="block text-slate-400 mb-1">Tài khoản rút</label><input type="text" required placeholder="Vd: user123" value={simWithdraw.username} onChange={(e) => setSimWithdraw({ ...simWithdraw, username: e.target.value })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none" /></div>
              <div><label className="block text-slate-400 mb-1">Số tiền rút (đ)</label><input type="number" required value={simWithdraw.amount} onChange={(e) => setSimWithdraw({ ...simWithdraw, amount: Number(e.target.value) })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none font-mono" /></div>
              <div><label className="block text-slate-400 mb-1">Tên ngân hàng</label><input type="text" required value={simWithdraw.bankName} onChange={(e) => setSimWithdraw({ ...simWithdraw, bankName: e.target.value })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-slate-400 mb-1">Số tài khoản</label><input type="text" required value={simWithdraw.accountNumber} onChange={(e) => setSimWithdraw({ ...simWithdraw, accountNumber: e.target.value })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none" /></div>
                <div><label className="block text-slate-400 mb-1">Chủ tài khoản</label><input type="text" required value={simWithdraw.accountOwner} onChange={(e) => setSimWithdraw({ ...simWithdraw, accountOwner: e.target.value.toUpperCase() })} className="w-full bg-[#070F1E] border border-[#1D293E] p-2.5 rounded-xl text-white outline-none" /></div>
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer">Gửi yêu cầu rút tiền</button>
          </form>
        </div>
      )}

      {/* CHANGE ADMIN PASSWORD */}
      {showChangeAdminPasswordModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <form onSubmit={handleAdminChangePassword} className="bg-[#0B1528] border border-[#1E293B] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[#1E293B]">
              <h3 className="font-bold text-white text-base flex items-center gap-2"><Key className="w-4.5 h-4.5 text-blue-400" /> Đổi mật khẩu Admin</h3>
              <button type="button" onClick={() => setShowChangeAdminPasswordModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-4 text-xs">
              <div><label className="block text-slate-400 mb-1.5">Mật khẩu hiện tại</label><input type="password" required value={adminPwForm.current} onChange={(e) => setAdminPwForm({ ...adminPwForm, current: e.target.value })} className="w-full bg-[#070F1E] border border-[#1D293E] p-3 rounded-xl text-white outline-none focus:border-[#1D5CFF] font-mono" /></div>
              <div><label className="block text-slate-400 mb-1.5">Mật khẩu mới</label><input type="password" required placeholder="Nhập tối thiểu 6 kí tự" value={adminPwForm.next} onChange={(e) => setAdminPwForm({ ...adminPwForm, next: e.target.value })} className="w-full bg-[#070F1E] border border-[#1D293E] p-3 rounded-xl text-white outline-none focus:border-[#1D5CFF] font-mono" /></div>
              <div><label className="block text-slate-400 mb-1.5">Xác nhận mật khẩu mới</label><input type="password" required placeholder="Nhập lại mật khẩu mới" value={adminPwForm.confirm} onChange={(e) => setAdminPwForm({ ...adminPwForm, confirm: e.target.value })} className="w-full bg-[#070F1E] border border-[#1D293E] p-3 rounded-xl text-white outline-none focus:border-[#1D5CFF] font-mono" /></div>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowChangeAdminPasswordModal(false)} className="flex-1 py-3 bg-[#070F1E] border border-[#1D293E] hover:bg-[#0F1D36] text-slate-200 font-bold rounded-xl transition-all cursor-pointer">Hủy bỏ</button>
              <button type="submit" className="flex-1 py-3 bg-[#1D5CFF] hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer">Lưu thay đổi</button>
            </div>
          </form>
        </div>
      )}

      {/* HISTORY LOOKUP */}
      {showHistoryLookupModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-[#0B1528] border border-[#1E293B] rounded-2xl w-full max-w-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-[#1E293B]">
              <h3 className="font-bold text-white text-base flex items-center gap-2"><History className="w-4.5 h-4.5 text-blue-400" /> Lịch sử @{selectedUser}</h3>
              <button type="button" onClick={() => setShowHistoryLookupModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setLookupSubTab('bets')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${lookupSubTab === 'bets' ? 'bg-[#1D5CFF] text-white' : 'bg-[#070F1E] text-slate-400 border border-[#1D293E]'}`}>Lịch sử cược ({lookupBets.length})</button>
              <button onClick={() => setLookupSubTab('transactions')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${lookupSubTab === 'transactions' ? 'bg-[#1D5CFF] text-white' : 'bg-[#070F1E] text-slate-400 border border-[#1D293E]'}`}>Lịch sử ví ({lookupTx.length})</button>
            </div>
            <div className="overflow-y-auto flex-1 -mx-1 px-1">
              {lookupSubTab === 'bets' ? (
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="text-slate-400 font-bold border-b border-[#1E293B] uppercase text-[10px] tracking-wider sticky top-0 bg-[#0B1528]">
                    <tr><th className="py-2.5">Mã</th><th>Phòng</th><th>Cửa cược</th><th>Mức cược</th><th>Kết quả</th><th>Thời gian</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]/60 font-mono">
                    {lookupBets.length === 0 ? (
                      <tr><td colSpan={6} className="py-8 text-center text-slate-500 font-sans">Chưa có lịch sử cược.</td></tr>
                    ) : lookupBets.map((b: any) => (
                      <tr key={b.id}>
                        <td className="py-2.5 text-white font-bold">{b.id}</td>
                        <td><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getRoomTheme(b.room).pill}`}>{b.room}</span></td>
                        <td className="font-sans">{b.choice}</td>
                        <td className="font-bold">{b.amount.toLocaleString('vi-VN')}đ</td>
                        <td><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${b.result === 'Thắng' ? 'bg-emerald-500/20 text-emerald-400' : b.result === 'Thua' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-500/20 text-slate-400'}`}>{b.result}</span></td>
                        <td className="text-slate-500">{new Date(b.timestamp).toLocaleString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="text-slate-400 font-bold border-b border-[#1E293B] uppercase text-[10px] tracking-wider sticky top-0 bg-[#0B1528]">
                    <tr><th className="py-2.5">Mã</th><th>Loại</th><th>Số tiền</th><th>Trạng thái</th><th>Thời gian</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]/60 font-mono">
                    {lookupTx.length === 0 ? (
                      <tr><td colSpan={5} className="py-8 text-center text-slate-500 font-sans">Chưa có lịch sử giao dịch.</td></tr>
                    ) : lookupTx.map((t: any) => (
                      <tr key={t.id}>
                        <td className="py-2.5 text-white font-bold">{t.id}</td>
                        <td className="font-sans">{t.type}</td>
                        <td className={`font-bold ${t.type === 'Rút tiền' ? 'text-rose-400' : 'text-emerald-400'}`}>{t.type === 'Rút tiền' ? '-' : '+'}{t.amount.toLocaleString('vi-VN')}đ</td>
                        <td><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${t.status === 'Thành công' ? 'bg-emerald-500/20 text-emerald-400' : t.status === 'Đang xử lý' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>{t.status}</span></td>
                        <td className="text-slate-500">{new Date(t.timestamp).toLocaleString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
