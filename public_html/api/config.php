<?php
// Central Configuration & Authoritative Game Logic for VT-SYS PHP MySQL Backend
// cPanel & PHP 7.4+ Compatible

// 1. Error Reporting (Turn off in production if desired, useful for debugging now)
ini_set('display_errors', 0);
error_reporting(E_ALL);

// 2. Start Secure Session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 3. MySQL Database Configuration
// Ưu tiên biến môi trường (dùng cho Docker/local test); fallback về giá trị sửa tay cho cPanel.
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_USER', getenv('DB_USER') ?: 'sukienvi3_viettien'); // cPanel database user
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : 'Gi2GXFD99tKH4h@');     // cPanel database password
define('DB_NAME', getenv('DB_NAME') ?: 'sukienvi3_viettien'); // cPanel database name

/**
 * Get PDO Database Connection
 */
function getDbConnection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        sendJsonError("Lỗi kết nối cơ sở dữ liệu: " . $e->getMessage(), 500);
    }
}

/**
 * Send Standard JSON Error Response
 */
function sendJsonError($message, $code = 400) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => $message]);
    exit;
}

/**
 * Send Standard JSON Success Response
 */
function sendJsonSuccess($data) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

/**
 * Generate Period Number (Authoritative format: YYYYMMDDHHMMSS)
 */
function generatePeriodNumber($roomName, $offsetSec = 0) {
    return date('YmdHis', time() + $offsetSec);
}

/**
 * Ghi một thông báo vào hộp thư (notifications).
 * $audience: 'user' (khách hàng) | 'admin' (hộp thư quản trị)
 * $username: tài khoản nhận ('admin' cho hộp thư quản trị)
 * Không ném lỗi ra ngoài để tránh làm hỏng hành động chính nếu bảng chưa tồn tại.
 */
function pushNotification($pdo, $audience, $username, $sender, $type, $title, $message = '') {
    try {
        $id = 'NT' . uniqid();
        $stmt = $pdo->prepare("INSERT INTO notifications (id, audience, username, sender, type, title, message, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)");
        $stmt->execute([$id, $audience, $username, $sender, $type, $title, $message, date('Y-m-d H:i:s')]);
        return $id;
    } catch (Exception $e) {
        return null;
    }
}

/**
 * Parse Bearer Authentication Header
 */
function requireAuth($pdo) {
    $headers = getallheaders();
    $authHeader = null;
    
    // Check capitalization variations of headers
    foreach ($headers as $key => $val) {
        if (strcasecmp($key, 'Authorization') === 0) {
            $authHeader = $val;
            break;
        }
    }

    if (!$authHeader || strpos($authHeader, 'Bearer ') !== 0) {
        sendJsonError('Chưa đăng nhập hoặc token không hợp lệ', 401);
    }

    $username = substr($authHeader, 7);
    if (empty($username)) {
        sendJsonError('Token không hợp lệ', 401);
    }

    // Fetch user profile
    $stmt = $pdo->prepare("SELECT * FROM accounts WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user) {
        sendJsonError('Tài khoản không tồn tại', 401);
    }

    if ($username !== 'admin' && (int)$user['is_locked'] === 1) {
        sendJsonError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.', 403);
    }

    // Update activity status occasionally
    $now = date('Y-m-d H:i:s');
    if (empty($user['last_active']) || (time() - strtotime($user['last_active']) > 15)) {
        $up = $pdo->prepare("UPDATE accounts SET last_active = ? WHERE username = ?");
        $up->execute([$now, $username]);
    }

    return [
        'username' => $user['username'],
        'role' => $user['username'] === 'admin' ? 'admin' : 'user',
        'profile' => $user
    ];
}

/**
 * Require Admin Access
 */
function requireAdmin($auth) {
    if ($auth['role'] !== 'admin') {
        sendJsonError('Quyền truy cập bị từ chối. Chỉ dành cho Admin.', 403);
    }
}

/**
 * Authoritative Game Clock Synchronizer and Bet Resolver
 * This runs on EVERY API request to keep rooms ticking completely dynamically!
 */
