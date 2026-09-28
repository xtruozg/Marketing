<?php
require_once 'config.php';

$pdo = getDbConnection();
$clock = syncGameClock($pdo);

$auth = requireAuth($pdo);
requireAdmin($auth);

$action = isset($_GET['action']) ? $_GET['action'] : '';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

if ($action === 'users') {
    // Return all users, structured exactly as required by VT-SYS Admin context:
    // accounts: Record<string, { profile: UserProfile; password: string; bets: BetRecord[]; transactions: Transaction[] }>
    $stmt = $pdo->query("SELECT * FROM accounts ORDER BY username ASC");
    $users = $stmt->fetchAll();

    $accountsFormatted = [];
    foreach ($users as $u) {
        $uname = $u['username'];

        // Get user's bets
        $bStmt = $pdo->prepare("SELECT * FROM bets WHERE username = ? ORDER BY timestamp DESC LIMIT 100");
        $bStmt->execute([$uname]);
        $bets = $bStmt->fetchAll();

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

        // Get user's transactions
        $tStmt = $pdo->prepare("SELECT * FROM transactions WHERE username = ? ORDER BY timestamp DESC LIMIT 100");
        $tStmt->execute([$uname]);
        $trans = $tStmt->fetchAll();

        $transFormatted = [];
        foreach ($trans as $t) {
            $transFormatted[] = [
                'id' => $t['id'],
                'type' => $t['type'],
                'amount' => (int)$t['amount'],
                'status' => $t['status'],
                'timestamp' => $t['timestamp'],
                'details' => $t['details'],
                'username' => $t['username'],
                'fullName' => $t['full_name']
            ];
        }

        $accountsFormatted[$uname] = [
            'password' => $u['password'],
            'profile' => [
                'username' => $u['username'],
                'fullName' => $u['full_name'],
                'id' => $u['user_id'],
                'balance' => (int)$u['balance'],
                'phone' => $u['phone'],
                'bankName' => $u['bank_name'],
                'accountNumber' => $u['account_number'],
                'accountHolder' => $u['account_holder'],
                'avatarUrl' => $u['avatar_url'],
                'accumulatedSupport' => (int)$u['accumulated_support'],
                'accumulatedInterest' => (int)$u['accumulated_interest'],
                'accumulatedWins' => (int)$u['accumulated_wins'],
                'accumulationCount' => (int)$u['accumulation_count'],
                'isLocked' => (bool)$u['is_locked'],
                'lastActive' => $u['last_active']
            ],
            'bets' => $betsFormatted,
            'transactions' => $transFormatted
        ];
    }

    sendJsonSuccess(['accounts' => $accountsFormatted]);
}

