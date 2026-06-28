<?php
$db = new PDO('mysql:host=localhost;dbname=cruzaa_admin', 'root', '');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$categories = [
    ['id' => 3, 'name' => 'E-SCOOTERS', 'slug' => 'e-scooters'],
    ['id' => 5, 'name' => 'E-BIKES', 'slug' => 'e-byke'],
    ['id' => 6, 'name' => 'The Official Cruzaa Limited Edition EScooters', 'slug' => 'cruzaa-scoota']
];

$stmt = $db->prepare("UPDATE categories SET name = ?, slug = ? WHERE id = ?");

foreach ($categories as $cat) {
    $stmt->execute([$cat['name'], $cat['slug'], $cat['id']]);
}

echo "Categories updated with new slugs and names.\n";
