import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Phone, User, Users, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const RegisterScreen: React.FC = () => {
  const { register, setActiveScreen, theme, toggleTheme } = useApp();
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [refCode, setRefCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setErrorMsg('Vui lòng nhập số điện thoại.');
      return;
    }
    if (!fullName) {
      setErrorMsg('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (passwordInput.length < 6) {
      setErrorMsg('Mật khẩu của quý khách phải có ít nhất 6 ký tự.');
      return;
    }
    if (refCode.trim() !== '88888') {
      setErrorMsg('Mã giới thiệu không chính xác. Quý khách vui lòng nhập đúng mã giới thiệu.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const ok = await register(phone, fullName, passwordInput, refCode.trim());
      setLoading(false);
      if (!ok) {
        setErrorMsg('Đăng ký không thành công. Hãy thử lại sau.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Lỗi mạng khi đăng ký tài khoản!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-300 via-slate-200 to-zinc-400 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500 w-full font-sans relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-teal-500/5 dark:bg-teal-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md p-[1px] rounded-[24px] bg-gradient-to-b from-white via-slate-200 to-slate-300 dark:from-slate-800 dark:via-slate-800/40 dark:to-slate-900 shadow-[0_20px_50px_-12px_rgba(37,99,235,0.06)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] z-10 transition-colors duration-300">
        <div className="bg-white dark:bg-slate-900/95 rounded-[23px] p-6 md:p-8 relative">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-widest text-[10px] bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-100/50 dark:border-blue-900/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              Khách hàng Việt Tiến
            </div>
            <button
              onClick={toggleTheme}
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? '☀️ Sáng' : '🌙 Tối'}
            </button>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-1.5">
              Đăng Ký Tài Khoản
            </h1>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
              Tạo tài khoản thành viên để nhận ngay gói quà tặng trải nghiệm dịch vụ.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-150/50 dark:border-rose-900/40 text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
              <span className="text-sm shrink-0">⚠️</span>
              <p className="leading-snug">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                SỐ ĐIỆN THOẠI ĐĂNG KÝ
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại của bạn"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none text-slate-800 dark:text-slate-100 placeholder-slate-450 dark:placeholder-slate-600 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                HỌ VÀ TÊN KHÁCH HÀNG
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên đầy đủ"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none text-slate-800 dark:text-slate-100 placeholder-slate-455 dark:placeholder-slate-600 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                MẬT KHẨU (Tối thiểu 6 ký tự)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Thiết lập mật khẩu bảo mật"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-10 text-sm outline-none text-slate-800 dark:text-slate-100 placeholder-slate-450 dark:placeholder-slate-600 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                MÃ ĐĂNG KÝ / GIỚI THIỆU (Bắt buộc)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                  <Users className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value)}
                  placeholder="Nhập mã giới thiệu bắt buộc"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none text-slate-800 dark:text-slate-100 placeholder-slate-450 dark:placeholder-slate-600 transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.12)] hover:shadow-[0_12px_25px_rgba(37,99,235,0.2)] cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50 mt-2 uppercase tracking-widest"
            >
              {loading ? 'Đang tạo tài khoản...' : 'HOÀN TẤT ĐĂNG KÝ'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Đã có tài khoản Việt Tiến?{' '}
            <button
              onClick={() => setActiveScreen('login')}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
