<?php
require_once 'config.php';

$pdo = getDbConnection();
$clock = syncGameClock($pdo);

$auth = requireAuth($pdo);
$username = $auth['username'];
$user = $auth['profile'];

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$room = isset($input['room']) ? trim($input['room']) : '';
$choice = isset($input['choice']) ? trim($input['choice']) : '';
$amount = isset($input['amount']) ? (int)$input['amount'] : 0;
$bets = isset($input['bets']) ? $input['bets'] : null;

// Enforce wait block (last 3 seconds before next period release)
if ($clock['secondsRemaining'] <= 3) {
    sendJsonError('Thời gian đăng ký kỳ này đã kết thúc. Vui lòng đợi kỳ tiếp theo!');
}

// Fetch active room details
$roomStmt = $pdo->prepare("SELECT * FROM rooms WHERE name = ?");
$roomStmt->execute([$room]);
$targetRoom = $roomStmt->fetch();

if (!$targetRoom) {
    sendJsonError('Phòng chơi không tồn tại!');
}

$betsToPlace = [];

if (is_array($bets)) {
    // Multi-bets format
    foreach ($bets as $b) {
        $betsToPlace[] = [
            'choice' => trim($b['choice']),
            'amount' => (int)$b['amount']
        ];
    }
} else if (!empty($choice) && $amount > 0) {
    // Single bet fallback format
    $betsToPlace[] = [
        'choice' => $choice,
        'amount' => $amount
    ];
}

if (empty($betsToPlace)) {
    sendJsonError('Thông tin đặt cược không hợp lệ!');
}

// Validate individual categories & values
$validCategories = ['Tăng tương tác', 'Tăng doanh số', 'Quảng bá sản phẩm', 'Thu hút đầu tư'];
$totalRequired = 0;

foreach ($betsToPlace as $b) {
    if (!in_array($b['choice'], $validCategories)) {
        sendJsonError('Hạng mục biểu quyết không hợp lệ: ' . $b['choice']);
    }
    if ($b['amount'] <= 0) {
        sendJsonError('Số tiền đăng ký không hợp lệ!');
    }
    $totalRequired += $b['amount'];
}

if ($user['balance'] < $totalRequired) {
    sendJsonError('Số dư tài khoản không đủ để thực hiện giao dịch này!');
}

$activePeriod = $targetRoom['session'];
$placedBets = [];
$now = date('Y-m-d H:i:s');

// Begin Database Transaction to safely lock values
$pdo->beginTransaction();
try {
    // Deduct user balance upfront
    $upAcc = $pdo->prepare("UPDATE accounts SET balance = balance - ? WHERE username = ?");
    $upAcc->execute([$totalRequired, $username]);

    foreach ($betsToPlace as $b) {
        $betId = 'B-' . rand(100000, 999999);
        
        $insBet = $pdo->prepare("INSERT INTO bets (id, room, period, choice, amount, result, timestamp, username) VALUES (?, ?, ?, ?, ?, 'Chờ kết quả', ?, ?)");
        $insBet->execute([
            $betId,
            $room,
            $activePeriod,
            $b['choice'],
            $b['amount'],
            $now,
            $username
        ]);

        $placedBets[] = [
            'id' => $betId,
            'room' => $room,
            'period' => $activePeriod,
            'choice' => $b['choice'],
            'amount' => $b['amount'],
            'result' => 'Chờ kết quả',
            'timestamp' => $now
        ];
    }

    $pdo->commit();

    // Fetch updated balance
    $q = $pdo->prepare("SELECT balance FROM accounts WHERE username = ?");
    $q->execute([$username]);
    $newBalance = (int)$q->fetch()['balance'];

    sendJsonSuccess([
        'success' => true,
        'message' => 'Đăng ký phân bổ sự kiện thành công!',
        'balance' => $newBalance,
        'bets' => $placedBets,
        'bet' => $placedBets[0] // fallback compat
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    sendJsonError('Lỗi xử lý đặt cược: ' . $e->getMessage());
}
?>
