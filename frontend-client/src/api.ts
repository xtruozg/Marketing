/**
 * API client cho Cổng Khách hàng.
 * ADAPTER: dịch các route kiểu Node (/state, /auth/login, /bets...) sang
 * backend PHP shared-hosting (auth.php, rooms.php, bets.php, transactions.php).
 * Nhờ vậy bản React chạy được trên TinoHost với backend PHP + MySQL sẵn có.
 */
const TOKEN_KEY = 'viet-tien-token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/** Gọi 1 endpoint PHP; map {error} + HTTP status thành Error để lớp trên bắt. */
async function php<T = any>(method: string, endpoint: string, body?: any): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api/${endpoint}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = (data && (data.error || data.message)) || 'Lỗi kết nối máy chủ!';
    const err: any = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

/** Dịch route Node -> endpoint PHP + chuẩn hoá shape trả về cho UI React. */
async function handle(method: string, path: string, body?: any): Promise<any> {
  // Gộp trạng thái: profile (user/bets/transactions) + rooms (rooms/secondsRemaining/history)
  if (method === 'GET' && path === '/state') {
    let profile: any;
    try {
      profile = await php('POST', 'auth.php?action=profile', {});
    } catch (e: any) {
      if (e.status === 403) return { locked: true };
      throw e;
    }
    const rooms = await php<any>('GET', 'rooms.php');
    return {
      user: profile.profile,
      bets: profile.bets || [],
      transactions: profile.transactions || [],
      rooms: rooms.rooms || [],
      periodsHistory: rooms.periodsHistory || {},
      secondsRemaining: rooms.secondsRemaining,
    };
  }

  if (method === 'POST' && path === '/auth/login') {
    const r = await php<any>('POST', 'auth.php?action=login', body);
    // PHP token = username; suy ra role để tương thích luồng chuyển hướng admin.
    return { token: r.token, user: r.user, role: r.token === 'admin' ? 'admin' : 'user' };
  }

  if (method === 'POST' && path === '/auth/register') {
    const r = await php<any>('POST', 'auth.php?action=register', body);
    // PHP register không trả token; token = username = số điện thoại.
    return { token: (body && body.phone) || (r.user && r.user.username), user: r.user, role: 'user' };
  }

  if (method === 'POST' && path === '/auth/change-password') {
    return await php('POST', 'auth.php?action=change-password', body);
  }
  if (method === 'POST' && path === '/me/bank') {
    return await php('POST', 'auth.php?action=bank', body);
  }
  if (method === 'POST' && path === '/me/avatar') {
    return await php('POST', 'auth.php?action=avatar', body);
  }
  if (method === 'POST' && path === '/bets') {
    return await php('POST', 'bets.php', body);
  }
  if (method === 'POST' && path === '/deposit') {
    return await php('POST', 'transactions.php?action=deposit', body);
  }
  if (method === 'POST' && path === '/withdraw') {
    return await php('POST', 'transactions.php?action=withdraw', body);
  }

  // --- Thông báo (hộp thư khách hàng) ---
  if (method === 'GET' && path === '/notifications') {
    return await php('GET', 'notifications.php?action=list');
  }
  if (method === 'POST' && path === '/notifications/read') {
    return await php('POST', 'notifications.php?action=read', body);
  }
  if (method === 'POST' && path === '/notifications/send') {
    return await php('POST', 'notifications.php?action=send', body);
  }

  throw new Error(`Endpoint không hỗ trợ: ${method} ${path}`);
}

export const api = {
  get: <T = any>(path: string) => handle('GET', path) as Promise<T>,
  post: <T = any>(path: string, body?: any) => handle('POST', path, body ?? {}) as Promise<T>,
  put: <T = any>(path: string, body?: any) => handle('PUT', path, body ?? {}) as Promise<T>,
  del: <T = any>(path: string) => handle('DELETE', path) as Promise<T>,
};
