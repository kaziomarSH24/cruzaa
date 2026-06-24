<?php
require_once __DIR__ . '/config/database.php';
$db = (new Database())->getConnection();
$stmt = $db->prepare("SELECT content_value FROM dynamic_content WHERE content_key = 'homepage_slider'");
$stmt->execute();
$val = $stmt->fetchColumn();
echo "Value: " . $val . "\n";
echo "Type: " . gettype($val) . "\n";
