import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Transaction, BetRecord, Room } from '../types';
import { api, getAdminToken, setAdminToken, clearAdminToken } from '../api';

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  sender: string;
  isRead: boolean;
  createdAt: string;
}

interface AdminContextType {
  isAdminLoggedIn: boolean;
  adminToken: string | null;
  accounts: Record<string, { profile: UserProfile; password: string; bets?: BetRecord[]; transactions?: Transaction[] }>;
  allTransactions: Transaction[];
  rooms: Room[];
  secondsRemaining: number;
  currentPeriod: Record<string, string>;
  isLoading: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;

  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  adminLogin: (password: string) => Promise<{ success: boolean; message: string }>;
  adminLogout: () => void;
  fetchAdminData: () => Promise<void>;

  updateTransactionStatus: (id: string, action: 'approve' | 'reject') => Promise<boolean>;
  adminModifyUserBalance: (targetUsername: string, amount: number, isAddition: boolean) => Promise<boolean>;
  adminUpdateUserProfile: (targetUsername: string, updates: Partial<UserProfile>, password?: string) => Promise<boolean>;
  adminCreateUser: (payload: {
    username: string;
    password?: string;
    fullName?: string;
    phone?: string;
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    initialBalance?: number;
  }) => Promise<boolean>;
  adminForceGameResult: (room: string, category: string | null) => Promise<boolean>;
  adminDeleteUser: (targetUsername: string) => Promise<boolean>;

  addRoom: (name: string, cycle: number, icon: string) => Promise<boolean>;
  updateRoom: (id: string, name: string, cycle: number, icon: string) => Promise<boolean>;
  deleteRoom: (id: string) => Promise<boolean>;

  adminClearAllBets: () => Promise<boolean>;
  adminClearAllTransactions: () => Promise<boolean>;
  simulateDepositRequest: (targetUsername: string, amount: number, txCode: string, phone: string) => Promise<boolean>;
  simulateWithdrawRequest: (targetUsername: string, amount: number, bankName: string, accountNumber: string, accountOwner: string) => Promise<boolean>;
  globalForcedResult: 'TAI' | 'XIU' | null;
  adminForceGlobalResult: (result: 'TAI' | 'XIU' | null) => Promise<boolean>;
  adminChangePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;

