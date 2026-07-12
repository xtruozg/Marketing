import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Eye, EyeOff } from 'lucide-react';
import { VietTienLogo } from './VietTienLogo';

export const LoginScreen: React.FC = () => {
  const { login, setActiveScreen } = useApp();
  const [username, setUsername] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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

    setTimeout(() => {
      const ok = login(username.trim(), passwordInput);
      setLoading(false);
      if (!ok) {
        setErrorMsg('Thông tin đăng nhập không chính xác. Vui lòng kiểm tra lại!');
      } else {
        // Successful login
        if (username.trim() === 'admin') {
          setActiveScreen('admin');
        } else {
          setActiveScreen('home');
        }
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-zinc-200 text-slate-800 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans transition-all duration-300">
      
      {/* Background radial soft light-glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-teal-500/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Main Container with elegant soft shadow and light border */}
      <div className="w-full max-w-md p-[1px] rounded-[24px] bg-gradient-to-b from-white via-slate-200 to-slate-300 shadow-[0_30px_70px_-16px_rgba(37,99,235,0.06)] z-10">
        
        <div className="bg-white/95 rounded-[23px] p-8 md:p-10 flex flex-col items-center relative overflow-hidden backdrop-blur-xl">
          
          {/* Top subtle ambient glow bar */}
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500" />

          {/* Official Viet Tien Logo */}
          <VietTienLogo className="mb-6 shadow-[0_10px_35px_rgba(37,99,235,0.05)] border border-slate-100" size={110} />

          <p className="text-[10px] text-blue-600 font-extrabold mb-6 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100/60">
            TỔNG CÔNG TY VIỆT TIẾN
          </p>

          {/* Error Message */}
          {errorMsg && (
            <div className="w-full mb-5 p-4 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-600 font-semibold flex items-center gap-2.5">
              <span className="text-sm shrink-0">⚠️</span> 
              <p className="leading-snug">{errorMsg}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                TÀI KHOẢN ĐĂNG NHẬP
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tài khoản hoặc số điện thoại"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                MẬT KHẨU BẢO MẬT
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Nhập mật khẩu an toàn"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3.5 pr-12 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
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
          {username.trim() !== 'admin' && (
            <div className="mt-6 text-center text-xs text-slate-500">
              Chưa có tài khoản tham gia?{' '}
              <button
                type="button"
                onClick={() => setActiveScreen('register')}
                className="text-blue-600 font-bold hover:underline ml-1 cursor-pointer"
              >
                Đăng ký ngay
              </button>
            </div>
          )}

          {/* Copyright footer */}
          <span className="text-[9px] text-slate-400 mt-8 tracking-widest">
            © 2026 VIỆT TIẾN. ALL RIGHTS RESERVED.
          </span>

        </div>
      </div>
    </div>
  );
};
