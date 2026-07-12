import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HeaderNav } from './HeaderNav';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter, 
  FileText,
  Facebook,
  Youtube,
  Search
} from 'lucide-react';

export const HistoriesScreen: React.FC = () => {
  const { bets, transactions } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'facebook' | 'youtube'>('all');
  const [subTab, setSubTab] = useState<'bets' | 'transactions'>('bets');

  const filteredBets = bets.filter((b) => {
    if (filterType === 'facebook') return b.room === 'Facebook';
    if (filterType === 'youtube') return b.room === 'Youtube';
    return true;
  });

  return (
    <div className="pb-24">
      <HeaderNav title="Sao Kê Hoạt Động" />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Toggle subtab: Events and Cashflow */}
        <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl">
          <button
            onClick={() => setSubTab('bets')}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              subTab === 'bets'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-600'
            }`}
          >
            Lịch Sử Sự Kiện
          </button>
          <button
            onClick={() => setSubTab('transactions')}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              subTab === 'transactions'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-600'
            }`}
          >
            Nhật Ký Dòng Tiền
          </button>
        </div>

        {/* Room Filter (Only for bets subtab) */}
        {subTab === 'bets' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-black mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Lọc phòng:
            </span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold border transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-850 hover:bg-slate-50 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              Tất Cả
            </button>
            <button
              onClick={() => setFilterType('facebook')}
              className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                filterType === 'facebook'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-850 hover:bg-slate-50 border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400'
              }`}
            >
              <Facebook className="w-3 h-3 fill-current" /> Facebook
            </button>
            <button
              onClick={() => setFilterType('youtube')}
              className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                filterType === 'youtube'
                  ? 'bg-red-600 text-white border-red-650'
                  : 'bg-white dark:bg-slate-850 hover:bg-slate-50 border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400'
              }`}
            >
              <Youtube className="w-3 h-3 fill-current" /> Youtube
            </button>
          </div>
        )}

        {/* Dynamic Lists */}
        {subTab === 'bets' ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-705/10 rounded-2xl p-4 shadow-sm overflow-hidden">
            {filteredBets.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">Không tìm thấy bản ghi phân bổ phù hợp.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700 pb-2">
                      <th className="py-2.5">Mã Kỳ Mở</th>
                      <th>Nhóm Phòng</th>
                      <th>Lựa chọn Hạng Mục</th>
                      <th>Số Tiền</th>
                      <th>Thời gian</th>
                      <th className="text-right">Kết quả đợt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {filteredBets.map((bet) => (
                      <tr key={bet.id} className="text-slate-600 dark:text-slate-300 font-mono">
                        <td className="py-3 font-semibold text-slate-850 dark:text-slate-100">{bet.period}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            bet.room === 'Facebook' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/30' : 'bg-red-100 text-red-800 dark:bg-red-950/30'
                          }`}>
                            {bet.room}
                          </span>
                        </td>
                        <td className="font-sans font-bold text-slate-755 dark:text-slate-200">{bet.choice}</td>
                        <td className="font-bold">{bet.amount.toLocaleString('vi-VN')} đ</td>
                        <td className="text-[10px] text-slate-400">{new Date(bet.timestamp).toLocaleTimeString('vi-VN')}</td>
                        <td className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            bet.result === 'Thắng' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' :
                            bet.result === 'Thua' ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-950/40 animate-pulse'
                          }`}>
                            {bet.result === 'Thắng' ? `Có Lãi (+${bet.payout?.toLocaleString('vi-VN')}đ)` : bet.result}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-705/10 rounded-2xl p-4 shadow-sm overflow-hidden">
            {transactions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">Không tìm thấy giao dịch chuyển khoản nào.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700 pb-2">
                      <th className="py-2.5">Mã GD</th>
                      <th>Loại biến động</th>
                      <th>Số tiền chuyển</th>
                      <th>Mô tả chi tiết</th>
                      <th>Thời gian phát hành</th>
                      <th className="text-right">Trạng thái lệnh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {transactions.map((trans) => (
                      <tr key={trans.id} className="text-slate-600 dark:text-slate-300 font-mono">
                        <td className="py-3 font-semibold text-slate-800 dark:text-slate-100">{trans.id}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            trans.type === 'Nạp tiền' ? 'bg-emerald-100 text-emerald-800' :
                            trans.type === 'Rút tiền' ? 'bg-amber-100 text-amber-800' :
                            trans.type === 'Tiền thắng cược' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {trans.type}
                          </span>
                        </td>
                        <td className={`font-bold ${trans.amount > 0 ? 'text-emerald-500' : 'text-slate-500'}`}>
                          {trans.amount > 0 ? '+' : ''}{trans.amount.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="font-sans max-w-xs truncate">{trans.details}</td>
                        <td className="text-[10px] text-slate-400">
                          {new Date(trans.timestamp).toLocaleString('vi-VN')}
                        </td>
                        <td className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            trans.status === 'Thành công' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' :
                            trans.status === 'Đang xử lý' ? 'bg-amber-100 text-amber-850 dark:bg-amber-950/20 dark:text-amber-400 animate-pulse' :
                            'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400'
                          }`}>
                            {trans.status === 'Thành công' ? 'Thành công' :
                             trans.status === 'Đang xử lý' ? 'Đang chờ xử lý' :
                             'Yêu cầu chưa được duyệt'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};
