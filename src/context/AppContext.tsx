import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ActiveScreen, UserProfile, BetRecord, Transaction, BetCategory } from '../types';

interface AppContextType {
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  user: UserProfile | null;
  login: (phoneOrUsername: string, pass: string) => boolean;
  register: (phone: string, fullName: string, pass: string, refCode?: string) => boolean;
  logout: () => void;
  changePassword: (oldPass: string, newPass: string) => { success: boolean; message: string };
  updateBankInfo: (bank: string, accountNo: string, holder: string) => void;
  placeBet: (room: string, choice: BetCategory | null, amount: number | null, bets?: { choice: BetCategory; amount: number }[]) => { success: boolean; message?: string };
  deposit: (amount: number, txCode?: string, phone?: string) => void;
  withdraw: (amount: number, bank: string, accountNo: string, holderName: string) => { success: boolean; message: string };
  bets: BetRecord[];
  transactions: Transaction[];
  secondsRemaining: number;
  currentPeriod: Record<string, string>;
  periodsHistory: Record<string, { period: string; result: BetCategory }[]>;
  recentResultNotice: {
    show: boolean;
    period: string;
    room: string;
    choice: string;
    result: 'Thắng' | 'Thua';
    amount: number;
    payout: number;
  } | null;
  dismissNotice: () => void;

  // Admin capabilities
  accounts: Record<string, { profile: UserProfile; password: string; bets: BetRecord[]; transactions: Transaction[] }>;
  setAccounts: React.Dispatch<React.SetStateAction<Record<string, { profile: UserProfile; password: string; bets: BetRecord[]; transactions: Transaction[] }>>>;
  allTransactions: Transaction[];
  setAllTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  updateTransactionStatus: (id: string, status: 'Thành công' | 'Thất bại') => void;
  adminModifyUserBalance: (username: string, amount: number, isAddition: boolean) => void;
  adminUpdateUserProfile: (username: string, updatedProfile: Partial<UserProfile>, updatedPassword?: string) => void;
  adminForceGameResult: (room: string, winningCategory: BetCategory) => void;
  adminDeleteUser: (username: string) => void;
  forcedNextResult: Record<string, BetCategory | null>;
  profileActiveTab: 'info' | 'password' | 'bank' | 'withdraw';
  setProfileActiveTab: (tab: 'info' | 'password' | 'bank' | 'withdraw') => void;

  // Toast Notifications
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Dynamic Rooms State & Actions
  rooms: { id: string; name: string; icon: string; cycle: number; currentCycle: number; session: string }[];
  addRoom: (name: string, cycle: number, icon: string) => void;
  updateRoom: (id: string, name: string, cycle: number, icon: string) => void;
  deleteRoom: (id: string) => void;

