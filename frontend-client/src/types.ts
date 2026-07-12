export type ActiveScreen =
  | 'login'
  | 'register'
  | 'home'
  | 'introduction'
  | 'withdrawing'
  | 'profile'
  | 'financial_report'
  | 'histories'
  | 'link_bank'
  | 'admin'
  | 'detail_introduction'
  | 'detail_overview'
  | 'detail_achievements'
  | 'detail_security'
  | 'detail_trends'
  | `betting_${string}`;

export interface UserProfile {
  username: string;
  fullName: string;
  id: string;
  balance: number;
  phone: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  referralCode?: string;
  accumulatedSupport: number; // Hỗ trợ tích lũy
  accumulatedInterest: number; // Số tiền lãi
  accumulatedWins: number; // Số tiền thắng
  accumulationCount: number; // Số lần tích lũy
  isLocked?: boolean;
  avatarUrl?: string;
  lastActive?: string;
}

export interface Room {
  id: string;
  name: string;
  icon: string;
  cycle: number;
  currentCycle: number;
  session: string;
}

export type BetCategory = 'Tăng tương tác' | 'Tăng doanh số' | 'Quảng bá sản phẩm' | 'Thu hút đầu tư';

export interface BetRecord {
  id: string;
  room: string;
  period: string;
  choice: BetCategory;
  amount: number;
  result: 'Thắng' | 'Thua' | 'Chờ kết quả';
  payout?: number;
  timestamp: string;
  username?: string;
}

export interface Transaction {
  id: string;
  type: 'Nạp tiền' | 'Rút tiền' | 'Hoàn trả cược' | 'Tiền thắng cược';
  amount: number;
  status: 'Thành công' | 'Đang xử lý' | 'Thất bại';
  timestamp: string;
  details?: string;
  username?: string;
  fullName?: string;
}

export interface PeriodStats {
  period: string;
  winningCategory: BetCategory;
  facebookWagersTotal: number;
  youtubeWagersTotal: number;
}
