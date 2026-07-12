/**
 * API client cho Hệ thống Quản trị (VT-SYS).
 * ADAPTER: dịch các route kiểu Node (/admin/login, /admin/state, /admin/users...)
 * sang backend PHP shared-hosting (auth.php, admin.php, rooms.php).
 * Nhờ vậy bản React admin chạy được trên TinoHost với backend PHP + MySQL sẵn có.
 * Giữ nguyên interface `api` + token helpers để AdminContext không cần sửa.
 */
const TOKEN_KEY = 'viet-tien-admin-token';

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/** Gọi 1 endpoint PHP; map {error}/{message} + HTTP status thành Error để lớp trên bắt. */
async function php<T = any>(method: string, endpoint: string, body?: any): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getAdminToken();
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

/** Dịch route Node -> endpoint PHP + chuẩn hoá shape trả về cho AdminContext. */
async function handle(method: string, path: string, body?: any): Promise<any> {
  const parts = path.split('/').filter(Boolean); // ['admin','users','user','balance']

  // --- Đăng nhập quản trị: chỉ nhận password, username cố định 'admin' ---
  if (method === 'POST' && path === '/admin/login') {
    const r = await php<any>('POST', 'auth.php?action=login', {
      username: 'admin',
      password: body?.password,
    });
    if (r.token !== 'admin') {
      const err: any = new Error('Tài khoản này không có quyền quản trị viên!');
      err.status = 403;
      throw err;
    }
    return { token: r.token };
  }

  // --- Trạng thái tổng hợp: accounts + transactions + rooms(+forced) ---
  if (method === 'GET' && path === '/admin/state') {
    const [usersRes, txRes, roomsRes, forcedRes] = await Promise.all([
      php<any>('GET', 'admin.php?action=users'),
      php<any>('GET', 'admin.php?action=transactions'),
      php<any>('GET', 'rooms.php'),
      php<any>('GET', 'admin.php?action=game-forced-list'),
    ]);
    const forced = forcedRes.forced || {};
    const rooms = (roomsRes.rooms || []).map((r: any) => ({
      ...r,
      forcedNextResult: forced[r.name] ?? null,
    }));
    return {
      accounts: usersRes.accounts || {},
      allTransactions: txRes.transactions || [],
      rooms,
      secondsRemaining: roomsRes.secondsRemaining,
      globalForcedResult: null, // Không có khái niệm TÀI/XỈU toàn cục ở backend PHP
    };
  }

  // --- Duyệt / từ chối giao dịch: POST /admin/transactions/:id { action } ---
  if (method === 'POST' && parts[0] === 'admin' && parts[1] === 'transactions' && parts[2]) {
    const id = decodeURIComponent(parts[2]);
    const action = body?.action === 'approve' ? 'transactions-approve' : 'transactions-reject';
    return await php('POST', `admin.php?action=${action}`, { id });
  }

  // --- Điều chỉnh số dư: POST /admin/users/:username/balance { amount, isAddition } ---
  if (method === 'POST' && parts[0] === 'admin' && parts[1] === 'users' && parts[3] === 'balance') {
    const targetUsername = decodeURIComponent(parts[2]);
    return await php('POST', 'admin.php?action=users-adjust-balance', {
      targetUsername,
      type: body?.isAddition ? 'add' : 'deduct',
      amount: body?.amount,
    });
  }

  // --- Tạo thành viên mới: POST /admin/users ---
  if (method === 'POST' && path === '/admin/users') {
    return await php('POST', 'admin.php?action=users-add', body);
  }

  // --- Cập nhật thành viên: PUT /admin/users/:username { updates, password } ---
  if (method === 'PUT' && parts[0] === 'admin' && parts[1] === 'users' && parts[2]) {
    const targetUsername = decodeURIComponent(parts[2]);
    const updates = body?.updates || {};
    let last: any = { success: true };

    // Khóa / mở khóa
    if (Object.prototype.hasOwnProperty.call(updates, 'isLocked')) {
      last = await php('POST', 'admin.php?action=users-lock', {
        targetUsername,
        isLocked: updates.isLocked ? 1 : 0,
      });
    }

    // Cập nhật thông tin hồ sơ (nếu có trường hồ sơ)
    const profileKeys = ['fullName', 'phone', 'bankName', 'accountNumber', 'accountHolder', 'accumulatedSupport'];
    const profilePayload: any = { targetUsername };
    let hasProfile = false;
    for (const k of profileKeys) {
      if (updates[k] !== undefined) {
        profilePayload[k] = updates[k];
        hasProfile = true;
      }
    }
    if (hasProfile) {
      last = await php('POST', 'admin.php?action=users-update', profilePayload);
    }

    // Đổi mật khẩu người dùng
    if (body?.password) {
      last = await php('POST', 'admin.php?action=users-change-password', {
        targetUsername,
        newPassword: body.password,
      });
    }

    return last;
  }

  // --- Xóa thành viên: DELETE /admin/users/:username ---
  if (method === 'DELETE' && parts[0] === 'admin' && parts[1] === 'users' && parts[2]) {
    const targetUsername = decodeURIComponent(parts[2]);
    return await php('POST', 'admin.php?action=users-delete', { targetUsername });
  }

  // --- Can thiệp kết quả 1 phòng: POST /admin/force-room { room, category } ---
  if (method === 'POST' && path === '/admin/force-room') {
    return await php('POST', 'admin.php?action=game-force-result', {
      room: body?.room,
      choice: body?.category ?? null,
    });
  }

  // --- Force toàn cục TÀI/XỈU: không tồn tại ở backend PHP, no-op an toàn ---
  if (method === 'POST' && path === '/admin/force-global') {
    return { success: true, message: 'Backend PHP không hỗ trợ can thiệp toàn cục.' };
  }

  // --- Quản lý phòng ---
  if (method === 'POST' && path === '/admin/rooms') {
    return await php('POST', 'admin.php?action=rooms-add', {
      name: body?.name,
      cycle: body?.cycle,
      icon: body?.icon,
    });
  }
  if (method === 'PUT' && parts[0] === 'admin' && parts[1] === 'rooms' && parts[2]) {
    const id = parts[2]; // giữ nguyên đã encode (vd '#4' -> '%234') cho $_GET['id']
    return await php('POST', `admin.php?action=rooms-update&id=${id}`, {
      name: body?.name,
      cycle: body?.cycle,
      icon: body?.icon,
    });
  }
  if (method === 'DELETE' && parts[0] === 'admin' && parts[1] === 'rooms' && parts[2]) {
    const id = parts[2];
    return await php('POST', `admin.php?action=rooms-delete&id=${id}`);
  }

  // --- Xóa lịch sử ---
  if (method === 'DELETE' && path === '/admin/bets') {
    return await php('POST', 'admin.php?action=history-clear-bets');
  }
  if (method === 'DELETE' && path === '/admin/transactions') {
    return await php('POST', 'admin.php?action=history-clear-transactions');
  }

  // --- Mô phỏng nạp / rút ---
  if (method === 'POST' && path === '/admin/simulate-deposit') {
    return await php('POST', 'admin.php?action=simulation-deposit', {
      username: body?.targetUsername,
      amount: body?.amount,
      txCode: body?.txCode,
      phone: body?.phone,
    });
  }
  if (method === 'POST' && path === '/admin/simulate-withdraw') {
    return await php('POST', 'admin.php?action=simulation-withdraw', {
      username: body?.targetUsername,
      amount: body?.amount,
      bankName: body?.bankName,
      accountNumber: body?.accountNumber,
      accountOwner: body?.accountOwner,
    });
  }

  // --- Đổi mật khẩu chính admin ---
  if (method === 'POST' && path === '/admin/change-password') {
    return await php('POST', 'auth.php?action=change-password', {
      oldPassword: body?.currentPassword,
      newPassword: body?.newPassword,
    });
  }

  // --- Thông báo (hộp thư quản trị) ---
  if (method === 'GET' && path === '/admin/notifications') {
    return await php('GET', 'notifications.php?action=list');
  }
  if (method === 'POST' && path === '/admin/notifications/read') {
    return await php('POST', 'notifications.php?action=read', body);
  }
  if (method === 'POST' && path === '/admin/notifications/send') {
    return await php('POST', 'notifications.php?action=send', body);
  }

  throw new Error(`Endpoint quản trị không hỗ trợ: ${method} ${path}`);
}

export const api = {
  get: <T = any>(path: string) => handle('GET', path) as Promise<T>,
  post: <T = any>(path: string, body?: any) => handle('POST', path, body ?? {}) as Promise<T>,
  put: <T = any>(path: string, body?: any) => handle('PUT', path, body ?? {}) as Promise<T>,
  del: <T = any>(path: string) => handle('DELETE', path) as Promise<T>,
};
