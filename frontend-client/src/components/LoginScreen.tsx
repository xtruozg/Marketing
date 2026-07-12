import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { VietTienLogo } from './VietTienLogo';

export const LoginScreen: React.FC = () => {
  const { login, setActiveScreen, theme, toggleTheme } = useApp();
  const [username, setUsername] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Vui lòng nhập tên tài khoản.');
      return;
    }
    if (!passwordInput) {
      setErrorMsg('Vui lòng nhập mật khẩu.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const ok = await login(username.trim(), passwordInput);
      setLoading(false);
      if (!ok) {
        setErrorMsg('Thông tin đăng nhập không chính xác. Vui lòng kiểm tra lại!');
      } else {
        // Successful login
        setActiveScreen('home');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Lỗi kết nối máy chủ!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-300 via-slate-200 to-zinc-400 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Nút gạt Sáng/Tối */}
      <button
        onClick={toggleTheme}
        aria-label="Đổi giao diện sáng tối"
        className="absolute top-5 right-5 z-20 p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-slate-200/60 dark:border-slate-700 text-slate-600 dark:text-amber-400 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Background radial soft light-glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-teal-500/5 dark:bg-teal-400/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container with elegant soft shadow and light border */}
      <div className="w-full max-w-md p-[1px] rounded-[24px] bg-gradient-to-b from-white via-slate-200 to-slate-300 dark:from-slate-800 dark:via-slate-800/40 dark:to-slate-900 shadow-[0_20px_50px_-12px_rgba(37,99,235,0.06)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] z-10 transition-colors duration-300">
        <div className="bg-white dark:bg-slate-900/95 rounded-[23px] p-8 md:p-10 flex flex-col items-center relative">
          
          {/* Official Viet Tien Logo */}
          <VietTienLogo className="mb-6 shadow-[0_10px_35px_rgba(37,99,235,0.05)] dark:shadow-none border border-slate-100 dark:border-slate-800" size={120} />

          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold mb-6 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 rounded-full border border-blue-100/60 dark:border-blue-900/40">
            TỔNG CÔNG TY VIỆT TIẾN
          </p>

          {/* Error Message */}
          {errorMsg && (
            <div className="w-full mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-150/50 dark:border-rose-900/40 text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
              <span className="text-sm shrink-0">⚠️</span> 
              <p className="leading-snug">{errorMsg}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                TÀI KHẢN ĐĂNG NHẬP
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tài khoản hoặc số điện thoại"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none text-slate-800 dark:text-slate-100 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                MẬT KHẨU BẢO MẬT
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Nhập mật khẩu an toàn"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl px-4 py-3 pr-12 text-sm outline-none text-slate-800 dark:text-slate-100 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-[0_8px_20px_rgba(37,99,235,0.12)] hover:shadow-[0_12px_25px_rgba(37,99,235,0.2)] cursor-pointer disabled:opacity-55 active:scale-[0.99] mt-2"
            >
              {loading ? 'Đang xác thực thông tin...' : 'ĐĂNG NHẬP HỆ THỐNG'}
            </button>
          </form>

          {/* Switch to Register for members */}
          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Chưa có tài khoản tham gia?{' '}
            <button
              type="button"
              onClick={() => setActiveScreen('register')}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline ml-1"
            >
              Đăng ký ngay
            </button>
          </div>

          {/* Copyright footer */}
          <span className="text-[9px] text-slate-450 dark:text-slate-500 mt-8 tracking-widest">
            © 2026 VIỆT TIẾN. ALL RIGHTS RESERVED.
          </span>

        </div>
      </div>
    </div>
  );
};
