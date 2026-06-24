<?php
$db = new PDO('mysql:host=localhost;dbname=cruzaa_admin', 'root', '');
$stmt = $db->query('DESCRIBE navigation_menu');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