  // Global clearing actions for Admin
  adminClearAllBets: () => void;
  adminClearAllTransactions: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to generate period numbers
const generatePeriodNumber = (room: string, offsetSec = 0) => {
  const now = new Date();
  now.setSeconds(now.getSeconds() + offsetSec);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  // Dynamic suffix based on room & block increments
  const block = String(Math.floor(now.getSeconds() / 30)).padStart(2, '0');
  const roomCode = room === 'Facebook' ? '1' : '2';
  return `${year}${month}${day}${hh}${mm}${block}${roomCode}`;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme Initial state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('viet-tien-theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  // Screen selection
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('login');

  // Tab selection inside profile screen
  const [profileActiveTab, setProfileActiveTab] = useState<'info' | 'password' | 'bank' | 'withdraw'>('info');

  // Interactive User
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('viet-tien-user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const savedAccounts = localStorage.getItem('viet-tien-accounts');
        if (savedAccounts && parsed.username) {
          const loadedAccounts = JSON.parse(savedAccounts);
          if (loadedAccounts[parsed.username]) {
            return loadedAccounts[parsed.username].profile;
          }
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return null; // Empty by default so they can register
  });

  // User credentials
  const [password, setPassword] = useState<string>(() => {
    return localStorage.getItem('viet-tien-pass') || '';
  });

  // Local Accounts Registry for persistence
  const [accounts, setAccounts] = useState<Record<string, { profile: UserProfile; password: string; bets: BetRecord[]; transactions: Transaction[] }>>(() => {
    const saved = localStorage.getItem('viet-tien-accounts');
    const loaded = saved ? JSON.parse(saved) : {};
    
    // Ensure all loaded accounts have 'bets' and 'transactions' arrays initialized
    Object.keys(loaded).forEach((username) => {
      const acc = loaded[username];
      if (!acc.bets) {
        const savedBets = localStorage.getItem(`viet-tien-bets-${username}`);
        acc.bets = savedBets ? JSON.parse(savedBets) : [];
      }
      if (!acc.transactions) {
        const savedTrans = localStorage.getItem(`viet-tien-trans-${username}`);
        acc.transactions = savedTrans ? JSON.parse(savedTrans) : [];
      }
    });

    // Force seed/reset admin credentials as requested by user
    loaded['admin'] = {
      profile: {
        username: 'admin',
        fullName: 'Quản Trị Viên Hệ Thống',
        id: '1',
        balance: 999999999,
        phone: '0999999999',
        bankName: 'Hệ Thống',
        accountNumber: 'ADMIN_VTEC',
        accountHolder: 'VTEC GLOBAL',
        accumulatedSupport: 0,
        accumulatedInterest: 0,
        accumulatedWins: 0,
        accumulationCount: 0,
      },
      password: 'admin',
      bets: loaded['admin']?.bets || [],
      transactions: loaded['admin']?.transactions || [],
    };
    return loaded;
  });

  // Dynamic Rooms list state
  const [rooms, setRooms] = useState<{ id: string; name: string; icon: string; cycle: number; currentCycle: number; session: string }[]>(() => {
    const saved = localStorage.getItem('viet-tien-rooms');
    if (saved) return JSON.parse(saved);
    return [
      { id: '#4', name: 'Youtube', icon: 'smart_display', cycle: 45, currentCycle: 45, session: generatePeriodNumber('Youtube') },
      { id: '#3', name: 'Facebook', icon: 'thumb_up', cycle: 45, currentCycle: 45, session: generatePeriodNumber('Facebook') }
    ];
  });

  // Pre-seed empty or user saved history
  const [bets, setBets] = useState<BetRecord[]>(() => {
    const savedUser = localStorage.getItem('viet-tien-user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const username = parsed.username;
        const savedAccounts = localStorage.getItem('viet-tien-accounts');
        if (savedAccounts && username) {
          const loadedAccounts = JSON.parse(savedAccounts);
          if (loadedAccounts[username] && loadedAccounts[username].bets) {
            return loadedAccounts[username].bets;
          }
        }
        const savedBets = localStorage.getItem(`viet-tien-bets-${username}`);
        return savedBets ? JSON.parse(savedBets) : [];
      } catch (err) {
        console.error('Error loading initial bets', err);
      }
    }
    return [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedUser = localStorage.getItem('viet-tien-user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const username = parsed.username;
        const savedAccounts = localStorage.getItem('viet-tien-accounts');
        if (savedAccounts && username) {
          const loadedAccounts = JSON.parse(savedAccounts);
          if (loadedAccounts[username] && loadedAccounts[username].transactions) {
            const txs = loadedAccounts[username].transactions as Transaction[];
            return txs.filter((item, index) => txs.findIndex(t => t.id === item.id) === index);
          }
        }
        const savedTrans = localStorage.getItem(`viet-tien-trans-${username}`);
        if (savedTrans) {
          const parsedTrans = JSON.parse(savedTrans) as Transaction[];
          return parsedTrans.filter((item, index) => parsedTrans.findIndex(t => t.id === item.id) === index);
        }
      } catch (err) {
        console.error('Error loading initial transactions', err);
      }
    }
    return [];
  });

  // Global Admin transactions list
  const [allTransactions, setAllTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('viet-tien-all-transactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Transaction[];
        return parsed.filter((item, index) => parsed.findIndex(t => t.id === item.id) === index);
      } catch (err) {
        console.error(err);
      }
    }
    return [];
  });

  // Admin forced game outcomes
  const [forcedNextResult, setForcedNextResult] = useState<Record<string, BetCategory | null>>(() => {
    const saved = localStorage.getItem('viet-tien-forced-results');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { Facebook: null, Youtube: null, ...parsed };
    }
    return {
      Facebook: null,
      Youtube: null,
    };
  });

  // Room periods and countdown states
  const [secondsRemaining, setSecondsRemaining] = useState(39);
  const [currentPeriod, setCurrentPeriod] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('viet-tien-current-period');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing current period from localStorage', e);
      }
    }

    const initial: Record<string, string> = {
      Facebook: generatePeriodNumber('Facebook'),
      Youtube: generatePeriodNumber('Youtube'),
    };
    // Also add any other room names from saved rooms
    const savedRoomsStr = localStorage.getItem('viet-tien-rooms');
    if (savedRoomsStr) {
      try {
        const savedRooms = JSON.parse(savedRoomsStr);
        savedRooms.forEach((r: any) => {
          if (!initial[r.name]) {
            initial[r.name] = generatePeriodNumber(r.name);
          }
        });
      } catch (e) {
        console.error(e);
      }
    }
    return initial;
  });

  // Recent 5 public roll results for the rooms
  const [periodsHistory, setPeriodsHistory] = useState<Record<string, { period: string; result: BetCategory }[]>>(() => {
    const saved = localStorage.getItem('viet-tien-periods-history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing periods history from localStorage', e);
      }
    }

    const initialHistory: Record<string, { period: string; result: BetCategory }[]> = {
      Facebook: [
        { period: '20261102144904', result: 'Tăng doanh số' as BetCategory },
        { period: '20261102144700', result: 'Quảng bá sản phẩm' as BetCategory },
        { period: '20261102144500', result: 'Tăng tương tác' as BetCategory },
        { period: '20261102144300', result: 'Thu hút đầu tư' as BetCategory },
        { period: '20261102144100', result: 'Tăng doanh số' as BetCategory },
      ],
      Youtube: [
        { period: '20261102144903', result: 'Tăng doanh số' as BetCategory },
        { period: '20261102144700', result: 'Tăng tương tác' as BetCategory },
        { period: '20261102144500', result: 'Thu hút đầu tư' as BetCategory },
        { period: '20261102144300', result: 'Quảng bá sản phẩm' as BetCategory },
        { period: '20261102144100', result: 'Tăng doanh số' as BetCategory },
      ],
    };

    // Also populate for any custom rooms
    const savedRoomsStr = localStorage.getItem('viet-tien-rooms');
    if (savedRoomsStr) {
      try {
        const savedRooms = JSON.parse(savedRoomsStr);
        savedRooms.forEach((r: any) => {
          if (!initialHistory[r.name]) {
            initialHistory[r.name] = [
              { period: generatePeriodNumber(r.name, -45), result: 'Tăng doanh số' as BetCategory },
              { period: generatePeriodNumber(r.name, -90), result: 'Quảng bá sản phẩm' as BetCategory },
              { period: generatePeriodNumber(r.name, -135), result: 'Tăng tương tác' as BetCategory },
              { period: generatePeriodNumber(r.name, -180), result: 'Thu hút đầu tư' as BetCategory },
              { period: generatePeriodNumber(r.name, -225), result: 'Tăng doanh số' as BetCategory },
            ];
          }
        });
      } catch (e) {
        console.error(e);
      }
    }
    return initialHistory;
  });

  const [recentResultNotice, setRecentResultNotice] = useState<any | null>(null);

  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Synchronize localStorage changes across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'viet-tien-accounts' && e.newValue) {
        try {
          const parsedAccounts = JSON.parse(e.newValue);
          setAccounts(parsedAccounts);
        } catch (err) {
          console.error('Error syncing accounts from storage event', err);
        }
      }
      if (e.key === 'viet-tien-all-transactions' && e.newValue) {
        try {
          const parsedTrans = JSON.parse(e.newValue) as Transaction[];
          const unique = parsedTrans.filter((item, index) => parsedTrans.findIndex(t => t.id === item.id) === index);
          setAllTransactions(unique);
        } catch (err) {
          console.error('Error syncing all transactions from storage event', err);
        }
      }
      if (e.key === 'viet-tien-periods-history' && e.newValue) {
        try {
          const parsedHistory = JSON.parse(e.newValue);
          setPeriodsHistory(parsedHistory);
        } catch (err) {
          console.error('Error syncing periods history from storage event', err);
        }
      }
      if (e.key === 'viet-tien-current-period' && e.newValue) {
        try {
          const parsedCurrentPeriod = JSON.parse(e.newValue);
          setCurrentPeriod(parsedCurrentPeriod);
        } catch (err) {
          console.error('Error syncing current period from storage event', err);
        }
      }
      if (e.key === 'viet-tien-rooms' && e.newValue) {
        try {
          const parsedRooms = JSON.parse(e.newValue);
          setRooms(parsedRooms);
        } catch (err) {
          console.error('Error syncing rooms from storage event', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Keep the active user state, bets, and transactions in sync with the accounts registry (so customer's balance and logs update immediately)
  useEffect(() => {
    if (user) {
      const acc = accounts[user.username];
      if (acc) {
        if (acc.profile && JSON.stringify(acc.profile) !== JSON.stringify(user)) {
          setUser(acc.profile);
        }
        if (acc.bets && JSON.stringify(acc.bets) !== JSON.stringify(bets)) {
          setBets(acc.bets);
        }
        if (acc.transactions && JSON.stringify(acc.transactions) !== JSON.stringify(transactions)) {
          setTransactions(acc.transactions);
        }
      } else {
        // Fallback loading from individual localStorage if account is not loaded in accounts state yet
        try {
          const savedTrans = localStorage.getItem(`viet-tien-trans-${user.username}`);
          const loadedTrans = savedTrans ? JSON.parse(savedTrans) : [];
          if (JSON.stringify(loadedTrans) !== JSON.stringify(transactions)) {
            setTransactions(loadedTrans);
          }
        } catch (err) {
          console.error('Error loading fallback transactions', err);
        }
        try {
          const savedBets = localStorage.getItem(`viet-tien-bets-${user.username}`);
          const loadedBets = savedBets ? JSON.parse(savedBets) : [];
          if (JSON.stringify(loadedBets) !== JSON.stringify(bets)) {
            setBets(loadedBets);
          }
        } catch (err) {
          console.error('Error loading fallback bets', err);
        }
      }
    }
  }, [accounts, user?.username]);

  // Listen for storage changes to sync across multiple tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'viet-tien-accounts' && e.newValue) {
        try {
          const loaded = JSON.parse(e.newValue);
          setAccounts(loaded);
        } catch (err) {
          console.error('Error parsing accounts from storage event', err);
        }
      }
      if (e.key === 'viet-tien-all-transactions' && e.newValue) {
        try {
          const loaded = JSON.parse(e.newValue);
          setAllTransactions(loaded);
        } catch (err) {
          console.error('Error parsing transactions from storage event', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync active user profile, password, bets, and transactions to accounts registry
  useEffect(() => {
    if (user) {
      localStorage.setItem('viet-tien-user', JSON.stringify(user));
      setAccounts((prev) => {
        const existing = prev[user.username];
        const userPassword = existing ? existing.password : (password || localStorage.getItem('viet-tien-pass') || '');
        
        // Return same object reference if nothing changed to prevent render loops
        if (
          existing &&
          existing.profile === user &&
          existing.bets === bets &&
          existing.transactions === transactions &&
          existing.password === userPassword
        ) {
          return prev;
        }

        return {
          ...prev,
          [user.username]: {
            profile: user,
            password: userPassword,
            bets: bets || [],
            transactions: transactions || [],
          },
        };
      });
      localStorage.setItem(`viet-tien-bets-${user.username}`, JSON.stringify(bets || []));
      localStorage.setItem(`viet-tien-trans-${user.username}`, JSON.stringify(transactions || []));
    } else {
      localStorage.removeItem('viet-tien-user');
    }
  }, [user, bets, transactions, password]);

  useEffect(() => {
    localStorage.setItem('viet-tien-all-transactions', JSON.stringify(allTransactions));
  }, [allTransactions]);

  useEffect(() => {
    localStorage.setItem('viet-tien-accounts', JSON.stringify(accounts));
  }, [accounts]);

  // One-time automatic migration to wipe all virtual mock transactions (deposits & withdrawals) from localStorage
  // This allows the admin to start with a completely clean slate so only real customer transactions are visible.
  useEffect(() => {
    const isMockDataCleared = localStorage.getItem('viet-tien-mock-transactions-cleared-v3');
    if (!isMockDataCleared) {
      // 1. Wipe global transaction histories
      setAllTransactions([]);
      localStorage.setItem('viet-tien-all-transactions', JSON.stringify([]));

      // 2. Wipe transaction histories in every single account
      setAccounts((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((username) => {
          if (next[username]) {
            next[username] = {
              ...next[username],
              transactions: [],
            };
          }
          localStorage.setItem(`viet-tien-trans-${username}`, JSON.stringify([]));
        });
        localStorage.setItem('viet-tien-accounts', JSON.stringify(next));
        return next;
      });

      // 3. Reset active transactions hook state
      setTransactions([]);
      if (user) {
        localStorage.setItem(`viet-tien-trans-${user.username}`, JSON.stringify([]));
      }

      // Mark migration as successfully executed
      localStorage.setItem('viet-tien-mock-transactions-cleared-v3', 'true');
      console.log('Successfully wiped all preseeded virtual transactions!');
    }
  }, []);

  // Handle document element theme class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#0F172A';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f7f9fb';
    }
    localStorage.setItem('viet-tien-theme', theme);
  }, [theme]);

  // Ref to always hold the latest resolvePeriod function and prevent stale closures inside setInterval
  const resolvePeriodRef = useRef(resolvePeriod);
  useEffect(() => {
    resolvePeriodRef.current = resolvePeriod;
  }, [bets, user, currentPeriod, forcedNextResult, periodsHistory, accounts, rooms]);

  // Ticking Timer Loop (runs in background for realistic experience)
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Timer reached 0! Trigger period roll determination
          resolvePeriodRef.current();
          return 39; // reset to 40 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Function to resolve active bets when the countdown hits zero
  function resolvePeriod() {
    const newPeriodsHistory = { ...periodsHistory };
    const nextForcedResults = { ...forcedNextResult };

    let localRecentNotice: any = null;
    const newGlobalTransactions: Transaction[] = [];

    // Create a deep copy of accounts to update all users safely
    const updatedAccounts = { ...accounts };

    rooms.forEach((room) => {
      const activePeriod = currentPeriod[room.name] || generatePeriodNumber(room.name);
      
      // Core Categories
      const categories: BetCategory[] = [
        'Tăng tương tác',
        'Tăng doanh số',
        'Quảng bá sản phẩm',
        'Thu hút đầu tư',
      ];
      
      // 1. Try to find the result in existing public room history to stay consistent
      const roomHistory = newPeriodsHistory[room.name] || [];
      const existingHistoryEntry = roomHistory.find((h) => h.period === activePeriod);
      
      let winningCategory: BetCategory | null = existingHistoryEntry ? existingHistoryEntry.result : null;

      // 2. If not found in history, try to find if anyone has a winning bet resolved for this period
      if (!winningCategory) {
        Object.keys(updatedAccounts).forEach((uname) => {
          if (winningCategory) return;
          const uBets = updatedAccounts[uname]?.bets || [];
          const winBet = uBets.find(
            (b) => b.room === room.name && b.period === activePeriod && b.result === 'Thắng'
          );
          if (winBet) {
            winningCategory = winBet.choice;
          }
        });
      }

      // 3. Fallback to forced result or a random choice
      if (!winningCategory) {
        winningCategory = forcedNextResult[room.name] || categories[Math.floor(Math.random() * categories.length)];
      }

      // 4. Update the public room history if not already there
      if (!existingHistoryEntry) {
        newPeriodsHistory[room.name] = [
          { period: activePeriod, result: winningCategory },
          ...roomHistory,
        ].slice(0, 5);
      }

      // Resolve bets for ALL accounts registered in our database
      Object.keys(updatedAccounts).forEach((username) => {
        const acc = updatedAccounts[username];
        if (!acc) return;

        const userBets = acc.bets || [];
        const pendingBets = userBets.filter(
          (b) => b.room === room.name && b.period === activePeriod && b.result === 'Chờ kết quả'
        );

        if (pendingBets.length > 0) {
          let balanceIncrease = 0;
          let winCountIncrement = 0;

          const updatedUserBets = userBets.map((b) => {
            if (b.room === room.name && b.period === activePeriod && b.result === 'Chờ kết quả') {
              const isWin = b.choice === winningCategory;
              const outcome = isWin ? 'Thắng' : 'Thua';
              const payoutAmount = isWin ? Math.floor(b.amount * 1.3) : 0;
              
              if (isWin) {
                balanceIncrease += payoutAmount;
                winCountIncrement += 1;
              }
              
              return {
                ...b,
                result: outcome as 'Thắng' | 'Thua',
                payout: payoutAmount || undefined,
              };
            }
            return b;
          });

          // If win occurred, append a Transaction log for this account
          let userTransactions = acc.transactions || [];
          if (balanceIncrease > 0) {
            const txId = 'TX' + Math.floor(1000 + Math.random() * 9000);
            const winTx: Transaction = {
              id: txId,
              type: 'Tiền thắng cược',
              amount: balanceIncrease,
              status: 'Thành công',
              timestamp: new Date().toISOString(),
              details: `Thắng phòng ${room.name} kỳ ${activePeriod} (${winningCategory})`,
              username: username,
              fullName: acc.profile.fullName,
            };
            userTransactions = [winTx, ...userTransactions];
            newGlobalTransactions.push(winTx);

            // Setup real-time notice if this is the currently logged-in user
            if (user && user.username === username) {
              localRecentNotice = {
                show: true,
                period: activePeriod,
                room: room.name,
                choice: pendingBets[0]?.choice || '',
                result: 'Thắng' as const,
                amount: pendingBets[0]?.amount || 0,
                payout: balanceIncrease,
              };
            }
          } else {
            // Setup real-time loss notice if this is the currently logged-in user
            if (user && user.username === username) {
              localRecentNotice = {
                show: true,
                period: activePeriod,
                room: room.name,
                choice: pendingBets[0]?.choice || '',
                result: 'Thua' as const,
                amount: pendingBets[0]?.amount || 0,
                payout: 0,
              };
            }
          }

          // Write updates back into the account object
          acc.profile = {
            ...acc.profile,
            balance: acc.profile.balance + balanceIncrease,
            accumulatedWins: acc.profile.accumulatedWins + balanceIncrease,
            accumulationCount: acc.profile.accumulationCount + winCountIncrement,
          };
          acc.bets = updatedUserBets;
          acc.transactions = userTransactions;
        }
      });

      // Clear forced results for this room
      nextForcedResults[room.name] = null;
    });

    // Save updated accounts and history
    setAccounts(updatedAccounts);
    setPeriodsHistory(newPeriodsHistory);
    setForcedNextResult(nextForcedResults);
    localStorage.setItem('viet-tien-periods-history', JSON.stringify(newPeriodsHistory));
    localStorage.setItem('viet-tien-forced-results', JSON.stringify(nextForcedResults));
    localStorage.setItem('viet-tien-accounts', JSON.stringify(updatedAccounts));

    if (newGlobalTransactions.length > 0) {
      setAllTransactions((prev) => [...newGlobalTransactions, ...prev]);
    }

    // If currently logged-in user got updated, reflect the changes in their active state immediately
    if (user && updatedAccounts[user.username]) {
      const activeUserAcc = updatedAccounts[user.username];
      setUser({ ...activeUserAcc.profile });
      setBets([...activeUserAcc.bets]);
      setTransactions([...activeUserAcc.transactions]);
    }

    // Increment period numbers for the next cycle across all rooms
    const nextPeriods: Record<string, string> = {};
    rooms.forEach((r) => {
      nextPeriods[r.name] = generatePeriodNumber(r.name, 45);
    });
    setCurrentPeriod(nextPeriods);
    localStorage.setItem('viet-tien-current-period', JSON.stringify(nextPeriods));

    if (localRecentNotice) {
      setRecentResultNotice(localRecentNotice);
    }
  }

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const login = (phoneOrUsername: string, pass: string): boolean => {
    const cleanInput = phoneOrUsername.trim().toLowerCase();
    
    // Find account by matching username key, profile.username, profile.phone, or profile.fullName
    const accountEntry = Object.entries(accounts as Record<string, { profile: UserProfile; password: string; bets?: BetRecord[]; transactions?: Transaction[] }>).find(([key, val]) => {
      const uKey = key.toLowerCase();
      const uUsername = (val.profile.username || '').toLowerCase();
      const uPhone = (val.profile.phone || '').toLowerCase();
      const uFullName = (val.profile.fullName || '').toLowerCase();
      
      return uKey === cleanInput || 
             uUsername === cleanInput || 
             uPhone === cleanInput || 
             uFullName === cleanInput;
    });

    if (accountEntry) {
      const [key, account] = accountEntry as [string, { profile: UserProfile; password: string; bets?: BetRecord[]; transactions?: Transaction[] }];
      if (account.password === pass) {
        setPassword(pass);
        localStorage.setItem('viet-tien-pass', pass);
        setUser(account.profile);
        setBets(account.bets || []);
        setTransactions(account.transactions || []);
        if (key === 'admin' || account.profile.username === 'admin') {
          setActiveScreen('admin');
        } else {
          setActiveScreen('home');
        }
        return true;
      }
    }
    return false;
  };

  const register = (phone: string, fullName: string, pass: string, refCode?: string): boolean => {
    if (!refCode || refCode.trim() !== '88888') {
      return false;
    }
    if (phone.trim() && fullName.trim() && pass.trim()) {
      const cleanPhone = phone.trim();
      const newUser: UserProfile = {
        username: cleanPhone,
        fullName: fullName,
        id: String(Math.floor(1000 + Math.random() * 9005)),
        balance: 0, // No default starting balance as requested ("bỏ các số dư đi")
        phone: cleanPhone,
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        referralCode: refCode || undefined,
        accumulatedSupport: 0,
        accumulatedInterest: 0,
        accumulatedWins: 0,
        accumulationCount: 0,
      };
      
      setPassword(pass);
      localStorage.setItem('viet-tien-pass', pass);
      
      // Update accounts dictionary synchronously to prevent race condition during registration
      setAccounts((prev) => {
        const next = {
          ...prev,
          [cleanPhone]: { profile: newUser, password: pass, bets: [], transactions: [] },
        };
        localStorage.setItem('viet-tien-accounts', JSON.stringify(next));
        return next;
      });

      setUser(newUser);
      setBets([]);
      setTransactions([]);
      setActiveScreen('home');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setBets([]);
    setTransactions([]);
    setActiveScreen('login');
  };

  const changePassword = (oldPass: string, newPass: string) => {
    if (oldPass !== password) {
      return { success: false, message: 'Mật khẩu cũ không chính xác.' };
    }
    if (newPass.length < 6) {
      return { success: false, message: 'Mật khẩu mới phải từ 6 ký tự.' };
    }
    setPassword(newPass);
    localStorage.setItem('viet-tien-pass', newPass);

    if (user) {
      setAccounts((prev) => ({
        ...prev,
        [user.username]: {
          ...prev[user.username],
          password: newPass
        }
      }));
    }

    return { success: true, message: 'Đổi mật khẩu thành công!' };
  };

  const updateBankInfo = (bank: string, accountNo: string, holder: string) => {
    if (user) {
      setUser({
        ...user,
        bankName: bank,
        accountNumber: accountNo,
        accountHolder: holder.toUpperCase(),
      });
    }
  };

  const placeBet = (
    room: string,
    choice: BetCategory | null,
    amount: number | null,
    bets?: { choice: BetCategory; amount: number }[]
  ) => {
    if (!user) return { success: false, message: 'Vui lòng đăng nhập.' };

    const betsToPlace = bets || (choice && amount ? [{ choice, amount }] : []);
    if (betsToPlace.length === 0) {
      return { success: false, message: 'Vui lòng chọn ít nhất 1 hạng mục.' };
    }

    const totalAmount = betsToPlace.reduce((sum, b) => sum + b.amount, 0);
    if (user.balance < totalAmount) {
      return { success: false, message: 'Số dư khả dụng không đủ!' };
    }

    const activePeriod = currentPeriod[room] || generatePeriodNumber(room);

    const updatedProfile = {
      ...user,
      balance: user.balance - totalAmount,
    };

    const newBets: BetRecord[] = [];
    const newTxs: Transaction[] = [];

    betsToPlace.forEach((b) => {
      const betId = '#' + Math.floor(7000 + Math.random() * 900);
      const newBet: BetRecord = {
        id: betId,
        room,
        period: activePeriod,
        choice: b.choice,
        amount: b.amount,
        result: 'Chờ kết quả',
        timestamp: new Date().toISOString(),
        username: user.username,
      };
      newBets.push(newBet);

      const transactId = 'TX' + Math.floor(1000 + Math.random() * 9000);
      const newTx: Transaction = {
        id: transactId,
        type: 'Hoàn trả cược',
        amount: -b.amount,
        status: 'Thành công',
        timestamp: new Date().toISOString(),
        details: `Đặt cược phòng ${room} kỳ ${activePeriod} - ${b.choice}`,
        username: user.username,
        fullName: user.fullName,
      };
      newTxs.push(newTx);
    });

    // Update active user state
    setUser(updatedProfile);
    setBets((current) => [...newBets, ...current]);
    setTransactions((prev) => [...newTxs, ...prev]);
    setAllTransactions((prev) => [...newTxs, ...prev]);

    // Synchronously update the master accounts registry so that Admin or any other views see it instantly
    setAccounts((prev) => {
      const existingUserAcc = prev[user.username] || { profile: user, password: password, bets: [], transactions: [] };
      const nextAccounts = {
        ...prev,
        [user.username]: {
          ...existingUserAcc,
          profile: updatedProfile,
          bets: [...newBets, ...(existingUserAcc.bets || [])],
          transactions: [...newTxs, ...(existingUserAcc.transactions || [])],
        },
      };
      localStorage.setItem('viet-tien-accounts', JSON.stringify(nextAccounts));
      return nextAccounts;
    });

    localStorage.setItem(`viet-tien-bets-${user.username}`, JSON.stringify([...newBets, ...bets]));
    localStorage.setItem(`viet-tien-trans-${user.username}`, JSON.stringify([...newTxs, ...transactions]));

    return { success: true };
  };

  const deposit = (amount: number, txCode?: string, phone?: string) => {
    if (user && amount > 0) {
      const transactId = 'TX' + Math.floor(1000 + Math.random() * 9000);
      const isUserAdmin = user.username === 'admin';
      const status = isUserAdmin ? 'Thành công' : 'Đang xử lý';
      
      const newTx: Transaction = {
        id: transactId,
        type: 'Nạp tiền',
        amount,
        status,
        timestamp: new Date().toISOString(),
        details: isUserAdmin 
          ? 'Nạp tiền trực tuyến (Quản trị viên)' 
          : txCode 
            ? `Mã giao dịch: ${txCode}. SĐT: ${phone}` 
            : 'Yêu cầu nạp tiền qua tài khoản ngân hàng',
        username: user.username,
        fullName: user.fullName,
      };

      const updatedProfile = {
        ...user,
        balance: isUserAdmin ? user.balance + amount : user.balance,
      };

      setUser(updatedProfile);

      setTransactions((prev) => {
        const combined = [newTx, ...prev];
        return combined.filter((item, index) => combined.findIndex(t => t.id === item.id) === index);
      });
      setAllTransactions((prev) => {
        const combined = [newTx, ...prev];
        const unique = combined.filter((item, index) => combined.findIndex(t => t.id === item.id) === index);
        localStorage.setItem('viet-tien-all-transactions', JSON.stringify(unique));
        return unique;
      });

      // Sync specific user transactions array synchronously in the accounts list
      setAccounts((prev) => {
        const existingUserAcc = prev[user.username] || { profile: user, password: password, bets: [], transactions: [] };
        const updatedTransactions = [newTx, ...(existingUserAcc.transactions || [])];
        const uniqueTransactions = updatedTransactions.filter((item, index) => updatedTransactions.findIndex(t => t.id === item.id) === index);
        const nextAccounts = {
          ...prev,
          [user.username]: {
            ...existingUserAcc,
            profile: updatedProfile,
            transactions: uniqueTransactions,
          },
        };
        localStorage.setItem('viet-tien-accounts', JSON.stringify(nextAccounts));
        return nextAccounts;
      });
    }
  };

  const withdraw = (amount: number, bank: string, accountNo: string, holderName: string) => {
    if (!user) return { success: false, message: 'Yêu cầu đăng nhập.' };
    if (amount <= 0) return { success: false, message: 'Số tiền rút không hợp lệ.' };
    if (user.balance < amount) return { success: false, message: 'Số dư tài khoản không đủ!' };

    const updatedProfile = {
      ...user,
      balance: user.balance - amount,
    };

    // Deduct balance
    setUser(updatedProfile);

    const transactId = 'TX' + Math.floor(1000 + Math.random() * 9000);
    const newTx: Transaction = {
      id: transactId,
      type: 'Rút tiền',
      amount: amount,
      status: 'Đang xử lý',
      timestamp: new Date().toISOString(),
      details: `Rút về ngân hàng ${bank} - ${accountNo} - ${holderName.toUpperCase()}`,
      username: user.username,
      fullName: user.fullName,
    };

    setTransactions((prev) => {
      const combined = [newTx, ...prev];
      return combined.filter((item, index) => combined.findIndex(t => t.id === item.id) === index);
    });
    setAllTransactions((prev) => {
      const combined = [newTx, ...prev];
      const unique = combined.filter((item, index) => combined.findIndex(t => t.id === item.id) === index);
      localStorage.setItem('viet-tien-all-transactions', JSON.stringify(unique));
      return unique;
    });

    // Sync specific user transactions array synchronously in the accounts list
    setAccounts((prev) => {
      const existingUserAcc = prev[user.username] || { profile: user, password: password, bets: [], transactions: [] };
      const updatedTransactions = [newTx, ...(existingUserAcc.transactions || [])];
      const uniqueTransactions = updatedTransactions.filter((item, index) => updatedTransactions.findIndex(t => t.id === item.id) === index);
      const nextAccounts = {
        ...prev,
        [user.username]: {
          ...existingUserAcc,
          profile: updatedProfile,
          transactions: uniqueTransactions,
        },
      };
      localStorage.setItem('viet-tien-accounts', JSON.stringify(nextAccounts));
      return nextAccounts;
    });

    return { success: true, message: 'Tạo lệnh rút tiền thành công! Vui lòng chờ quản trị viên phê duyệt.' };
  };

  // ADMIN UTILITY FUNCTIONS IMPLEMENTATION
  const updateTransactionStatus = (id: string, status: 'Thành công' | 'Thất bại') => {
    // Find the transaction from the state, local storage, or accounts registry
    let tx = allTransactions.find((t) => t.id === id);
    
    if (!tx) {
      const savedGlobal = localStorage.getItem('viet-tien-all-transactions');
      if (savedGlobal) {
        try {
          const parsed = JSON.parse(savedGlobal) as Transaction[];
          tx = parsed.find((t) => t.id === id);
        } catch (e) {
          console.error('Error reading global transactions from fallback storage', e);
        }
      }
    }

    if (!tx) {
      // Search in all accounts' transactions
      const savedAccounts = localStorage.getItem('viet-tien-accounts');
      if (savedAccounts) {
        try {
          const parsedAccounts = JSON.parse(savedAccounts);
          for (const username of Object.keys(parsedAccounts)) {
            const accTrans = parsedAccounts[username].transactions as Transaction[] | undefined;
            const found = accTrans?.find((t) => t.id === id);
            if (found) {
              tx = found;
              break;
            }
          }
        } catch (e) {
          console.error('Error searching in accounts fallback storage', e);
        }
      }
    }

    if (!tx) {
      console.error("Không tìm thấy giao dịch nào trùng khớp để cập nhật trạng thái", id);
      return;
    }

    const targetUsername = tx.username || '';
    if (!targetUsername) return;

    // 1. Update global transactions list in state & localStorage
    const transactionToUse = tx; // Create a stable variable for closures
    setAllTransactions((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, status } : t));
      const exists = prev.some((t) => t.id === id);
      const nextTrans = exists ? updated : [{ ...transactionToUse, status }, ...prev];
      const unique = nextTrans.filter((item, index) => nextTrans.findIndex(t => t.id === item.id) === index);
      localStorage.setItem('viet-tien-all-transactions', JSON.stringify(unique));
      return unique;
    });

    // 2. Update target user account profile balance & transaction log
    setAccounts((currAccounts) => {
      const targetAcc = currAccounts[targetUsername] || (() => {
        const savedAccounts = localStorage.getItem('viet-tien-accounts');
        if (savedAccounts) {
          try {
            const parsed = JSON.parse(savedAccounts);
            return parsed[targetUsername];
          } catch (e) {
            console.error(e);
          }
        }
        return undefined;
      })();

      if (!targetAcc) return currAccounts;

      const updatedProfile = { 
        ...targetAcc.profile,
        username: targetAcc.profile.username || targetUsername,
      };

      if (transactionToUse.type === 'Nạp tiền' && status === 'Thành công') {
        updatedProfile.balance += transactionToUse.amount;
      } else if (transactionToUse.type === 'Rút tiền' && status === 'Thất bại') {
        updatedProfile.balance += transactionToUse.amount;
      }

      // Sync specific user transactions array
      const userTransKey = `viet-tien-trans-${targetUsername}`;
      const savedUserTransStr = localStorage.getItem(userTransKey);
      const userTrans: Transaction[] = savedUserTransStr ? JSON.parse(savedUserTransStr) : (targetAcc.transactions || []);
      
      let updatedUserTrans = userTrans.map((utx) => utx.id === id ? { ...utx, status } : utx);

      // If the transaction wasn't in the user's specific array, append it!
      const exists = userTrans.some((utx) => utx.id === id);
      if (!exists) {
        updatedUserTrans = [{ ...transactionToUse, status }, ...updatedUserTrans];
      }

      const uniqueUserTrans = updatedUserTrans.filter((item, index) => updatedUserTrans.findIndex(t => t.id === item.id) === index);
      localStorage.setItem(userTransKey, JSON.stringify(uniqueUserTrans));

      // 3. If currently logged in user is the target, update their active user session
      if (user && user.username === targetUsername) {
        setUser(updatedProfile);
        setTransactions(uniqueUserTrans);
      }

      const nextAccounts = {
        ...currAccounts,
        [targetUsername]: {
          ...targetAcc,
          profile: updatedProfile,
          transactions: uniqueUserTrans,
          bets: targetAcc.bets || []
        },
      };

      localStorage.setItem('viet-tien-accounts', JSON.stringify(nextAccounts));
      return nextAccounts;
    });
  };

  const adminModifyUserBalance = (username: string, amount: number, isAddition: boolean) => {
    setAccounts((currAccounts) => {
      const targetAcc = currAccounts[username];
      if (!targetAcc) return currAccounts;

      const delta = isAddition ? amount : -amount;
      const updatedProfile = {
        ...targetAcc.profile,
        balance: Math.max(0, targetAcc.profile.balance + delta),
      };

      const transactId = 'TX' + Math.floor(1000 + Math.random() * 9000);
      const newTx: Transaction = {
        id: transactId,
        type: isAddition ? 'Nạp tiền' : 'Rút tiền',
        amount,
        status: 'Thành công',
        timestamp: new Date().toISOString(),
        details: isAddition ? 'Cộng tiền thủ công bởi Quản trị viên' : 'Trừ tiền thủ công bởi Quản trị viên',
        username,
        fullName: targetAcc.profile.fullName,
      };

      setAllTransactions((prev) => {
        const combined = [newTx, ...prev];
        const unique = combined.filter((item, index) => combined.findIndex(t => t.id === item.id) === index);
        localStorage.setItem('viet-tien-all-transactions', JSON.stringify(unique));
        return unique;
      });

      const userTransKey = `viet-tien-trans-${username}`;
      const savedUserTransStr = localStorage.getItem(userTransKey);
      const userTrans: Transaction[] = savedUserTransStr ? JSON.parse(savedUserTransStr) : [];
      const updatedUserTrans = [newTx, ...userTrans];
      const uniqueUserTrans = updatedUserTrans.filter((item, index) => updatedUserTrans.findIndex(t => t.id === item.id) === index);
      localStorage.setItem(userTransKey, JSON.stringify(uniqueUserTrans));

      if (user && user.username === username) {
        setUser(updatedProfile);
        setTransactions(uniqueUserTrans);
      }

      const nextAccounts = {
        ...currAccounts,
        [username]: { 
          ...targetAcc, 
          profile: updatedProfile,
          transactions: uniqueUserTrans,
          bets: targetAcc.bets || []
        },
      };

      localStorage.setItem('viet-tien-accounts', JSON.stringify(nextAccounts));
      return nextAccounts;
    });
  };

  const adminUpdateUserProfile = (username: string, updatedProfile: Partial<UserProfile>, updatedPassword?: string) => {
    setAccounts((currAccounts) => {
      const targetAcc = currAccounts[username];
      if (!targetAcc) return currAccounts;

      const nextProfile = {
        ...targetAcc.profile,
        ...updatedProfile,
      };

      const nextPassword = updatedPassword !== undefined ? updatedPassword : targetAcc.password;

      if (user && user.username === username) {
        setUser(nextProfile);
        if (updatedPassword !== undefined) {
          setPassword(nextPassword);
          localStorage.setItem('viet-tien-pass', nextPassword);
        }
      }

      const nextAccounts = {
        ...currAccounts,
        [username]: {
          profile: nextProfile,
          password: nextPassword,
          bets: targetAcc.bets || [],
          transactions: targetAcc.transactions || [],
        },
      };

      localStorage.setItem('viet-tien-accounts', JSON.stringify(nextAccounts));
      return nextAccounts;
    });
  };

  const adminForceGameResult = (room: string, winningCategory: BetCategory) => {
    setForcedNextResult((prev) => {
      const next = {
        ...prev,
        [room]: winningCategory,
      };
      localStorage.setItem('viet-tien-forced-results', JSON.stringify(next));
      return next;
    });
  };

  const adminDeleteUser = (username: string) => {
    setAccounts((prev) => {
      const next = { ...prev };
      delete next[username];
      localStorage.setItem('viet-tien-accounts', JSON.stringify(next));
      return next;
    });
  };

  const addRoom = (name: string, cycle: number, icon: string) => {
    setRooms(prev => {
      const nextId = '#' + (prev.length + 3);
      const nextRoom = {
        id: nextId,
        name,
        icon: icon || 'smart_display',
        cycle: Number(cycle) || 45,
        currentCycle: Number(cycle) || 45,
        session: generatePeriodNumber(name)
      };
      const updated = [...prev, nextRoom];
      localStorage.setItem('viet-tien-rooms', JSON.stringify(updated));
      return updated;
    });

    // Initialize period, history and forced result for the custom room
    setCurrentPeriod(prev => {
      const next = {
        ...prev,
        [name]: generatePeriodNumber(name)
      };
      localStorage.setItem('viet-tien-current-period', JSON.stringify(next));
      return next;
    });

    setPeriodsHistory(prev => {
      const next = {
        ...prev,
        [name]: [
          { period: generatePeriodNumber(name, -45), result: 'Tăng doanh số' as BetCategory },
          { period: generatePeriodNumber(name, -90), result: 'Quảng bá sản phẩm' as BetCategory },
          { period: generatePeriodNumber(name, -135), result: 'Tăng tương tác' as BetCategory },
          { period: generatePeriodNumber(name, -180), result: 'Thu hút đầu tư' as BetCategory },
          { period: generatePeriodNumber(name, -225), result: 'Tăng doanh số' as BetCategory },
        ]
      };
      localStorage.setItem('viet-tien-periods-history', JSON.stringify(next));
      return next;
    });

    setForcedNextResult(prev => ({
      ...prev,
      [name]: null
    }));
  };

  const updateRoom = (id: string, name: string, cycle: number, icon: string) => {
    const targetRoom = rooms.find(r => r.id === id);
    if (!targetRoom) return;
    const oldName = targetRoom.name;

    setRooms(prev => {
      const updated = prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            name,
            icon: icon || 'smart_display',
            cycle: Number(cycle) || 45,
          };
        }
        return r;
      });
      localStorage.setItem('viet-tien-rooms', JSON.stringify(updated));
      return updated;
    });

    if (oldName && oldName !== name) {
      // Name changed, update dependent states
      setCurrentPeriod(prev => {
        const next = { ...prev };
        if (next[oldName]) {
          next[name] = next[oldName];
          delete next[oldName];
        } else {
          next[name] = generatePeriodNumber(name);
        }
        localStorage.setItem('viet-tien-current-period', JSON.stringify(next));
        return next;
      });

      setPeriodsHistory(prev => {
        const next = { ...prev };
        if (next[oldName]) {
          next[name] = next[oldName];
          delete next[oldName];
        } else {
          next[name] = [
            { period: generatePeriodNumber(name, -45), result: 'Tăng doanh số' as BetCategory },
            { period: generatePeriodNumber(name, -90), result: 'Quảng bá sản phẩm' as BetCategory },
            { period: generatePeriodNumber(name, -135), result: 'Tăng tương tác' as BetCategory },
            { period: generatePeriodNumber(name, -180), result: 'Thu hút đầu tư' as BetCategory },
            { period: generatePeriodNumber(name, -225), result: 'Tăng doanh số' as BetCategory },
          ];
        }
        localStorage.setItem('viet-tien-periods-history', JSON.stringify(next));
        return next;
      });

      setForcedNextResult(prev => {
        const next = { ...prev };
        if (oldName in next) {
          next[name] = next[oldName];
          delete next[oldName];
        }
        return next;
      });
    }
  };

  const deleteRoom = (id: string) => {
    const targetRoom = rooms.find(r => r.id === id);
    if (!targetRoom) return;
    const oldName = targetRoom.name;

    setRooms(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('viet-tien-rooms', JSON.stringify(updated));
      return updated;
    });

    if (oldName) {
      setCurrentPeriod(prev => {
        const next = { ...prev };
        delete next[oldName];
        localStorage.setItem('viet-tien-current-period', JSON.stringify(next));
        return next;
      });
      setPeriodsHistory(prev => {
        const next = { ...prev };
        delete next[oldName];
        localStorage.setItem('viet-tien-periods-history', JSON.stringify(next));
        return next;
      });
      setForcedNextResult(prev => {
        const next = { ...prev };
        delete next[oldName];
        return next;
      });
    }
  };

  const adminClearAllBets = () => {
    setAccounts(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(uname => {
        next[uname] = {
          ...next[uname],
          bets: []
        };
        localStorage.removeItem(`viet-tien-bets-${uname}`);
      });
      localStorage.setItem('viet-tien-accounts', JSON.stringify(next));
      return next;
    });
    setBets([]);
  };

  const adminClearAllTransactions = () => {
    setAccounts(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(uname => {
        next[uname] = {
          ...next[uname],
          transactions: []
        };
        localStorage.removeItem(`viet-tien-trans-${uname}`);
      });
      localStorage.setItem('viet-tien-accounts', JSON.stringify(next));
      return next;
    });
    setAllTransactions([]);
    setTransactions([]);
    localStorage.removeItem('viet-tien-all-transactions');
  };

  const dismissNotice = () => {
    setRecentResultNotice(null);
  };

  return (
    <AppContext.Provider
      value={{
        activeScreen,
        setActiveScreen,
        theme,
        toggleTheme,
        user,
        login,
        register,
        logout,
        changePassword,
        updateBankInfo,
        placeBet,
        deposit,
        withdraw,
        bets,
        transactions,
        secondsRemaining,
        currentPeriod,
        periodsHistory,
        recentResultNotice,
        dismissNotice,

        // Toast Notifications
        toast,
        showToast,

        // Admin values
        accounts,
        setAccounts,
        allTransactions,
        setAllTransactions,
        updateTransactionStatus,
        adminModifyUserBalance,
        adminUpdateUserProfile,
        adminForceGameResult,
        adminDeleteUser,
        forcedNextResult,
        profileActiveTab,
        setProfileActiveTab,
        adminClearAllBets,
        adminClearAllTransactions,

        // Dynamic Rooms
        rooms,
        addRoom,
        updateRoom,
        deleteRoom,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
