<?php
require_once 'config.php';

$pdo = getDbConnection();
syncGameClock($pdo);

$action = isset($_GET['action']) ? $_GET['action'] : '';

// Parse JSON body input
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

if ($action === 'register') {
    $phone = isset($input['phone']) ? trim($input['phone']) : '';
    $fullName = isset($input['fullName']) ? trim($input['fullName']) : '';
    $password = isset($input['password']) ? trim($input['password']) : '';
    $refCode = isset($input['refCode']) ? trim($input['refCode']) : (isset($input['inviteCode']) ? trim($input['inviteCode']) : '');

    if (empty($phone) || empty($fullName) || empty($password)) {
        sendJsonError('Vui lòng nhập đầy đủ các trường thông tin bắt buộc!');
    }

    if ($refCode !== '88888') {
        sendJsonError('Mã giới thiệu không chính xác. Quý khách vui lòng nhập đúng mã giới thiệu.');
    }

    // Clean username from phone
    $username = $phone;
    
    // Check if user already exists
    $stmt = $pdo->prepare("SELECT username FROM accounts WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        sendJsonError('Tên đăng nhập / Số điện thoại đã tồn tại trên hệ thống!');
    }

    $newId = (string)rand(1000, 9999);
    $now = date('Y-m-d H:i:s');

    $stmt = $pdo->prepare("INSERT INTO accounts (username, password, full_name, phone, user_id, balance, referral_code, last_active) VALUES (?, ?, ?, ?, ?, 0, ?, ?)");
    $stmt->execute([
        $username,
        $password,
        $fullName,
        $phone,
        $newId,
        $refCode,
        $now
    ]);

    // Fetch and return created user
    $q = $pdo->prepare("SELECT * FROM accounts WHERE username = ?");
    $q->execute([$username]);
    $user = $q->fetch();

    sendJsonSuccess([
        'success' => true,
        'message' => 'Đăng ký tài khoản thành công!',
        'user' => [
            'username' => $user['username'],
            'fullName' => $user['full_name'],
            'id' => $user['user_id'],
            'balance' => (int)$user['balance'],
            'phone' => $user['phone']
        ]
    ]);
}

if ($action === 'login') {
    // Cho phép đăng nhập bằng TÊN ĐĂNG NHẬP / SỐ ĐIỆN THOẠI / HỌ TÊN (không phân biệt hoa thường).
    $identifier = isset($input['username']) ? trim($input['username']) : '';
    $identifierLower = strtolower($identifier);
    $password = isset($input['password']) ? trim($input['password']) : '';

    if (empty($identifier) || empty($password)) {
        sendJsonError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
    }

    $stmt = $pdo->prepare("SELECT * FROM accounts WHERE LOWER(username) = ? OR phone = ? OR LOWER(full_name) = ? LIMIT 1");
    $stmt->execute([$identifierLower, $identifier, $identifierLower]);
    $user = $stmt->fetch();

    if (!$user || $user['password'] !== $password) {
        sendJsonError('Tên đăng nhập hoặc mật khẩu không chính xác!');
    }

    // Chuẩn hoá username thật của tài khoản để dùng cho các bước cập nhật bên dưới.
    $username = $user['username'];

    if ($username !== 'admin' && (int)$user['is_locked'] === 1) {
        sendJsonError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.', 403);
    }

    $now = date('Y-m-d H:i:s');
    $up = $pdo->prepare("UPDATE accounts SET last_active = ? WHERE username = ?");
    $up->execute([$now, $username]);

    sendJsonSuccess([
        'success' => true,
        'token' => $user['username'],
        'user' => [
            'username' => $user['username'],
            'fullName' => $user['full_name'],
            'id' => $user['user_id'],
            'balance' => (int)$user['balance'],
            'phone' => $user['phone'],
            'bankName' => $user['bank_name'],
            'accountNumber' => $user['account_number'],
            'accountHolder' => $user['account_holder'],
            'avatarUrl' => $user['avatar_url'],
            'referralCode' => $user['referral_code'],
            'accumulatedSupport' => (int)$user['accumulated_support'],
            'accumulatedInterest' => (int)$user['accumulated_interest'],
            'accumulatedWins' => (int)$user['accumulated_wins'],
            'accumulationCount' => (int)$user['accumulation_count'],
            'isLocked' => (bool)$user['is_locked']
        ]
    ]);
}

// Authentication barrier for remaining routes
$auth = requireAuth($pdo);
$username = $auth['username'];

if ($action === 'logout') {
    // Set active offline
    $oneMinAgo = date('Y-m-d H:i:s', time() - 60);
    $up = $pdo->prepare("UPDATE accounts SET last_active = ? WHERE username = ?");
    $up->execute([$oneMinAgo, $username]);
    sendJsonSuccess(['success' => true]);
}

