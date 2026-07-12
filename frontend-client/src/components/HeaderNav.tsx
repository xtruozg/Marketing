import React from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon, Wallet, Bell, ArrowLeft, X, Send, CheckCheck } from 'lucide-react';
import { MEDIA } from '../assets/media';

interface HeaderNavProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

const formatTime = (s: string) => {
  if (!s) return '';
  const d = new Date(s.replace(' ', 'T'));
  if (isNaN(d.getTime())) return s;
  return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
};

const typeStyle: Record<string, string> = {
  balance: 'bg-emerald-500',
  transaction: 'bg-blue-500',
  info: 'bg-amber-500',
  message: 'bg-cyan-500',
};

export const HeaderNav: React.FC<HeaderNavProps> = ({ title, showBack, onBack }) => {
  const {
    theme,
    toggleTheme,
    user,
    activeScreen,
    setActiveScreen,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    sendNotificationToAdmin,
  } = useApp();

  const [showPanel, setShowPanel] = React.useState(false);
  const [composeText, setComposeText] = React.useState('');
  const [sending, setSending] = React.useState(false);

  const handleAvatarClick = () => {
    setActiveScreen('profile');
  };

  const handleSend = async () => {
    const msg = composeText.trim();
    if (!msg || sending) return;
    setSending(true);
    const ok = await sendNotificationToAdmin('Yêu cầu hỗ trợ từ khách hàng', msg);
    setSending(false);
    if (ok) setComposeText('');
  };

  return (
    <header className="sticky top-0 z-50 w-full h-16 flex items-center justify-between px-4 md:px-8 border-b border-gray-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-[#0F172A]/90 backdrop-blur-md transition-all duration-300">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack || (() => setActiveScreen('home'))}
            className="p-2 -ml-1 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div
          onClick={() => setActiveScreen('home')}
          className="flex items-center gap-2.5 cursor-pointer group active:scale-98 transition-transform"
        >
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/70 dark:border-slate-700 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
            <img src={MEDIA.logo} alt="Việt Tiến" className="w-full h-full object-contain p-0.5" referrerPolicy="no-referrer" />
          </div>
          <span className="font-sans font-extrabold text-2xl tracking-tight bg-gradient-to-r from-[#004ac6] to-cyan-500 dark:from-[#b4c5ff] dark:to-teal-300 bg-clip-text text-transparent group-hover:opacity-90">
            Việt Tiến
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Theme Toggle explicitly for 'đổi màu sáng tối' */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors mr-1 cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400 animate-pulse" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" />
          )}
        </button>

        {user && activeScreen !== 'login' && activeScreen !== 'register' && (
          <>
            {/* Wallet Quick Button */}
            <button
              onClick={() => setActiveScreen('profile')}
              title="Xem Ví"
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Wallet className="w-5 h-5" />
            </button>

            {/* Notification Bell + Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPanel((v) => !v)}
                title="Thông báo"
                className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-[#0F172A]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {showPanel && (
                <>
                  {/* Backdrop để bấm ra ngoài đóng panel */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowPanel(false)} />
                  <div className="absolute right-0 mt-2 w-[330px] max-w-[92vw] max-h-[70vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Thông báo</span>
                      <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllNotificationsRead}
                            title="Đánh dấu tất cả đã đọc"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <CheckCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setShowPanel(false)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">Chưa có thông báo nào.</div>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => !n.isRead && markNotificationRead(n.id)}
                            className={`w-full text-left px-4 py-3 border-b border-slate-50 dark:border-slate-800/60 flex gap-3 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                              n.isRead ? 'opacity-70' : 'bg-blue-50/40 dark:bg-blue-950/20'
                            }`}
                          >
                            <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.isRead ? 'bg-slate-300 dark:bg-slate-600' : typeStyle[n.type] || 'bg-blue-500'}`} />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{n.title}</p>
                              {n.message && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{n.message}</p>}
                              <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">{formatTime(n.createdAt)}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    {/* Gửi yêu cầu tới quản trị viên */}
                    <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                      <div className="flex items-end gap-2">
                        <textarea
                          value={composeText}
                          onChange={(e) => setComposeText(e.target.value)}
                          placeholder="Gửi yêu cầu / phản hồi tới CSKH..."
                          rows={1}
                          className="flex-1 resize-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-blue-400"
                        />
                        <button
                          onClick={handleSend}
                          disabled={sending || !composeText.trim()}
                          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0"
                          title="Gửi tới quản trị viên"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Avatar */}
            <button
              onClick={handleAvatarClick}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-blue-500/20 dark:border-blue-400/30 hover:border-blue-600 transition-colors active:scale-95 cursor-pointer ml-1"
            >
              <img
                src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          </>
        )}
      </div>
    </header>
  );
};
