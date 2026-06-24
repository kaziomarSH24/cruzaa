<?php
$db = new PDO('mysql:host=localhost;dbname=cruzaa_admin', 'root', '');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$products = [
    [
        'id' => 10,
        'name' => 'Cruzaa E-Scooter Pro Carbon Black – with Built-in Speakers & Bluetooth',
        'slug' => 'the-cruzaa-e-scooter-pro-carbon-black-sale'
    ],
    [
        'id' => 11,
        'name' => 'Cruzaa E-Scooter Pro Racing White – with Built-in Speakers & Bluetooth',
        'slug' => 'the-cruzaa-e-scooter-pro-racing-white-sale'
    ]
];

$price = 1699.00;
$sale_price = 1399.99;
$description = "Move your own way and let the Cruzaa PRO Electric Scooter do all the hard work for you. The PRO Cruzaa sit-down Electric Scooter is a faster and exclusive lifestyle premium scooter under the Cruzaa product family range. The PRO Cruzaa is 100% electric with a unique foldable slick frame design, making every day social and transport an effortless pleasure, with an impressive range up to 35 miles, reaching a top speed of 22 mph, and comes with a smart xenon large LED Screen Display. The PRO Cruzaa is so unique, it has an extensive range of built-in features, such as built-in speakers with Bluetooth enabled to stream music, the battery is detachable for portable charging and the scooter has a built-in USB port to charge devices such as a mobile phone. The beauty of the detachable battery is for portable charging and to swap over if needed on those long journeys, being a very lightweight foldable scooter, making it easy to transport. The PRO Cruzaa Scooter has truly been crafted specifically with your lifestyle in mind.";

$specs = json_encode([
    'Top Speed' => '22 mph (40km)',
    'Max Range' => '45 Miles',
    'Water Resistant' => 'Yes – IPX4',
    'Bluetooth' => 'Built-in Speakers',
    'Display' => 'Digital LCD',
    'Battery' => 'Detachable',
    'Security' => 'Alarm System - Yes',
    'Headlight' => 'Front Headlight',
    'Brakes' => 'Disk Brake System - Yes',
    'Design' => 'Foldable',
    'Cruise Control' => 'Yes',
    'USB Port' => 'Built-in - Yes',
    'Speed Settings' => '3 levels'
]);

$stmt = $db->prepare("UPDATE products SET name = ?, slug = ?, price = ?, sale_price = ?, description = ?, specs = ? WHERE id = ?");

foreach ($products as $p) {
    $stmt->execute([$p['name'], $p['slug'], $price, $sale_price, $description, $specs, $p['id']]);
    echo "Updated E-Scooter Pro: " . $p['name'] . " (ID: " . $p['id'] . ")\n";
}
