<?php
$db = new PDO('mysql:host=localhost;dbname=cruzaa_admin', 'root', '');
$stmt = $db->query("SELECT * FROM navigation WHERE position = 'header' ORDER BY order_index ASC");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
