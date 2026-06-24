<?php
require_once __DIR__ . '/config/database.php';
try {
    $db = (new Database())->getConnection();
    $stmt = $db->query("SHOW CREATE TABLE navigation_menu");
    $result = $stmt->fetch();
    echo $result['Create Table'];
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
