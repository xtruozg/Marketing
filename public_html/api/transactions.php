<?php
require_once 'config.php';

$pdo = getDbConnection();
syncGameClock($pdo);

$auth = requireAuth($pdo);
$username = $auth['username'];
$user = $auth['profile'];

$action = isset($_GET['action']) ? $_GET['action'] : '';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

if ($action === 'deposit') {
    $amount = isset($input['amount']) ? (int)$input['amount'] : 0;

    if ($amount <= 0) {
        sendJsonError('Số tiền nạp không hợp lệ!');
    }

    $txId = 'TX' . rand(1000, 9999);
    $now = date('Y-m-d H:i:s');

    $stmt = $pdo->prepare("INSERT INTO transactions (id, type, amount, status, timestamp, details, username, full_name) VALUES (?, 'Nạp tiền', ?, 'Đang xử lý', ?, 'Nạp tiền vào tài khoản', ?, ?)");
    $stmt->execute([
        $txId,
        $amount,
        $now,
        $username,
        $user['full_name']
    ]);

    // Báo cho hộp thư quản trị về yêu cầu nạp mới
    pushNotification($pdo, 'admin', 'admin', $username, 'request', 'Yêu cầu nạp tiền mới',
        'Khách hàng @' . $username . ' (' . $user['full_name'] . ') gửi yêu cầu nạp ' . number_format($amount, 0, ',', '.') . ' đ.');

    sendJsonSuccess([
        'success' => true,
        'message' => 'Yêu cầu nạp tiền đã được gửi. Vui lòng đợi phê duyệt!',
        'transaction' => [
            'id' => $txId,
            'type' => 'Nạp tiền',
            'amount' => $amount,
            'status' => 'Đang xử lý',
            'timestamp' => $now,
            'details' => 'Nạp tiền vào tài khoản'
        ]
    ]);
}

if ($action === 'withdraw') {
    $amount = isset($input['amount']) ? (int)$input['amount'] : 0;

    if ($amount <= 0) {
        sendJsonError('Số tiền rút không hợp lệ!');
    }

    if (empty($user['bank_name']) || empty($user['account_number'])) {
        sendJsonError('Vui lòng liên kết tài khoản ngân hàng trước khi rút tiền!');
    }

    if ($amount < 100000) {
        sendJsonError('Mức rút tiền tối thiểu là 100,000 đ.');
    }

    if ($user['balance'] < $amount) {
        sendJsonError('Số dư quý khách không đủ để thực hiện giao dịch này.');
    }

    $txId = 'TX' . rand(1000, 9999);
    $now = date('Y-m-d H:i:s');
    $details = "Rút tiền về " . $user['bank_name'] . " (" . $user['account_number'] . ")";

    // Begin Database Transaction
    $pdo->beginTransaction();
    try {
        // Deduct balance upfront
        $up = $pdo->prepare("UPDATE accounts SET balance = balance - ? WHERE username = ?");
        $up->execute([$amount, $username]);

        $ins = $pdo->prepare("INSERT INTO transactions (id, type, amount, status, timestamp, details, username, full_name) VALUES (?, 'Rút tiền', ?, 'Đang xử lý', ?, ?, ?, ?)");
        $ins->execute([
            $txId,
            $amount,
            $now,
            $details,
            $username,
            $user['full_name']
        ]);

        $pdo->commit();

        // Báo cho hộp thư quản trị về yêu cầu rút mới
        pushNotification($pdo, 'admin', 'admin', $username, 'request', 'Yêu cầu rút tiền mới',
            'Khách hàng @' . $username . ' (' . $user['full_name'] . ') gửi yêu cầu rút ' . number_format($amount, 0, ',', '.') . ' đ về ' . $user['bank_name'] . '.');

        sendJsonSuccess([
            'success' => true,
            'message' => 'Yêu cầu rút tiền đã gửi thành công! Số tiền tạm thời được khấu trừ.',
            'balance' => $user['balance'] - $amount,
            'transaction' => [
                'id' => $txId,
                'type' => 'Rút tiền',
                'amount' => $amount,
                'status' => 'Đang xử lý',
                'timestamp' => $now,
                'details' => $details
            ]
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        sendJsonError('Lỗi gửi yêu cầu rút tiền: ' . $e->getMessage());
    }
}

sendJsonError('Hành động không hợp lệ');
?>
