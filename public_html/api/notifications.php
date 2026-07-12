<?php
/**
 * Hệ thống thông báo 2 chiều (admin <-> khách hàng).
 * - Khách hàng: xem hộp thư của mình, đánh dấu đã đọc, gửi yêu cầu tới admin.
 * - Admin: xem hộp thư quản trị (audience='admin'), đánh dấu đã đọc, gửi tin cho 1 khách hàng.
 */
require_once 'config.php';

$pdo = getDbConnection();

$auth = requireAuth($pdo);
$username = $auth['username'];
$role = $auth['role']; // 'admin' | 'user'

$action = isset($_GET['action']) ? $_GET['action'] : '';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

// Hộp thư của người đang đăng nhập
$inboxAudience = $role === 'admin' ? 'admin' : 'user';
$inboxUser = $role === 'admin' ? 'admin' : $username;

if ($action === 'list') {
    $stmt = $pdo->prepare("SELECT * FROM notifications WHERE audience = ? AND username = ? ORDER BY created_at DESC LIMIT 100");
    $stmt->execute([$inboxAudience, $inboxUser]);
    $rows = $stmt->fetchAll();

    $items = [];
    $unread = 0;
    foreach ($rows as $r) {
        $isRead = (int)$r['is_read'];
        if (!$isRead) {
            $unread++;
        }
        $items[] = [
            'id' => $r['id'],
            'type' => $r['type'],
            'title' => $r['title'],
            'message' => $r['message'],
            'sender' => $r['sender'],
            'isRead' => (bool)$isRead,
            'createdAt' => $r['created_at'],
        ];
    }

    sendJsonSuccess(['notifications' => $items, 'unreadCount' => $unread]);
}

if ($action === 'read') {
    $id = isset($input['id']) ? trim($input['id']) : '';
    $all = isset($input['all']) ? (bool)$input['all'] : false;

    if ($all || $id === '') {
        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE audience = ? AND username = ?");
        $stmt->execute([$inboxAudience, $inboxUser]);
    } else {
        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND audience = ? AND username = ?");
        $stmt->execute([$id, $inboxAudience, $inboxUser]);
    }

    sendJsonSuccess(['success' => true]);
}

if ($action === 'send') {
    $title = isset($input['title']) ? trim($input['title']) : '';
    $message = isset($input['message']) ? trim($input['message']) : '';

    if ($title === '' && $message === '') {
        sendJsonError('Vui lòng nhập nội dung thông báo!');
    }

    if ($role === 'admin') {
        // Admin gửi cho 1 khách hàng cụ thể
        $target = isset($input['targetUsername']) ? trim($input['targetUsername']) : '';
        if ($target === '') {
            sendJsonError('Thiếu tài khoản người nhận!');
        }
        $chk = $pdo->prepare("SELECT username FROM accounts WHERE username = ?");
        $chk->execute([$target]);
        if (!$chk->fetch()) {
            sendJsonError('Không tìm thấy tài khoản người nhận!');
        }
        pushNotification($pdo, 'user', $target, 'admin', 'message', $title !== '' ? $title : 'Thông báo từ quản trị viên', $message);
        sendJsonSuccess(['success' => true, 'message' => 'Đã gửi thông báo tới khách hàng!']);
    } else {
        // Khách hàng gửi yêu cầu / tin nhắn tới admin
        pushNotification($pdo, 'admin', 'admin', $username, 'request', $title !== '' ? $title : ('Yêu cầu từ @' . $username), $message);
        sendJsonSuccess(['success' => true, 'message' => 'Đã gửi yêu cầu tới quản trị viên!']);
    }
}

sendJsonError('Hành động thông báo không hợp lệ');
?>
