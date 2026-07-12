import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, User2 } from 'lucide-react';

export const FooterNav: React.FC = () => {
  const { activeScreen, setActiveScreen, user } = useApp();

  if (!user || activeScreen === 'login' || activeScreen === 'register' || activeScreen === 'admin') {
    return null;
  }

  // Active state matching includes nested routes
  const isHomeActive = activeScreen === 'home';
  const isProfileActive = activeScreen === 'profile' || 
                           activeScreen === 'financial_report' || 
                           activeScreen === 'histories' ||
                           activeScreen === 'link_bank';
  
  const isEventsActive = activeScreen === 'introduction' || 
                         activeScreen === 'betting_facebook' || 
                         activeScreen === 'betting_youtube';

  const handleTabClick = (tab: 'home' | 'events' | 'profile') => {
    if (tab === 'home') {
      setActiveScreen('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'events') {
      setActiveScreen('introduction');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'profile') {
      setActiveScreen('profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] px-4 py-1.5 flex items-center justify-around h-16 transition-all max-w-lg mx-auto">
      
      {/* 1. Trang Chủ Tab (Home with an elegant orange-roof house icon matching screenshot) */}
      <button
        onClick={() => handleTabClick('home')}
        className={`flex flex-col items-center justify-center py-1 w-20 transition-all cursor-pointer relative ${
          isHomeActive && !isEventsActive
            ? 'text-cyan-600 font-bold scale-102'
            : 'text-slate-400 font-medium hover:text-slate-600'
        }`}
        id="tab-home"
      >
        <div className="w-6 h-6 flex items-center justify-center mb-0.5 relative">
          {/* Custom SVG of a house with orange triangle roof matching screenshot exactly’s icon details */}
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2">
            {/* Orange Roof */}
            <path d="M3 11l9-8 9 8" stroke="#F97316" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            {/* House body */}
            <path d="M5 11v8a2 2 0 002 2h10a2 2 0 002-2v-8" className={isHomeActive && !isEventsActive ? 'text-cyan-600' : 'text-slate-400'} strokeLinecap="round" strokeLinejoin="round" />
            {/* Door */}
            <path d="M9 21v-6a3 3 0 016 0v6" className={isHomeActive && !isEventsActive ? 'text-cyan-600' : 'text-slate-400'} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-[11px] mt-0.5 tracking-wide">Trang chủ</span>
      </button>

      {/* 2. Sự kiện Tab (Golden sparkling/award star motif matching screenshot) */}
      <button
        onClick={() => handleTabClick('events')}
        className={`flex flex-col items-center justify-center py-1 w-20 transition-all cursor-pointer relative ${
          isEventsActive
            ? 'text-amber-500 font-bold scale-102'
            : 'text-slate-400 font-medium hover:text-slate-650'
        }`}
        id="tab-events"
      >
        <div className="w-6 h-6 flex items-center justify-center mb-0.5">
          <svg viewBox="0 0 24 24" className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2.2">
            {/* Glowing active star filled with gold if selected */}
            <polygon 
              points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" 
              fill={isEventsActive ? '#F59E0B' : 'transparent'} 
              stroke={isEventsActive ? '#D97706' : '#94A3B8'} 
              strokeLinejoin="round" 
              strokeLinecap="round" 
            />
            {/* Small sparkles accent design */}
            <path d="M19 3h.01M21 5h.01M3 5h.01M5 3h.01" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <span className="text-[11px] mt-0.5 tracking-wide">Sự kiện</span>
      </button>

      {/* 3. Cá Nhân Tab (Soft blue profile silhouette matching screenshot) */}
      <button
        onClick={() => handleTabClick('profile')}
        className={`flex flex-col items-center justify-center py-1 w-20 transition-all cursor-pointer relative ${
          isProfileActive
            ? 'text-blue-600 font-bold scale-102'
            : 'text-slate-400 font-medium hover:text-slate-600'
        }`}
        id="tab-profile"
      >
        <div className="w-6 h-6 flex items-center justify-center mb-0.5">
          <svg viewBox="0 0 24 24" className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2.2">
            {/* Avatar circle body outline */}
            <path 
              d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" 
              fill={isProfileActive ? '#EFF6FF' : 'transparent'}
              stroke={isProfileActive ? '#2563EB' : '#94A3B8'} 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            <circle 
              cx="12" 
              cy="7" 
              r="4" 
              fill={isProfileActive ? '#EFF6FF' : 'transparent'}
              stroke={isProfileActive ? '#2563EB' : '#94A3B8'} 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
        </div>
        <span className="text-[11px] mt-0.5 tracking-wide">Cá nhân</span>
      </button>

    </footer>
  );
};
