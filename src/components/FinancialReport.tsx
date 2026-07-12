import React from 'react';
import { useApp } from '../context/AppContext';
import { HeaderNav } from './HeaderNav';
import { AreaChart, TrendingUp, DollarSign, Wallet, Percent, ShieldCheck } from 'lucide-react';

export const FinancialReport: React.FC = () => {
  const { user, bets, transactions } = useApp();

  if (!user) return null;

  // Let's draw modern responsive SVG visual progress paths
  // Simple coordinates for active profit trends
  const svgPoints = "0,120 60,110 120,95 180,60 240,40 300,30 360,10";

  return (
    <div className="pb-24">
      <HeaderNav title="Báo cáo tài chính" />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-705/10 rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Doanh số tăng trưởng</span>
            <span className="text-xl font-black font-mono text-emerald-500 mt-1 block">
              +{(user.accumulatedWins * 1.15).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}đ
            </span>
            <span className="text-[9px] text-slate-400 mt-0.5 block">Nâng cấp từ chu kỳ 12</span>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-705/10 rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tỷ suất hoàn trả</span>
            <span className="text-xl font-black font-mono text-blue-500 mt-1 block">
              30%
            </span>
            <span className="text-[9px] text-slate-400 mt-0.5 block">Hưởng bảo vệ rủi ro 100%</span>
          </div>
        </div>

        {/* Dynamic Growth Interactive Canvas Chart */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-705/10 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-1.5 ">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Xu Hướng Tăng Trưởng Tài Khoản
              </h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400 font-mono">Bản đồ 7 ngày gần nhất</span>
          </div>

          <div className="relative h-44 w-full">
            {/* Visual SVG graph line */}
            <svg viewBox="0 0 360 130" className="w-full h-full text-blue-500/20 fill-current overflow-visible">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Fill Area */}
              <path 
                d={`M 0,130 L ${svgPoints} L 360,130 Z`} 
                fill="url(#chartGrad)" 
              />
              {/* Stroke Line */}
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={svgPoints}
              />
              {/* Dot Markers */}
              <circle cx="0" cy="120" r="4" fill="#1d4ed8" />
              <circle cx="60" cy="110" r="4" fill="#1d4ed8" />
              <circle cx="120" cy="95" r="4" fill="#1d4ed8" />
              <circle cx="180" cy="60" r="4" fill="#1d4ed8" />
              <circle cx="240" cy="40" r="4" fill="#1d4ed8" />
              <circle cx="300" cy="30" r="4" fill="#1d4ed8" />
              <circle cx="360" cy="10" r="5" fill="#10b981" className="animate-pulse" />
            </svg>
            <div className="absolute top-2 right-2 bg-emerald-500 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded shadow">
              Live: +1.3X
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono font-semibold pt-1 border-t border-slate-100/50 dark:border-slate-700/30">
            <span>Thứ 4</span>
            <span>Thứ 5</span>
            <span>Thứ 6</span>
            <span>Thứ 7</span>
            <span>Chủ Nhật</span>
            <span>Thứ 2</span>
            <span>Hôm nay (Live)</span>
          </div>
        </div>

        {/* Investment breakdown and help tips */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-205 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Cam kết hoàn trả rủi ro Việt Tiến
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Hệ thống hỗ trợ hoàn trả cược cam kết bảo lãnh nguồn vốn đầu tư quảng bá trực tuyến cho quý hội viên. Mọi biến động phân bổ sự kiện đều tuân thủ nguyên tắc độc quyền liên kết giữa doanh nghiệp và khách hàng.
          </p>
          <div className="flex gap-4 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
            <span>• Hoạt động: <strong className="text-blue-500">Bảo đảm 24/7</strong></span>
            <span>• Phí giao dịch: <strong className="text-emerald-500">0%</strong></span>
          </div>
        </div>

      </main>
    </div>
  );
};
