import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Định nghĩa cấu trúc dữ liệu truyền từ Backend / State của anh
export interface Room {
  id: string;
  name: string;
  cycleTime: number;
  activeCycle: number;
  sessionCode: string;
  roomImage?: string;
}

export interface Member {
  id: string;
  username: string;
  balance: number;
  bankName?: string;
  accountNumber?: string;
  accountOwner?: string;
  isLocked: boolean;
}

export interface BetHistory {
  id: string;
  username: string;
  roomName: string;
  sessionCode: string;
  betOption: string;
  betAmount: number;
  status: 'PENDING' | 'WIN' | 'LOSE';
  payout: number;
  timestamp: string;
}

export interface Deposit {
  id: string;
  txCode: string;
  phone: string;
  username: string;
  amount: number;
  type: string;
  date: string;
  status: 'PENDING' | 'SUCCESS' | 'REJECTED';
}

export interface Withdrawal {
  id: string;
  username: string;
  amount: number;
  date: string;
  bankName: string;
  accountNumber: string;
  accountOwner: string;
  status: 'PENDING' | 'SUCCESS' | 'REJECTED';
}

interface CustomerPortalProps {
  currentMember: Member;
  rooms: Room[];
  bets: BetHistory[];
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  // Callback xử lý hành động gửi lên server của anh
  onPlaceBet: (roomName: string, sessionCode: string, option: string, amount: number) => string | null;
  onAddDeposit: (amount: number, txCode: string, phone: string) => void;
  onAddWithdrawal: (amount: number, bankName: string, accountNumber: string, accountOwner: string) => string | null;
  onLogout: () => void;
}

