import mongoose, { Schema, model } from 'mongoose';

/**
 * Kết nối MongoDB. Ưu tiên biến môi trường MONGODB_URI,
 * mặc định trỏ về Mongo local (mongodb://127.0.0.1:27017/viet-tien).
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/viet-tien';
  mongoose.set('strictQuery', false);
  await mongoose.connect(uri);
  console.log('[DB] Đã kết nối MongoDB:', uri.replace(/\/\/([^@]+)@/, '//***@'));
}

/* ------------------------------- User ------------------------------- */
const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, default: '' },
    id: { type: String, default: '' },
    balance: { type: Number, default: 0 },
    phone: { type: String, default: '' },
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    accountHolder: { type: String, default: '' },
    referralCode: { type: String, default: '' },
    accumulatedSupport: { type: Number, default: 0 },
    accumulatedInterest: { type: Number, default: 0 },
    accumulatedWins: { type: Number, default: 0 },
    accumulationCount: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
    avatarUrl: { type: String, default: '' },
    lastActive: { type: String, default: '' },
    // Nội bộ (không trả về client thường)
    password: { type: String, default: '' },
    role: { type: String, default: 'user' }, // 'user' | 'admin'
    status: { type: String, default: 'active' },
  },
  { versionKey: false }
);

/* --------------------------- Transaction ---------------------------- */
const TransactionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    username: { type: String, index: true },
    fullName: { type: String, default: '' },
    type: { type: String }, // 'Nạp tiền' | 'Rút tiền' | 'Hoàn trả cược' | 'Tiền thắng cược'
    amount: { type: Number, default: 0 },
    status: { type: String, default: 'Đang xử lý' }, // 'Thành công' | 'Đang xử lý' | 'Thất bại'
    timestamp: { type: String },
    details: { type: String, default: '' },
  },
  { versionKey: false }
);

/* ------------------------------- Bet -------------------------------- */
const BetSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    room: { type: String, index: true },
    period: { type: String, index: true },
    choice: { type: String },
    amount: { type: Number, default: 0 },
    result: { type: String, default: 'Chờ kết quả' }, // 'Thắng' | 'Thua' | 'Chờ kết quả'
    payout: { type: Number, default: 0 },
    timestamp: { type: String },
    username: { type: String, index: true },
    fullName: { type: String, default: '' },
  },
  { versionKey: false }
);

/* ------------------------------- Room ------------------------------- */
const RoomSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    id: { type: String, default: '' },
    icon: { type: String, default: 'thumb_up' },
    cycle: { type: Number, default: 60 },
    forcedNextResult: { type: String, default: null },
    periodsHistory: {
      type: [{ period: String, result: String, _id: false }],
      default: [],
    },
  },
  { versionKey: false }
);

/* --------------------------- System State --------------------------- */
const SystemStateSchema = new Schema(
  {
    _id: { type: String, default: 'state' },
    forcedNextResult: { type: String, default: null }, // 'TAI' | 'XIU' | null
  },
  { versionKey: false }
);

export const User = model('User', UserSchema);
export const Transaction = model('Transaction', TransactionSchema);
export const Bet = model('Bet', BetSchema);
export const Room = model('Room', RoomSchema);
export const SystemState = model('SystemState', SystemStateSchema);