if ($action === 'profile') {
    $user = $auth['profile'];

    // Fetch user bets
    $betsStmt = $pdo->prepare("SELECT * FROM bets WHERE username = ? ORDER BY timestamp DESC LIMIT 50");
    $betsStmt->execute([$username]);
    $bets = $betsStmt->fetchAll();

    $betsFormatted = [];
    foreach ($bets as $b) {
        $betsFormatted[] = [
            'id' => $b['id'],
            'room' => $b['room'],
            'period' => $b['period'],
            'choice' => $b['choice'],
            'amount' => (int)$b['amount'],
            'result' => $b['result'],
            'timestamp' => $b['timestamp'],
            'payout' => $b['payout'] ? (int)$b['payout'] : null
        ];
    }

    // Fetch user transactions
    $txStmt = $pdo->prepare("SELECT * FROM transactions WHERE username = ? ORDER BY timestamp DESC LIMIT 50");
    $txStmt->execute([$username]);
    $transactions = $txStmt->fetchAll();

    $txFormatted = [];
    foreach ($transactions as $t) {
        $txFormatted[] = [
            'id' => $t['id'],
            'type' => $t['type'],
            'amount' => (int)$t['amount'],
            'status' => $t['status'],
            'timestamp' => $t['timestamp'],
            'details' => $t['details']
        ];
    }

    sendJsonSuccess([
        'profile' => [
            'username' => $user['username'],
            'fullName' => $user['full_name'],
            'id' => $user['user_id'],
            'balance' => (int)$user['balance'],
            'phone' => $user['phone'],
            'bankName' => $user['bank_name'],
            'accountNumber' => $user['account_number'],
            'accountHolder' => $user['account_holder'],
            'avatarUrl' => $user['avatar_url'],
            'referralCode' => $user['referral_code'],
            'accumulatedSupport' => (int)$user['accumulated_support'],
            'accumulatedInterest' => (int)$user['accumulated_interest'],
            'accumulatedWins' => (int)$user['accumulated_wins'],
            'accumulationCount' => (int)$user['accumulation_count'],
            'isLocked' => (bool)$user['is_locked']
        ],
        'bets' => $betsFormatted,
        'transactions' => $txFormatted
    ]);
}

if ($action === 'change-password') {
    $oldPassword = isset($input['oldPassword']) ? trim($input['oldPassword']) : '';
    $newPassword = isset($input['newPassword']) ? trim($input['newPassword']) : '';

    if (empty($oldPassword) || empty($newPassword)) {
        sendJsonError('Vui lòng điền đầy đủ mật khẩu cũ và mới!');
    }

    $user = $auth['profile'];
    if ($user['password'] !== $oldPassword) {
        sendJsonError('Mật khẩu cũ không chính xác!');
    }

    $stmt = $pdo->prepare("UPDATE accounts SET password = ? WHERE username = ?");
    $stmt->execute([$newPassword, $username]);

    sendJsonSuccess(['success' => true, 'message' => 'Thay đổi mật khẩu thành công!']);
}

if ($action === 'link-bank' || $action === 'bank') {
    $bankName = isset($input['bankName']) ? trim($input['bankName']) : '';
    $accountNumber = isset($input['accountNumber']) ? trim($input['accountNumber']) : '';
    $accountHolder = isset($input['accountHolder']) ? trim(strtoupper($input['accountHolder'])) : '';

    if (empty($bankName) || empty($accountNumber) || empty($accountHolder)) {
        sendJsonError('Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng!');
    }

    $stmt = $pdo->prepare("UPDATE accounts SET bank_name = ?, account_number = ?, account_holder = ? WHERE username = ?");
    $stmt->execute([$bankName, $accountNumber, $accountHolder, $username]);

    // Fetch updated user
    $q = $pdo->prepare("SELECT * FROM accounts WHERE username = ?");
    $q->execute([$username]);
    $user = $q->fetch();

    sendJsonSuccess([
        'success' => true,
        'message' => 'Liên kết ngân hàng thành công!',
        'user' => [
            'username' => $user['username'],
            'fullName' => $user['full_name'],
            'id' => $user['user_id'],
            'balance' => (int)$user['balance'],
            'phone' => $user['phone'],
            'bankName' => $user['bank_name'],
            'accountNumber' => $user['account_number'],
            'accountHolder' => $user['account_holder'],
            'avatarUrl' => $user['avatar_url']
        ]
    ]);
}

if ($action === 'update-avatar' || $action === 'avatar') {
    $avatarUrl = isset($input['avatarUrl']) ? trim($input['avatarUrl']) : '';

    if (empty($avatarUrl)) {
        sendJsonError('Thiếu đường dẫn ảnh đại diện!');
    }

    $stmt = $pdo->prepare("UPDATE accounts SET avatar_url = ? WHERE username = ?");
    $stmt->execute([$avatarUrl, $username]);

    $q = $pdo->prepare("SELECT * FROM accounts WHERE username = ?");
    $q->execute([$username]);
    $user = $q->fetch();

    sendJsonSuccess([
        'success' => true,
        'message' => 'Cập nhật ảnh đại diện thành công!',
        'user' => [
            'username' => $user['username'],
            'fullName' => $user['full_name'],
            'id' => $user['user_id'],
            'balance' => (int)$user['balance'],
            'phone' => $user['phone'],
            'bankName' => $user['bank_name'],
            'accountNumber' => $user['account_number'],
            'accountHolder' => $user['account_holder'],
            'avatarUrl' => $user['avatar_url']
        ]
    ]);
}

sendJsonError('Hành động không hợp lệ');
?>
