import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BetCategory, UserProfile, Transaction, BetRecord } from '../types';
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
  Minus, 
  LogOut, 
  Sliders, 
  ShieldAlert,
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
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export const AdminScreen: React.FC = () => {
  const {
    logout,
    accounts,
    setAccounts,
    allTransactions,
    setAllTransactions,
    updateTransactionStatus,
    adminModifyUserBalance,
    adminUpdateUserProfile,
    adminForceGameResult,
    adminDeleteUser,
    forcedNextResult,
    secondsRemaining,
    currentPeriod,
    bets,
    setActiveScreen,
    rooms,
    addRoom,
    updateRoom,
    deleteRoom,
    adminClearAllBets,
    adminClearAllTransactions,
    showToast
  } = useApp();

  // Selected tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'bets' | 'deposits' | 'withdrawals' | 'rooms' | 'control'>('dashboard');
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters for tables
  const [filterRoom, setFilterRoom] = useState<string>('Tất cả');
  const [filterStatus, setFilterStatus] = useState<string>('Tất cả');
  const [filterWithdrawStatus, setFilterWithdrawStatus] = useState<string>('Tất cả');

  // Mobile sidebar drawer toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals visibility states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showAdjustBalanceModal, setShowAdjustBalanceModal] = useState(false);
  const [showChangeUserPasswordModal, setShowChangeUserPasswordModal] = useState(false);
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [showSimulateDepositModal, setShowSimulateDepositModal] = useState(false);
  const [showSimulateWithdrawModal, setShowSimulateWithdrawModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string>('');
  const [showHistoryLookupModal, setShowHistoryLookupModal] = useState(false);
  const [lookupSubTab, setLookupSubTab] = useState<'bets' | 'transactions'>('bets');

  // Selected user username for modals
  const [selectedUser, setSelectedUser] = useState<string>('');

  // Target inputs for user creation/editing
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    password: '',
    fullName: '',
    phone: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    initialBalance: 0
  });

  const [editUserForm, setEditUserForm] = useState({
    username: '',
    fullName: '',
    phone: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    accumulatedSupport: 0,
    password: ''
  });

  // Balance adjustment inputs
  const [adjustAmount, setAdjustAmount] = useState<number>(500000);
  const [adjustAmountInput, setAdjustAmountInput] = useState<string>('500000');
  const [adjustIsAddition, setAdjustIsAddition] = useState<boolean>(true);

  // Single user password update
  const [singleUserNewPassword, setSingleUserNewPassword] = useState('');

  // Admin password update inputs
  const [adminPasswordForm, setAdminPasswordForm] = useState({
    currentPass: '',
    newPass: '',
    confirmNewPass: ''
  });

  // Simulation inputs
  const [simDeposit, setSimDeposit] = useState({
    username: '',
    amount: 15000000,
    txCode: 'VTX-99812A',
    phone: '0901234567'
  });

  const [simWithdraw, setSimWithdraw] = useState({
    username: '',
    amount: 5000000,
    bankName: 'Vietcombank',
    accountNumber: '0123456789',
    accountOwner: 'NGUYEN VAN PHONG'
  });

  // Force result feedback state
  const [forcedResults, setForcedResults] = useState<{
    Facebook: BetCategory | null;
    Youtube: BetCategory | null;
  }>({
    Facebook: null,
    Youtube: null
  });

  // Derived roomList from global rooms state and countdowns
  const roomList = rooms.map(r => ({
    ...r,
    currentCycle: secondsRemaining,
    session: currentPeriod[r.name] || 'N/A'
  }));

  const [newRoomForm, setNewRoomForm] = useState({
    name: '',
    cycle: 45,
    icon: 'smart_display'
  });

  const [editingRoom, setEditingRoom] = useState<{ id: string; name: string; cycle: number; icon: string } | null>(null);
  const [showEditRoomModal, setShowEditRoomModal] = useState(false);

  const [showClearAllBetsConfirm, setShowClearAllBetsConfirm] = useState(false);
  const [showClearAllTransactionsConfirm, setShowClearAllTransactionsConfirm] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<{ id: string; name: string } | null>(null);

  // Derived metrics from accounts object
  const accountsData = accounts as Record<string, { profile: UserProfile; password: string; bets?: BetRecord[]; transactions?: Transaction[] }>;
  const userList = Object.values(accountsData).map(a => a.profile).filter(u => u.username !== 'admin');
  const totalUsers = userList.length;
  
  // Calculate total deposits and total withdrawals
  const totalDeposits = allTransactions
    .filter(t => t.type === 'Nạp tiền' && t.status === 'Thành công')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = allTransactions
    .filter(t => t.type === 'Rút tiền' && t.status === 'Thành công')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingCount = allTransactions.filter(t => t.status === 'Đang xử lý').length;

  // Alert sound and blinking document title when there are pending transactions
  useEffect(() => {
    if (pendingCount > 0) {
      // 1. Play beautiful synthesized notification chime using Web Audio API
      const playChime = () => {
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioContextClass) return;
          const audioCtx = new AudioContextClass();
          
          const now = audioCtx.currentTime;
          
          // Sound note synthesizer helper
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
          
          // Play high dual-tone chime (ding-dong effect)
          synthNote(784, now, 0.25); // G5
          synthNote(987, now + 0.12, 0.4); // B5
        } catch (e) {
          console.warn('Audio Context block:', e);
        }
      };

      playChime();

      // 2. Flash page title
      const originalTitle = document.title;
      let isAlt = false;
      const titleTimer = setInterval(() => {
        document.title = isAlt 
          ? `⚠️ CÓ LỆNH CHỜ DUYỆT (${pendingCount})!` 
          : `🔔 Kiểm tra giao dịch mới!`;
        isAlt = !isAlt;
      }, 1200);

      return () => {
        clearInterval(titleTimer);
        document.title = originalTitle;
      };
    }
  }, [pendingCount]);

  const formatVND = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v).replace('₫', 'đ');
  const formatNumber = (v: number) => new Intl.NumberFormat('vi-VN').format(v);

  // 7-day transaction analytics for chart
  const getLast7DaysLabels = () => {
    const labels = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      labels.push({
        label: `${day}/${month}`,
        rawDate: d
      });
    }
    return labels;
  };

  const chartData = getLast7DaysLabels().map(day => {
    const deposits = allTransactions.filter(t => {
      if (t.type !== 'Nạp tiền' || t.status !== 'Thành công') return false;
      const tDate = new Date(t.timestamp);
      return tDate.getDate() === day.rawDate.getDate() &&
             tDate.getMonth() === day.rawDate.getMonth() &&
             tDate.getFullYear() === day.rawDate.getFullYear();
    }).reduce((sum, t) => sum + t.amount, 0);

    const withdrawals = allTransactions.filter(t => {
      if (t.type !== 'Rút tiền' || t.status !== 'Thành công') return false;
      const tDate = new Date(t.timestamp);
      return tDate.getDate() === day.rawDate.getDate() &&
             tDate.getMonth() === day.rawDate.getMonth() &&
             tDate.getFullYear() === day.rawDate.getFullYear();
    }).reduce((sum, t) => sum + t.amount, 0);

    return {
      label: day.label,
      deposits,
      withdrawals
    };
  });

  const hasChartData = chartData.some(d => d.deposits > 0 || d.withdrawals > 0);
  const chartMaxVal = Math.max(...chartData.map(d => Math.max(d.deposits, d.withdrawals)), 100000);

  // SVG Chart configurations
  const chartWidth = 500;
  const chartHeight = 140;
  const chartLeftMargin = 70;
  const chartBottomY = 170;

  const depositPoints = chartData.map((d, i) => {
    const x = chartLeftMargin + i * (chartWidth / 6);
    const y = chartBottomY - (d.deposits / chartMaxVal) * chartHeight;
    return { x, y };
  });

  const withdrawPoints = chartData.map((d, i) => {
    const x = chartLeftMargin + i * (chartWidth / 6);
    const y = chartBottomY - (d.withdrawals / chartMaxVal) * chartHeight;
    return { x, y };
  });

  const depositPath = depositPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const depositAreaPath = depositPoints.length > 0 ? `${depositPath} L ${depositPoints[depositPoints.length - 1].x} ${chartBottomY} L ${depositPoints[0].x} ${chartBottomY} Z` : '';

  const withdrawPath = withdrawPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const withdrawAreaPath = withdrawPoints.length > 0 ? `${withdrawPath} L ${withdrawPoints[withdrawPoints.length - 1].x} ${chartBottomY} L ${withdrawPoints[0].x} ${chartBottomY} Z` : '';

  // Filter members
  const filteredUsers = userList.filter(user => {
    const s = searchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(s) ||
      user.fullName.toLowerCase().includes(s) ||
      user.phone.includes(s) ||
      (user.accountNumber && user.accountNumber.includes(s))
    );
  });

  // Filter deposits
  const depositTransactions = allTransactions.filter(t => t.type === 'Nạp tiền');
  const filteredDeposits = depositTransactions.filter(t => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = !s || 
      t.id.toLowerCase().includes(s) || 
      (t.username && t.username.toLowerCase().includes(s)) ||
      (t.fullName && t.fullName.toLowerCase().includes(s)) ||
      (t.details && t.details.toLowerCase().includes(s));
    return matchesSearch;
  });

  // Filter withdrawals
  const withdrawTransactions = allTransactions.filter(t => t.type === 'Rút tiền');
  const filteredWithdrawals = withdrawTransactions.filter(t => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = !s ||
      t.id.toLowerCase().includes(s) ||
      (t.username && t.username.toLowerCase().includes(s)) ||
      (t.fullName && t.fullName.toLowerCase().includes(s)) ||
      (t.details && t.details.toLowerCase().includes(s));

    const matchesStatus = filterWithdrawStatus === 'Tất cả' ||
      (filterWithdrawStatus === 'Chờ xử lý' && t.status === 'Đang xử lý') ||
      (filterWithdrawStatus === 'Đã duyệt' && t.status === 'Thành công') ||
      (filterWithdrawStatus === 'Đã từ chối' && t.status === 'Thất bại');

    return matchesSearch && matchesStatus;
  });

  // Filter bets
  const allUsersBets = Object.keys(accountsData).flatMap((username) => {
    const acc = accountsData[username];
    const userBets = acc.bets || [];
    return userBets.map(b => ({
      ...b,
      username: b.username || username,
      fullName: acc.profile?.fullName || ''
    }));
  });

  const filteredBets = allUsersBets.filter(b => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = !s ||
      b.id.toLowerCase().includes(s) ||
      b.period.includes(s) ||
      b.choice.toLowerCase().includes(s) ||
      b.username.toLowerCase().includes(s) ||
      b.fullName.toLowerCase().includes(s);

    const matchesRoom = filterRoom === 'Tất cả' || b.room === filterRoom;
    const matchesStatus = filterStatus === 'Tất cả' ||
      (filterStatus === 'Thắng' && b.result === 'Thắng') ||
      (filterStatus === 'Thua' && b.result === 'Thua') ||
      (filterStatus === 'Chờ kết quả' && b.result === 'Chờ kết quả');

    return matchesSearch && matchesRoom && matchesStatus;
  });

  // Force Outcome Handler
  const handleForceGame = (room: 'Facebook' | 'Youtube', category: BetCategory) => {
    adminForceGameResult(room, category);
    setForcedResults(prev => ({ ...prev, [room]: category }));
    alert(`Đã gán kết quả tiếp theo của phòng ${room} thành: "${category}"`);
  };

  // Clear all transaction records
  const handleClearAllTransactions = () => {
    if (window.confirm("Bạn có chắc chắn muốn XÓA SẠCH tất cả lịch sử giao dịch nạp/rút tiền trên toàn bộ hệ thống? Việc này sẽ giúp bạn dễ dàng nhận biết khi có khách nạp/rút tiền mới.")) {
      setAllTransactions([]);
      localStorage.setItem('viet-tien-all-transactions', JSON.stringify([]));

      setAccounts((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((username) => {
          next[username] = {
            ...next[username],
            transactions: [],
          };
          localStorage.setItem(`viet-tien-trans-${username}`, JSON.stringify([]));
        });
        localStorage.setItem('viet-tien-accounts', JSON.stringify(next));
        return next;
      });

      alert("Đã xóa sạch tất cả lịch sử giao dịch nạp và rút tiền thành công!");
    }
  };

  // Create User Submit handler
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const usernameClean = newUserForm.username.trim();
    if (!usernameClean) return;

    if (accountsData[usernameClean]) {
      alert('Tên tài khoản đã tồn tại trên hệ thống!');
      return;
    }

    const newUserProfile: UserProfile = {
      username: usernameClean,
      fullName: newUserForm.fullName.trim(),
      id: String(Math.floor(1000 + Math.random() * 9000)),
      balance: Number(newUserForm.initialBalance) || 0,
      phone: newUserForm.phone.trim(),
      bankName: newUserForm.bankName.trim(),
      accountNumber: newUserForm.accountNumber.trim(),
      accountHolder: newUserForm.accountHolder.trim().toUpperCase(),
      accumulatedSupport: 0,
      accumulatedInterest: 0,
      accumulatedWins: 0,
      accumulationCount: 0
    };

    const transactId = 'TX' + Math.floor(1000 + Math.random() * 9000);
    const initialTx: Transaction[] = [];
    if (Number(newUserForm.initialBalance) > 0) {
      initialTx.push({
        id: transactId,
        type: 'Nạp tiền',
        amount: Number(newUserForm.initialBalance),
        status: 'Thành công',
        timestamp: new Date().toISOString(),
        details: 'Nạp tiền khởi tạo tài khoản trải nghiệm',
        username: usernameClean,
        fullName: newUserForm.fullName.trim()
      });
    }

    setAccounts(prev => ({
      ...prev,
      [usernameClean]: {
        profile: newUserProfile,
        password: newUserForm.password || usernameClean,
        bets: [],
        transactions: initialTx
      }
    }));

    localStorage.setItem(`viet-tien-trans-${usernameClean}`, JSON.stringify(initialTx));
    localStorage.setItem(`viet-tien-bets-${usernameClean}`, JSON.stringify([]));

    alert(`Đã thêm thành viên "${usernameClean}" thành công!`);
    setShowAddUserModal(false);
    setNewUserForm({
      username: '',
      password: '',
      fullName: '',
      phone: '',
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      initialBalance: 0
    });
  };

  // Edit User Submit handler
  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profileUpdates: Partial<UserProfile> = {
      fullName: editUserForm.fullName.trim(),
      phone: editUserForm.phone.trim(),
      bankName: editUserForm.bankName.trim(),
      accountNumber: editUserForm.accountNumber.trim(),
      accountHolder: editUserForm.accountHolder.trim().toUpperCase(),
      accumulatedSupport: Number(editUserForm.accumulatedSupport) || 0
    };

    adminUpdateUserProfile(editUserForm.username, profileUpdates, editUserForm.password || undefined);
    alert(`Đã cập nhật thông tin thành viên "${editUserForm.username}" thành công!`);
    setShowEditUserModal(false);
  };

  // Toggle Lock state for member (represented locally as flag)
  const handleToggleLockUser = (username: string) => {
    const userAcc = accountsData[username];
    if (!userAcc) return;

    const isLockedCurrently = (userAcc.profile as any).isLocked || false;
    const nextLockedState = !isLockedCurrently;

    setAccounts(prev => {
      const copy = { ...prev };
      copy[username] = {
        ...copy[username],
        profile: {
          ...copy[username].profile,
          isLocked: nextLockedState
        } as any
      };
      return copy;
    });

    alert(`Đã ${nextLockedState ? 'Khóa' : 'Mở khóa'} tài khoản "${username}" thành công!`);
  };

  // Delete user from local accounts registry
  const handleDeleteUser = (username: string) => {
    setUserToDelete(username);
    setShowDeleteUserModal(true);
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    adminDeleteUser(userToDelete);
    setShowDeleteUserModal(false);
    setUserToDelete('');
  };

  // Balance adjust handler
  const handleAdjustBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (adjustAmount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ!');
      return;
    }

    adminModifyUserBalance(selectedUser, adjustAmount, adjustIsAddition);

    showToast(`Đã ${adjustIsAddition ? 'Cộng' : 'Trừ'} ${formatNumber(adjustAmount)}đ vào ví ${selectedUser}!`, 'success');
    setShowAdjustBalanceModal(false);
  };

  // Reset member password
  const handleResetUserPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !singleUserNewPassword.trim()) return;

    adminUpdateUserProfile(selectedUser, {}, singleUserNewPassword.trim());

    alert(`Đã đổi mật khẩu tài khoản "${selectedUser}" thành: ${singleUserNewPassword.trim()}`);
    setShowChangeUserPasswordModal(false);
    setSingleUserNewPassword('');
  };

  // Admin password change handler
  const handleAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adminAcc = accountsData['admin'];
    if (!adminAcc) return;

    if (adminPasswordForm.currentPass !== adminAcc.password) {
      alert('Mật khẩu quản trị hiện tại không chính xác!');
      return;
    }

    if (adminPasswordForm.newPass.length < 6) {
      alert('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }

    if (adminPasswordForm.newPass !== adminPasswordForm.confirmNewPass) {
      alert('Xác nhận mật khẩu mới không khớp!');
      return;
    }

    setAccounts(prev => ({
      ...prev,
      admin: {
        ...prev.admin,
        password: adminPasswordForm.newPass
      }
    }));

    alert('Đã thay đổi mật khẩu quản trị thành công!');
    setShowAdminPasswordModal(false);
    setAdminPasswordForm({ currentPass: '', newPass: '', confirmNewPass: '' });
  };

  // Simulate Deposit (create a pending deposit request)
  const handleSimulateDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = simDeposit.username;
    const userAcc = accountsData[target];
    if (!userAcc) {
      showToast('Không tìm thấy tài khoản này để nạp!', 'error');
      return;
    }

    const txCode = simDeposit.txCode.trim() || 'VTX-' + Math.floor(10000 + Math.random() * 90000) + 'A';
    const txId = 'DP-' + Math.floor(100000 + Math.random() * 900000);
    const newTx: Transaction = {
      id: txId,
      type: 'Nạp tiền',
      amount: Number(simDeposit.amount),
      status: 'Đang xử lý',
      timestamp: new Date().toISOString(),
      details: `Mã giao dịch: ${txCode}. SĐT: ${simDeposit.phone.trim()}`,
      username: target,
      fullName: userAcc.profile.fullName
    };

    setAllTransactions(prev => {
      const combined = [newTx, ...prev];
      const unique = combined.filter((item, index) => combined.findIndex(t => t.id === item.id) === index);
      localStorage.setItem('viet-tien-all-transactions', JSON.stringify(unique));
      return unique;
    });

    setAccounts(prev => {
      const copy = { ...prev };
      if (!copy[target]) return prev;
      const userTransactions = copy[target].transactions || [];
      const updatedTransactions = [newTx, ...userTransactions];
      const uniqueTransactions = updatedTransactions.filter((item, index) => updatedTransactions.findIndex(t => t.id === item.id) === index);
      
      localStorage.setItem(`viet-tien-trans-${target}`, JSON.stringify(uniqueTransactions));

      copy[target] = {
        ...copy[target],
        transactions: uniqueTransactions
      };
      
      localStorage.setItem('viet-tien-accounts', JSON.stringify(copy));
      return copy;
    });

    showToast(`Đã khởi tạo yêu cầu nạp tiền giả định thành công cho @${target}!`, 'success');
    setShowSimulateDepositModal(false);
  };

  // Simulate Withdrawal (create a pending withdrawal request)
  const handleSimulateWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = simWithdraw.username;
    const userAcc = accountsData[target];
    if (!userAcc) {
      alert('Không tìm thấy tài khoản này để rút!');
      return;
    }

    if (userAcc.profile.balance < simWithdraw.amount) {
      alert(`Số dư của @${target} không đủ để thực hiện yêu cầu rút này!`);
      return;
    }

    const txId = '#WR-' + Math.floor(1000 + Math.random() * 9000);
    const newTx: Transaction = {
      id: txId,
      type: 'Rút tiền',
      amount: Number(simWithdraw.amount),
      status: 'Đang xử lý',
      timestamp: new Date().toISOString(),
      details: `Rút về ngân hàng ${simWithdraw.bankName} - ${simWithdraw.accountNumber} - ${simWithdraw.accountOwner.toUpperCase()}`,
      username: target,
      fullName: userAcc.profile.fullName
    };

    // Subtract balance first to mock real request logic
    setAccounts(prev => {
      const copy = { ...prev };
      if (!copy[target]) return prev;
      const userTransactions = copy[target].transactions || [];
      const updatedTransactions = [newTx, ...userTransactions];
      const uniqueTransactions = updatedTransactions.filter((item, index) => updatedTransactions.findIndex(t => t.id === item.id) === index);
      
      localStorage.setItem(`viet-tien-trans-${target}`, JSON.stringify(uniqueTransactions));

      copy[target] = {
        ...copy[target],
        profile: {
          ...copy[target].profile,
          balance: copy[target].profile.balance - simWithdraw.amount
        },
        transactions: uniqueTransactions
      };

      localStorage.setItem('viet-tien-accounts', JSON.stringify(copy));
      return copy;
    });

    setAllTransactions(prev => {
      const combined = [newTx, ...prev];
      const unique = combined.filter((item, index) => combined.findIndex(t => t.id === item.id) === index);
      localStorage.setItem('viet-tien-all-transactions', JSON.stringify(unique));
      return unique;
    });

    alert(`Đã tạo yêu cầu rút tiền giả định thành công cho @${target}!`);
    setShowSimulateWithdrawModal(false);
  };

  // Save Room changes or add new room
  const handleAddRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomForm.name.trim()) return;

    addRoom(newRoomForm.name.trim(), newRoomForm.cycle, newRoomForm.icon);
    showToast(`Đã tạo phòng chơi mới "${newRoomForm.name.trim()}" thành công!`, 'success');
    setNewRoomForm({ name: '', cycle: 45, icon: 'smart_display' });
  };

  const handleEditRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !editingRoom.name.trim()) return;

    updateRoom(editingRoom.id, editingRoom.name.trim(), editingRoom.cycle, editingRoom.icon);
    showToast(`Đã cập nhật phòng chơi "${editingRoom.name.trim()}" thành công!`, 'success');
    setShowEditRoomModal(false);
    setEditingRoom(null);
  };

  return (
    <div className="min-h-screen bg-[#070F1E] text-slate-100 flex font-sans w-full">
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0B1528] border-r border-[#1E293B] flex flex-col py-6 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="px-6 mb-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1D5CFF] flex items-center justify-center font-bold text-xl text-white shadow-[0_4px_12px_rgba(29,92,255,0.3)]">
              VT
            </div>
            <div>
              <h1 className="font-extrabold text-white text-md tracking-wide">Việt Tiến</h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Quản trị hệ thống</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1.5">
          <button 
            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }} 
            className={`w-full text-left flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wide cursor-pointer transition-all duration-300 relative group overflow-hidden ${
              activeTab === 'dashboard' 
                ? 'bg-gradient-to-r from-blue-600/15 via-blue-500/5 to-transparent text-blue-400 border-l-[3.5px] border-blue-500 shadow-[inset_1px_0_0_0_rgba(29,92,255,0.15)] shadow-md shadow-blue-900/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-l-[3.5px] border-transparent hover:border-slate-700/50 hover:translate-x-1'
            }`}
          >
            <TrendingUp className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${activeTab === 'dashboard' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Tổng quan</span>
            {activeTab === 'dashboard' && (
              <span className="absolute right-4 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(29,92,255,0.8)] animate-pulse" />
            )}
          </button>
          
          <button 
            onClick={() => { setActiveTab('users'); setSidebarOpen(false); }} 
            className={`w-full text-left flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wide cursor-pointer transition-all duration-300 relative group overflow-hidden ${
              activeTab === 'users' 
                ? 'bg-gradient-to-r from-blue-600/15 via-blue-500/5 to-transparent text-blue-400 border-l-[3.5px] border-blue-500 shadow-[inset_1px_0_0_0_rgba(29,92,255,0.15)] shadow-md shadow-blue-900/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-l-[3.5px] border-transparent hover:border-slate-700/50 hover:translate-x-1'
            }`}
          >
            <Users className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${activeTab === 'users' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Thành viên</span>
            {activeTab === 'users' && (
              <span className="absolute right-4 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(29,92,255,0.8)] animate-pulse" />
            )}
          </button>

          <button 
            onClick={() => { setActiveTab('bets'); setSidebarOpen(false); }} 
            className={`w-full text-left flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wide cursor-pointer transition-all duration-300 relative group overflow-hidden ${
              activeTab === 'bets' 
                ? 'bg-gradient-to-r from-blue-600/15 via-blue-500/5 to-transparent text-blue-400 border-l-[3.5px] border-blue-500 shadow-[inset_1px_0_0_0_rgba(29,92,255,0.15)] shadow-md shadow-blue-900/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-l-[3.5px] border-transparent hover:border-slate-700/50 hover:translate-x-1'
            }`}
          >
            <Clock className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${activeTab === 'bets' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Lịch sử cược</span>
            {activeTab === 'bets' && (
              <span className="absolute right-4 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(29,92,255,0.8)] animate-pulse" />
            )}
          </button>

          <button 
            onClick={() => { setActiveTab('deposits'); setSidebarOpen(false); }} 
            className={`w-full text-left flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wide cursor-pointer transition-all duration-300 relative group overflow-hidden ${
              activeTab === 'deposits' 
                ? 'bg-gradient-to-r from-blue-600/15 via-blue-500/5 to-transparent text-blue-400 border-l-[3.5px] border-blue-500 shadow-[inset_1px_0_0_0_rgba(29,92,255,0.15)] shadow-md shadow-blue-900/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-l-[3.5px] border-transparent hover:border-slate-700/50 hover:translate-x-1'
            }`}
          >
            <ArrowDownCircle className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${activeTab === 'deposits' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Giao dịch nạp</span>
            {activeTab === 'deposits' && (
              <span className="absolute right-4 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(29,92,255,0.8)] animate-pulse" />
            )}
          </button>

          <button 
            onClick={() => { setActiveTab('withdrawals'); setSidebarOpen(false); }} 
            className={`w-full text-left flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wide cursor-pointer transition-all duration-300 relative group overflow-hidden ${
              activeTab === 'withdrawals' 
                ? 'bg-gradient-to-r from-blue-600/15 via-blue-500/5 to-transparent text-blue-400 border-l-[3.5px] border-blue-500 shadow-[inset_1px_0_0_0_rgba(29,92,255,0.15)] shadow-md shadow-blue-900/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-l-[3.5px] border-transparent hover:border-slate-700/50 hover:translate-x-1'
            }`}
          >
            <ArrowUpCircle className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${activeTab === 'withdrawals' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Giao dịch rút</span>
            {pendingCount > 0 ? (
              <span className="ml-auto bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black px-2 py-0.5 rounded-full text-[9px] shadow-[0_0_8px_rgba(245,158,11,0.25)]">{pendingCount}</span>
            ) : (
              activeTab === 'withdrawals' && (
                <span className="absolute right-4 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(29,92,255,0.8)] animate-pulse" />
              )
            )}
          </button>

          <button 
            onClick={() => { setActiveTab('rooms'); setSidebarOpen(false); }} 
            className={`w-full text-left flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wide cursor-pointer transition-all duration-300 relative group overflow-hidden ${
              activeTab === 'rooms' 
                ? 'bg-gradient-to-r from-blue-600/15 via-blue-500/5 to-transparent text-blue-400 border-l-[3.5px] border-blue-500 shadow-[inset_1px_0_0_0_rgba(29,92,255,0.15)] shadow-md shadow-blue-900/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-l-[3.5px] border-transparent hover:border-slate-700/50 hover:translate-x-1'
            }`}
          >
            <Sliders className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${activeTab === 'rooms' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Quản lý phòng</span>
            {activeTab === 'rooms' && (
              <span className="absolute right-4 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(29,92,255,0.8)] animate-pulse" />
            )}
          </button>

          <button 
            onClick={() => { setActiveTab('control'); setSidebarOpen(false); }} 
            className={`w-full text-left flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wide cursor-pointer transition-all duration-300 relative group overflow-hidden ${
              activeTab === 'control' 
                ? 'bg-gradient-to-r from-blue-600/15 via-blue-500/5 to-transparent text-blue-400 border-l-[3.5px] border-blue-500 shadow-[inset_1px_0_0_0_rgba(29,92,255,0.15)] shadow-md shadow-blue-900/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-l-[3.5px] border-transparent hover:border-slate-700/50 hover:translate-x-1'
            }`}
          >
            <Settings className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${activeTab === 'control' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Can thiệp kết quả</span>
            {activeTab === 'control' && (
              <span className="absolute right-4 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(29,92,255,0.8)] animate-pulse" />
            )}
          </button>

          <div className="border-t border-[#1E293B]/60 my-4" />

          <button 
            onClick={() => { setShowAdminPasswordModal(true); setSidebarOpen(false); }} 
            className="w-full text-left flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800/30 hover:text-slate-100 cursor-pointer transition-all duration-300 hover:translate-x-1 group"
          >
            <Key className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110 text-slate-400" />
            <span>Đổi mật khẩu</span>
          </button>
          
          <button 
            onClick={logout} 
            className="w-full text-left flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-all duration-300 hover:translate-x-1 group"
          >
            <LogOut className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
            <span>Đăng xuất</span>
          </button>
        </nav>

        <div className="mt-auto px-6 text-center text-[10px] text-slate-500">
          VT-SYS Control Panel v2.5
        </div>
      </aside>

      {/* MAIN ADMIN WORKSPACE */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* HEADER */}
        <header className="h-16 border-b border-[#1E293B] bg-[#0B1528]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-400 hover:text-white p-1">
              Menu
            </button>
            <div className="relative hidden sm:block w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm kiếm giao dịch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#070F1E] border border-[#1D293E] text-xs text-white rounded-xl py-2 pl-10 pr-4 outline-none focus:border-[#1D5CFF] transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">


            <button className="text-slate-400 hover:text-white relative p-1">
              <Bell className="w-5 h-5" />
              {pendingCount > 0 && <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-amber-500" />}
            </button>

            <button className="text-slate-400 hover:text-white p-1">
              <Settings className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-l border-[#1E293B] pl-4">
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

        {/* CONTAINER VIEW */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {pendingCount > 0 && (
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white px-5 py-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-amber-500/30 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center animate-bounce shrink-0">
                  <Bell className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider">Có yêu cầu giao dịch chờ xét duyệt!</h4>
                  <p className="text-xs text-white/95 mt-0.5">
                    Hiện tại đang có <span className="font-black font-mono text-yellow-300 text-sm">{pendingCount}</span> yêu cầu giao dịch đang ở trạng thái <span className="font-bold underline">Chờ xử lý</span>. Vui lòng kiểm tra và duyệt ngay.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('withdrawals')}
                className="bg-white text-orange-700 hover:bg-slate-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer shrink-0"
              >
                Xử lý ngay
              </button>
            </div>
          )}
          
          {/* TAB: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0B1528]/40 border border-slate-800/60 p-5 rounded-2xl backdrop-blur-md">
                <div>
                  <h2 className="text-xl font-black text-white tracking-wider uppercase flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping shrink-0" />
                    Tổng quan hệ thống
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Bảng điều khiển giám sát hoạt động tài chính & đặt cược thời gian thực.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-slate-400 bg-slate-900/80 px-4 py-2.5 border border-slate-800 rounded-xl font-mono flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    Đếm ngược: <span className="text-red-500 font-extrabold">{secondsRemaining} giây</span>
                  </span>
                </div>
              </div>

              {/* KPI STATS CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* CARD 1: TOTAL USERS */}
                <div className="bg-[#0B1528]/80 hover:bg-[#0F1D36]/80 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl flex items-center justify-between transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-xl hover:shadow-blue-500/5 group">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Tổng thành viên</span>
                    <h3 className="text-2xl font-black text-white font-mono group-hover:text-blue-400 transition-colors">{totalUsers}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-[#1D5CFF] flex items-center justify-center transition-all duration-300 group-hover:bg-blue-500 group-hover:text-white">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                {/* CARD 2: TOTAL DEPOSITS */}
                <div className="bg-[#0B1528]/80 hover:bg-[#0F1D36]/80 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl flex items-center justify-between transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-xl hover:shadow-emerald-500/5 group">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Tổng nạp thành công</span>
                    <h3 className="text-xl font-black text-emerald-400 font-mono group-hover:text-emerald-300 transition-colors">{formatVND(totalDeposits)}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white">
                    <ArrowDownCircle className="w-5 h-5" />
                  </div>
                </div>

                {/* CARD 3: TOTAL WITHDRAWALS */}
                <div className="bg-[#0B1528]/80 hover:bg-[#0F1D36]/80 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl flex items-center justify-between transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-xl hover:shadow-rose-500/5 group">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Tổng rút thành công</span>
                    <h3 className="text-xl font-black text-rose-500 font-mono group-hover:text-rose-450 transition-colors">{formatVND(totalWithdrawals)}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center transition-all duration-300 group-hover:bg-rose-500 group-hover:text-white">
                    <ArrowUpCircle className="w-5 h-5" />
                  </div>
                </div>

                {/* CARD 4: ACTIVE ROOMS */}
                <div className="bg-[#0B1528]/80 hover:bg-[#0F1D36]/80 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl flex items-center justify-between transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-xl hover:shadow-purple-500/5 group">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Phòng hoạt động</span>
                    <h3 className="text-2xl font-black text-purple-400 font-mono group-hover:text-purple-300 transition-colors">{roomList.length}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center transition-all duration-300 group-hover:bg-purple-500 group-hover:text-white">
                    <Sliders className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* BENTO GRID PANELS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Chart Card */}
                <div className="bg-[#0B1528]/80 border border-slate-800/80 rounded-2xl p-5 lg:col-span-2 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-white">Thống kê Giao dịch thành công (7 ngày gần nhất)</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Dữ liệu doanh số giao dịch đã duyệt thành công.</p>
                    </div>
                    {hasChartData && (
                      <div className="flex items-center gap-3 text-[10px] bg-slate-950/40 p-2 rounded-xl border border-slate-800">
                        <span className="flex items-center gap-1.5 font-bold"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Nạp tiền</span>
                        <span className="flex items-center gap-1.5 font-bold"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> Rút tiền</span>
                      </div>
                    )}
                  </div>

                  {/* CUSTOM GLOWING SVG LINE CHART */}
                  <div className="h-64 relative w-full pt-4 bg-slate-950/20 rounded-xl border border-slate-900/60 p-2">
                    {!hasChartData ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                        <TrendingUp className="w-10 h-10 stroke-1 text-slate-600 animate-pulse" />
                        <p className="text-xs font-semibold text-slate-400">Chưa có dữ liệu</p>
                        <p className="text-[10px] text-slate-500">Các yêu cầu nạp hoặc rút tiền được duyệt thành công sẽ hiển thị tại đây.</p>
                      </div>
                    ) : (
                      <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                        {/* Grid Lines */}
                        <line x1="70" y1="30" x2="570" y2="30" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
                        <line x1="70" y1="100" x2="570" y2="100" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
                        <line x1="70" y1="170" x2="570" y2="170" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />

                        {/* Y-Axis Labels */}
                        <text x="60" y="34" fill="#64748B" fontSize="9" fontWeight="bold" textAnchor="end" className="font-mono">{formatVND(chartMaxVal)}</text>
                        <text x="60" y="104" fill="#64748B" fontSize="9" fontWeight="bold" textAnchor="end" className="font-mono">{formatVND(chartMaxVal / 2)}</text>
                        <text x="60" y="174" fill="#64748B" fontSize="9" fontWeight="bold" textAnchor="end" className="font-mono">0 đ</text>

                        {/* Deposit Area & Path */}
                        <path 
                          d={depositAreaPath} 
                          fill="url(#depositGlow)" 
                          opacity="0.1"
                        />
                        <path 
                          d={depositPath} 
                          fill="none" 
                          stroke="#10B981" 
                          strokeWidth="3.5" 
                          strokeLinecap="round"
                          className="animate-pulse"
                        />

                        {/* Withdrawal Area & Path */}
                        <path 
                          d={withdrawAreaPath} 
                          fill="url(#withdrawGlow)" 
                          opacity="0.08"
                        />
                        <path 
                          d={withdrawPath} 
                          fill="none" 
                          stroke="#EF4444" 
                          strokeWidth="3.5" 
                          strokeLinecap="round"
                        />

                        {/* Glowing Points */}
                        {depositPoints.map((p, idx) => (
                          chartData[idx].deposits > 0 && (
                            <circle key={`dep-${idx}`} cx={p.x} cy={p.y} r="4" fill="#10B981" stroke="#070F1E" strokeWidth="1.5" className="cursor-pointer" />
                          )
                        ))}
                        {withdrawPoints.map((p, idx) => (
                          chartData[idx].withdrawals > 0 && (
                            <circle key={`with-${idx}`} cx={p.x} cy={p.y} r="4" fill="#EF4444" stroke="#070F1E" strokeWidth="1.5" className="cursor-pointer" />
                          )
                        ))}

                        {/* X-Axis labels */}
                        {chartData.map((d, i) => (
                          <text
                            key={i}
                            x={70 + i * (500 / 6)}
                            y={195}
                            fill="#64748B"
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                            className="font-mono"
                          >
                            {d.label}
                          </text>
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

                {/* Recommendations and Quick Actions Card */}
                <div className="bg-[#0B1528]/80 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
                  <h4 className="font-bold text-sm text-white">Lối tắt & Khuyên dùng</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Bạn có thể giám sát tất cả các phòng trò chơi đồng thời, can thiệp kết quả cược hoặc xử lý trực tiếp các yêu cầu thanh toán.
                  </p>

                  <div className="space-y-3.5 pt-2">
                    <button 
                      onClick={() => setActiveTab('control')}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-500/10 hover:bg-blue-550/20 border border-blue-500/20 text-white text-xs font-bold transition-all text-left cursor-pointer active:scale-[0.98] duration-200"
                    >
                      <span className="flex items-center gap-2">🎯 Can thiệp kết quả phòng cược</span>
                      <ChevronRight className="w-4 h-4 text-blue-400" />
                    </button>

                    <button 
                      onClick={() => setShowAddUserModal(true)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-white text-xs font-bold transition-all text-left cursor-pointer active:scale-[0.98] duration-200"
                    >
                      <span className="flex items-center gap-2">➕ Thêm thành viên mới</span>
                      <ChevronRight className="w-4 h-4 text-emerald-400" />
                    </button>

                    <button 
                      onClick={() => {
                        setActiveTab('deposits');
                        setFilterWithdrawStatus('Chờ xử lý');
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-white text-xs font-bold transition-all text-left cursor-pointer active:scale-[0.98] duration-200"
                    >
                      <span className="flex items-center gap-2">⌛ {pendingCount} giao dịch chờ duyệt</span>
                      <ChevronRight className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MEMBER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-wide">Quản lý Thành viên</h2>
                  <p className="text-xs text-slate-400">Danh sách và thông tin chi tiết người dùng hệ thống.</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-[#0B1528] text-xs font-bold text-slate-300 border border-[#1E293B] rounded-xl px-4 py-2 font-mono">
                    TỔNG THÀNH VIÊN: <span className="text-[#1D5CFF] font-black">{totalUsers}</span>
                  </span>
                  <button 
                    onClick={() => setShowAddUserModal(true)}
                    className="bg-[#1D5CFF] hover:bg-[#1A52E5] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-[0_4px_12px_rgba(29,92,255,0.25)] transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Thêm thành viên
                  </button>
                </div>
              </div>

              {/* SEARCH FILTER */}
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Tìm người dùng theo Tên, Số TK, ID, SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0B1528] border border-[#1E293B] text-xs text-white rounded-xl py-3 pl-11 pr-4 outline-none focus:border-[#1D5CFF] transition-all"
                />
              </div>

              {/* MEMBER CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => {
                  const isUserLocked = (user as any).isLocked || false;
                  return (
                    <div 
                      key={user.username} 
                      className={`bg-[#0B1528] border rounded-2xl p-5 space-y-4 relative overflow-hidden transition-all ${
                        isUserLocked ? 'border-red-500/40 opacity-75' : 'border-[#1E293B] hover:border-[#1E293B]/80'
                      }`}
                    >
                      {/* Top Row: User basic info */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold font-mono bg-[#1E293B] text-[#1D5CFF] px-2 py-0.5 rounded border border-[#1D293E]">
                            #{user.id}
                          </span>
                          <span className="font-extrabold text-white text-sm">{user.username}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 font-semibold">Pass: ******</span>
                      </div>

                      {/* Fullname / Phone / Referral Code */}
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Họ tên:</span>
                          <span className="font-semibold text-white">{user.fullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">SĐT:</span>
                          <span className="font-mono text-slate-300">{user.phone}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Mã mời:</span>
                          <span className="font-mono text-xs text-blue-400 flex items-center gap-1">
                            {user.username}5618
                          </span>
                        </div>
                      </div>

                      {/* BALANCE STYLING */}
                      <div className="bg-[#050B14] p-3 rounded-xl border border-[#1D293E] flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Số dư:</span>
                        <span className="font-mono text-base font-black text-emerald-400">{formatVND(user.balance)}</span>
                      </div>

                      {/* BANKING DETAILS */}
                      <div className="bg-[#050B14]/40 p-3 rounded-xl border border-[#1E293B]/60 space-y-1.5 text-xs">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Ngân hàng:</span>
                          <span className="font-bold text-white text-right">{user.bankName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Số tài khoản:</span>
                          <span className="font-mono text-white text-right font-medium">{user.accountNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Chủ tài khoản:</span>
                          <span className="font-semibold text-white uppercase text-right">{user.accountHolder || 'N/A'}</span>
                        </div>
                      </div>

                      {/* ACTION BUTTONS GRID */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button 
                          onClick={() => {
                            setSelectedUser(user.username);
                            setAdjustIsAddition(true);
                            setAdjustAmount(500000);
                            setAdjustAmountInput("500000");
                            setShowAdjustBalanceModal(true);
                          }}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-400 text-[11px] font-bold rounded-xl cursor-pointer transition-all"
                        >
                          🏦 Số dư
                        </button>

                        <button 
                          onClick={() => {
                            setSelectedUser(user.username);
                            setSingleUserNewPassword('');
                            setShowChangeUserPasswordModal(true);
                          }}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-300 text-[11px] font-bold rounded-xl cursor-pointer transition-all"
                        >
                          🔑 Mật khẩu
                        </button>

                        <button 
                          onClick={() => handleToggleLockUser(user.username)}
                          className={`flex items-center justify-center gap-1.5 py-2 px-3 border text-[11px] font-bold rounded-xl cursor-pointer transition-all ${
                            isUserLocked 
                              ? 'border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/15 text-yellow-500' 
                              : 'border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400'
                          }`}
                        >
                          {isUserLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          {isUserLocked ? 'Mở khóa' : 'Khóa'}
                        </button>

                        <button 
                          onClick={() => handleDeleteUser(user.username)}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400 text-[11px] font-bold rounded-xl cursor-pointer transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Xóa
                        </button>

                        <button 
                          onClick={() => {
                            setSelectedUser(user.username);
                            setLookupSubTab('bets');
                            setShowHistoryLookupModal(true);
                          }}
                          className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 px-3 border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/15 text-blue-400 text-[11px] font-black rounded-xl cursor-pointer transition-all mt-1"
                        >
                          🔎 Tra cứu Lịch sử (Cược / Ví)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: BET HISTORY */}
          {activeTab === 'bets' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-wide">Lịch sử đặt cược</h2>
                  <p className="text-xs text-slate-400">Xem chi tiết các giao dịch cược trên hệ thống.</p>
                </div>
                {allUsersBets.length > 0 && (
                  <button 
                    onClick={() => {
                      setShowClearAllBetsConfirm(true);
                    }} 
                    className="px-4 py-2.5 bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0"
                  >
                    🗑️ Xóa toàn bộ lịch sử cược
                  </button>
                )}
              </div>

              {/* SEARCH & FILTERS ROW */}
              <div className="bg-[#0B1528] border border-[#1E293B] p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Tìm mã đơn, người chơi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#070F1E] border border-[#1D293E] text-xs text-white rounded-xl py-2 pl-10 pr-4 outline-none focus:border-[#1D5CFF] transition-all"
                  />
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <div className="flex items-center gap-1 bg-[#070F1E] border border-[#1D293E] px-2 py-1 rounded-xl text-xs">
                    <span className="text-slate-500">Phòng:</span>
                    <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)} className="bg-transparent text-white outline-none cursor-pointer">
                      <option value="Tất cả" className="bg-[#070F1E]">Tất cả phòng</option>
                      <option value="Facebook" className="bg-[#070F1E]">Facebook</option>
                      <option value="Youtube" className="bg-[#070F1E]">Youtube</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1 bg-[#070F1E] border border-[#1D293E] px-2 py-1 rounded-xl text-xs">
                    <span className="text-slate-500">Trạng thái:</span>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-transparent text-white outline-none cursor-pointer">
                      <option value="Tất cả" className="bg-[#070F1E]">Tất cả trạng thái</option>
                      <option value="Thắng" className="bg-[#070F1E]">Thắng</option>
                      <option value="Thua" className="bg-[#070F1E]">Thua</option>
                      <option value="Chờ kết quả" className="bg-[#070F1E]">Chờ kết quả</option>
                    </select>
                  </div>

                  <span className="ml-auto bg-[#050B14] text-slate-400 border border-[#1D293E] font-mono font-bold text-xs py-1.5 px-3 rounded-xl flex items-center">
                    TỔNG: {filteredBets.length} BẢN GHI
                  </span>
                </div>
              </div>

              {/* TABLE */}
              <div className="bg-[#0B1528] border border-[#1E293B] rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs min-w-[850px]">
                  <thead>
                    <tr className="bg-[#050B14] border-b border-[#1E293B] text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                      <th className="p-4">Mã ID</th>
                      <th className="p-4">Người chơi</th>
                      <th className="p-4">Phòng</th>
                      <th className="p-4">Chu kỳ (Session ID)</th>
                      <th className="p-4">Cửa cược (Option)</th>
                      <th className="p-4">Mức cược (Amount)</th>
                      <th className="p-4">Thời gian đặt cược</th>
                      <th className="p-4">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]/60">
                    {filteredBets.map((b) => {
                      const formattedTime = b.timestamp 
                        ? new Date(b.timestamp).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })
                        : 'Vừa xong';
                      return (
                        <tr key={b.id} className="hover:bg-slate-800/10">
                          <td className="p-4 font-mono font-bold text-slate-300">B-{b.id.slice(-6)}</td>
                          <td className="p-4">
                            <div className="font-bold text-white">@{b.username}</div>
                            {b.fullName && (
                              <div className="text-[11px] text-slate-400 font-normal mt-0.5">{b.fullName}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.room === 'Facebook' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}>
                              {b.room}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-slate-400">{b.period}</td>
                          <td className="p-4 text-slate-200 font-semibold">{b.choice}</td>
                          <td className="p-4 font-mono text-white font-bold">{formatVND(b.amount)}</td>
                          <td className="p-4 font-mono text-slate-350 font-semibold text-[11px] text-indigo-300">{formattedTime}</td>
                          <td className="p-4">
                            {b.result === 'Thắng' && <span className="text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">THÀNH CÔNG</span>}
                            {b.result === 'Thua' && <span className="text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">THẤT BẠI</span>}
                            {b.result === 'Chờ kết quả' && <span className="text-yellow-500 font-medium bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded">ĐANG CHỜ</span>}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredBets.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-slate-500 font-bold">Chưa có bản ghi đặt cược nào.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: DEPOSIT TRANSACTIONS */}
          {activeTab === 'deposits' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-wide">Danh sách giao dịch nạp tiền</h2>
                  <p className="text-xs text-slate-400">Quản lý và xét duyệt các yêu cầu nạp tiền từ người dùng.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTransactions.length > 0 && (
                    <button 
                      onClick={() => {
                        setShowClearAllTransactionsConfirm(true);
                      }} 
                      className="bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      🗑️ Xóa toàn bộ lịch sử nạp/rút
                    </button>
                  )}

                  <button 
                    onClick={() => setShowSimulateDepositModal(true)}
                    className="bg-[#1D5CFF] hover:bg-[#1A52E5] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-[0_4px_12px_rgba(29,92,255,0.25)] transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Mô phỏng Nạp tiền
                  </button>

                  <button 
                    onClick={() => alert('Đã xuất thành công báo cáo Excel!')}
                    className="border border-[#1E293B] hover:bg-[#1E293B] text-slate-300 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Xuất Excel
                  </button>
                </div>
              </div>

              {/* SEARCH FILTER */}
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Tìm theo Mã đơn, người dùng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0B1528] border border-[#1E293B] text-xs text-white rounded-xl py-3 pl-11 pr-4 outline-none focus:border-[#1D5CFF] transition-all"
                />
              </div>

              {/* TABLE */}
              <div className="bg-[#0B1528] border border-[#1E293B] rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs min-w-[800px]">
                  <thead>
                    <tr className="bg-[#050B14] border-b border-[#1E293B] text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                      <th className="p-4">ID Giao dịch</th>
                      <th className="p-4">Mã đơn</th>
                      <th className="p-4">Người dùng</th>
                      <th className="p-4">Số điện thoại</th>
                      <th className="p-4">Số tiền</th>
                      <th className="p-4">Loại hình</th>
                      <th className="p-4">Thời gian</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-center">Xử lý</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]/60">
                    {filteredDeposits.map((d) => {
                      let txCode = d.id;
                      let phone = '0988888888';
                      if (d.details) {
                        const matchTx = d.details.match(/Mã giao dịch: ([^\s.]+)/);
                        const matchPhone = d.details.match(/SĐT: ([^\s.]+)/);
                        if (matchTx) txCode = matchTx[1];
                        if (matchPhone) phone = matchPhone[1];
                      }
                      return (
                        <tr key={d.id} className="hover:bg-slate-800/10">
                          <td className="p-4 font-mono text-slate-400">{d.id}</td>
                          <td className="p-4 font-mono font-bold text-[#1D5CFF]">{txCode}</td>
                          <td className="p-4 font-bold text-white">@{d.username || 'khach_hang'}</td>
                          <td className="p-4 font-mono text-slate-300">{phone}</td>
                          <td className="p-4 font-mono text-emerald-400 font-extrabold text-sm">{formatVND(d.amount)}</td>
                          <td className="p-4 text-slate-300">Chuyển khoản NH</td>
                          <td className="p-4 text-slate-400 font-mono">{new Date(d.timestamp).toLocaleString('vi-VN')}</td>
                          <td className="p-4">
                            {d.status === 'Thành công' && <span className="text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-xl text-[10px] font-bold border border-emerald-500/20">THÀNH CÔNG</span>}
                            {d.status === 'Thất bại' && <span className="text-red-400 bg-red-400/10 px-2.5 py-1 rounded-xl text-[10px] font-bold border border-red-500/20">TỪ CHỐI</span>}
                            {d.status === 'Đang xử lý' && <span className="text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded-xl text-[10px] font-bold border border-yellow-500/20">CHỜ DUYỆT</span>}
                          </td>
                          <td className="p-4">
                            {d.status === 'Đang xử lý' ? (
                              <div className="flex gap-1.5 justify-center">
                                <button
                                  onClick={() => {
                                    updateTransactionStatus(d.id, 'Thành công');
                                    showToast('Đã duyệt nạp tiền và cộng ví thành viên!', 'success');
                                  }}
                                  className="p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded cursor-pointer transition-all"
                                  title="Phê duyệt"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    updateTransactionStatus(d.id, 'Thất bại');
                                    showToast('Đã hủy lệnh nạp tiền!', 'info');
                                  }}
                                  className="p-1 bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer transition-all"
                                  title="Từ chối"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-center items-center">
                                <span className="text-slate-500/50 font-bold">—</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredDeposits.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-12 text-center text-slate-500 font-bold">Không tìm thấy yêu cầu nạp tiền nào.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: WITHDRAW TRANSACTIONS */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-wide">Danh sách rút tiền</h2>
                  <p className="text-xs text-slate-400">Quản lý và xét duyệt các yêu cầu rút tiền từ người chơi. Đảm bảo kiểm tra kỹ thông tin trước khi duyệt lệnh.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTransactions.length > 0 && (
                    <button 
                      onClick={() => {
                        setShowClearAllTransactionsConfirm(true);
                      }} 
                      className="bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      🗑️ Xóa toàn bộ lịch sử nạp/rút
                    </button>
                  )}

                  <button 
                    onClick={() => setShowSimulateWithdrawModal(true)}
                    className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-[0_4px_12px_rgba(244,63,94,0.25)] transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Mô phỏng Giao dịch Rút
                  </button>
                </div>
              </div>

              {/* TABS CAPSULES */}
              <div className="bg-[#0B1528] border border-[#1E293B] p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên người dùng, STK..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#070F1E] border border-[#1D293E] text-xs text-white rounded-xl py-2 pl-10 pr-4 outline-none focus:border-[#1D5CFF] transition-all"
                  />
                </div>

                <div className="flex gap-2">
                  {['Tất cả', 'Chờ xử lý', 'Đã duyệt', 'Đã từ chối'].map((lbl) => (
                    <button
                      key={lbl}
                      onClick={() => setFilterWithdrawStatus(lbl)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        filterWithdrawStatus === lbl 
                          ? 'bg-rose-600/15 border border-rose-500 text-rose-500 shadow-md' 
                          : 'bg-[#070F1E] border border-[#1D293E] text-slate-400 hover:text-white'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* TABLE */}
              <div className="bg-[#0B1528] border border-[#1E293B] rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs min-w-[900px]">
                  <thead>
                    <tr className="bg-[#050B14] border-b border-[#1E293B] text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                      <th className="p-4">Yêu cầu ID</th>
                      <th className="p-4">Người dùng</th>
                      <th className="p-4">Số tiền rút</th>
                      <th className="p-4">Ngày yêu cầu</th>
                      <th className="p-4">Ngân hàng</th>
                      <th className="p-4">Số tài khoản</th>
                      <th className="p-4">Chủ tài khoản</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-center">Xử lý lệnh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]/60">
                    {filteredWithdrawals.map((w) => {
                      const userAcc = accountsData[w.username || ''];
                      const bankName = userAcc?.profile.bankName || 'Vietcombank';
                      const bankAccount = userAcc?.profile.accountNumber || '1028392812';
                      const bankOwner = userAcc?.profile.accountHolder || 'NGUYEN THI QUYNH';

                      return (
                        <tr key={w.id} className="hover:bg-slate-800/10">
                          <td className="p-4 font-mono font-bold text-slate-300">{w.id}</td>
                          <td className="p-4 font-bold text-white">@{w.username || 'khach_hang'}</td>
                          <td className="p-4 font-mono text-rose-500 font-extrabold text-sm">-{formatVND(w.amount)}</td>
                          <td className="p-4 text-slate-400 font-mono">{new Date(w.timestamp).toLocaleString('vi-VN')}</td>
                          <td className="p-4 font-bold text-slate-300">{bankName}</td>
                          <td className="p-4 font-mono text-slate-300">{bankAccount}</td>
                          <td className="p-4 font-semibold text-white uppercase">{bankOwner}</td>
                          <td className="p-4">
                            {w.status === 'Thành công' && <span className="text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-xl text-[10px] font-bold border border-emerald-500/20">ĐÃ DUYỆT</span>}
                            {w.status === 'Thất bại' && <span className="text-red-400 bg-red-400/10 px-2.5 py-1 rounded-xl text-[10px] font-bold border border-red-500/20">TỪ CHỐI</span>}
                            {w.status === 'Đang xử lý' && <span className="text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded-xl text-[10px] font-bold border border-yellow-500/20">CHỜ XỬ LÝ</span>}
                          </td>
                          <td className="p-4">
                            {w.status === 'Đang xử lý' ? (
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => {
                                    updateTransactionStatus(w.id, 'Thành công');
                                    showToast('Đã phê duyệt lệnh rút tiền và trừ số dư thành công!', 'success');
                                  }}
                                  className="px-3 py-1 bg-[#10B981] text-white font-bold rounded text-[10px] flex items-center gap-1 cursor-pointer hover:bg-emerald-600 transition-colors"
                                >
                                  <Check className="w-3.5 h-3.5" /> Duyệt
                                </button>
                                <button
                                  onClick={() => {
                                    updateTransactionStatus(w.id, 'Thất bại');
                                    showToast('Đã từ chối lệnh rút tiền và hoàn trả số dư lại cho thành viên!', 'info');
                                  }}
                                  className="px-3 py-1 bg-red-600 text-white font-bold rounded text-[10px] flex items-center gap-1 cursor-pointer hover:bg-red-700 transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" /> Từ chối
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-center items-center">
                                <span className="text-slate-500/50 font-bold">—</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredWithdrawals.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-12 text-center text-slate-500 font-bold">Không tìm thấy yêu cầu rút tiền nào.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: ROOM MANAGEMENT */}
          {activeTab === 'rooms' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Thêm Sửa Phòng Form Panel */}
              <div className="space-y-6">
                <div className="bg-[#0B1528] border border-[#1E293B] p-5 rounded-2xl space-y-4">
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-5 bg-[#1D5CFF] rounded-full inline-block" /> Thêm/Sửa phòng
                  </h3>

                  <form onSubmit={handleAddRoomSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Tên phòng</label>
                      <input 
                        type="text" 
                        value={newRoomForm.name}
                        onChange={(e) => setNewRoomForm({ ...newRoomForm, name: e.target.value })}
                        placeholder="Nhập tên phòng (ví dụ: Youtube, Facebook...)" 
                        className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#1D5CFF]"
                        required 
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Chu kỳ thời gian (giây)</label>
                      <input 
                        type="number" 
                        value={newRoomForm.cycle}
                        onChange={(e) => setNewRoomForm({ ...newRoomForm, cycle: parseInt(e.target.value) || 45 })}
                        className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#1D5CFF]"
                        required 
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Ảnh đại diện (Tên icon)</label>
                      <input 
                        type="text" 
                        value={newRoomForm.icon}
                        onChange={(e) => setNewRoomForm({ ...newRoomForm, icon: e.target.value })}
                        placeholder="Mặc định: smart_display" 
                        className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#1D5CFF]" 
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-3 bg-[#1D5CFF] hover:bg-[#1A52E5] text-white font-extrabold rounded-xl uppercase cursor-pointer transition-all shadow-[0_4px_12px_rgba(29,92,255,0.25)]"
                    >
                      💾 Lưu phòng chơi
                    </button>
                  </form>
                </div>

                <div className="bg-[#0B1528] border border-[#1E293B] p-5 rounded-2xl space-y-4">
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-5 bg-emerald-500 rounded-full inline-block" /> Chu kỳ mặc định hệ thống
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Cấu hình chu kỳ thời gian chạy mặc định cho tất cả phòng hoặc áp dụng trực tiếp.
                  </p>
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Thời gian mặc định (giây)</label>
                      <input type="number" defaultValue="45" className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => alert('Đã lưu thiết lập chu kỳ!')} className="py-2.5 bg-[#1E293B] border border-[#1D293E] text-white font-bold rounded-xl cursor-pointer">Lưu mặc định</button>
                      <button onClick={() => alert('Đã áp dụng chu kỳ 45s cho tất cả phòng!')} className="py-2.5 bg-[#00B47E] text-white font-bold rounded-xl cursor-pointer">Áp dụng tất cả</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danh sách phòng Table */}
              <div className="bg-[#0B1528] border border-[#1E293B] rounded-2xl p-5 lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-sm text-white">Danh sách phòng hiện có</h3>
                  <div className="relative w-48">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                    <input type="text" placeholder="Tìm phòng..." className="w-full bg-[#070F1E] border border-[#1D293E] text-[10px] text-white rounded-lg py-1.5 pl-7 pr-2 outline-none" />
                  </div>
                </div>

                <div className="overflow-x-auto border border-[#1E293B] rounded-xl">
                  <table className="w-full text-left border-collapse text-xs min-w-[500px]">
                    <thead>
                      <tr className="bg-[#050B14] border-b border-[#1E293B] text-slate-400 uppercase text-[9px] font-bold tracking-wider">
                        <th className="p-3">ID ID</th>
                        <th className="p-3">Tên phòng</th>
                        <th className="p-3">Ảnh Icon</th>
                        <th className="p-3">Mã chu kỳ</th>
                        <th className="p-3">Đếm ngược (S)</th>
                        <th className="p-3 text-center">Lựa chọn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]/60 font-medium">
                      {roomList.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-800/10">
                          <td className="p-3 font-mono text-slate-400">{r.id}</td>
                          <td className="p-3 font-bold text-white">{r.name}</td>
                          <td className="p-3 font-mono text-blue-400">{r.icon}</td>
                          <td className="p-3 font-mono text-slate-400">{r.session.slice(-10)}</td>
                          <td className="p-3">
                            <span className="font-mono text-emerald-400 font-bold bg-[#050B14] px-2 py-1 rounded border border-[#1E293B]">
                              {r.currentCycle}s / {r.cycle}s
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2 justify-center">
                              <button 
                                onClick={() => {
                                  setEditingRoom({ id: r.id, name: r.name, cycle: r.cycle, icon: r.icon });
                                  setShowEditRoomModal(true);
                                }} 
                                className="p-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 rounded cursor-pointer transition-all"
                                title="Chỉnh sửa"
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={() => {
                                  if (r.name === 'Facebook' || r.name === 'Youtube') {
                                    showToast('Không thể xóa phòng mặc định của hệ thống!', 'error');
                                  } else {
                                    setRoomToDelete({ id: r.id, name: r.name });
                                  }
                                }} 
                                className="p-1 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded cursor-pointer transition-all"
                                title="Xóa"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB: RESULT CONTROL (CAN THIEP KET QUA) */}
          {activeTab === 'control' && (
            <div className="space-y-6">
              {/* Overall Header card */}
              <div className="bg-[#0B1528] border border-[#1E293B] p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wide">BẢNG ĐIỀU KHIỂN KẾT QUẢ SỰ KIỆN</h2>
                  <p className="text-xs text-slate-400">Can thiệp kết quả mở kỳ cho từng phòng. Kết quả cưỡng chế sẽ tự động áp dụng khi bộ đếm ngược kết thúc.</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-400">Thời gian đếm ngược:</span>
                  <span className="font-mono text-red-500 font-black text-lg bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-xl">
                    ⏱ {secondsRemaining} giây
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roomList.map((room) => {
                  const isFb = room.name.toLowerCase() === 'facebook';
                  const isYt = room.name.toLowerCase() === 'youtube';
                  const themeColor = isFb ? '#1877F2' : isYt ? '#E52D27' : '#D97706'; // blue, red, amber for custom
                  
                  return (
                    <div key={room.id} className="bg-[#0B1528] border border-[#1E293B] rounded-2xl p-6 space-y-5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: themeColor }} />
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full" style={{ backgroundColor: `${themeColor}20`, color: themeColor }}>
                            Phòng ID: {room.id}
                          </span>
                          <h3 className="font-extrabold text-base text-white mt-2">Phòng Sự Kiện {room.name}</h3>
                        </div>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${themeColor}20`, color: themeColor }}>
                          {isFb ? (
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          ) : isYt ? (
                            <div className="flex flex-col items-center justify-center font-sans font-black text-[9px] uppercase leading-none">
                              <span>You</span>
                              <span className="text-white text-[7px] px-0.5 rounded mt-0.5 font-black" style={{ backgroundColor: themeColor }}>Tube</span>
                            </div>
                          ) : (
                            <span className="text-lg">🎯</span>
                          )}
                        </div>
                      </div>

                      <div className="bg-[#070F1E] border border-[#1D293E]/60 rounded-xl p-4 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Mã kỳ hiện tại:</span>
                          <span className="font-mono text-blue-400 font-extrabold">{room.session}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1.5 border-t border-[#1D293E]/30">
                          <span className="text-slate-400">Trạng thái kết quả:</span>
                          {forcedNextResult[room.name] ? (
                            <span className="text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                              🎯 Đang cưỡng chế: "{forcedNextResult[room.name]}"
                            </span>
                          ) : (
                            <span className="text-yellow-400 font-bold bg-yellow-950/40 border border-yellow-500/20 px-2.5 py-0.5 rounded-full">
                              🎲 Ngẫu nhiên
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-slate-300 text-xs block mb-1.5 font-semibold">Chọn kết quả muốn cưỡng chế hiển thị:</label>
                          <select 
                            id={`select-forced-${room.id.replace('#', '')}`}
                            defaultValue={forcedNextResult[room.name] || "Tăng tương tác"}
                            className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-4 py-3 text-white text-xs outline-none cursor-pointer focus:border-[#1D5CFF]"
                          >
                            <option value="Tăng tương tác">Tăng tương tác</option>
                            <option value="Tăng doanh số">Tăng doanh số</option>
                            <option value="Quảng bá sản phẩm">Quảng bá sản phẩm</option>
                            <option value="Thu hút đầu tư">Thu hút đầu tư</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => {
                              const sel = document.getElementById(`select-forced-${room.id.replace('#', '')}`) as HTMLSelectElement;
                              handleForceGame(room.name, sel.value as BetCategory);
                            }}
                            className="py-3 text-white font-black text-xs rounded-xl uppercase cursor-pointer transition-all shadow-md hover:opacity-90"
                            style={{ backgroundColor: themeColor }}
                          >
                            🎯 GÁN KẾT QUẢ
                          </button>
                          <button 
                            onClick={() => {
                              adminForceGameResult(room.name, null as any);
                              alert(`Đã xóa kết quả cưỡng chế của ${room.name}. Quay về ngẫu nhiên.`);
                            }}
                            disabled={!forcedNextResult[room.name]}
                            className="py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 font-black text-xs rounded-xl uppercase cursor-pointer transition-all text-center"
                          >
                            🗑️ HỦY CƯỠNG CHẾ
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL 1: ADD MEMBER */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1528] border border-[#1E293B] rounded-[24px] max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#1E293B] pb-3">
              <h4 className="font-black text-white text-md flex items-center gap-2">
                👥 Thêm thành viên mới
              </h4>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-400 block mb-1">Tên tài khoản (Username)</label>
                  <input 
                    type="text" 
                    value={newUserForm.username}
                    onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                    placeholder="ví dụ: quynh88"
                    className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#1D5CFF]"
                    required 
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Mật khẩu</label>
                  <input 
                    type="text" 
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    placeholder="Nhập mật khẩu"
                    className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#1D5CFF]"
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-400 block mb-1">Họ tên thành viên</label>
                  <input 
                    type="text" 
                    value={newUserForm.fullName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                    placeholder="NGUYEN THI QUYNH"
                    className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#1D5CFF]"
                    required 
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Số điện thoại</label>
                  <input 
                    type="text" 
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    placeholder="0987654321"
                    className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#1D5CFF] font-mono"
                    required 
                  />
                </div>
              </div>

              <div className="border-t border-[#1E293B]/60 my-2 pt-2 space-y-3.5">
                <span className="text-[10px] font-extrabold text-[#1D5CFF] tracking-wider uppercase">Liên kết ngân hàng thụ hưởng</span>
                
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-slate-400 block mb-1">Ngân hàng</label>
                    <input 
                      type="text" 
                      value={newUserForm.bankName}
                      onChange={(e) => setNewUserForm({ ...newUserForm, bankName: e.target.value })}
                      placeholder="Vietcombank"
                      className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#1D5CFF]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Số tài khoản</label>
                    <input 
                      type="text" 
                      value={newUserForm.accountNumber}
                      onChange={(e) => setNewUserForm({ ...newUserForm, accountNumber: e.target.value })}
                      placeholder="1028392812"
                      className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#1D5CFF] font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-slate-400 block mb-1">Chủ tài khoản (Không dấu)</label>
                    <input 
                      type="text" 
                      value={newUserForm.accountHolder}
                      onChange={(e) => setNewUserForm({ ...newUserForm, accountHolder: e.target.value })}
                      placeholder="NGUYEN THI QUYNH"
                      className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#1D5CFF] uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Số dư khởi tạo (VND)</label>
                    <input 
                      type="number" 
                      value={newUserForm.initialBalance}
                      onChange={(e) => setNewUserForm({ ...newUserForm, initialBalance: parseInt(e.target.value) || 0 })}
                      placeholder="5000000"
                      className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#1D5CFF] font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowAddUserModal(false)} className="w-1/2 py-3 border border-[#1E293B] hover:bg-[#1E293B] rounded-xl text-white font-bold cursor-pointer">Hủy bỏ</button>
                <button type="submit" className="w-1/2 py-3 bg-[#1D5CFF] hover:bg-[#1A52E5] text-white font-bold rounded-xl cursor-pointer">Xác nhận tạo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADJUST BALANCE */}
      {showAdjustBalanceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1528] border border-[#1E293B] rounded-[24px] max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#1E293B] pb-3">
              <h4 className="font-black text-white text-md flex items-center gap-2">
                🏦 Điều chỉnh số dư
              </h4>
              <button onClick={() => setShowAdjustBalanceModal(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <form onSubmit={handleAdjustBalanceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Tài khoản điều chỉnh</label>
                <input 
                  type="text" 
                  disabled 
                  value={`@${selectedUser} (${accountsData[selectedUser]?.profile.fullName})`} 
                  className="w-full bg-[#070F1E]/80 border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-slate-400 font-bold" 
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1.5">Loại hình điều chỉnh</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustIsAddition(true)}
                    className={`py-2.5 rounded-xl font-bold cursor-pointer border text-center ${
                      adjustIsAddition ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-[#070F1E] border-[#1D293E] text-slate-400'
                    }`}
                  >
                    ➕ Cộng tiền (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustIsAddition(false)}
                    className={`py-2.5 rounded-xl font-bold cursor-pointer border text-center ${
                      !adjustIsAddition ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-[#070F1E] border-[#1D293E] text-slate-400'
                    }`}
                  >
                    ➖ Trừ tiền (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Số tiền (VND)</label>
                <input 
                  type="text" 
                  value={adjustAmountInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    const cleanVal = val.replace(/\D/g, '').replace(/^0+/, '');
                    if (cleanVal === '') {
                      setAdjustAmountInput('');
                      setAdjustAmount(0);
                    } else {
                      const parsedNum = parseInt(cleanVal, 10);
                      setAdjustAmountInput(cleanVal);
                      setAdjustAmount(parsedNum);
                    }
                  }}
                  placeholder="0"
                  className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white font-mono text-base font-black focus:border-[#1D5CFF] outline-none" 
                  required
                />
                <span className="text-[10px] text-slate-500 block mt-1">Hệ thống sẽ quy đổi trực tiếp vào tài khoản: {formatVND(adjustAmount)}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdjustBalanceModal(false)} className="w-1/2 py-3 border border-[#1E293B] hover:bg-[#1E293B] rounded-xl text-white font-bold cursor-pointer">Hủy bỏ</button>
                <button type="submit" className="w-1/2 py-3 bg-[#1D5CFF] hover:bg-[#1A52E5] text-white font-bold rounded-xl cursor-pointer">Lưu điều chỉnh</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: USER HISTORY LOOKUP */}
      {showHistoryLookupModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-[#0B1528] border border-[#1E293B] rounded-[24px] max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#1E293B] p-5 shrink-0">
              <div>
                <h4 className="font-black text-white text-md flex items-center gap-2 uppercase tracking-wide">
                  🔎 Tra cứu lịch sử hoạt động
                </h4>
                <p className="text-[10px] text-slate-400 mt-1">
                  Đang xem dữ liệu của thành viên: <strong className="text-blue-400">@{selectedUser}</strong> ({accountsData[selectedUser]?.profile.fullName || 'N/A'})
                </p>
              </div>
              <button 
                onClick={() => setShowHistoryLookupModal(false)} 
                className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-[#1E293B]/60 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* User Info Overview Strip */}
            {accountsData[selectedUser] && (
              <div className="bg-[#050B14] border-b border-[#1E293B] px-5 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0 text-[11px]">
                <div>
                  <span className="text-slate-500 uppercase tracking-widest text-[9px] font-bold block">Tổng số dư:</span>
                  <strong className="text-emerald-400 font-mono text-sm font-black">{formatVND(accountsData[selectedUser].profile.balance)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-widest text-[9px] font-bold block">Số điện thoại:</span>
                  <strong className="text-slate-200 font-mono text-xs">{accountsData[selectedUser].profile.phone || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-widest text-[9px] font-bold block">Liên kết ngân hàng:</span>
                  <span className="text-slate-200 font-bold block max-w-[160px] truncate">{accountsData[selectedUser].profile.bankName || 'Chưa liên kết'}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-widest text-[9px] font-bold block">Chủ tài khoản / Số TK:</span>
                  <span className="text-slate-200 font-mono block truncate">
                    {accountsData[selectedUser].profile.accountHolder ? `${accountsData[selectedUser].profile.accountHolder} - ${accountsData[selectedUser].profile.accountNumber}` : 'N/A'}
                  </span>
                </div>
              </div>
            )}

            {/* Sub-tabs controller */}
            <div className="flex bg-[#050B14] border-b border-[#1E293B] p-1 shrink-0">
              <button
                onClick={() => setLookupSubTab('bets')}
                className={`flex-1 text-center py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  lookupSubTab === 'bets'
                    ? 'bg-[#1D5CFF] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#1E293B]/40'
                }`}
              >
                📊 Lịch Sử Sự Kiện ({accountsData[selectedUser]?.bets?.length || 0})
              </button>
              <button
                onClick={() => setLookupSubTab('transactions')}
                className={`flex-1 text-center py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  lookupSubTab === 'transactions'
                    ? 'bg-[#1D5CFF] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#1E293B]/40'
                }`}
              >
                💳 Nhật Ký Biến Động Số Dư ({accountsData[selectedUser]?.transactions?.length || 0})
              </button>
            </div>

            {/* Modal Body / History lists */}
            <div className="flex-1 overflow-y-auto p-5 bg-[#050B14]/30 min-h-[250px]">
              {lookupSubTab === 'bets' ? (
                // USER BETS TAB
                !accountsData[selectedUser]?.bets || accountsData[selectedUser].bets.length === 0 ? (
                  <div className="text-slate-500 text-xs text-center py-16">
                    Không tìm thấy dữ liệu phân bổ đặt cược của thành viên này.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[600px] border-collapse font-mono">
                      <thead>
                        <tr className="text-slate-500 font-bold border-b border-[#1E293B] pb-2 text-[10px] uppercase">
                          <th className="py-2.5">Thời gian</th>
                          <th>Mã phiên (Kỳ)</th>
                          <th>Phòng</th>
                          <th>Lựa chọn phân bổ</th>
                          <th>Số tiền</th>
                          <th className="text-right">Kết quả / Payout</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                        {accountsData[selectedUser].bets.map((bet) => (
                          <tr key={bet.id} className="hover:bg-[#0B1528]/45">
                            <td className="py-2.5 text-[10px] text-slate-500">{new Date(bet.timestamp).toLocaleString('vi-VN')}</td>
                            <td className="font-semibold text-slate-100">{bet.period}</td>
                            <td>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                bet.room === 'Facebook' ? 'bg-blue-950/40 text-blue-400 border border-blue-900/30' : 'bg-red-950/40 text-red-400 border border-red-900/30'
                              }`}>
                                {bet.room}
                              </span>
                            </td>
                            <td className="font-sans font-bold text-slate-100">{bet.choice}</td>
                            <td className="font-bold text-slate-100">{bet.amount.toLocaleString('vi-VN')}đ</td>
                            <td className="text-right">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                bet.result === 'Thắng' ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/20' :
                                bet.result === 'Thua' ? 'bg-slate-900 text-slate-500 border border-slate-800' :
                                'bg-amber-950/40 text-amber-400 animate-pulse border border-amber-900/20'
                              }`}>
                                {bet.result === 'Thắng' ? `Có lãi (+${bet.payout?.toLocaleString('vi-VN')}đ)` : bet.result}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                // USER TRANSACTIONS TAB
                !accountsData[selectedUser]?.transactions || accountsData[selectedUser].transactions.length === 0 ? (
                  <div className="text-slate-500 text-xs text-center py-16">
                    Không tìm thấy nhật ký biến động số dư của thành viên này.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[600px] border-collapse font-mono">
                      <thead>
                        <tr className="text-slate-500 font-bold border-b border-[#1E293B] pb-2 text-[10px] uppercase">
                          <th className="py-2.5">Thời gian</th>
                          <th>Mã GD</th>
                          <th>Loại giao dịch</th>
                          <th>Biến động</th>
                          <th>Chi tiết / Mô tả</th>
                          <th className="text-right">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                        {accountsData[selectedUser].transactions.map((trans) => (
                          <tr key={trans.id} className="hover:bg-[#0B1528]/45">
                            <td className="py-2.5 text-[10px] text-slate-500">{new Date(trans.timestamp).toLocaleString('vi-VN')}</td>
                            <td className="font-bold text-slate-400">{trans.id}</td>
                            <td>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                trans.type === 'Nạp tiền' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' :
                                trans.type === 'Rút tiền' ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30' :
                                trans.type === 'Tiền thắng cược' ? 'bg-blue-950/40 text-blue-400 border border-blue-900/30' :
                                'bg-slate-900 text-slate-400 border border-slate-800'
                              }`}>
                                {trans.type}
                              </span>
                            </td>
                            <td className={`font-black ${trans.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {trans.amount > 0 ? '+' : ''}{trans.amount.toLocaleString('vi-VN')}đ
                            </td>
                            <td className="font-sans text-xs text-slate-100 max-w-xs truncate" title={trans.details}>{trans.details}</td>
                            <td className="text-right">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                trans.status === 'Thành công' ? 'bg-emerald-950/30 text-emerald-400' :
                                trans.status === 'Đang xử lý' ? 'bg-amber-950/30 text-amber-450 animate-pulse' :
                                'bg-rose-950/30 text-rose-400'
                              }`}>
                                {trans.status === 'Thành công' ? 'Thành công' :
                                 trans.status === 'Đang xử lý' ? 'Đang chờ xử lý' :
                                 'Yêu cầu chưa được duyệt'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#0B1528] border-t border-[#1E293B] p-4 flex justify-end shrink-0">
              <button 
                type="button" 
                onClick={() => setShowHistoryLookupModal(false)} 
                className="px-6 py-2.5 bg-[#1E293B] hover:bg-[#2A3B54] text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
              >
                Đóng tra cứu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CHANGE PASSWORD MEMBER */}
      {showChangeUserPasswordModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1528] border border-[#1E293B] rounded-[24px] max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#1E293B] pb-3">
              <h4 className="font-black text-white text-sm flex items-center gap-2">
                🔑 Đổi mật khẩu thành viên
              </h4>
              <button onClick={() => setShowChangeUserPasswordModal(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <form onSubmit={handleResetUserPasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Mật khẩu mới</label>
                <input 
                  type="text" 
                  value={singleUserNewPassword}
                  onChange={(e) => setSingleUserNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới" 
                  className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#1D5CFF]"
                  required 
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowChangeUserPasswordModal(false)} className="w-1/2 py-3 border border-[#1E293B] hover:bg-[#1E293B] rounded-xl text-white font-bold cursor-pointer">Hủy</button>
                <button type="submit" className="w-1/2 py-3 bg-[#1D5CFF] hover:bg-[#1A52E5] text-white font-bold rounded-xl cursor-pointer">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADMIN CHANGE PASSWORD MODAL (Image 9) */}
      {showAdminPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1528] border border-[#1E293B] rounded-[24px] max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#1E293B]/80 pb-3">
              <h4 className="font-black text-white text-md flex items-center gap-2 uppercase tracking-wide">
                🔄 Đổi mật khẩu admin
              </h4>
              <button onClick={() => setShowAdminPasswordModal(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <form onSubmit={handleAdminPasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Mật khẩu hiện tại</label>
                <input 
                  type="password" 
                  value={adminPasswordForm.currentPass}
                  onChange={(e) => setAdminPasswordForm({ ...adminPasswordForm, currentPass: e.target.value })}
                  placeholder="••••••••" 
                  className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white focus:border-[#1D5CFF] outline-none"
                  required 
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Mật khẩu mới</label>
                <input 
                  type="password" 
                  value={adminPasswordForm.newPass}
                  onChange={(e) => setAdminPasswordForm({ ...adminPasswordForm, newPass: e.target.value })}
                  placeholder="Nhập tối thiểu 6 kí tự" 
                  className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white focus:border-[#1D5CFF] outline-none"
                  required 
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Xác nhận mật khẩu mới</label>
                <input 
                  type="password" 
                  value={adminPasswordForm.confirmNewPass}
                  onChange={(e) => setAdminPasswordForm({ ...adminPasswordForm, confirmNewPass: e.target.value })}
                  placeholder="Nhập lại mật khẩu mới" 
                  className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white focus:border-[#1D5CFF] outline-none"
                  required 
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdminPasswordModal(false)} className="w-1/2 py-3 border border-[#1E293B] hover:bg-[#1E293B] rounded-xl text-white font-bold cursor-pointer">Hủy bỏ</button>
                <button type="submit" className="w-1/2 py-3 bg-[#1D5CFF] hover:bg-[#1A52E5] text-white font-bold rounded-xl cursor-pointer">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: SIMULATE DEPOSIT */}
      {showSimulateDepositModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1528] border border-[#1E293B] rounded-[24px] max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#1E293B] pb-3">
              <h4 className="font-black text-white text-sm flex items-center gap-2">
                📥 Tạo giả định yêu cầu nạp tiền
              </h4>
              <button onClick={() => setShowSimulateDepositModal(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <form onSubmit={handleSimulateDepositSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Chọn thành viên nhận nạp</label>
                <select 
                  value={simDeposit.username} 
                  onChange={(e) => setSimDeposit({ ...simDeposit, username: e.target.value })}
                  className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white"
                >
                  {userList.map(u => (
                    <option key={u.username} value={u.username} className="bg-[#070F1E]">@{u.username} ({u.fullName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Số tiền nạp (VND)</label>
                <input 
                  type="number" 
                  value={simDeposit.amount}
                  onChange={(e) => setSimDeposit({ ...simDeposit, amount: Number(e.target.value) })}
                  className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white font-mono"
                  required 
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Mã biên lai giao dịch</label>
                <input 
                  type="text" 
                  value={simDeposit.txCode}
                  onChange={(e) => setSimDeposit({ ...simDeposit, txCode: e.target.value })}
                  className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white"
                  required 
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">SĐT liên hệ người nạp</label>
                <input 
                  type="text" 
                  value={simDeposit.phone}
                  onChange={(e) => setSimDeposit({ ...simDeposit, phone: e.target.value })}
                  className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white font-mono"
                  required 
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowSimulateDepositModal(false)} className="w-1/2 py-3 border border-[#1E293B] hover:bg-[#1E293B] rounded-xl text-white font-bold cursor-pointer">Hủy</button>
                <button type="submit" className="w-1/2 py-3 bg-[#1D5CFF] hover:bg-[#1A52E5] text-white font-bold rounded-xl cursor-pointer">Khởi tạo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: SIMULATE WITHDRAWAL */}
      {showSimulateWithdrawModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1528] border border-[#1E293B] rounded-[24px] max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#1E293B] pb-3">
              <h4 className="font-black text-white text-sm flex items-center gap-2">
                📤 Tạo giả định yêu cầu rút tiền
              </h4>
              <button onClick={() => setShowSimulateWithdrawModal(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <form onSubmit={handleSimulateWithdrawSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Chọn thành viên rút tiền</label>
                <select 
                  value={simWithdraw.username} 
                  onChange={(e) => setSimWithdraw({ ...simWithdraw, username: e.target.value })}
                  className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white"
                >
                  {userList.map(u => (
                    <option key={u.username} value={u.username} className="bg-[#070F1E]">@{u.username} ({u.fullName} - Số dư: {formatNumber(u.balance)}đ)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Số tiền rút (VND)</label>
                <input 
                  type="number" 
                  value={simWithdraw.amount}
                  onChange={(e) => setSimWithdraw({ ...simWithdraw, amount: Number(e.target.value) })}
                  className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white font-mono"
                  required 
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tên ngân hàng thụ hưởng</label>
                <input 
                  type="text" 
                  value={simWithdraw.bankName}
                  onChange={(e) => setSimWithdraw({ ...simWithdraw, bankName: e.target.value })}
                  className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white"
                  required 
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Số tài khoản nhận</label>
                <input 
                  type="text" 
                  value={simWithdraw.accountNumber}
                  onChange={(e) => setSimWithdraw({ ...simWithdraw, accountNumber: e.target.value })}
                  className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white font-mono"
                  required 
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Họ tên chủ tài khoản (Chữ hoa không dấu)</label>
                <input 
                  type="text" 
                  value={simWithdraw.accountOwner}
                  onChange={(e) => setSimWithdraw({ ...simWithdraw, accountOwner: e.target.value.toUpperCase() })}
                  className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white uppercase"
                  required 
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowSimulateWithdrawModal(false)} className="w-1/2 py-3 border border-[#1E293B] hover:bg-[#1E293B] rounded-xl text-white font-bold cursor-pointer">Hủy</button>
                <button type="submit" className="w-1/2 py-3 bg-[#1D5CFF] hover:bg-[#1A52E5] text-white font-bold rounded-xl cursor-pointer">Khởi tạo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: CONFIRM DELETE USER */}
      {showDeleteUserModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1528] border border-red-500/30 rounded-[24px] max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#1E293B] pb-3">
              <h4 className="font-black text-white text-sm flex items-center gap-2">
                ⚠️ Xác nhận xóa thành viên
              </h4>
              <button onClick={() => setShowDeleteUserModal(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <div className="space-y-3.5 py-2">
              <p className="text-slate-300 text-xs leading-relaxed">
                Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản thành viên <strong className="text-red-400 font-extrabold">@{userToDelete}</strong> khỏi hệ thống?
              </p>
              <p className="text-slate-400 text-[11px] leading-relaxed bg-[#1E1111]/30 border border-red-500/10 p-3 rounded-xl">
                Lưu ý: Hành động này là không thể khôi phục. Tất cả lịch sử và số dư liên quan sẽ bị loại bỏ khỏi danh sách thành viên.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowDeleteUserModal(false)} 
                className="w-1/2 py-3 border border-[#1E293B] hover:bg-[#1E293B] rounded-xl text-white font-bold cursor-pointer text-xs animate-in"
              >
                Hủy bỏ
              </button>
              <button 
                type="button" 
                onClick={handleConfirmDeleteUser} 
                className="w-1/2 py-3 bg-red-650 hover:bg-red-600 text-white font-bold rounded-xl cursor-pointer text-xs animate-in"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHỈNH SỬA PHÒNG CHƠI */}
      {showEditRoomModal && editingRoom && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1528] border border-[#1E293B] rounded-[24px] max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#1E293B] pb-3">
              <h4 className="font-black text-white text-sm flex items-center gap-2">
                ✏️ Chỉnh sửa thông tin phòng chơi
              </h4>
              <button onClick={() => { setShowEditRoomModal(false); setEditingRoom(null); }} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <form onSubmit={handleEditRoomSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Tên phòng chơi</label>
                <input 
                  type="text" 
                  value={editingRoom.name}
                  onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                  placeholder="Nhập tên phòng (ví dụ: Tik Tok, Telegram...)"
                  className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#1D5CFF]"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Mã Icon (Lucide Icon)</label>
                <input 
                  type="text" 
                  value={editingRoom.icon}
                  onChange={(e) => setEditingRoom({ ...editingRoom, icon: e.target.value })}
                  placeholder="ví dụ: thumb_up, smart_display, video_library"
                  className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#1D5CFF] font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Thời gian chu kỳ (Giây)</label>
                <input 
                  type="number" 
                  value={editingRoom.cycle}
                  onChange={(e) => setEditingRoom({ ...editingRoom, cycle: Number(e.target.value) || 45 })}
                  placeholder="45"
                  className="w-full bg-[#070F1E] border border-[#1D293E] rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#1D5CFF] font-mono"
                  required
                  min="5"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => { setShowEditRoomModal(false); setEditingRoom(null); }} 
                  className="w-1/2 py-3 border border-[#1E293B] hover:bg-[#1E293B] rounded-xl text-white font-bold cursor-pointer text-xs"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 py-3 bg-[#1D5CFF] hover:bg-[#1A52E5] text-white font-bold rounded-xl cursor-pointer text-xs"
                >
                  Lưu cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: XÁC NHẬN XÓA TOÀN BỘ LỊCH SỬ CƯỢC */}
      {showClearAllBetsConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1528] border border-[#1E293B] rounded-[24px] max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#1E293B] pb-3">
              <h4 className="font-black text-white text-sm flex items-center gap-2 text-rose-500">
                ⚠️ Xác nhận xóa lịch sử cược
              </h4>
              <button onClick={() => setShowClearAllBetsConfirm(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn <strong className="text-rose-400">XÓA TOÀN BỘ</strong> lịch sử đặt cược của tất cả thành viên trên hệ thống? Thao tác này sẽ không thể hoàn tác!
            </p>

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowClearAllBetsConfirm(false)} 
                className="w-1/2 py-3 border border-[#1E293B] hover:bg-[#1E293B] rounded-xl text-white font-bold cursor-pointer text-xs"
              >
                Hủy bỏ
              </button>
              <button 
                type="button"
                onClick={() => {
                  adminClearAllBets();
                  showToast("Đã xóa sạch toàn bộ lịch sử cược thành công!", "success");
                  setShowClearAllBetsConfirm(false);
                }}
                className="w-1/2 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl cursor-pointer text-xs"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: XÁC NHẬN XÓA TOÀN BỘ LỊCH SỬ GIAO DỊCH */}
      {showClearAllTransactionsConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1528] border border-[#1E293B] rounded-[24px] max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#1E293B] pb-3">
              <h4 className="font-black text-white text-sm flex items-center gap-2 text-rose-500">
                ⚠️ Xác nhận xóa lịch sử nạp/rút
              </h4>
              <button onClick={() => setShowClearAllTransactionsConfirm(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn <strong className="text-rose-400">XÓA TOÀN BỘ</strong> lịch sử tất cả giao dịch nạp và rút tiền trên hệ thống? Thao tác này sẽ không thể hoàn tác!
            </p>

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowClearAllTransactionsConfirm(false)} 
                className="w-1/2 py-3 border border-[#1E293B] hover:bg-[#1E293B] rounded-xl text-white font-bold cursor-pointer text-xs"
              >
                Hủy bỏ
              </button>
              <button 
                type="button"
                onClick={() => {
                  adminClearAllTransactions();
                  showToast("Đã xóa sạch toàn bộ lịch sử giao dịch thành công!", "success");
                  setShowClearAllTransactionsConfirm(false);
                }}
                className="w-1/2 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl cursor-pointer text-xs"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: XÁC NHẬN XÓA PHÒNG CHƠI */}
      {roomToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1528] border border-[#1E293B] rounded-[24px] max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#1E293B] pb-3">
              <h4 className="font-black text-white text-sm flex items-center gap-2 text-rose-500">
                🗑️ Xác nhận xóa phòng chơi
              </h4>
              <button onClick={() => setRoomToDelete(null)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa phòng chơi <strong className="text-white">"{roomToDelete.name}"</strong>? Thao tác này không thể hoàn tác!
            </p>

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setRoomToDelete(null)} 
                className="w-1/2 py-3 border border-[#1E293B] hover:bg-[#1E293B] rounded-xl text-white font-bold cursor-pointer text-xs"
              >
                Hủy bỏ
              </button>
              <button 
                type="button"
                onClick={() => {
                  deleteRoom(roomToDelete.id);
                  showToast(`Đã xóa phòng "${roomToDelete.name}" thành công!`, "success");
                  setRoomToDelete(null);
                }}
                className="w-1/2 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl cursor-pointer text-xs"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
