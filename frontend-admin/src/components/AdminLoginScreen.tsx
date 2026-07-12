import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { ShieldAlert, Key, Eye, EyeOff } from 'lucide-react';

export const AdminLoginScreen: React.FC = () => {
  const { adminLogin } = useAdmin();
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Quý khách vui lòng điền mật khẩu quản trị.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminLogin(password);
      setLoading(false);
      if (!res.success) {
        setError(res.message);
      }
    } catch (err) {
      setLoading(false);
      setError('Không thể kết nối máy chủ quản trị!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] flex items-center justify-center p-4 relative overflow-hidden font-sans text-slate-800">
      
      {/* Background soft glowing light spheres */}
      <div className="absolute top-[-10%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-tr from-cyan-400/10 to-blue-500/10 blur-[120px] pointer-events-none" />

      {/* Main Card wrapper with sleek border gradient and premium shadow */}
      <div className="w-full max-w-md p-[1px] rounded-[24px] bg-gradient-to-b from-white via-slate-200 to-slate-300 shadow-[0_30px_70px_-16px_rgba(15,23,42,0.06)] z-10">
        
        <div className="bg-white/95 rounded-[23px] p-8 md:p-10 flex flex-col items-center relative overflow-hidden backdrop-blur-xl">
          
          {/* Animated glow bar at top */}
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500" />
          
          {/* Advanced glowing ShieldAlert wrapper */}
          <div className="relative group mb-5 mt-3">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-35 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <div className="relative w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(37,99,235,0.04)]">
              <ShieldAlert className="w-7 h-7 text-blue-600" />
            </div>
          </div>

          <div className="text-center space-y-2.5 mb-7">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-950 font-sans">VT-SYS Admin Control</h2>
            <p className="inline-block text-[10px] text-blue-600 font-extrabold uppercase tracking-widest bg-blue-50 border border-blue-100/50 px-4 py-1.5 rounded-full">
              Hệ Thống Phê Duyệt &amp; Doanh Số
            </p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Vui lòng cung cấp mật khẩu quản trị chuyên sâu để truy cập bảng điều khiển hệ thống.
            </p>
          </div>

          {error && (
            <div className="w-full mb-5 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-600 font-semibold flex items-center gap-2.5">
              <span className="text-sm shrink-0">⚠️</span>
              <p className="leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div className="space-y-1.5 w-full">
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Nhập mật khẩu quản trị viên
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 pl-11 pr-11 text-xs font-bold font-mono text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all tracking-widest placeholder:text-slate-350"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs py-3.5 rounded-xl shadow-[0_10px_25px_-5px_rgba(37,99,235,0.2)] hover:shadow-[0_15px_30px_-5px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98] cursor-pointer uppercase tracking-widest font-sans mt-3"
            >
              {loading ? 'Đang kiểm tra quyền...' : 'ĐĂNG NHẬP HỆ THỐNG'}
            </button>
          </form>

          <div className="text-center mt-8 text-[9px] text-slate-400 uppercase tracking-widest font-mono">
            Bảo mật chuẩn AES-256 | VT-CONTROL PANEL
          </div>

        </div>
      </div>

    </div>
  );
};
