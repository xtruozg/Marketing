import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BetCategory } from '../types';
import { HeaderNav } from './HeaderNav';
import { 
  DollarSign, 
  Clock, 
  CheckCircle,
  HelpCircle,
  TrendingDown,
  ChevronRight,
  TrendingUp,
  Award,
  AlertTriangle,
  History
} from 'lucide-react';

interface BettingRoomProps {
  room: string;
}

export const BettingRoom: React.FC<BettingRoomProps> = ({ room }) => {
  const { 
    user, 
    currentPeriod, 
    secondsRemaining, 
    placeBet, 
    bets, 
    periodsHistory,
    setActiveScreen
  } = useApp();

  const activePeriod = currentPeriod[room] || 'N/A';

  // Selected options & amount
  const [selectedItems, setSelectedItems] = useState<BetCategory[]>([]);
  const [amountInput, setAmountInput] = useState<number>(300000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [errorNotice, setErrorNotice] = useState<string>('');
  const [successNotice, setSuccessNotice] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const totalAmountToPlace = amountInput * selectedItems.length;

  const formatPrice = (val: number) => {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleToggleCategory = (name: BetCategory) => {
    setSelectedItems((prev) => {
      if (prev.includes(name)) {
        return prev.filter((item) => item !== name);
      } else {
        return [...prev, name];
      }
    });
    setErrorNotice('');
    setSuccessNotice('');
  };

  if (!user) return null;

  const categories: { name: BetCategory; label: string; desc: string; iconColor: string }[] = [
    {
      name: 'Tăng tương tác',
      label: 'TĂNG TƯƠNG TÁC',
      desc: 'Bình luận, Thích, Đăng tin lan tỏa giá trị thương hiệu Việt Tiến.',
      iconColor: 'bg-emerald-500',
    },
    {
      name: 'Tăng doanh số',
      label: 'TĂNG DOANH SỐ',
      desc: 'Đẩy mạnh truyền thông sản phẩm veston & sơ mi cao cấp.',
      iconColor: 'bg-indigo-500',
    },
    {
      name: 'Quảng bá sản phẩm',
      label: 'QUẢNG BÁ SẢN PHẨM',
      desc: 'Chiến dịch ra mắt BST Thu Đông & Thể thao thời thượng.',
      iconColor: 'bg-cyan-500',
    },
    {
      name: 'Thu hút đầu tư',
      label: 'THU HÚT ĐẦU TƯ',
      desc: 'Tăng trưởng tài chính dài hạn cùng cổ đông doanh nghiệp.',
      iconColor: 'bg-amber-500',
    },
  ];

  const suggestedAmounts = [100000, 300000, 500000, 1000000];

  const handleSelectAmount = (val: number) => {
    setAmountInput(val);
    setCustomAmount('');
    setErrorNotice('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    if (val === '') {
      setErrorNotice('');
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setAmountInput(num);
      setErrorNotice('');
    } else {
      setErrorNotice('Vui lòng nhập số tiền hợp lệ');
    }
  };

  const handleConfirmBet = () => {
    setErrorNotice('');
    setSuccessNotice('');

    if (selectedItems.length === 0) {
      setErrorNotice('Vui lòng lựa chọn ít nhất 1 trong các hạng mục sự kiện ở trên.');
      return;
    }

    if (amountInput <= 0) {
      setErrorNotice('Số tiền phân bổ không hợp lệ.');
      return;
    }

    if (user.balance < totalAmountToPlace) {
      setErrorNotice('Số dư của quý khách không đủ. Vui lòng liên hệ với Quản trị viên để nạp thêm tiền.');
      return;
    }

    setLoading(true);

    const betsToPlace = selectedItems.map((choice) => ({
      choice,
      amount: amountInput,
    }));

    // Simulate small backend verification delay
    setTimeout(() => {
      const res = placeBet(room, null, null, betsToPlace);
      setLoading(false);
      if (res.success) {
        const namesStr = selectedItems.map(item => `"${item}"`).join(', ');
        setSuccessNotice(`Sự nghiệp đã ghi nhận! Bạn đã phân bổ thành công vào các hạng mục: ${namesStr} cho kỳ ${activePeriod}.`);
        setSelectedItems([]); // Clear selected
      } else {
        setErrorNotice(res.message || 'Xảy ra lỗi trong hệ thống.');
      }
    }, 450);
  };

  // Filter previous bets on this room
  const roomBetsHistory = bets
    .filter((b) => b.room === room)
    .slice(0, 5); // display only 5 recent wagers in active room

  const formatTime = (secs: number) => {
    return `00:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="pb-24">
      <HeaderNav title={`Phòng Sự Kiện ${room}`} showBack={true} onBack={() => setActiveScreen('home')} />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Banner with info about target room with colors corresponding to Facebook/Youtube/Custom */}
        <div className={`p-5 rounded-2xl text-white shadow-md relative overflow-hidden ${
          room.toLowerCase() === 'facebook' 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-700' 
            : room.toLowerCase() === 'youtube'
            ? 'bg-gradient-to-r from-red-650 to-rose-600'
            : 'bg-gradient-to-r from-amber-600 to-orange-650'
        }`}>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-100 bg-white/10 px-2 py-0.5 rounded-md">
                Cổng thông tin sự kiện
              </span>
              <h2 className="text-xl sm:text-2xl font-black mt-1">
                Phòng Tích Lũy Đầu Tư {room}
              </h2>
              <p className="text-xs text-white/90 mt-1 max-w-md">
                Phát triển chiến lược thương mại điện tử Việt Tiến. Mỗi chu kỳ 40 giây tự động hoàn trả lãi thắng cược 30%.
              </p>
            </div>
            
            <div className="flex gap-4 md:border-l md:border-white/20 md:pl-6">
              <div>
                <span className="text-[10px] text-white/70 block">KỲ ĐANG MỞ</span>
                <span className="text-sm font-mono font-black">{activePeriod}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/70 block">BẢO MẬT</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-400/20">SSL SECURE</span>
              </div>
            </div>
          </div>
          {/* Subtle background abstract shape */}
          <div className="absolute right-0 bottom-0 w-44 h-44 bg-white/5 rounded-full blur-2xl transform translate-x-10 translate-y-10" />
        </div>

        {/* Ticking Clock and Balance summary */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-705/10 rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3.5 border-r border-slate-100 dark:border-slate-700/50 pr-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Clock className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block">ĐẮM CHÌM - THỜI GIAN CÒN LẠI</span>
              <span className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100 tracking-wider">
                {formatTime(secondsRemaining)}
              </span>
              {secondsRemaining <= 6 && (
                <span className="text-[10px] text-amber-500 font-bold block animate-pulse">Sắp đóng đăng ký kỳ này...</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3.5 pl-0 sm:pl-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-sans">VÍ KHẢ DỤNG CỦA QUÝ KHÁCH</span>
              <span className="text-lg font-black font-mono text-slate-800 dark:text-slate-100 leading-tight block">
                {user.balance.toLocaleString('vi-VN')} VND
              </span>
              <span className="text-[10px] text-slate-400">X1.3 số tiền hoàn trả lãi</span>
            </div>
          </div>
        </div>

        {/* Categories Choice selection (Grid of 4 items) */}
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase tracking-widest text-[#2563eb] dark:text-[#60a5fa]">
            BƯỚC 1: LỰA CHỌN PHÂN BỔ SỰ KIỆN (CÓ THỂ CHỌN NHIỀU MỤC)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => {
              const isSelected = selectedItems.includes(cat.name);
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleToggleCategory(cat.name)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 shadow-md transform -translate-y-0.5'
                      : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black tracking-wide text-slate-800 dark:text-slate-100">
                      {cat.label}
                    </span>
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {cat.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount distribution selection */}
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase tracking-widest text-[#2563eb] dark:text-[#60a5fa]">
            BƯỚC 2: CHỌN SỐ TIỀN PHÂN BỔ
          </label>

          <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-705/10 rounded-2xl p-4 shadow-sm space-y-4">
            
            {/* Quick value tags */}
            <div className="flex flex-wrap gap-2">
              {suggestedAmounts.map((val) => {
                const isSelected = amountInput === val && !customAmount;
                return (
                  <button
                    key={val}
                    onClick={() => handleSelectAmount(val)}
                    className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {val.toLocaleString('vi-VN')} đ
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <div className="relative">
              <input
                type="number"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="Nhập số tiền khác"
                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl py-2.5 pl-4 pr-4 text-xs outline-none text-slate-800 dark:text-slate-100 transition-all font-mono"
              />
            </div>
            
            {selectedItems.length > 0 && (
              <div className="text-[11px] text-slate-400 flex flex-col gap-1 sm:flex-row sm:justify-between border-t border-slate-100 dark:border-slate-700/50 pt-3">
                <div>
                  Đã chọn: <strong className="text-blue-500 font-bold">{selectedItems.length}</strong> hạng mục × <strong className="text-slate-700 dark:text-slate-300 font-mono">{formatPrice(amountInput)}đ</strong>
                </div>
              </div>
            )}

            <div className="text-[11px] text-slate-400 flex justify-between">
              <span>Định mức tối thiểu: 10.000 đ</span>
              <span>Tổng lãi hoàn trả dự tính: <strong className="text-emerald-500 font-mono">{formatPrice(Math.floor(totalAmountToPlace * 1.3))} đ</strong></span>
            </div>
          </div>
        </div>

        {/* Notices and confirmations */}
        {errorNotice && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {errorNotice}
          </div>
        )}

        {successNotice && (
          <div className="p-3.5 bg-green-50 dark:bg-green-950/20 border border-green-200/60 dark:border-green-900/60 rounded-xl text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {successNotice}
          </div>
        )}

        <button
          onClick={handleConfirmBet}
          disabled={loading || secondsRemaining <= 3}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold py-3.5 rounded-2xl shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-40 uppercase tracking-wider text-xs flex justify-center items-center gap-2"
        >
          {secondsRemaining <= 3
            ? 'ĐANG CHỜ BẢN GHI PHÁT HÀNH...'
            : loading
            ? 'Đang xử lý biểu quyết...'
            : 'XÁC NHẬN'}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Recent results in this room - "LỊCH SỬ MỞ KỲ" */}
          <div className="md:col-span-1 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-705/10 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
              <History className="w-4 h-4 text-blue-500" />
              <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 uppercase">
                KQ 5 kỳ gần đây
              </h5>
            </div>

            <div className="space-y-2">
              {(periodsHistory[room] || []).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-slate-400">{item.period.slice(-8)}</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${
                    item.result === 'Tăng tương tác' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                    item.result === 'Tăng doanh số' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300' :
                    item.result === 'Quảng bá sản phẩm' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300' :
                    'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}>
                    {item.result}
                  </span>
                </div>
              ))}
              {(periodsHistory[room] || []).length === 0 && (
                <p className="text-[11px] text-slate-400 text-center py-4">Chưa có phiên sự kiện nào kết thúc</p>
              )}
            </div>
          </div>

          {/* User's recent bets in this room */}
          <div className="md:col-span-2 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-705/10 rounded-2xl p-4 shadow-sm space-y-3">
            <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 uppercase pb-2 border-b border-slate-100 dark:border-slate-700">
              Đăng ký phân bổ của bạn
            </h5>

            {roomBetsHistory.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Bạn chưa có lượt đăng ký phân bổ nào cho phòng {room} kì này.
              </p>
            ) : (
              <div className="space-y-2 overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[300px]">
                  <thead>
                    <tr className="text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700 pb-1">
                      <th className="py-1">Kỳ mở</th>
                      <th>Lựa chọn</th>
                      <th>Số tiền</th>
                      <th className="text-right">Kết quả</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {roomBetsHistory.map((bet) => (
                      <tr key={bet.id} className="text-slate-600 dark:text-slate-300 font-mono">
                        <td className="py-2">{bet.period.slice(-8)}</td>
                        <td>{bet.choice}</td>
                        <td className="font-bold">{bet.amount.toLocaleString('vi-VN')}đ</td>
                        <td className="text-right">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                            bet.result === 'Thắng' ? 'bg-emerald-100 text-emerald-800 dark:bg-green-950/40 dark:text-green-400' :
                            bet.result === 'Thua' ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 animate-pulse'
                          }`}>
                            {bet.result === 'Thắng' ? `Thắng (+${bet.payout?.toLocaleString('vi-VN')}đ)` : bet.result}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
};
