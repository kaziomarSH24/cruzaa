<?php
require 'backend/config/Database.php';
$db = (new Database())->getConnection();
$stmt = $db->query('SELECT setting_key, setting_value FROM settings');
$settings = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($settings);
