import React from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon, Wallet, Bell, ArrowLeft } from 'lucide-react';

interface HeaderNavProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ title, showBack, onBack }) => {
  const { theme, toggleTheme, user, activeScreen, setActiveScreen } = useApp();

  const handleAvatarClick = () => {
    setActiveScreen('profile');
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
          className="flex items-center gap-2 cursor-pointer group active:scale-98 transition-transform"
        >
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

            {/* Notification welcome modal */}
            <button 
              onClick={() => alert(`Kính chào quý khách!\nChúc quý khách giao dịch an toàn và có những trải nghiệm tuyệt vời cùng Việt Tiến!`)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* User Avatar */}
            <button 
              onClick={handleAvatarClick}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-blue-500/20 dark:border-blue-400/30 hover:border-blue-600 transition-colors active:scale-95 cursor-pointer ml-1"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            </button>
          </>
        )}
      </div>
    </header>
  );
};
