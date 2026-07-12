import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  Sparkles,
  Wallet,
  ShieldAlert,
  Paintbrush,
  FileText,
  History,
  ChevronRight
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { 
    user, 
    changePassword, 
    updateBankInfo, 
    withdraw, 
    logout,
    theme,
    toggleTheme,
    setActiveScreen,
    profileActiveTab: activeTab,
    setProfileActiveTab: setActiveTab,
    transactions
  } = useApp();

  // Change password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // Bank Info States
  const [bankName, setBankName] = useState(user?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(user?.accountNumber || '');
  const [accountHolder, setAccountHolder] = useState(user?.accountHolder || '');
  const [bankSuccess, setBankSuccess] = useState('');

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

  const handleUpdatePassword = (e: React.FormEvent) => {
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

    const res = changePassword(oldPassword, newPassword);
    if (res.success) {
      setPassSuccess(res.message);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      setPassError(res.message);
    }
  };

  const handleUpdateBank = (e: React.FormEvent) => {
    e.preventDefault();
    setBankSuccess('');

    if (!bankName || !accountNumber || !accountHolder) {
      alert('Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng.');
      return;
    }

    updateBankInfo(bankName, accountNumber, accountHolder);
    setBankSuccess('Đã cập nhật thông tin tài khoản ngân hàng thành công!');
    setTimeout(() => setBankSuccess(''), 3000);
  };

  const handleWithdrawRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    if (!user.bankName || !user.accountNumber) {
      setWithdrawError('Quý khách vui lòng cấu hình Tài khoản ngân hàng liên kết trước.');
      return;
    }

    if (withdrawAmount <= 0) {
      setWithdrawError('Số tiền rút không hợp lệ.');
      return;
    }

    if (withdrawAmount < 100000) {
      setWithdrawError('Mức rút tiền tối thiểu là 100,000 đ.');
      return;
    }

    if (user.balance < withdrawAmount) {
      setWithdrawError('Số dư quý khách không đủ để thực hiện giao dịch này.');
      return;
    }

    setWithdrawingAction(true);
    setTimeout(() => {
      const res = withdraw(withdrawAmount, user.bankName, user.accountNumber, user.accountHolder);
      setWithdrawingAction(false);
      if (res.success) {
        setWithdrawSuccess(res.message);
      } else {
        setWithdrawError(res.message);
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
      root.style.backgroundColor = theme === 'dark' ? '#0F172A' : '#f7f9fb';
    }
  };

  return (
    <div className="pb-24">
      <HeaderNav title="Cá nhân & Cài đặt" showBack={false} />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* User Card Layout */}
        <div className="bg-gradient-to-r from-blue-600/90 to-cyan-750 dark:from-slate-800 dark:to-slate-700/80 p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-white/20 overflow-hidden shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
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
        <div className="flex border-b border-slate-205/60 dark:border-slate-800 pb-px">
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
                className={`flex items-center gap-1.5 py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  isTabActive
                    ? 'border-blue-600 text-blue-600 dark:border-cyan-400 dark:text-cyan-405 font-black'
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
          <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-705/10 rounded-2xl p-5 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700/50">
              <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-100 uppercase tracking-wider">
                Cấu hình Giao diện & Trực quan
              </h4>
              <span className="text-xs text-slate-400 font-mono">Dành cho Khách hàng</span>
            </div>

            {/* Background Color Customization picker */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Paintbrush className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Lựa chọn Màu Nền Trực Quan Dễ Nhìn (Phù hợp mắt)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Slate Theme */}
                <button
                  onClick={() => handleChangeBgPreset('slate')}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                    bgPreset === 'slate'
                      ? 'border-blue-500 bg-slate-50 dark:bg-slate-900/80 shadow-sm'
                      : 'border-transparent bg-slate-100 dark:bg-slate-900/35 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-205">Tối Toàn Bộ</div>
                  <div className="text-[10px] text-slate-400 mt-1">Nền xám đá Slate thanh lịch, tiết kiệm pin.</div>
                </button>

                {/* Ocean Theme */}
                <button
                  onClick={() => handleChangeBgPreset('ocean')}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                    bgPreset === 'ocean'
                      ? 'border-teal-500 bg-teal-950/20 shadow-sm'
                      : 'border-transparent bg-emerald-950/5 hover:bg-emerald-950/10'
                  }`}
                >
                  <div className="font-bold text-xs text-teal-650 dark:text-teal-400">Xanh Êm Dịu (Oceanic)</div>
                  <div className="text-[10px] text-slate-400 mt-1">Hạn chế mỏi mắt, phù hợp đọc bảng số liệu lâu.</div>
                </button>

                {/* Beige Theme */}
                <button
                  onClick={() => handleChangeBgPreset('beige')}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                    bgPreset === 'beige'
                      ? 'border-amber-600 bg-amber-50/50 shadow-sm'
                      : 'border-transparent bg-amber-50/10 hover:bg-amber-50/20'
                  }`}
                >
                  <div className="font-bold text-xs text-amber-800 dark:text-amber-200">Sáng Tinh Tế (Beige Cream)</div>
                  <div className="text-[10px] text-slate-400 mt-1">Tone kem dịu mắt, độ tương phản mượt mà nhất.</div>
                </button>
              </div>
            </div>

            {/* Customer stats list */}
            <div className="space-y-4 pt-2">
              <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                Thông số hoạt động của bạn
              </h5>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Mã giới thiệu của tôi</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">VT3091</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Trạng thái bảo mật</span>
                  <span className="text-green-500 font-bold flex items-center gap-1">✓ Đã kích hoạt OTP</span>
                </div>
              </div>

              {/* Seamless Navigation Shortcuts (retaining Báo cáo and Sao kê functionality flawlessly) */}
              <div className="space-y-2 pt-2">
                <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                  Tiện ích báo cáo &amp; lịch sử
                </h5>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setActiveScreen('financial_report')}
                    type="button"
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900/80 rounded-xl border border-slate-100 dark:border-slate-800 tracking-wide transition-all text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer group"
                    id="btn-goto-report"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span>Báo cáo doanh thu &amp; hoàn thừa</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-455 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setActiveScreen('histories')}
                    type="button"
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900/80 rounded-xl border border-slate-100 dark:border-slate-800 tracking-wide transition-all text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer group"
                    id="btn-goto-histories"
                  >
                    <div className="flex items-center gap-2.5">
                      <History className="w-4 h-4 text-blue-500" />
                      <span>Lọc sao kê &amp; lịch sử tích lũy</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-455 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full mt-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/80 dark:hover:bg-slate-700 text-red-650 dark:text-red-400 font-sans font-bold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> ĐĂNG XUẤT TÀI KHOẢN
            </button>
          </div>
        )}

        {/* Link Bank Account TAB */}
        {activeTab === 'bank' && (
          <form onSubmit={handleUpdateBank} className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-705/10 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Tài Khoản Liên Kết Rút Tiền
              </h4>
              <span className="text-xs text-slate-400 font-sans">Xác thực chính chủ</span>
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
                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 outline-none transition-all font-bold"
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
                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-205 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-550 rounded-xl py-2.5 px-3 text-xs outline-none text-slate-800 dark:text-slate-100 transition-all font-mono font-bold"
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
                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-205 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-550 rounded-xl py-2.5 px-3 text-xs outline-none text-slate-800 dark:text-slate-100 transition-all font-bold tracking-wider"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold text-xs py-3 rounded-xl shadow-md transition-all active:scale-98 cursor-pointer uppercase tracking-wider mt-2"
            >
              LƯU THÔNG TIN KHAI BÁO
            </button>
          </form>
        )}



        {/* Withdraw cash TAB */}
        {activeTab === 'withdraw' && (
          <div className="space-y-6">
            <form onSubmit={handleWithdrawRequest} className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-705/10 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  Rút Tiền Khả Dụng Về Ngân Hàng
                </h4>
                <span className="text-xs text-slate-400 font-sans">Xử lý trong 24h</span>
              </div>

              {withdrawError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/60 rounded-xl text-xs text-red-500 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  {withdrawError}
                </div>
              )}

              {withdrawSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200/60 dark:border-green-900/60 rounded-xl text-xs text-green-500 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  {withdrawSuccess}
                </div>
              )}

              {/* Warn if no linked bank details */}
              {(!user.bankName || !user.accountNumber) ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/60 rounded-xl text-xs text-amber-700 dark:text-amber-400 space-y-2">
                  <p className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Quý khách chưa liên kết tài khoản ngân hàng!
                  </p>
                  <p>Hãy nhấp vào tab "Liên Kết Ngân Hàng" trên thanh danh mục để liên kết ví cá nhân trước.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
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
                      className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-205 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-550 rounded-xl py-3 px-3.5 text-base outline-none text-slate-800 dark:text-slate-100 transition-all font-mono font-black"
                    />
                    <div className="mt-1.5 flex justify-between items-center bg-slate-100/50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/60">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Thực nhận bằng chữ:</span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {withdrawAmount > 0 ? `${formatNumber(withdrawAmount)} đ` : '0 đ'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Tối thiểu: 100,000đ | Hạn mức rút 1 lần lên tới 100,000,000đ</span>
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
            <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-705/10 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
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
                      <tr className="text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700/50 pb-2">
                        <th className="py-2.5">Mã Giao Dịch</th>
                        <th>Thông Tin Nhận</th>
                        <th>Số Tiền</th>
                        <th>Thời Gian Gửi</th>
                        <th className="text-right">Trạng Thái Lệnh</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
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
                              {tx.status === 'Thành công' ? 'Đã duyệt thành công' :
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
    </div>
  );
};
