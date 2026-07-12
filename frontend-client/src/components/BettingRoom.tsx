import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BetCategory } from '../types';
import { HeaderNav } from './HeaderNav';
import { 
  DollarSign, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  History
} from 'lucide-react';

interface BettingRoomProps {
  room: string;
}

export const BettingRoom: React.FC<BettingRoomProps> = ({ room }) => {
  const { 
    user, 
    rooms,
    secondsRemaining, 
    placeBet, 
    bets, 
    periodsHistory,
    setActiveScreen
  } = useApp();

  const activeRoom = rooms.find(r => r.id === room || r.name === room);
  const activePeriod = activeRoom?.session || 'N/A';

  // Selected options & amount
  const [selectedItems, setSelectedItems] = useState<BetCategory[]>([]);
  const [amountPerCategory, setAmountPerCategory] = useState<number>(300000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [errorNotice, setErrorNotice] = useState<string>('');
  const [successNotice, setSuccessNotice] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

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
    setAmountPerCategory(val);
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
      setAmountPerCategory(num);
      setErrorNotice('');
    } else {
      setErrorNotice('Vui lòng nhập số tiền hợp lệ');
    }
  };

  const handleConfirmBet = () => {
    setErrorNotice('');
    setSuccessNotice('');

    if (secondsRemaining <= 3) {
      setErrorNotice('Đã hết thời gian đặt cược cho phiên này!');
      return;
    }

    const betsToPlace = selectedItems.map((choice) => ({
      choice,
      amount: amountPerCategory,
    }));

    if (betsToPlace.length === 0) {
      setErrorNotice('Vui lòng chọn ít nhất 1 hạng mục sự kiện để tiến hành tích lũy.');
      return;
    }

    if (!Number.isInteger(amountPerCategory) || amountPerCategory <= 0) {
      setErrorNotice('Số tiền phân bổ không hợp lệ.');
      return;
    }

    if (amountPerCategory < 10000) {
      setErrorNotice('Định mức phân bổ tối thiểu cho mỗi hạng mục là 10.000 đ.');
      return;
    }

    const totalAmount = amountPerCategory * betsToPlace.length;

    if (user.balance < totalAmount) {
      setErrorNotice('Số dư của quý khách không đủ. Vui lòng liên hệ với Quản trị viên để nạp thêm tiền.');
      return;
    }

    setLoading(true);

    // Simulate small backend verification delay
    setTimeout(async () => {
      try {
        const res = await placeBet(room, null, null, betsToPlace);
        setLoading(false);
        if (res) {
          const namesStr = betsToPlace.map(b => `"${b.choice}" (${b.amount.toLocaleString('vi-VN')}đ)`).join(', ');
          setSuccessNotice(`Sự nghiệp đã ghi nhận! Bạn đã phân bổ thành công vào các hạng mục: ${namesStr} cho kỳ ${activePeriod}.`);
          
          // Reset selections
          setSelectedItems([]);
          setAmountPerCategory(300000);
          setCustomAmount('');
        } else {
          setErrorNotice('Xảy ra lỗi trong hệ thống hoặc số dư không đủ.');
        }
      } catch (err) {
        setLoading(false);
        setErrorNotice('Lỗi kết nối máy chủ khi thực hiện cược!');
      }
    }, 450);
  };

  // Filter previous bets on this room
  const roomBetsHistory = bets
    .filter((b) => b.room === room)
    .slice(0, 5); // display only 5 recent wagers in active room

  const formatPrice = (val: number) => {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  const selectedCount = selectedItems.length;
  const totalAmountToPlace = amountPerCategory * selectedCount;

  return (
    <div className="pb-24 bg-gradient-to-b from-[#f3f6fa] via-slate-100 to-[#eef2f6] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-screen text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      <HeaderNav title={`Phòng Sự Kiện ${room}`} showBack={true} onBack={() => setActiveScreen('home')} />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        
        {/* Banner with info about target room with colors corresponding to Facebook/Youtube/Custom */}
        <div className={`p-6 rounded-[24px] text-white shadow-[0_12px_40px_-8px_rgba(37,99,235,0.15)] relative overflow-hidden ${
          room.toLowerCase() === 'facebook' 
            ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800' 
            : room.toLowerCase() === 'youtube'
            ? 'bg-gradient-to-br from-red-600 via-rose-600 to-rose-700'
            : 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600'
        }`}>
          <div className="relative z-10 flex flex-col justify-between gap-4">
            <div>
              <span className="text-[9px] uppercase font-black tracking-widest text-white/95 bg-white/15 px-3 py-1 rounded-full backdrop-blur-xs border border-white/10">
                CỔNG THÔNG TIN SỰ KIỆN
              </span>
              <h2 className="text-xl sm:text-2xl font-black mt-3 tracking-tight">
                Phòng Tích Lũy Đầu Tư {room}
              </h2>
              <p className="text-xs text-white/85 mt-2 leading-relaxed font-medium">
                Phát triển chiến lược thương mại điện tử Việt Tiến. Mỗi chu kỳ 40 giây tự động hoàn trả lãi thắng cược 30%.
              </p>
            </div>
            
            <div className="flex gap-6 mt-1">
              <div>
                <span className="text-[9px] text-white/70 block uppercase tracking-wider font-extrabold">KỲ ĐANG MỞ</span>
                <span className="text-sm font-mono font-black tracking-wider text-amber-300 mt-0.5 block">{activePeriod}</span>
              </div>
              <div>
                <span className="text-[9px] text-white/70 block uppercase tracking-wider font-extrabold">BẢO MẬT HỆ THỐNG</span>
                <span className="inline-block text-[9px] bg-emerald-500/20 text-emerald-300 font-black px-2.5 py-1 rounded-full border border-emerald-400/25 mt-0.5 uppercase tracking-widest">SSL SECURE</span>
              </div>
            </div>
          </div>
          {/* Subtle background abstract shape */}
          <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* Ticking Clock and Balance summary */}
        <div className="bg-white/80 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 rounded-3xl p-4.5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.03)] grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 border-r border-slate-100 dark:border-slate-800/80 pr-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold block">THỜI GIAN CÒN LẠI</span>
              <span className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100 tracking-widest mt-0.5 block">
                {formatTime(secondsRemaining)}
              </span>
              {secondsRemaining <= 6 && (
                <span className="text-[9px] text-rose-500 font-extrabold uppercase tracking-wider mt-0.5 block animate-pulse">Sắp đóng đăng ký...</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 pl-0 sm:pl-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold block">VÍ KHẢ DỤNG</span>
              <span className="text-lg font-black font-mono text-slate-800 dark:text-slate-100 mt-0.5 block tracking-tight">
                {user.balance.toLocaleString('vi-VN')} đ
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium block mt-0.5">X1.3 Lãi suất hoàn lại</span>
            </div>
          </div>
        </div>

        {/* Step 1: Select Categories */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
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
                  className={`p-4.5 rounded-2xl border text-left cursor-pointer transition-all duration-250 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-[0_8px_20px_-8px_rgba(37,99,235,0.12)] -translate-y-0.5'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/40 dark:hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black tracking-wide text-slate-800 dark:text-slate-100 uppercase">
                      {cat.label}
                    </span>
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs">✓</span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed font-medium">
                    {cat.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Choose allocation amount per category */}
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase tracking-widest text-[#2563eb] dark:text-[#60a5fa]">
            BƯỚC 2: CHỌN SỐ TIỀN PHÂN BỔ CHO MỖI HẠNG MỤC
          </label>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
            {/* Quick value tags */}
            <div className="flex flex-wrap gap-2">
              {suggestedAmounts.map((val) => {
                const isSelected = amountPerCategory === val && !customAmount;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelectAmount(val)}
                    className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {formatPrice(val)} đ
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
                className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl py-2.5 pl-4 pr-4 text-xs outline-none text-slate-800 dark:text-slate-100 transition-all font-mono"
              />
            </div>
            
            <div className="text-[11px] text-slate-400 flex flex-col gap-1 sm:flex-row sm:justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
              <div>
                Đã chọn: <strong className="text-blue-500 font-bold">{selectedCount}</strong> hạng mục × <strong className="text-slate-700 dark:text-slate-300 font-mono">{formatPrice(amountPerCategory)}đ</strong>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex justify-between font-mono">
              <span>Định mức tối thiểu: 10.000 đ</span>
              <span>Tổng lãi hoàn trả dự tính: <strong className="text-emerald-500 font-bold">{formatPrice(Math.floor(totalAmountToPlace * 1.3))} đ</strong></span>
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
          <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
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
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 uppercase pb-2 border-b border-slate-100 dark:border-slate-800">
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
                    <tr className="text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 pb-1">
                      <th className="py-1">Kỳ mở</th>
                      <th>Lựa chọn</th>
                      <th>Số tiền</th>
                      <th className="text-right">Kết quả</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
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