export default function CustomerPortal({
  currentMember,
  rooms,
  bets,
  deposits,
  withdrawals,
  onPlaceBet,
  onAddDeposit,
  onAddWithdrawal,
  onLogout,
}: CustomerPortalProps) {
  const [currentTab, setCurrentTab] = useState<'betting' | 'history' | 'transactions' | 'profile'>('betting');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [betOption, setBetOption] = useState<string>('');
  const [betAmountStr, setBetAmountStr] = useState<string>('500000');

  // Nạp tiền
  const [depositAmount, setDepositAmount] = useState('');
  const [depositTxCode, setDepositTxCode] = useState('');
  const [depositPhone, setDepositPhone] = useState('');
  const [depositSuccess, setDepositSuccess] = useState(false);

  // Rút tiền
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalBank, setWithdrawalBank] = useState(currentMember.bankName || '');
  const [withdrawalAccount, setWithdrawalAccount] = useState(currentMember.accountNumber || '');
  const [withdrawalOwner, setWithdrawalOwner] = useState(currentMember.accountOwner || '');
  const [withdrawalError, setWithdrawalError] = useState('');
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);

  const [betError, setBetError] = useState('');
  const [betSuccess, setBetSuccess] = useState(false);

  useEffect(() => {
    if (rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  const formatVND = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
  const formatNumber = (v: number) => new Intl.NumberFormat('vi-VN').format(v);

  const handleBetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBetError('');
    setBetSuccess(false);

    if (!selectedRoom) return;
    const amount = Number(betAmountStr);
    if (isNaN(amount) || amount <= 0) {
      setBetError('Số tiền cược không hợp lệ');
      return;
    }
    if (!betOption) {
      setBetError('Vui lòng chọn một tùy chọn cược');
      return;
    }

    const err = onPlaceBet(selectedRoom.name, selectedRoom.sessionCode, betOption, amount);
    if (err) {
      setBetError(err);
    } else {
      setBetSuccess(true);
      setTimeout(() => setBetSuccess(false), 3000);
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDepositSuccess(false);
    const amount = Number(depositAmount);
    if (isNaN(amount) || amount < 100000) {
      alert('Số tiền nạp tối thiểu là 100.000 VND');
      return;
    }
    if (!depositTxCode.trim()) {
      alert('Vui lòng nhập mã giao dịch');
      return;
    }
    onAddDeposit(amount, depositTxCode.trim(), depositPhone.trim());
    setDepositSuccess(true);
    setDepositAmount('');
    setDepositTxCode('');
    setDepositPhone('');
    setTimeout(() => setDepositSuccess(false), 4000);
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawalError('');
    setWithdrawalSuccess(false);
    const amount = Number(withdrawalAmount);
    if (isNaN(amount) || amount < 200000) {
      setWithdrawalError('Số tiền rút tối thiểu là 200.000 VND');
      return;
    }
    const err = onAddWithdrawal(amount, withdrawalBank, withdrawalAccount, withdrawalOwner);
    if (err) {
      setWithdrawalError(err);
    } else {
      setWithdrawalSuccess(true);
      setWithdrawalAmount('');
      setTimeout(() => setWithdrawalSuccess(false), 4000);
    }
  };

  const myBets = bets.filter((b) => b.username === currentMember.username);
  const myTransactions = [
    ...deposits.filter((d) => d.username === currentMember.username).map((d) => ({
      id: d.id, type: 'Nạp tiền', amount: d.amount, date: d.date, status: d.status, detail: `Mã GD: ${d.txCode}`, isDeposit: true
    })),
    ...withdrawals.filter((w) => w.username === currentMember.username).map((w) => ({
      id: w.id, type: 'Rút tiền', amount: w.amount, date: w.date, status: w.status, detail: `NH: ${w.bankName} - ${w.accountNumber}`, isDeposit: false
    }))
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans w-full">
      {/* Sidebar Navigation */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col py-6 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="px-6 mb-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-xl text-white">VT</div>
            <div>
              <h1 className="font-black text-white text-md">Việt Tiến</h1>
              <p className="text-xs text-slate-400">Cổng Game Thành Viên</p>
            </div>
          </div>
          {/* Close button for mobile sidebar */}
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        <div className="mx-4 mb-6 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Số dư tài khoản</span>
          <div className="text-lg font-mono font-black text-emerald-400">{formatVND(currentMember.balance)}</div>
          <div className="text-xs text-slate-400 mt-2">ID: {currentMember.username}</div>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          <button onClick={() => { setCurrentTab('betting'); setSidebarOpen(false); }} className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold cursor-pointer ${currentTab === 'betting' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Đặt cược</button>
          <button onClick={() => { setCurrentTab('history'); setSidebarOpen(false); }} className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold cursor-pointer ${currentTab === 'history' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Lịch sử cược</button>
          <button onClick={() => { setCurrentTab('transactions'); setSidebarOpen(false); }} className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold cursor-pointer ${currentTab === 'transactions' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Nạp / Rút tiền</button>
          <button onClick={() => { setCurrentTab('profile'); setSidebarOpen(false); }} className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold cursor-pointer ${currentTab === 'profile' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Hồ sơ cá nhân</button>
        </nav>

        <div className="mt-auto px-4 pt-4 border-t border-slate-800/60">
          <button onClick={onLogout} className="w-full text-left text-rose-400 hover:bg-rose-500/10 flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm cursor-pointer">Đăng xuất</button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 px-6 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-slate-400 hover:text-white border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
            Menu
          </button>
          <h2 className="font-bold text-sm uppercase tracking-wider text-slate-200">
            {currentTab === 'betting' && '🎮 Đặt cược trò chơi'}
            {currentTab === 'history' && '📊 Lịch sử đặt cược'}
            {currentTab === 'transactions' && '💳 Nạp & Rút tiền'}
            {currentTab === 'profile' && '👤 Thông tin cá nhân'}
          </h2>
          <div className="font-mono text-emerald-400 font-bold">{formatVND(currentMember.balance)}</div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
          {currentTab === 'betting' && (
            <div className="space-y-6">
              {/* Rooms Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rooms.map((room) => {
                  const isSelected = selectedRoomId === room.id;
                  const minutes = Math.floor(room.activeCycle / 60);
                  const seconds = room.activeCycle % 60;
                  return (
                    <div
                      key={room.id}
                      onClick={() => { setSelectedRoomId(room.id); setBetOption(''); }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-slate-900 border-emerald-500 shadow-md' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">Phòng {room.name}</span>
                        <span className="font-mono text-emerald-400 font-bold bg-slate-950 px-2 py-1 rounded border border-slate-800">{`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2">Mã Phiên: {room.sessionCode}</p>
                    </div>
                  );
                })}
              </div>

              {/* Place Bet Form */}
              {selectedRoom && (
                <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Đặt cược: Phòng {selectedRoom.name} - Phiên {selectedRoom.sessionCode}</h3>
                  {betError && <div className="text-rose-400 text-xs bg-rose-500/10 p-3 rounded">{betError}</div>}
                  {betSuccess && <div className="text-emerald-400 text-xs bg-emerald-500/10 p-3 rounded">Đặt cược thành công!</div>}

                  {/* Options */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Tăng tương tác', 'Tăng doanh số', 'Quảng bá sản phẩm', 'Thu hút đầu tư'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setBetOption(opt)}
                        className={`p-3 rounded text-xs border cursor-pointer ${betOption === opt ? 'bg-emerald-600/15 border-emerald-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {/* Input Amount */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Nhập số tiền (VND)</label>
                      <input
                        type="number"
                        value={betAmountStr}
                        onChange={(e) => setBetAmountStr(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 font-mono text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Chọn nhanh số tiền</label>
                      <div className="grid grid-cols-4 gap-1">
                        {['200000', '500000', '1000000', '5000000'].map((val) => (
                          <button key={val} type="button" onClick={() => setBetAmountStr(val)} className="bg-slate-950 border border-slate-800 hover:bg-slate-800 text-[10px] text-white py-1.5 rounded font-mono cursor-pointer">{formatNumber(Number(val))}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleBetSubmit}
                    disabled={selectedRoom.activeCycle <= 3}
                    className={`w-full py-3 rounded font-bold text-xs uppercase cursor-pointer transition-colors ${selectedRoom.activeCycle <= 3 ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
                  >
                    {selectedRoom.activeCycle <= 3 ? 'Hết giờ đặt cược' : 'Xác nhận cược'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab: History */}
          {currentTab === 'history' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[600px]">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="p-4">Mã Vé</th>
                    <th className="p-4">Phòng / Phiên</th>
                    <th className="p-4">Lựa chọn</th>
                    <th className="p-4">Tiền cược</th>
                    <th className="p-4">Kết quả / Thưởng</th>
                    <th className="p-4">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {myBets.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/20">
                      <td className="p-4 font-mono font-bold text-slate-300">{b.id}</td>
                      <td className="p-4">{b.roomName} <span className="block text-[10px] text-slate-500">Phiên: {b.sessionCode}</span></td>
                      <td className="p-4 font-semibold text-slate-200">{b.betOption}</td>
                      <td className="p-4 font-mono">{formatVND(b.betAmount)}</td>
                      <td className="p-4">
                        {b.status === 'PENDING' && <span className="text-yellow-500 font-semibold">Chờ kết quả</span>}
                        {b.status === 'WIN' && <span className="text-emerald-500 font-bold">Thắng (+{formatVND(b.payout)})</span>}
                        {b.status === 'LOSE' && <span className="text-slate-500 font-medium">Thua</span>}
                      </td>
                      <td className="p-4 text-slate-500">{b.timestamp}</td>
                    </tr>
                  ))}
                  {myBets.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">Không có dữ liệu lịch sử đặt cược nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab: Nạp rút */}
          {currentTab === 'transactions' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nạp tiền */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400">Nạp tiền vào tài khoản</h3>
                  {depositSuccess && <div className="text-emerald-400 text-xs bg-emerald-500/10 p-3 rounded">Gửi yêu cầu nạp tiền thành công! Vui lòng chờ admin phê duyệt.</div>}
                  <form onSubmit={handleDepositSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Số tiền nạp (Tối thiểu 100.000đ)</label>
                      <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="Ví dụ: 1000000" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white" required />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Mã giao dịch ngân hàng (TxID)</label>
                      <input type="text" value={depositTxCode} onChange={(e) => setDepositTxCode(e.target.value)} placeholder="Nhập mã biên lai chuyển khoản" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white" required />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Số điện thoại liên hệ</label>
                      <input type="text" value={depositPhone} onChange={(e) => setDepositPhone(e.target.value)} placeholder="Nhập số điện thoại" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white" required />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded uppercase cursor-pointer transition-colors">Gửi yêu cầu nạp tiền</button>
                  </form>
                </div>

                {/* Rút tiền */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-rose-400">Rút tiền về tài khoản ngân hàng</h3>
                  {withdrawalError && <div className="text-rose-400 text-xs bg-rose-500/10 p-3 rounded">{withdrawalError}</div>}
                  {withdrawalSuccess && <div className="text-emerald-400 text-xs bg-emerald-500/10 p-3 rounded">Gửi yêu cầu rút tiền thành công!</div>}
                  <form onSubmit={handleWithdrawalSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Số tiền muốn rút (Tối thiểu 200.000đ)</label>
                      <input type="number" value={withdrawalAmount} onChange={(e) => setWithdrawalAmount(e.target.value)} placeholder="Ví dụ: 500000" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white" required />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Tên ngân hàng nhận</label>
                      <input type="text" value={withdrawalBank} onChange={(e) => setWithdrawalBank(e.target.value)} placeholder="Ví dụ: Vietcombank" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white" required />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Số tài khoản nhận</label>
                      <input type="text" value={withdrawalAccount} onChange={(e) => setWithdrawalAccount(e.target.value)} placeholder="Nhập số tài khoản" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white" required />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Họ tên chủ tài khoản (Không dấu)</label>
                      <input type="text" value={withdrawalOwner} onChange={(e) => setWithdrawalOwner(e.target.value)} placeholder="Ví dụ: NGUYEN VAN A" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white" required />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded uppercase cursor-pointer transition-colors">Gửi yêu cầu rút tiền</button>
                  </form>
                </div>
              </div>

              {/* Lịch sử giao dịch */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mt-6">
                <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">Lịch sử giao dịch (Nạp/Rút)</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                        <th className="p-4">Mã GD</th>
                        <th className="p-4">Loại giao dịch</th>
                        <th className="p-4">Chi tiết</th>
                        <th className="p-4">Số tiền</th>
                        <th className="p-4">Trạng thái</th>
                        <th className="p-4">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {myTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-800/20">
                          <td className="p-4 font-mono font-bold text-slate-300">{tx.id}</td>
                          <td className="p-4 font-semibold text-slate-200">
                            {tx.isDeposit ? (
                              <span className="text-emerald-500">📥 Nạp tiền</span>
                            ) : (
                              <span className="text-rose-500">📤 Rút tiền</span>
                            )}
                          </td>
                          <td className="p-4 text-slate-400">{tx.detail}</td>
                          <td className="p-4 font-mono font-bold">{formatVND(tx.amount)}</td>
                          <td className="p-4">
                            {tx.status === 'PENDING' && <span className="text-yellow-500 font-semibold bg-yellow-500/10 px-2.5 py-1 rounded">Chờ duyệt</span>}
                            {tx.status === 'SUCCESS' && <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-1 rounded">Thành công</span>}
                            {tx.status === 'REJECTED' && <span className="text-rose-500 font-bold bg-rose-500/10 px-2.5 py-1 rounded">Từ chối</span>}
                          </td>
                          <td className="p-4 text-slate-500">{tx.date}</td>
                        </tr>
                      ))}
                      {myTransactions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500">Chưa có giao dịch nào được ghi nhận.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Profile */}
          {currentTab === 'profile' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 max-w-md mx-auto text-xs">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider text-center">Thông tin thành viên</h3>
              <div className="space-y-3 divide-y divide-slate-800/80 pt-2">
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Tài khoản:</span>
                  <span className="font-bold text-white">{currentMember.username}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Số dư hiện tại:</span>
                  <span className="font-bold text-emerald-400 font-mono">{formatVND(currentMember.balance)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Ngân hàng liên kết:</span>
                  <span className="font-semibold text-white">{currentMember.bankName || 'Chưa liên kết'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Số tài khoản:</span>
                  <span className="font-mono text-white">{currentMember.accountNumber || 'Chưa liên kết'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Chủ tài khoản:</span>
                  <span className="uppercase text-white font-semibold">{currentMember.accountOwner || 'Chưa liên kết'}</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
