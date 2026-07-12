import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { UserProfile, BetRecord, Transaction, BetCategory, ActiveScreen } from '../types';
import { api, getToken, setToken as persistToken, clearToken } from '../api';

interface AppContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  profileActiveTab: 'info' | 'bank' | 'withdraw';
  setProfileActiveTab: (tab: 'info' | 'bank' | 'withdraw') => void;
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
  toggleTheme: () => void;
  rooms: { id: string; name: string; icon: string; cycle: number; currentCycle: number; session: string }[];
  bets: BetRecord[];
  transactions: Transaction[];
  periodsHistory: Record<string, { period: string; result: BetCategory }[]>;
  secondsRemaining: number;
  recentResultNotice: { show: boolean; period: string; room: string; choice: string; result: 'Thắng' | 'Thua'; amount: number; payout: number } | null;
  dismissNotice: () => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  sendNotificationToAdmin: (title: string, message: string) => Promise<boolean>;

  login: (username: string, pass: string) => Promise<boolean>;
  register: (phone: string, fullName: string, pass: string, refCode?: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (oldP: string, newP: string) => Promise<{ success: boolean; message: string }>;
  linkBank: (bankName: string, accountNumber: string, accountHolder: string) => Promise<boolean>;
  updateBankInfo: (bankName: string, accountNumber: string, accountHolder: string) => Promise<boolean>;
  updateAvatar: (avatarUrl: string) => Promise<boolean>;
  placeBet: (room: string, choice: BetCategory | null, amount: number | null, bets?: { choice: BetCategory; amount: number }[]) => Promise<boolean>;
  requestDeposit: (amount: number) => Promise<boolean>;
  requestWithdraw: (amount: number) => Promise<boolean>;
  withdraw: (amount: number, bankName: string, accountNumber: string, accountHolder: string) => Promise<{ success: boolean; message: string }>;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  sender: string;
  isRead: boolean;
  createdAt: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const isUppercaseNoAccent = (str: string) => /^[A-Z0-9\s]+$/.test(str);

// Hạn mức rút tiền tối thiểu (đồng bộ với backend transactions.php)
export const MIN_WITHDRAW = 100000;

const DEFAULT_ROOMS = [
  { id: '#3', name: 'Facebook', icon: 'thumb_up', cycle: 60, currentCycle: 60, session: '' },
  { id: '#4', name: 'Youtube', icon: 'smart_display', cycle: 60, currentCycle: 60, session: '' },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>(() => {
    const saved = localStorage.getItem('viet-tien-active-screen');
    return (saved as ActiveScreen) || 'home';
  });

  const [profileActiveTab, setProfileActiveTab] = useState<'info' | 'bank' | 'withdraw'>('info');

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('viet-tien-theme') as 'light' | 'dark') || 'light';
  });

  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<UserProfile | null>(null);
  const [rooms, setRooms] = useState(DEFAULT_ROOMS);
  const [bets, setBets] = useState<BetRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [periodsHistory, setPeriodsHistory] = useState<Record<string, { period: string; result: BetCategory }[]>>({
    Facebook: [],
    Youtube: [],
  });
  const [secondsRemaining, setSecondsRemaining] = useState<number>(59 - (new Date().getSeconds() % 60));
  const [recentResultNotice, setRecentResultNotice] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const prevBetsRef = useRef<BetRecord[]>([]);

  // Áp theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#0B1528';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f3f6fa';
    }
    localStorage.setItem('viet-tien-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('viet-tien-active-screen', activeScreen);
  }, [activeScreen]);

  // Điều hướng theo trạng thái đăng nhập
  useEffect(() => {
    if (token) {
      if (activeScreen === 'login' || activeScreen === 'register') setActiveScreen('home');
    } else {
      if (activeScreen !== 'login' && activeScreen !== 'register') setActiveScreen('login');
    }
  }, [token, activeScreen]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Đồng hồ đếm ngược: đếm lùi cục bộ mỗi giây, tái đồng bộ từ server mỗi lần poll
  // (bộ máy PHP dùng chu kỳ ~40s, giá trị chuẩn lấy từ rooms.php qua /state).
  useEffect(() => {
    const timer = setInterval(() => setSecondsRemaining((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  // Nạp trạng thái từ backend + polling realtime (thay cho onSnapshot)
  const fetchState = async () => {
    try {
      const data = await api.get('/state');
      if (data.locked) {
        logout();
        showToast('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!', 'error');
        return;
      }
      setUser(data.user);

      const bList: BetRecord[] = data.bets || [];
      const prevBets = prevBetsRef.current;
      if (prevBets.length > 0) {
        bList.forEach((newBet) => {
          const oldBet = prevBets.find((ob) => ob.id === newBet.id);
          if (oldBet && oldBet.result === 'Chờ kết quả' && newBet.result !== 'Chờ kết quả') {
            setRecentResultNotice({
              show: true,
              period: newBet.period,
              room: newBet.room,
              choice: newBet.choice,
              result: newBet.result,
              amount: newBet.amount,
              payout: newBet.payout || 0,
            });
          }
        });
      }
      prevBetsRef.current = bList;
      setBets(bList);
      setTransactions(data.transactions || []);
      if (Array.isArray(data.rooms) && data.rooms.length > 0) setRooms(data.rooms);
      if (data.periodsHistory) setPeriodsHistory(data.periodsHistory);
      if (typeof data.secondsRemaining === 'number') setSecondsRemaining(data.secondsRemaining);
    } catch (err: any) {
      if (err.status === 401) {
        logout();
      }
    }
  };

  // Nạp danh sách thông báo (hộp thư khách hàng)
  const fetchNotifications = async () => {
    try {
      const data = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      /* im lặng: không chặn UI nếu thông báo lỗi */
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await api.post('/notifications/read', { id });
      await fetchNotifications();
    } catch {
      /* noop */
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.post('/notifications/read', { all: true });
      await fetchNotifications();
    } catch {
      /* noop */
    }
  };

  const sendNotificationToAdmin = async (title: string, message: string): Promise<boolean> => {
    try {
      await api.post('/notifications/send', { title, message });
      showToast('Đã gửi yêu cầu tới quản trị viên!', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Gửi yêu cầu thất bại!', 'error');
      return false;
    }
  };

  useEffect(() => {
    if (!token) {
      setUser(null);
      setBets([]);
      setTransactions([]);
      setNotifications([]);
      setUnreadCount(0);
      prevBetsRef.current = [];
      return;
    }
    fetchState();
    fetchNotifications();
    const poll = setInterval(() => {
      fetchState();
      fetchNotifications();
    }, 2000);
    return () => clearInterval(poll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ----------------------------- Actions -----------------------------
  const login = async (username: string, pass: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/login', { username, password: pass });
      if (res.role === 'admin') {
        // Cổng khách CHỈ dành cho tài khoản khách. Không cho tài khoản quản trị đăng nhập ở đây.
        showToast('Tài khoản này không thể đăng nhập tại cổng khách hàng!', 'error');
        return false;
      }
      persistToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      showToast('Đăng nhập thành công!', 'success');
      setActiveScreen('home');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối máy chủ!', 'error');
      return false;
    }
  };

  const register = async (phone: string, fullName: string, pass: string, refCode?: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/register', { phone, fullName, password: pass, refCode });
      persistToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      showToast('Đăng ký tài khoản thành công!', 'success');
      setActiveScreen('home');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối máy chủ khi đăng ký!', 'error');
      return false;
    }
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem('viet-tien-admin-logged');
    localStorage.removeItem('viet-tien-admin-token');
    setTokenState(null);
    setUser(null);
    setBets([]);
    setTransactions([]);
    prevBetsRef.current = [];
    setActiveScreen('login');
  };

  const changePassword = async (oldP: string, newP: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.post('/auth/change-password', { oldPassword: oldP, newPassword: newP });
      const message = res?.message || 'Đổi mật khẩu thành công!';
      showToast(message, 'success');
      return { success: true, message };
    } catch (err: any) {
      const message = err.message || 'Mật khẩu cũ không đúng!';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  const linkBank = async (bankName: string, accountNumber: string, accountHolder: string): Promise<boolean> => {
    try {
      await api.post('/me/bank', { bankName, accountNumber, accountHolder });
      await fetchState();
      showToast('Liên kết tài khoản ngân hàng thành công!', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối máy chủ!', 'error');
      return false;
    }
  };
  const updateBankInfo = linkBank;

  const updateAvatar = async (avatarUrl: string): Promise<boolean> => {
    try {
      await api.post('/me/avatar', { avatarUrl });
      await fetchState();
      showToast('Cập nhật ảnh đại diện thành công!', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối!', 'error');
      return false;
    }
  };

  const placeBet = async (
    room: string,
    choice: BetCategory | null,
    amount: number | null,
    betsArray?: { choice: BetCategory; amount: number }[]
  ): Promise<boolean> => {
    if (secondsRemaining <= 3) {
      showToast('Đã khóa cổng đặt cược phiên này! Vui lòng chờ phiên sau.', 'error');
      return false;
    }
    try {
      await api.post('/bets', { room, choice, amount, bets: betsArray });
      await fetchState();
      showToast('Đặt cược thành công!', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Lỗi đặt cược!', 'error');
      return false;
    }
  };

  const requestDeposit = async (amount: number): Promise<boolean> => {
    try {
      await api.post('/deposit', { amount });
      await fetchState();
      showToast('Đã gửi lệnh nạp tiền! Vui lòng chuyển khoản và chờ hệ thống duyệt.', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Gửi lệnh nạp tiền thất bại!', 'error');
      return false;
    }
  };

  const withdraw = async (
    amount: number,
    bankName: string,
    accountNumber: string,
    accountHolder: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!Number.isInteger(amount) || amount <= 0) return { success: false, message: 'Số tiền rút không hợp lệ!' };
    if (amount < MIN_WITHDRAW) return { success: false, message: `Hạn mức rút tiền tối thiểu là ${MIN_WITHDRAW.toLocaleString('vi-VN')}đ!` };
    if ((user?.balance || 0) < amount) return { success: false, message: 'Số dư của quý khách không đủ để thực hiện giao dịch này.' };
    if (!bankName || !accountNumber || !accountHolder) return { success: false, message: 'Vui lòng liên kết đầy đủ thông tin ngân hàng trước khi rút tiền!' };
    if (!isUppercaseNoAccent(accountHolder)) {
      return {
        success: false,
        message: 'Tên chủ tài khoản bắt buộc viết bằng CHỮ IN HOA KHÔNG DẤU (Ví dụ: NGUYEN VAN A)!',
      };
    }
    try {
      const res = await api.post('/withdraw', { amount, bankName, accountNumber, accountHolder });
      await fetchState();
      showToast('Gửi lệnh rút tiền thành công! Hệ thống đang xử lý.', 'success');
      return { success: true, message: res.message || 'Gửi lệnh rút tiền thành công! Hệ thống đang xử lý.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Gửi lệnh rút tiền thất bại!' };
    }
  };

  const requestWithdraw = async (amount: number): Promise<boolean> => {
    const res = await withdraw(amount, user?.bankName || '', user?.accountNumber || '', user?.accountHolder || '');
    return res.success;
  };

  const dismissNotice = () => setRecentResultNotice(null);
  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const roomsView = rooms.map((r) => ({ ...r, currentCycle: secondsRemaining }));

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        activeScreen,
        setActiveScreen,
        profileActiveTab,
        setProfileActiveTab,
        theme,
        setTheme,
        toggleTheme,
        rooms: roomsView,
        bets,
        transactions,
        periodsHistory,
        secondsRemaining,
        recentResultNotice,
        dismissNotice,
        toast,
        showToast,
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
        sendNotificationToAdmin,
        login,
        register,
        logout,
        changePassword,
        linkBank,
        updateBankInfo,
        updateAvatar,
        placeBet,
        requestDeposit,
        requestWithdraw,
        withdraw,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
