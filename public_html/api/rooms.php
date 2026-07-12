<?php
require_once 'config.php';

$pdo = getDbConnection();
$clock = syncGameClock($pdo);

// Fetch public rooms
$roomsStmt = $pdo->query("SELECT * FROM rooms");
$rooms = $roomsStmt->fetchAll();

$roomsFormatted = [];
foreach ($rooms as $r) {
    $roomsFormatted[] = [
        'id' => $r['id'],
        'name' => $r['name'],
        'icon' => $r['icon'],
        'cycle' => (int)$r['cycle'],
        'currentCycle' => (int)$r['current_cycle'],
        'session' => $r['session']
    ];
}

// Fetch historical outcomes for periods (up to 5 for each room)
$historyFormatted = [];
foreach ($rooms as $r) {
    $roomName = $r['name'];
    $histStmt = $pdo->prepare("SELECT period, result FROM periods_history WHERE room = ? ORDER BY period DESC LIMIT 5");
    $histStmt->execute([$roomName]);
    $hist = $histStmt->fetchAll();
    
    $historyFormatted[$roomName] = $hist;
}

sendJsonSuccess([
    'rooms' => $roomsFormatted,
    'secondsRemaining' => $clock['secondsRemaining'],
    'periodsHistory' => $historyFormatted
]);
?>