  notifications: AdminNotification[];
  unreadNotifications: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  sendNotificationToUser: (targetUsername: string, title: string, message: string) => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const generatePeriodNumber = (room: string, offsetSec = 0) => {
  const now = new Date();
  now.setSeconds(now.getSeconds() + offsetSec);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const roomCode = room === 'Facebook' ? '1' : '2';
  return `${year}${month}${day}${hh}${mm}${roomCode}`;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(
    () => localStorage.getItem('viet-tien-admin-logged') === 'true' && !!getAdminToken()
  );
  const [adminToken, setAdminTokenState] = useState<string | null>(() => getAdminToken());

  const [accounts, setAccounts] = useState<Record<string, any>>({});
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [currentPeriod, setCurrentPeriod] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [globalForcedResult, setGlobalForcedResult] = useState<'TAI' | 'XIU' | null>(null);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Đồng hồ đếm ngược + mã kỳ (đồng bộ đồng hồ hệ thống)
  useEffect(() => {
    const update = () => {
      setSecondsRemaining(60 - new Date().getSeconds());
      setCurrentPeriod({
        Facebook: generatePeriodNumber('Facebook'),
        Youtube: generatePeriodNumber('Youtube'),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const adminLogin = async (password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.post('/admin/login', { password });
      setAdminToken(res.token);
      setAdminTokenState(res.token);
      setIsAdminLoggedIn(true);
      localStorage.setItem('viet-tien-admin-logged', 'true');
      showToast('Chào mừng Quản trị viên đăng nhập thành công!', 'success');
      return { success: true, message: 'Đăng nhập thành công' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Mật khẩu quản trị viên không chính xác!' };
    }
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminTokenState(null);
    clearAdminToken();
    setAccounts({});
    setAllTransactions([]);
    localStorage.removeItem('viet-tien-admin-logged');
    showToast('Đã đăng xuất tài khoản quản trị viên.', 'info');
  };

  // Nạp hộp thư thông báo quản trị
  const fetchNotifications = async () => {
    try {
      const data = await api.get('/admin/notifications');
      setNotifications(data.notifications || []);
      setUnreadNotifications(data.unreadCount || 0);
    } catch {
      /* im lặng: không chặn UI nếu thông báo lỗi */
    }
  };

  // Polling dữ liệu quản trị (thay cho onSnapshot)
  const fetchAdminState = async () => {
    try {
      const data = await api.get('/admin/state');
      setAccounts(data.accounts || {});
      setAllTransactions(data.allTransactions || []);
      setRooms(data.rooms || []);
      setGlobalForcedResult(data.globalForcedResult || null);
      fetchNotifications();
      setIsLoading(false);
    } catch (err: any) {
      if (err.status === 401 || err.status === 403) {
        adminLogout();
      }
      setIsLoading(false);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await api.post('/admin/notifications/read', { id });
      await fetchNotifications();
    } catch {
      /* noop */
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.post('/admin/notifications/read', { all: true });
      await fetchNotifications();
    } catch {
      /* noop */
    }
  };

  const sendNotificationToUser = async (targetUsername: string, title: string, message: string): Promise<boolean> => {
    try {
      const res = await api.post('/admin/notifications/send', { targetUsername, title, message });
      showToast(res?.message || 'Đã gửi thông báo tới khách hàng!', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Gửi thông báo thất bại!', 'error');
      return false;
    }
  };

  useEffect(() => {
    if (!isAdminLoggedIn || !adminToken) return;
    setIsLoading(true);
    fetchAdminState();
    const poll = setInterval(fetchAdminState, 2000);
    return () => clearInterval(poll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminLoggedIn, adminToken]);

  const fetchAdminData = async () => {
    await fetchAdminState();
  };

  // Helper: gọi API mutation + refetch + toast
  const run = async (fn: () => Promise<any>, okMsg?: string): Promise<boolean> => {
    try {
      const res = await fn();
      await fetchAdminState();
      if (okMsg || res?.message) showToast(okMsg || res.message, 'success');
      return true;
    } catch (err: any) {
      const msg = err.message || 'Lỗi kết nối máy chủ!';
      showToast(msg, 'error');
      return false;
    }
  };

  const updateTransactionStatus = (id: string, action: 'approve' | 'reject') =>
    run(() => api.post(`/admin/transactions/${id}`, { action }));

  const adminModifyUserBalance = (targetUsername: string, amount: number, isAddition: boolean) =>
    run(() => api.post(`/admin/users/${encodeURIComponent(targetUsername)}/balance`, { amount, isAddition }));

  const adminUpdateUserProfile = (targetUsername: string, updates: Partial<UserProfile>, password?: string) =>
    run(() => api.put(`/admin/users/${encodeURIComponent(targetUsername)}`, { updates, password }));

  const adminCreateUser = (payload: {
    username: string;
    password?: string;
    fullName?: string;
    phone?: string;
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    initialBalance?: number;
  }) => run(() => api.post('/admin/users', payload));

  const adminForceGameResult = (room: string, category: string | null) =>
    run(() => api.post('/admin/force-room', { room, category }));

  const adminForceGlobalResult = (result: 'TAI' | 'XIU' | null) =>
    run(() => api.post('/admin/force-global', { result }));

  const adminDeleteUser = (targetUsername: string) =>
    run(() => api.del(`/admin/users/${encodeURIComponent(targetUsername)}`));

  const addRoom = (name: string, cycle: number, icon: string) =>
    run(() => api.post('/admin/rooms', { name, cycle, icon }));

  const updateRoom = (id: string, name: string, cycle: number, icon: string) =>
    run(() => api.put(`/admin/rooms/${encodeURIComponent(id)}`, { name, cycle, icon }));

  const deleteRoom = (id: string) => run(() => api.del(`/admin/rooms/${encodeURIComponent(id)}`));

  const adminClearAllBets = () => run(() => api.del('/admin/bets'));
  const adminClearAllTransactions = () => run(() => api.del('/admin/transactions'));

  const simulateDepositRequest = (targetUsername: string, amount: number, txCode: string, phone: string) =>
    run(() => api.post('/admin/simulate-deposit', { targetUsername, amount, txCode, phone }));

  const adminChangePassword = (currentPassword: string, newPassword: string) =>
    run(() => api.post('/admin/change-password', { currentPassword, newPassword }));

  const simulateWithdrawRequest = (
    targetUsername: string,
    amount: number,
    bankName: string,
    accountNumber: string,
    accountOwner: string
  ) => run(() => api.post('/admin/simulate-withdraw', { targetUsername, amount, bankName, accountNumber, accountOwner }));

  return (
    <AdminContext.Provider
      value={{
        isAdminLoggedIn,
        adminToken,
        accounts,
        allTransactions,
        rooms,
        secondsRemaining,
        currentPeriod,
        isLoading,
        toast,
        showToast,
        adminLogin,
        adminLogout,
        fetchAdminData,
        updateTransactionStatus,
        adminModifyUserBalance,
        adminUpdateUserProfile,
        adminCreateUser,
        adminForceGameResult,
        adminDeleteUser,
        addRoom,
        updateRoom,
        deleteRoom,
        adminClearAllBets,
        adminClearAllTransactions,
        simulateDepositRequest,
        simulateWithdrawRequest,
        globalForcedResult,
        adminForceGlobalResult,
        adminChangePassword,
        notifications,
        unreadNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        sendNotificationToUser,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};
