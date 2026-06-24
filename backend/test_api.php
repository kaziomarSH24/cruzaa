<?php
header('Content-Type: application/json');
require_once 'config/config.php';
require_once 'config/database.php';

try {
    $db = (new Database())->getConnection();
    $stmt = $db->query("SELECT COUNT(*) as count FROM dynamic_content");
    $rowCount = $stmt->fetch()['count'];

    $stmt = $db->query("SELECT COUNT(*) as count FROM dynamic_content WHERE is_active = 1");
    $activeCount = $stmt->fetch()['count'];

    echo json_encode([
        'status' => 'ok',
        'total_blocks' => $rowCount,
        'active_blocks' => $activeCount,
        'path' => __DIR__
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