if ($action === 'users-add') {
    $username = isset($input['username']) ? trim(strtolower($input['username'])) : '';
    $password = isset($input['password']) ? trim($input['password']) : '';
    $fullName = isset($input['fullName']) ? trim($input['fullName']) : '';
    $phone = isset($input['phone']) ? trim($input['phone']) : '';
    $bankName = isset($input['bankName']) ? trim($input['bankName']) : '';
    $accountNumber = isset($input['accountNumber']) ? trim($input['accountNumber']) : '';
    $accountHolder = isset($input['accountHolder']) ? trim(strtoupper($input['accountHolder'])) : '';
    $initialBalance = isset($input['initialBalance']) ? (int)$input['initialBalance'] : 0;
    if ($initialBalance < 0) $initialBalance = 0;

    if (empty($username)) {
        sendJsonError('Vui lòng nhập tên đăng nhập / số điện thoại!');
    }

    $chk = $pdo->prepare("SELECT username FROM accounts WHERE username = ?");
    $chk->execute([$username]);
    if ($chk->fetch()) {
        sendJsonError('Tài khoản này đã tồn tại trên hệ thống!');
    }

    if (empty($password)) $password = $username;
    if (empty($phone)) $phone = $username;
    $newId = (string)rand(1000, 9999);
    $now = date('Y-m-d H:i:s');

    $pdo->beginTransaction();
    try {
        $ins = $pdo->prepare("INSERT INTO accounts (username, password, full_name, phone, user_id, balance, bank_name, account_number, account_holder, accumulated_support, last_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $ins->execute([$username, $password, $fullName, $phone, $newId, $initialBalance, $bankName, $accountNumber, $accountHolder, $initialBalance, $now]);

        if ($initialBalance > 0) {
            $txId = 'TX' . rand(1000, 9999);
            $insTx = $pdo->prepare("INSERT INTO transactions (id, type, amount, status, timestamp, details, username, full_name) VALUES (?, 'Nạp tiền', ?, 'Thành công', ?, 'Quản trị viên tạo tài khoản kèm số dư khởi tạo', ?, ?)");
            $insTx->execute([$txId, $initialBalance, $now, $username, $fullName]);
        }

        $pdo->commit();
        sendJsonSuccess(['success' => true, 'message' => 'Đã tạo thành viên mới thành công!']);
    } catch (Exception $e) {
        $pdo->rollBack();
        sendJsonError('Lỗi tạo thành viên: ' . $e->getMessage());
    }
}

if ($action === 'users-update') {
    $targetUsername = isset($input['targetUsername']) ? trim($input['targetUsername']) : '';
    
    if (empty($targetUsername)) {
        sendJsonError('Thiếu tên tài khoản cần chỉnh sửa');
    }

    $fullName = isset($input['fullName']) ? trim($input['fullName']) : null;
    $phone = isset($input['phone']) ? trim($input['phone']) : null;
    $bankName = isset($input['bankName']) ? trim($input['bankName']) : null;
    $accountNumber = isset($input['accountNumber']) ? trim($input['accountNumber']) : null;
    $accountHolder = isset($input['accountHolder']) ? trim(strtoupper($input['accountHolder'])) : null;
    $accumulatedSupport = isset($input['accumulatedSupport']) ? (int)$input['accumulatedSupport'] : null;

    $fields = [];
    $params = [];

    if ($fullName !== null) { $fields[] = "full_name = ?"; $params[] = $fullName; }
    if ($phone !== null) { $fields[] = "phone = ?"; $params[] = $phone; }
    if ($bankName !== null) { $fields[] = "bank_name = ?"; $params[] = $bankName; }
    if ($accountNumber !== null) { $fields[] = "account_number = ?"; $params[] = $accountNumber; }
    if ($accountHolder !== null) { $fields[] = "account_holder = ?"; $params[] = $accountHolder; }
    if ($accumulatedSupport !== null) { $fields[] = "accumulated_support = ?"; $params[] = $accumulatedSupport; }

    if (empty($fields)) {
        sendJsonError('Không có thông tin nào để cập nhật');
    }

    $params[] = $targetUsername;
    $sql = "UPDATE accounts SET " . implode(", ", $fields) . " WHERE username = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    // Thông báo cho khách hàng: ưu tiên nêu rõ nếu doanh số thay đổi
    if ($accumulatedSupport !== null) {
        pushNotification($pdo, 'user', $targetUsername, 'admin', 'info',
            'Doanh số của bạn được cập nhật',
            'Quản trị viên đã cập nhật doanh số hỗ trợ tích lũy: ' . number_format($accumulatedSupport, 0, ',', '.') . ' đ.');
    } else {
        pushNotification($pdo, 'user', $targetUsername, 'admin', 'info',
            'Thông tin tài khoản được cập nhật',
            'Quản trị viên vừa cập nhật thông tin hồ sơ tài khoản của bạn.');
    }

    sendJsonSuccess(['success' => true, 'message' => 'Cập nhật tài khoản thành công!']);
}

if ($action === 'users-lock') {
    $targetUsername = isset($input['targetUsername']) ? trim($input['targetUsername']) : '';
    $isLocked = isset($input['isLocked']) ? (int)$input['isLocked'] : 0;

    if (empty($targetUsername)) {
        sendJsonError('Thiếu tên tài khoản');
    }
    if ($targetUsername === 'admin') {
        sendJsonError('Không thể khóa tài khoản quản trị viên!');
    }

    $stmt = $pdo->prepare("UPDATE accounts SET is_locked = ? WHERE username = ?");
    $stmt->execute([$isLocked, $targetUsername]);

    pushNotification($pdo, 'user', $targetUsername, 'admin', 'info',
        $isLocked ? 'Tài khoản của bạn đã bị khóa' : 'Tài khoản của bạn đã được mở khóa',
        $isLocked
            ? 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.'
            : 'Tài khoản của bạn đã được mở khóa và có thể tiếp tục giao dịch bình thường.');

    $msg = $isLocked ? 'Đã khóa tài khoản thành công!' : 'Đã mở khóa tài khoản thành công!';
    sendJsonSuccess(['success' => true, 'message' => $msg]);
}

if ($action === 'users-change-password') {
    $targetUsername = isset($input['targetUsername']) ? trim($input['targetUsername']) : '';
    $newPassword = isset($input['newPassword']) ? trim($input['newPassword']) : '';

    if (empty($targetUsername) || empty($newPassword)) {
        sendJsonError('Vui lòng cung cấp đầy đủ thông tin!');
    }

    $stmt = $pdo->prepare("UPDATE accounts SET password = ? WHERE username = ?");
    $stmt->execute([$newPassword, $targetUsername]);

    sendJsonSuccess(['success' => true, 'message' => 'Đổi mật khẩu người dùng thành công!']);
}

if ($action === 'users-adjust-balance') {
    $targetUsername = isset($input['targetUsername']) ? trim($input['targetUsername']) : '';
    $type = isset($input['type']) ? trim($input['type']) : ''; // 'add' | 'deduct'
    $amount = isset($input['amount']) ? (int)$input['amount'] : 0;

    if (empty($targetUsername) || empty($type) || $amount <= 0) {
        sendJsonError('Thông tin điều chỉnh không hợp lệ!');
    }

    // Get user full name
    $uStmt = $pdo->prepare("SELECT full_name, balance FROM accounts WHERE username = ?");
    $uStmt->execute([$targetUsername]);
    $uRow = $uStmt->fetch();

    if (!$uRow) {
        sendJsonError('Không tìm thấy tài khoản');
    }

    $txId = 'TX' . rand(1000, 9999);
    $now = date('Y-m-d H:i:s');

    $pdo->beginTransaction();
    try {
        if ($type === 'add') {
            $up = $pdo->prepare("UPDATE accounts SET balance = balance + ?, accumulated_support = accumulated_support + ? WHERE username = ?");
            $up->execute([$amount, $amount, $targetUsername]);

            $ins = $pdo->prepare("INSERT INTO transactions (id, type, amount, status, timestamp, details, username, full_name) VALUES (?, 'Nạp tiền', ?, 'Thành công', ?, 'Quản trị viên nạp tiền trực tiếp', ?, ?)");
            $ins->execute([$txId, $amount, $now, $targetUsername, $uRow['full_name']]);
        } else {
            if ($uRow['balance'] < $amount) {
                sendJsonError('Số dư khả dụng không đủ để khấu trừ!');
            }
            $up = $pdo->prepare("UPDATE accounts SET balance = balance - ? WHERE username = ?");
            $up->execute([$amount, $targetUsername]);

            $ins = $pdo->prepare("INSERT INTO transactions (id, type, amount, status, timestamp, details, username, full_name) VALUES (?, 'Rút tiền', ?, 'Thành công', ?, 'Quản trị viên khấu trừ trực tiếp', ?, ?)");
            $ins->execute([$txId, $amount, $now, $targetUsername, $uRow['full_name']]);
        }

        $pdo->commit();

        $q = $pdo->prepare("SELECT balance FROM accounts WHERE username = ?");
        $q->execute([$targetUsername]);
        $newBalance = (int)$q->fetch()['balance'];

        // Thông báo cho khách hàng về thay đổi số dư
        $verb = $type === 'add' ? 'cộng' : 'trừ';
        pushNotification($pdo, 'user', $targetUsername, 'admin', 'balance',
            'Số dư của bạn vừa được cập nhật',
            "Quản trị viên đã {$verb} " . number_format($amount, 0, ',', '.') . " đ vào tài khoản. Số dư hiện tại: " . number_format($newBalance, 0, ',', '.') . " đ.");

        sendJsonSuccess(['success' => true, 'message' => 'Điều chỉnh số dư thành công!', 'balance' => $newBalance]);

    } catch (Exception $e) {
        $pdo->rollBack();
        sendJsonError('Lỗi điều chỉnh số dư: ' . $e->getMessage());
    }
}

if ($action === 'users-delete') {
    $targetUsername = isset($input['targetUsername']) ? trim($input['targetUsername']) : '';

    if (empty($targetUsername)) {
        sendJsonError('Thiếu thông tin người dùng!');
    }
    if ($targetUsername === 'admin') {
        sendJsonError('Không thể xóa tài khoản Admin!');
    }

    // Xóa kèm lịch sử giao dịch, cược và thông báo của user này. Các bảng này liên kết
    // theo username, nếu để lại thì user mới đăng ký trùng username sẽ nhận luôn lịch sử cũ.
    $pdo->beginTransaction();
    try {
        $pdo->prepare("DELETE FROM transactions WHERE username = ?")->execute([$targetUsername]);
        $pdo->prepare("DELETE FROM bets WHERE username = ?")->execute([$targetUsername]);
        $pdo->prepare("DELETE FROM notifications WHERE audience = 'user' AND username = ?")->execute([$targetUsername]);
        $pdo->prepare("DELETE FROM accounts WHERE username = ?")->execute([$targetUsername]);
        $pdo->commit();
    } catch (Exception $e) {
        $pdo->rollBack();
        sendJsonError('Lỗi xóa người dùng: ' . $e->getMessage());
    }

    sendJsonSuccess(['success' => true, 'message' => 'Đã xóa người dùng thành công!']);
}

if ($action === 'transactions') {
    // Return all transactions for administrative oversight
    $stmt = $pdo->query("SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 500");
    $trans = $stmt->fetchAll();

    $transFormatted = [];
    foreach ($trans as $t) {
        $transFormatted[] = [
            'id' => $t['id'],
            'type' => $t['type'],
            'amount' => (int)$t['amount'],
            'status' => $t['status'],
            'timestamp' => $t['timestamp'],
            'details' => $t['details'],
            'username' => $t['username'],
            'fullName' => $t['full_name']
        ];
    }

    sendJsonSuccess(['transactions' => $transFormatted]);
}

if ($action === 'transactions-approve') {
    $id = isset($input['id']) ? trim($input['id']) : '';

    if (empty($id)) {
        sendJsonError('Thiếu mã giao dịch');
    }

    // Fetch transaction details
    $stmt = $pdo->prepare("SELECT * FROM transactions WHERE id = ?");
    $stmt->execute([$id]);
    $tx = $stmt->fetch();

    if (!$tx) {
        sendJsonError('Không tìm thấy giao dịch!');
    }
    if ($tx['status'] !== 'Đang xử lý') {
        sendJsonError('Giao dịch này đã được phê duyệt hoặc từ chối trước đó!');
    }

    $pdo->beginTransaction();
    try {
        $username = $tx['username'];
        $amount = (int)$tx['amount'];

        // Approve transaction status
        $upTx = $pdo->prepare("UPDATE transactions SET status = 'Thành công' WHERE id = ?");
        $upTx->execute([$id]);

        if ($tx['type'] === 'Nạp tiền') {
            // Increase balance & accumulated_support for deposits
            $upAcc = $pdo->prepare("UPDATE accounts SET balance = balance + ?, accumulated_support = accumulated_support + ? WHERE username = ?");
            $upAcc->execute([$amount, $amount, $username]);
        }
        // Withdrawal balances were already deducted upfront when requested, so we just set transaction success!

        $pdo->commit();

        $msg = $tx['type'] === 'Nạp tiền'
            ? ('Yêu cầu nạp ' . number_format($amount, 0, ',', '.') . ' đ đã được duyệt và cộng vào số dư.')
            : ('Yêu cầu rút ' . number_format($amount, 0, ',', '.') . ' đ đã được duyệt thành công.');
        pushNotification($pdo, 'user', $username, 'admin', 'transaction', 'Giao dịch được duyệt', $msg);

        sendJsonSuccess(['success' => true, 'message' => 'Đã duyệt yêu cầu thành công!']);

    } catch (Exception $e) {
        $pdo->rollBack();
        sendJsonError('Lỗi duyệt giao dịch: ' . $e->getMessage());
    }
}

if ($action === 'transactions-reject') {
    $id = isset($input['id']) ? trim($input['id']) : '';

    if (empty($id)) {
        sendJsonError('Thiếu mã giao dịch');
    }

    // Fetch transaction details
    $stmt = $pdo->prepare("SELECT * FROM transactions WHERE id = ?");
    $stmt->execute([$id]);
    $tx = $stmt->fetch();

    if (!$tx) {
        sendJsonError('Không tìm thấy giao dịch!');
    }
    if ($tx['status'] !== 'Đang xử lý') {
        sendJsonError('Giao dịch này đã được xử lý trước đó!');
    }

    $pdo->beginTransaction();
    try {
        $username = $tx['username'];
        $amount = (int)$tx['amount'];

        // Reject transaction status
        $upTx = $pdo->prepare("UPDATE transactions SET status = 'Từ chối' WHERE id = ?");
        $upTx->execute([$id]);

        if ($tx['type'] === 'Rút tiền') {
            // Refund withdrawn balance to main account
            $upAcc = $pdo->prepare("UPDATE accounts SET balance = balance + ? WHERE username = ?");
            $upAcc->execute([$amount, $username]);
        }

        $pdo->commit();

        $msg = $tx['type'] === 'Rút tiền'
            ? ('Yêu cầu rút ' . number_format($amount, 0, ',', '.') . ' đ bị từ chối. Số tiền đã được hoàn lại số dư.')
            : ('Yêu cầu ' . $tx['type'] . ' ' . number_format($amount, 0, ',', '.') . ' đ đã bị từ chối.');
        pushNotification($pdo, 'user', $username, 'admin', 'transaction', 'Giao dịch bị từ chối', $msg);

        sendJsonSuccess(['success' => true, 'message' => 'Đã từ chối giao dịch thành công!']);

    } catch (Exception $e) {
        $pdo->rollBack();
        sendJsonError('Lỗi từ chối giao dịch: ' . $e->getMessage());
    }
}

if ($action === 'rooms-add') {
    $name = isset($input['name']) ? trim($input['name']) : '';
    $cycle = isset($input['cycle']) ? (int)$input['cycle'] : 45;
    $icon = isset($input['icon']) ? trim($input['icon']) : 'smart_display';

    if (empty($name)) {
        sendJsonError('Thiếu tên phòng chơi!');
    }

    // Check unique name
    $stmt = $pdo->prepare("SELECT id FROM rooms WHERE LOWER(name) = ?");
    $stmt->execute([strtolower($name)]);
    if ($stmt->fetch()) {
        sendJsonError('Tên phòng chơi đã tồn tại!');
    }

    $newId = '#' . rand(10, 99);
    $session = generatePeriodNumber($name);

    $pdo->beginTransaction();
    try {
        // Create Room
        $ins = $pdo->prepare("INSERT INTO rooms (id, name, icon, cycle, current_cycle, session) VALUES (?, ?, ?, ?, ?, ?)");
        $ins->execute([$newId, $name, $icon, $cycle, $cycle, $session]);

        // Create Default Forced Outcome entry
        $insF = $pdo->prepare("INSERT INTO forced_results (room, choice) VALUES (?, NULL)");
        $insF->execute([$name]);

        // Seed default 5 results history
        $times = [-45, -90, -135, -180, -225];
        $results = ['Tăng doanh số', 'Quảng bá sản phẩm', 'Tăng tương tác', 'Thu hút đầu tư', 'Tăng doanh số'];
        $insH = $pdo->prepare("INSERT INTO periods_history (room, period, result) VALUES (?, ?, ?)");

        for ($i = 0; $i < 5; $i++) {
            $pastPeriod = generatePeriodNumber($name, $times[$i]);
            $insH->execute([$name, $pastPeriod, $results[$i]]);
        }

        $pdo->commit();
        sendJsonSuccess(['success' => true, 'message' => 'Tạo phòng chơi mới thành công!']);

    } catch (Exception $e) {
        $pdo->rollBack();
        sendJsonError('Lỗi tạo phòng chơi: ' . $e->getMessage());
    }
}

if ($action === 'rooms-update') {
    $id = isset($_GET['id']) ? trim($_GET['id']) : '';
    $name = isset($input['name']) ? trim($input['name']) : '';
    $cycle = isset($input['cycle']) ? (int)$input['cycle'] : null;
    $icon = isset($input['icon']) ? trim($input['icon']) : '';

    if (empty($id)) {
        sendJsonError('Thiếu ID phòng chơi');
    }

    // Fetch original room
    $stmt = $pdo->prepare("SELECT * FROM rooms WHERE id = ?");
    $stmt->execute([$id]);
    $room = $stmt->fetch();

    if (!$room) {
        sendJsonError('Không tìm thấy phòng chơi');
    }

    $oldName = $room['name'];
    $fields = [];
    $params = [];

    if (!empty($name) && $name !== $oldName) {
        // Check unique
        $chk = $pdo->prepare("SELECT id FROM rooms WHERE LOWER(name) = ? AND id != ?");
        $chk->execute([strtolower($name), $id]);
        if ($chk->fetch()) {
            sendJsonError('Tên phòng chơi này đã được sử dụng!');
        }

        $fields[] = "name = ?";
        $params[] = $name;

        // Begin transaction to safely rename associated history keys
        $pdo->beginTransaction();
        try {
            // Update history room keys
            $upH = $pdo->prepare("UPDATE periods_history SET room = ? WHERE room = ?");
            $upH->execute([$name, $oldName]);

            // Update bets keys
            $upB = $pdo->prepare("UPDATE bets SET room = ? WHERE room = ?");
            $upB->execute([$name, $oldName]);

            // Create new force results entry and delete old
            $insF = $pdo->prepare("INSERT INTO forced_results (room, choice) SELECT ?, choice FROM forced_results WHERE room = ?");
            $insF->execute([$name, $oldName]);
            
            $delF = $pdo->prepare("DELETE FROM forced_results WHERE room = ?");
            $delF->execute([$oldName]);

            $pdo->commit();
        } catch (Exception $e) {
            $pdo->rollBack();
            sendJsonError('Lỗi chuyển tên phòng chơi: ' . $e->getMessage());
        }
    }

    if ($cycle !== null) { $fields[] = "cycle = ?, current_cycle = ?"; $params[] = $cycle; $params[] = $cycle; }
    if (!empty($icon)) { $fields[] = "icon = ?"; $params[] = $icon; }

    if (!empty($fields)) {
        $params[] = $id;
        $sql = "UPDATE rooms SET " . implode(", ", $fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }

    sendJsonSuccess(['success' => true, 'message' => 'Cập nhật phòng chơi thành công!']);
}

if ($action === 'rooms-delete') {
    $id = isset($_GET['id']) ? trim($_GET['id']) : '';

    if (empty($id)) {
        sendJsonError('Thiếu ID phòng chơi');
    }

    $stmt = $pdo->prepare("SELECT name FROM rooms WHERE id = ?");
    $stmt->execute([$id]);
    $room = $stmt->fetch();

    if (!$room) {
        sendJsonError('Không tìm thấy phòng chơi');
    }

    $name = $room['name'];

    $pdo->beginTransaction();
    try {
        $pdo->prepare("DELETE FROM rooms WHERE id = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM forced_results WHERE room = ?")->execute([$name]);
        $pdo->prepare("DELETE FROM periods_history WHERE room = ?")->execute([$name]);

        $pdo->commit();
        sendJsonSuccess(['success' => true, 'message' => 'Xóa phòng chơi thành công!']);

    } catch (Exception $e) {
        $pdo->rollBack();
        sendJsonError('Lỗi xóa phòng chơi: ' . $e->getMessage());
    }
}

if ($action === 'game-force-result') {
    $room = isset($input['room']) ? trim($input['room']) : '';
    $choice = isset($input['choice']) ? trim($input['choice']) : null; // can be NULL to clear

    if (empty($room)) {
        sendJsonError('Thiếu thông tin phòng chơi');
    }

    $stmt = $pdo->prepare("UPDATE forced_results SET choice = ? WHERE room = ?");
    $stmt->execute([$choice, $room]);

    $msg = $choice ? "Đã điều hướng kết quả kỳ tới tại phòng {$room} thành: {$choice}!" : "Đã hủy điều hướng kết quả tại phòng {$room} thành công.";
    sendJsonSuccess(['success' => true, 'message' => $msg]);
}

if ($action === 'game-forced-list') {
    // Trả về trạng thái can thiệp kết quả hiện tại của TẤT CẢ phòng chơi.
    // Dùng cho tab "Can Thiệp Kết Quả" bên admin để hiển thị lựa chọn đang đặt.
    $stmt = $pdo->query("SELECT room, choice FROM forced_results");
    $rows = $stmt->fetchAll();
    $forced = [];
    foreach ($rows as $r) {
        $forced[$r['room']] = $r['choice']; // null nếu đang để ngẫu nhiên
    }
    sendJsonSuccess(['forced' => $forced]);
}

if ($action === 'history-clear-bets') {
    // Delete all user bets and past rooms periods histories
    $pdo->exec("DELETE FROM bets");
    $pdo->exec("DELETE FROM periods_history");
    sendJsonSuccess(['success' => true, 'message' => 'Đã xóa toàn bộ lịch sử biểu quyết thành công!']);
}

if ($action === 'history-clear-transactions') {
    // Delete all transactions and reset accumulated deposit statistics on accounts
    $pdo->exec("DELETE FROM transactions");
    $pdo->exec("UPDATE accounts SET accumulated_support = 0");
    sendJsonSuccess(['success' => true, 'message' => 'Đã xóa sạch toàn bộ lịch sử nạp rút!']);
}

if ($action === 'simulation-deposit') {
    $targetUsername = isset($input['username']) ? trim($input['username']) : '';
    $amount = isset($input['amount']) ? (int)$input['amount'] : 0;
    $txCode = isset($input['txCode']) ? trim($input['txCode']) : '';
    $phone = isset($input['phone']) ? trim($input['phone']) : '';

    if (empty($targetUsername) || $amount <= 0 || empty($txCode)) {
        sendJsonError('Thông tin mô phỏng không hợp lệ!');
    }

    $stmt = $pdo->prepare("SELECT full_name FROM accounts WHERE username = ?");
    $stmt->execute([$targetUsername]);
    $uRow = $stmt->fetch();

    if (!$uRow) {
        sendJsonError('Không tìm thấy tài khoản người dùng!');
    }

    $now = date('Y-m-d H:i:s');
    $details = "Yêu cầu nạp tiền tự động (Code: {$txCode})";

    $ins = $pdo->prepare("INSERT INTO transactions (id, type, amount, status, timestamp, details, username, full_name) VALUES (?, 'Nạp tiền', ?, 'Đang xử lý', ?, ?, ?, ?)");
    $ins->execute([$txCode, $amount, $now, $details, $targetUsername, $uRow['full_name']]);

    sendJsonSuccess(['success' => true, 'message' => 'Mô phỏng gửi yêu cầu nạp tiền thành công!']);
}

if ($action === 'simulation-withdraw') {
    $targetUsername = isset($input['username']) ? trim($input['username']) : '';
    $amount = isset($input['amount']) ? (int)$input['amount'] : 0;
    $bankName = isset($input['bankName']) ? trim($input['bankName']) : '';
    $accountNumber = isset($input['accountNumber']) ? trim($input['accountNumber']) : '';
    $accountOwner = isset($input['accountOwner']) ? trim(strtoupper($input['accountOwner'])) : '';

    if (empty($targetUsername) || $amount <= 0 || empty($bankName) || empty($accountNumber)) {
        sendJsonError('Thông tin mô phỏng không hợp lệ!');
    }

    $stmt = $pdo->prepare("SELECT full_name, balance FROM accounts WHERE username = ?");
    $stmt->execute([$targetUsername]);
    $uRow = $stmt->fetch();

    if (!$uRow) {
        sendJsonError('Không tìm thấy tài khoản người dùng!');
    }

    if ($uRow['balance'] < $amount) {
        sendJsonError('Số dư tài khoản người dùng không đủ để mô phỏng rút tiền!');
    }

    $txId = 'TX' . rand(1000, 9999);
    $now = date('Y-m-d H:i:s');
    $details = "Mô phỏng rút tiền về {$bankName} ({$accountNumber})";

    $pdo->beginTransaction();
    try {
        $up = $pdo->prepare("UPDATE accounts SET balance = balance - ? WHERE username = ?");
        $up->execute([$amount, $targetUsername]);

        $ins = $pdo->prepare("INSERT INTO transactions (id, type, amount, status, timestamp, details, username, full_name) VALUES (?, 'Rút tiền', ?, 'Đang xử lý', ?, ?, ?, ?)");
        $ins->execute([$txId, $amount, $now, $details, $targetUsername, $uRow['full_name']]);

        $pdo->commit();
        sendJsonSuccess(['success' => true, 'message' => 'Mô phỏng gửi yêu cầu rút tiền thành công!']);

    } catch (Exception $e) {
        $pdo->rollBack();
        sendJsonError('Lỗi mô phỏng rút tiền: ' . $e->getMessage());
    }
}

sendJsonError('Hành động quản trị không hợp lệ');
?>