function syncGameClock($pdo) {
    try {
        // Fetch current clock parameters
        $stmt = $pdo->prepare("SELECT setting_value FROM system_settings WHERE setting_key = ?");
        
        $stmt->execute(['seconds_remaining']);
        $secRow = $stmt->fetch();
        $secondsRemaining = $secRow ? (int)$secRow['setting_value'] : 39;

        $stmt->execute(['last_updated_time']);
        $lastRow = $stmt->fetch();
        $lastUpdatedTime = $lastRow ? (int)$lastRow['setting_value'] : time();

        $now = time();
        $elapsed = $now - $lastUpdatedTime;

        if ($elapsed <= 0) {
            return [
                'secondsRemaining' => $secondsRemaining
            ];
        }

        // Ticking logic
        $secondsRemaining -= $elapsed;

        $categories = [
            'Tăng tương tác',
            'Tăng doanh số',
            'Quảng bá sản phẩm',
            'Thu hút đầu tư'
        ];

        // Did we cross the 0 boundary? (Resolution occurred)
        while ($secondsRemaining <= 0) {
            // Resolution cycle
            // 1. Reset clock (40-second interval: 39 down to 0)
            $secondsRemaining += 40; 

            // 2. Resolve bets for each room
            $roomsStmt = $pdo->query("SELECT * FROM rooms");
            $rooms = $roomsStmt->fetchAll();

            foreach ($rooms as $room) {
                $roomName = $room['name'];
                $activePeriod = $room['session'];

                // Get forced result if set
                $forcedStmt = $pdo->prepare("SELECT choice FROM forced_results WHERE room = ?");
                $forcedStmt->execute([$roomName]);
                $forceRow = $forcedStmt->fetch();
                $winningCategory = $forceRow ? $forceRow['choice'] : null;

                // If no forced, search if anyone placed winning bets resolved (to maintain consistency with notices)
                if (empty($winningCategory)) {
                    $winBetStmt = $pdo->prepare("SELECT choice FROM bets WHERE room = ? AND period = ? AND result = 'Thắng' LIMIT 1");
                    $winBetStmt->execute([$roomName, $activePeriod]);
                    $winBetRow = $winBetStmt->fetch();
                    if ($winBetRow) {
                        $winningCategory = $winBetRow['choice'];
                    }
                }

                // Default fallback is random choice
                if (empty($winningCategory)) {
                    $winningCategory = $categories[array_rand($categories)];
                }

                // 3. Save period history entry
                $histCheck = $pdo->prepare("SELECT id FROM periods_history WHERE room = ? AND period = ?");
                $histCheck->execute([$roomName, $activePeriod]);
                if (!$histCheck->fetch()) {
                    $insHist = $pdo->prepare("INSERT INTO periods_history (room, period, result) VALUES (?, ?, ?)");
                    $insHist->execute([$roomName, $activePeriod, $winningCategory]);
                }

                // 4. Resolve pending bets
                $betsStmt = $pdo->prepare("SELECT * FROM bets WHERE room = ? AND period = ? AND result = 'Chờ kết quả'");
                $betsStmt->execute([$roomName, $activePeriod]);
                $pendingBets = $betsStmt->fetchAll();

                // Group payout increases per user
                $userPayouts = [];
                $userWins = [];

                foreach ($pendingBets as $bet) {
                    $uname = $bet['username'];
                    $isWin = ($bet['choice'] === $winningCategory);
                    $outcome = $isWin ? 'Thắng' : 'Thua';
                    $payout = $isWin ? (int)floor($bet['amount'] * 1.3) : 0;

                    // Update individual bet
                    $upBet = $pdo->prepare("UPDATE bets SET result = ?, payout = ? WHERE id = ?");
                    $upBet->execute([$outcome, $payout ? $payout : null, $bet['id']]);

                    if ($isWin) {
                        if (!isset($userPayouts[$uname])) {
                            $userPayouts[$uname] = 0;
                            $userWins[$uname] = 0;
                        }
                        $userPayouts[$uname] += $payout;
                        $userWins[$uname] += 1;
                    }
                }

                // Apply payouts to accounts and log transactions
                foreach ($userPayouts as $uname => $balanceIncrease) {
                    if ($balanceIncrease > 0) {
                        // Create transaction
                        $txId = 'TX' . rand(1000, 9999);
                        $timestamp = date('Y-m-d H:i:s');
                        $details = "Thắng phòng {$roomName} kỳ {$activePeriod} ({$winningCategory})";

                        // Get full name
                        $uStmt = $pdo->prepare("SELECT full_name FROM accounts WHERE username = ?");
                        $uStmt->execute([$uname]);
                        $uRow = $uStmt->fetch();
                        $fullName = $uRow ? $uRow['full_name'] : 'Khách hàng';

                        $insTx = $pdo->prepare("INSERT INTO transactions (id, type, amount, status, timestamp, details, username, full_name) VALUES (?, 'Tiền thắng cược', ?, 'Thành công', ?, ?, ?, ?)");
                        $insTx->execute([$txId, $balanceIncrease, $timestamp, $details, $uname, $fullName]);

                        // Update account balance
                        $upAcc = $pdo->prepare("UPDATE accounts SET balance = balance + ?, accumulated_wins = accumulated_wins + ?, accumulation_count = accumulation_count + ? WHERE username = ?");
                        $upAcc->execute([$balanceIncrease, $balanceIncrease, $userWins[$uname], $uname]);
                    }
                }

                // 5. Reset forced result
                $clearForced = $pdo->prepare("UPDATE forced_results SET choice = NULL WHERE room = ?");
                $clearForced->execute([$roomName]);

                // 6. Generate next period session
                $nextPeriod = generatePeriodNumber($roomName, 45);
                $upRoom = $pdo->prepare("UPDATE rooms SET session = ? WHERE id = ?");
                $upRoom->execute([$nextPeriod, $room['id']]);
            }
        }

        // Keep seconds remaining in bounds
        if ($secondsRemaining > 39) $secondsRemaining = 39;
        if ($secondsRemaining < 0) $secondsRemaining = 39;

        // Save back system settings
        $upSettings = $pdo->prepare("UPDATE system_settings SET setting_value = ? WHERE setting_key = ?");
        $upSettings->execute([$secondsRemaining, 'seconds_remaining']);
        $upSettings->execute([$now, 'last_updated_time']);

        return [
            'secondsRemaining' => $secondsRemaining
        ];

    } catch (Exception $e) {
        // Return fallback if database lock errors occur during parallel requests
        return [
            'secondsRemaining' => 39
        ];
    }
}
?>
