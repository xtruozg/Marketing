import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { User } from './models';

const SECRET = process.env.JWT_SECRET || 'viet-tien-global-secret-2026';

function b64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Tạo token dạng HMAC (header-less JWT): base64(payload).chữ_ký */
export function signToken(payload: Record<string, any>): string {
  const body = b64url(JSON.stringify({ ...payload, iat: Date.now() }));
  const sig = b64url(crypto.createHmac('sha256', SECRET).update(body).digest());
  return `${body}.${sig}`;
}

/** Xác thực token, trả về payload hoặc null nếu sai/giả mạo */
export function verifyToken(token: string): Record<string, any> | null {
  try {
    const [body, sig] = token.split('.');
    if (!body || !sig) return null;
    const expected = b64url(crypto.createHmac('sha256', SECRET).update(body).digest());
    if (sig !== expected) return null;
    const json = Buffer.from(body.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export interface AuthedRequest extends Request {
  authUser?: any;
  authPayload?: Record<string, any>;
}

function extractToken(req: Request): string | null {
  const h = req.headers['authorization'];
  if (h && h.startsWith('Bearer ')) return h.slice(7);
  return null;
}

/** Bắt buộc đăng nhập (user thường hoặc admin) */
export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload || !payload.username) {
    return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại!' });
  }
  const user = await User.findOne({ username: payload.username }).lean();
  if (!user) return res.status(401).json({ message: 'Tài khoản không tồn tại!' });
  if (user.isLocked && user.role !== 'admin') {
    return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa!' });
  }
  req.authUser = user;
  req.authPayload = payload;
  next();
}

/** Bắt buộc quyền admin */
export async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== 'admin') {
    return res.status(403).json({ message: 'Yêu cầu quyền quản trị viên!' });
  }
  const user = await User.findOne({ username: payload.username }).lean();
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Yêu cầu quyền quản trị viên!' });
  }
  req.authUser = user;
  req.authPayload = payload;
  next();
}

/** Loại bỏ trường nhạy cảm trước khi trả cho client thường */
export function sanitizeUser(u: any) {
  if (!u) return u;
  const { password, ...rest } = u;
  return rest;
}
