<?php
$db = new PDO('mysql:host=localhost;dbname=cruzaa_admin', 'root', '');
$stmt = $db->query("SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 20");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
