import React from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';

export const IntroductionScreen: React.FC = () => {
  const { setActiveScreen, rooms } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="pb-24 max-w-lg mx-auto bg-[#f3f6fa] dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 font-sans"
    >
      {/* 1. Header Bar: Solid Cyan Bar with "SỰ KIỆN" bold white text */}
      <div 
        className="bg-[#00BCD4] text-white flex items-center justify-center font-sans h-14 shadow-sm select-none"
        style={{ letterSpacing: '0.05em' }}
      >
        <h1 className="text-[17px] font-black uppercase text-center tracking-wider">
          SỰ KIỆN THỜI TRANG
        </h1>
      </div>

      {/* 2. Grid contain dynamic square cards for all rooms */}
      <div className="grid grid-cols-2 gap-4 px-4 pt-6">
        {rooms.map((room) => {
          const isFb = room.name.toLowerCase() === 'facebook';
          const isYt = room.name.toLowerCase() === 'youtube';
          const themeColor = isFb ? '#1877F2' : isYt ? '#E52D27' : '#D97706'; // blue, red, amber for custom
          
          return (
            <motion.button
              key={room.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveScreen(`betting_${room.name}`)}
              className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center aspect-[10/11] group relative animate-in fade-in zoom-in-95"
              id={`event-card-${room.name.toLowerCase()}`}
            >
              {/* Icon container */}
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-3 shadow-md"
                style={{ backgroundColor: themeColor }}
              >
                {isFb ? (
                  <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current mt-2.5">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                ) : isYt ? (
                  <div className="flex flex-col items-center justify-center leading-none">
                    <span className="text-[12px] font-black uppercase tracking-tight font-sans">You</span>
                    <div className="bg-white text-[#E52D27] text-[10px] font-black px-1.5 py-0.5 rounded mt-0.5 tracking-tighter uppercase shrink-0 font-sans">
                      Tube
                    </div>
                  </div>
                ) : (
                  <span className="text-2xl">🎯</span>
                )}
              </div>
              
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-300 tracking-wide mt-1.5 font-sans">
                {room.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Decorative corporate bottom security label */}
      <div className="mt-20 text-center opacity-40 px-6 space-y-1">
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
          ỦY THÁC DỊCH VỤ TRUYỀN THÔNG SỐ VTEC
        </p>
        <p className="text-[9px] text-slate-400">
          Hãy nhấp chọn cổng dịch vụ phù hợp để tiến hành các chiến dịch tương tác được giao.
        </p>
      </div>

    </motion.div>
  );
};
