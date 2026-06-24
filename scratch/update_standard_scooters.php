<?php
$db = new PDO('mysql:host=localhost;dbname=cruzaa_admin', 'root', '');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$products = [
    [
        'id' => 12,
        'name' => 'Cruzaa E-Scooter Carbon Black – with Built-in Speakers & Bluetooth',
        'slug' => 'the-cruzaa-e-scooter-carbon-black-sale'
    ],
    [
        'id' => 13,
        'name' => 'Cruzaa E-Scooter Racing White – with Built-in Speakers & Bluetooth',
        'slug' => 'the-cruzaa-e-scooter-racing-white-sale'
    ]
];

$price = 1499.00;
$sale_price = 1299.99;
$description = "Move your own way and let the Cruzaa Electric Scooter do all the hard work for you. The Cruzaa sit-down Electric Scooter is an exclusive lifestyle premium scooter under the Cruzaa product family range. The Cruzaa is 100% electric with a unique foldable slick frame design, making everyday social and transport an effortless pleasure, with an impressive range up to 35 miles, reaching a top speed of 15.5 mph (legal road limit) and comes with a smart xenon large LED Screen Display. The Cruzaa is so unique, it has an extensive range of built-in features, such as built-in speakers with Bluetooth enabled to stream music, the battery is detachable for portable charging and the scooter has a built-in USB port to charge devices such as a mobile phone. The beauty of the detachable battery is for portable charging and to swap over if needed on those long journeys, being a very lightweight foldable scooter, making it easy to transport. The Cruzaa Scooter has truly been crafted specifically with your lifestyle in mind.";

$specs = json_encode([
    'Top Speed' => '15.5 mph (25 km)',
    'Max Range' => '35 Miles',
    'Water Resistant' => 'Yes – IPX4',
    'Bluetooth' => 'Built-in Speakers',
    'Display' => 'Digital LCD',
    'Battery' => 'Detachable',
    'Security' => 'Alarm System: Yes',
    'Headlight' => 'Front Headlight',
    'Brakes' => 'Disk Brake System: Yes',
    'Design' => 'Foldable',
    'Cruise Control' => 'Yes',
    'USB Port' => 'Built-in - Yes',
    'Speed Settings' => '3 levels'
]);

$stmt = $db->prepare("UPDATE products SET name = ?, slug = ?, price = ?, sale_price = ?, description = ?, specs = ? WHERE id = ?");

foreach ($products as $p) {
    $stmt->execute([$p['name'], $p['slug'], $price, $sale_price, $description, $specs, $p['id']]);
    echo "Updated E-Scooter: " . $p['name'] . " (ID: " . $p['id'] . ")\n";
}
