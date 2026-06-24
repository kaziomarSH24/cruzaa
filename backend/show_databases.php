<?php
try {
    $db = new PDO('mysql:host=localhost', 'root', '');
    $stmt = $db->query("SHOW DATABASES");
    $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);
    print_r($databases);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
