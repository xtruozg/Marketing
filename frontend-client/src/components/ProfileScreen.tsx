import React, { useState } from 'react';
import { useApp, MIN_WITHDRAW } from '../context/AppContext';
import { HeaderNav } from './HeaderNav';
import { 
  User, 
  Lock, 
  CreditCard, 
  LogOut, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle,
  Wallet,
  ShieldAlert,
  FileText,
  History,
  ChevronRight,
  Camera,
  Check,
  X
} from 'lucide-react';

const AVAILABLE_AVATARS = [
  {
    gender: 'Nữ' as const,
    list: [
      { id: 'f1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', name: 'Nữ thần sắc sảo' },
      { id: 'f2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', name: 'Nữ tính năng động' },
      { id: 'f3', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80', name: 'Nữ sinh thuần khiết' },
      { id: 'f4', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', name: 'Nữ cường trí tuệ' },
      { id: 'f5', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', name: 'Phong cách tối giản' },
      { id: 'f6', url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&auto=format&fit=crop&q=80', name: 'Thanh lịch hiện đại' }
    ]
  },
  {
    gender: 'Nam' as const,
    list: [
      { id: 'm1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', name: 'Nam thần lịch lãm' },
      { id: 'm2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', name: 'Phong cách năng động' },
      { id: 'm3', url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80', name: 'Nghệ thuật hiện đại' },
      { id: 'm4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', name: 'Nam tính phóng khoáng' },
      { id: 'm5', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', name: 'Cá tính độc đáo' },
      { id: 'm6', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80', name: 'Chuyên nghiệp tự tin' }
    ]
  }
];

export const ProfileScreen: React.FC = () => {
  const { 
    user, 
    changePassword, 
    updateBankInfo, 
    updateAvatar,
    withdraw, 
    logout,
    theme,
    toggleTheme,
    setActiveScreen,
    profileActiveTab: activeTab,
    setProfileActiveTab: setActiveTab,
    transactions
  } = useApp();

  // Avatar edit states
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarGenderTab, setAvatarGenderTab] = useState<'Nam' | 'Nữ'>('Nữ');
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  // Change password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [updatingPass, setUpdatingPass] = useState(false);

  // Bank Info States
  const [bankName, setBankName] = useState(user?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(user?.accountNumber || '');
  const [accountHolder, setAccountHolder] = useState(user?.accountHolder || '');
  const [bankSuccess, setBankSuccess] = useState('');
  const [updatingBank, setUpdatingBank] = useState(false);

  // Withdraw states
  const [withdrawAmount, setWithdrawAmount] = useState<number>(500000);
  const [withdrawAmountInput, setWithdrawAmountInput] = useState<string>('500000');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');
  const [withdrawingAction, setWithdrawingAction] = useState(false);

  const formatNumber = (v: number) => new Intl.NumberFormat('vi-VN').format(v);

  // Custom visual background theme color preset picker
  const [bgPreset, setBgPreset] = useState<'slate' | 'ocean' | 'beige'>(() => {
    return (localStorage.getItem('viet-tien-bg-preset') as 'slate' | 'ocean' | 'beige') || 'slate';
  });

  if (!user) return null;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setPassError('Quý khách vui lòng nhập đầy đủ thông tin mật khẩu.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPassError('Mật khẩu mới và xác nhận mật khẩu không trùng khớp.');
      return;
    }

    setUpdatingPass(true);
    try {
      const res = await changePassword(oldPassword, newPassword);
      setUpdatingPass(false);
      if (res.success) {
        setPassSuccess(res.message);
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPassError(res.message);
      }
    } catch (err) {
      setUpdatingPass(false);
      setPassError('Lỗi kết nối máy chủ khi cập nhật mật khẩu!');
    }
  };

  const handleUpdateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankSuccess('');

    if (!bankName || !accountNumber || !accountHolder) {
      alert('Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng.');
      return;
    }

    const uppercaseUnaccentedRegex = /^[A-Z0-9 ]+$/;
    if (!uppercaseUnaccentedRegex.test(accountHolder)) {
      alert('Tên chủ tài khoản bắt buộc phải viết hoa không dấu (ví dụ: NGUYEN VAN A).');
      return;
    }

    setUpdatingBank(true);
    try {
      const success = await updateBankInfo(bankName, accountNumber, accountHolder);
      setUpdatingBank(false);
      if (success) {
        setBankSuccess('Đã cập nhật thông tin tài khoản ngân hàng thành công!');
        setTimeout(() => setBankSuccess(''), 3000);
      } else {
        alert('Cập nhật tài khoản ngân hàng thất bại!');
      }
    } catch (err) {
      setUpdatingBank(false);
      alert('Lỗi kết nối máy chủ khi cập nhật thông tin ngân hàng!');
    }
  };

  const handleWithdrawRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    if (!user.bankName || !user.accountNumber) {
      setWithdrawError('Quý khách vui lòng cấu hình Tài khoản ngân hàng liên kết trước.');
      return;
    }

    if (!Number.isInteger(withdrawAmount) || withdrawAmount <= 0) {
      setWithdrawError('Số tiền rút không hợp lệ.');
      return;
    }

    if (withdrawAmount < MIN_WITHDRAW) {
      setWithdrawError(`Hạn mức rút tiền tối thiểu là ${MIN_WITHDRAW.toLocaleString('vi-VN')} VND.`);
      return;
    }

    if (user.balance < withdrawAmount) {
      setWithdrawError('Số dư quý khách không đủ để thực hiện giao dịch này.');
      return;
    }

    setWithdrawingAction(true);
    setTimeout(async () => {
      try {
        const res = await withdraw(withdrawAmount, user.bankName!, user.accountNumber!, user.accountHolder!);
        setWithdrawingAction(false);
        if (res.success) {
          setWithdrawSuccess(res.message);
        } else {
          setWithdrawError(res.message);
        }
      } catch (err) {
        setWithdrawingAction(false);
        setWithdrawError('Lỗi kết nối khi gửi yêu cầu rút tiền!');
      }
    }, 700);
  };

  const handleChangeBgPreset = (preset: 'slate' | 'ocean' | 'beige') => {
    setBgPreset(preset);
    localStorage.setItem('viet-tien-bg-preset', preset);
    
    // Inject dynamic client background hues
    const root = window.document.documentElement;
    if (preset === 'ocean') {
      root.style.backgroundColor = '#071F24'; // beautiful emerald dark oceanic
    } else if (preset === 'beige') {
      root.style.backgroundColor = '#FAF6F0'; // soft warm beige for light theme
    } else {
      // standard dark slate or light gray
      root.style.backgroundColor = theme === 'dark' ? '#0F172A' : '#f3f6fa';
    }
  };

  return (
    <div className="pb-24 bg-[#f3f6fa] dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 font-sans">
      <HeaderNav title="Cá nhân & Cài đặt" showBack={false} />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        
        {/* User Card Layout */}
        <div className="bg-gradient-to-r from-blue-600/90 to-cyan-700 dark:from-slate-900 dark:to-slate-800 p-6 rounded-2xl text-white shadow-md flex flex-col justify-between gap-4">
          <div className="flex items-center gap-4">
            <div 
              onClick={() => setIsAvatarModalOpen(true)}
              className="relative w-16 h-16 rounded-full border-4 border-white/20 overflow-hidden shrink-0 cursor-pointer group hover:border-blue-300 transition-all active:scale-95 duration-200"
              title="Nhấp để đổi ảnh đại diện AI"
            >
              <img
                src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                alt="Avatar"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="w-4 h-4 text-white" />
                <span className="text-[8px] text-white font-bold uppercase tracking-wider mt-0.5">Thay ảnh</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg tracking-tight">{user.fullName}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex flex-col items-end shrink-0">
            <span className="text-[10px] text-white/75 uppercase tracking-wider font-semibold">TỔNG SỐ DƯ TIỀN MẶT</span>
            <span className="text-2xl font-black font-mono mt-0.5">{user.balance.toLocaleString('vi-VN')} đ</span>
            <span className="text-[9px] text-emerald-300 font-medium">Bảo mật chuẩn mã hóa AES-256</span>
          </div>
        </div>

        {/* Tab Selection controller */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 pb-px">
          {[
            { id: 'info', label: 'Thông tin & Nền', icon: User },
            { id: 'bank', label: 'Liên Kết Ngân Hàng', icon: CreditCard },
            { id: 'withdraw', label: 'Rút Tiền Ví', icon: Wallet },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-center gap-1.5 py-3 flex-1 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  isTabActive
                    ? 'border-blue-600 text-blue-600 dark:border-cyan-400 dark:text-cyan-400 font-black'
                    : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ').pop()}</span>
              </button>
            );
          })}
        </div>

        {/* Info & Background theme settings TAB */}
        {activeTab === 'info' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-100 uppercase tracking-wider">
                Thông tin tài khoản
              </h4>
              <span className="text-xs text-slate-400 font-mono">Khách hàng</span>
            </div>

            {/* Doanh số tích lũy (đồng bộ với cập nhật từ quản trị viên) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-3.5 rounded-xl">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Doanh số hỗ trợ tích lũy</span>
                <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {formatNumber(user.accumulatedSupport || 0)} đ
                </span>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 p-3.5 rounded-xl">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Tổng tiền thắng tích lũy</span>
                <span className="text-lg font-black font-mono text-blue-600 dark:text-blue-400 mt-0.5 block">
                  {formatNumber(user.accumulatedWins || 0)} đ
                </span>
              </div>
            </div>

            {/* Tiện ích báo cáo & lịch sử + đăng xuất */}
            <div className="space-y-4 pt-2">
              {/* Seamless Navigation Shortcuts (retaining Báo cáo and Sao kê functionality flawlessly) */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                  Tiện ích báo cáo &amp; lịch sử
                </h5>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setActiveScreen('financial_report')}
                    type="button"
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 tracking-wide transition-all text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer group"
                    id="btn-goto-report"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span>Báo cáo doanh thu &amp; hoàn thừa</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setActiveScreen('histories')}
                    type="button"
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 tracking-wide transition-all text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer group"
                    id="btn-goto-histories"
                  >
                    <div className="flex items-center gap-2.5">
                      <History className="w-4 h-4 text-blue-500" />
                      <span>Lọc sao kê &amp; lịch sử tích lũy</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full mt-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 text-red-600 dark:text-red-400 font-sans font-bold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> ĐĂNG XUẤT TÀI KHOẢN
              </button>
            </div>
          </div>
        )}

        {/* Link Bank Account TAB */}
        {activeTab === 'bank' && (
          <form onSubmit={handleUpdateBank} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Tài Khoản Liên Kết Rút Tiền
              </h4>
              <span className="text-xs text-slate-400 font-sans">Liên kết</span>
            </div>

            {bankSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200/60 dark:border-green-900/60 rounded-xl text-xs text-green-500 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {bankSuccess}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Tên ngân hàng định danh
                </label>
                <input
                  type="text"
                  list="vietnamese-banks"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Chọn hoặc nhập tên ngân hàng của bạn"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 outline-none transition-all font-bold"
                />
                <datalist id="vietnamese-banks">
                  <option value="Vietcombank" />
                  <option value="Techcombank" />
                  <option value="MB Bank - Ngân hàng Quân đội" />
                  <option value="Vietinbank" />
                  <option value="Agribank" />
                  <option value="BIDV" />
                  <option value="ACB - Ngân hàng Á Châu" />
                  <option value="Sacombank" />
                  <option value="VPBank" />
                  <option value="TPBank" />
                  <option value="VIB" />
                  <option value="SHB" />
                  <option value="HDBank" />
                  <option value="LPBank" />
                  <option value="SeABank" />
                  <option value="MSB" />
                  <option value="OCB" />
                  <option value="Eximbank" />
                  <option value="SCB" />
                  <option value="Nam A Bank" />
                  <option value="Bac A Bank" />
                  <option value="BVBank - Viet Capital Bank" />
                  <option value="Kienlongbank" />
                  <option value="VietBank" />
                  <option value="PGBank" />
                  <option value="Saigonbank" />
                  <option value="GPBank" />
                  <option value="OceanBank" />
                  <option value="CBBank" />
                  <option value="PVcomBank" />
                  <option value="DongA Bank" />
                  <option value="VietABank" />
                  <option value="NCB" />
                  <option value="Shinhan Bank" />
                  <option value="Woori Bank" />
                  <option value="HSBC" />
                  <option value="Standard Chartered" />
                  <option value="Citibank" />
                  <option value="UOB" />
                </datalist>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Số tài khoản nhận tiền
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Nhập chính xác số tài khoản"
                  className="w-full bg-slate-50 dark:bg-slate-905 border border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl py-2.5 px-3 text-xs outline-none text-slate-800 dark:text-slate-100 transition-all font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Tên chủ tài khoản cá nhân (Mã viết hoa không dấu)
                </label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                  placeholder="NGUYEN VAN A"
                  className="w-full bg-slate-50 dark:bg-slate-905 border border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl py-2.5 px-3 text-xs outline-none text-slate-800 dark:text-slate-100 transition-all font-bold tracking-wider"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingBank}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold text-xs py-3 rounded-xl shadow-md transition-all active:scale-98 cursor-pointer uppercase tracking-wider mt-2 disabled:opacity-50"
            >
              {updatingBank ? 'Đang lưu...' : 'LƯU THÔNG TIN KHAI BÁO'}
            </button>
          </form>
        )}

        {/* Withdraw cash TAB */}
        {activeTab === 'withdraw' && (
          <div className="space-y-6">
            <form onSubmit={handleWithdrawRequest} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  Rút Tiền Khả Dụng Về Ngân Hàng
                </h4>
                <span className="text-xs text-slate-400 font-sans">Xử lý trong 24h</span>
              </div>

              {withdrawError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/60 rounded-xl text-xs text-red-550 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  {withdrawError}
                </div>
              )}

              {withdrawSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200/60 dark:border-green-900/60 rounded-xl text-xs text-green-550 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  {withdrawSuccess}
                </div>
              )}

              {/* Warn if no linked bank details */}
              {(!user.bankName || !user.accountNumber) ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/60 rounded-xl text-xs text-amber-700 dark:text-amber-400 space-y-2">
                  <p className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Quý khách chưa liên kết ngân hàng!
                  </p>
                  <p>Hãy nhấp vào tab "Liên Kết Ngân Hàng" trên thanh danh mục để liên kết ví cá nhân trước.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Tài khoản thụ hưởng hiện tại</span>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {user.bankName} - <span className="font-mono">{user.accountNumber}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Chủ tài khoản: {user.accountHolder}</div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Nhập số tiền muốn rút (đ)
                    </label>
                    <input
                      type="text"
                      value={withdrawAmountInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        const cleanVal = val.replace(/\D/g, '').replace(/^0+/, '');
                        if (cleanVal === '') {
                          setWithdrawAmountInput('');
                          setWithdrawAmount(0);
                        } else {
                          const parsedNum = parseInt(cleanVal, 10);
                          setWithdrawAmountInput(cleanVal);
                          setWithdrawAmount(parsedNum);
                        }
                      }}
                      placeholder="0"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl py-3 px-3.5 text-base outline-none text-slate-800 dark:text-slate-100 transition-all font-mono font-black"
                    />
                    <div className="mt-1.5 flex justify-between items-center bg-slate-100/50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/60">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Thực nhận bằng chữ:</span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {withdrawAmount > 0 ? `${formatNumber(withdrawAmount)} đ` : '0 đ'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Tối thiểu: {MIN_WITHDRAW.toLocaleString('vi-VN')} VND | Hạn mức rút 1 lần lên tới 100,000,000đ</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={withdrawingAction || !user.bankName}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-xs py-3.5 rounded-xl shadow-md transition-all active:scale-98 cursor-pointer uppercase tracking-wider mt-2 disabled:opacity-40"
              >
                {withdrawingAction ? 'Đang gửi giao dịch...' : 'XÁC NHẬN YÊU CẦU RÚT TIỀN'}
              </button>
            </form>

            {/* Recent withdrawals card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4.5 h-4.5 text-blue-500" />
                  Lịch Sử Giao Dịch Rút Tiền
                </h4>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded font-bold uppercase">
                  Tự động cập nhật
                </span>
              </div>

              {transactions.filter(t => t.type === 'Rút tiền').length === 0 ? (
                <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
                  Chưa ghi nhận yêu cầu rút tiền nào trên hệ thống.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead>
                      <tr className="text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
                        <th className="py-2.5">Mã Giao Dịch</th>
                        <th>Thông Tin Nhận</th>
                        <th>Số Tiền</th>
                        <th>Thời Gian Gửi</th>
                        <th className="text-right">Trạng Thái Lệnh</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {transactions.filter(t => t.type === 'Rút tiền').map((tx) => (
                        <tr key={tx.id} className="text-slate-600 dark:text-slate-300 font-mono">
                          <td className="py-3.5 font-semibold text-slate-800 dark:text-slate-100">{tx.id}</td>
                          <td className="font-sans text-xs">
                            <span className="font-semibold block truncate max-w-[200px]" title={tx.details}>
                              {tx.details?.replace('Rút về ngân hàng ', '') || tx.details}
                            </span>
                          </td>
                          <td className="font-bold text-rose-500">
                            -{tx.amount.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="text-[10px] text-slate-400">
                            {new Date(tx.timestamp).toLocaleString('vi-VN')}
                          </td>
                          <td className="text-right">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                              tx.status === 'Thành công' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' :
                              tx.status === 'Đang xử lý' ? 'bg-amber-100 text-amber-850 dark:bg-amber-950/20 dark:text-amber-400 animate-pulse' :
                              'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400'
                            }`}>
                              {tx.status === 'Thành công' ? 'Đã duyệt' :
                               tx.status === 'Đang xử lý' ? 'Chờ phê duyệt' :
                               'Đã bị từ chối'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* AI Avatar Selector Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                  Đổi Ảnh Đại Diện AI
                </h3>
              </div>
              <button 
                onClick={() => setIsAvatarModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gender Selection Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 p-2 gap-2 bg-white dark:bg-slate-900">
              {(['Nữ', 'Nam'] as const).map((gender) => (
                <button
                  key={gender}
                  onClick={() => setAvatarGenderTab(gender)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    avatarGenderTab === gender
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Ảnh AI {gender}
                </button>
              ))}
            </div>

            {/* Avatars Grid */}
            <div className="p-5 max-h-[350px] overflow-y-auto bg-slate-50/50 dark:bg-slate-950/20">
              <div className="grid grid-cols-3 gap-4">
                {AVAILABLE_AVATARS.find(g => g.gender === avatarGenderTab)?.list.map((item) => {
                  const isCurrent = user.avatarUrl === item.url || (!user.avatarUrl && item.id === 'f1');
                  return (
                    <button
                      key={item.id}
                      disabled={isSavingAvatar}
                      onClick={async () => {
                        setIsSavingAvatar(true);
                        const success = await updateAvatar(item.url);
                        setIsSavingAvatar(false);
                        if (success) {
                          setIsAvatarModalOpen(false);
                        }
                      }}
                      className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer group border-2 transition-all active:scale-95 flex flex-col justify-between ${
                        isCurrent 
                          ? 'border-blue-600 dark:border-cyan-400 ring-4 ring-blue-500/10 font-bold' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                      }`}
                    >
                      <img 
                        src={item.url} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Name overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-1.5 text-center">
                        <span className="text-[9px] text-white/95 font-medium truncate block leading-none">
                          {item.name}
                        </span>
                      </div>

                      {/* Selection overlay indicator */}
                      {isCurrent && (
                        <div className="absolute top-1 right-1 bg-blue-600 dark:bg-cyan-500 text-white rounded-full p-0.5 shadow-sm">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer notice */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">
                * Ảnh chân dung AI Generative chất lượng cao
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
