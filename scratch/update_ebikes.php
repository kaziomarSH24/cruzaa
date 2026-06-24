<?php
$db = new PDO('mysql:host=localhost;dbname=cruzaa_admin', 'root', '');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$products = [
    [
        'id' => 6,
        'name' => 'The Cruzaa E-Bike Solarbeam Yellow with Built-in Speakers & Bluetooth',
        'slug' => 'solarbeam-yellow-e-bike'
    ],
    [
        'id' => 7,
        'name' => 'The Cruzaa E-Bike Gunmetal Grey with Built-in Speakers & Bluetooth',
        'slug' => 'gun-metal-grey-e-bike'
    ],
    [
        'id' => 8,
        'name' => 'The Cruzaa E-Bike Racing White with Built-in Speakers & Bluetooth',
        'slug' => 'racing-white-e-bike'
    ],
    [
        'id' => 9,
        'name' => 'The Cruzaa E-Bike Carbon Black with Built-in Speakers & Bluetooth',
        'slug' => 'carbon-black-e-bike'
    ]
];

$price = 2399.00;
$sale_price = 1899.99;
$description = "Move your own way and let the Cruzaa electric Bike do all the hard work for you. 100% electric with a unique aluminium lightweight frame design, the Cruzaa makes everyday transport an effortless pleasure. The integrated 4-stage 240W electric motor makes riding at ease helping you to tackle hills and long journeys. With a total range of up to 60km, the long-life lithium-ion battery pack is built to last and a full charge can be done in 3-4 hours. The exclusive E-Bike also comes with integrated speakers and the latest 5.0 Bluetooth, enabling music to be streamed to the E-Bike. With a full 12 months warranty, you can be assured that you have a great UK-based service team backing you all the way.";

$specs = json_encode([
    'Top Speed' => '25 km/h (15.5 mph)',
    'Max Range' => '50 – 60 km (Up to 37 miles)',
    'Wheel Size' => '20 inch',
    'Charge Time' => '3 – 4 hours',
    'Power Assist' => 'Electric Power-Assist: Yes',
    'Rated Power' => '240 w / 36 v',
    'Water Resistant' => 'Yes – IPX4',
    'Total Weight' => '16.5 kg',
    'Max Loading' => '150 kg',
    'Display' => 'Digital LCD',
    'Bluetooth' => 'Built-in Speakers',
    'Battery' => 'Detachable',
    'Gears' => '3 Speed',
    'Brakes' => 'Disk Brake System',
    'Suspension' => 'Yes'
]);

$stmt = $db->prepare("UPDATE products SET name = ?, slug = ?, price = ?, sale_price = ?, description = ?, specs = ? WHERE id = ?");

foreach ($products as $p) {
    $stmt->execute([$p['name'], $p['slug'], $price, $sale_price, $description, $specs, $p['id']]);
    echo "Updated E-Bike: " . $p['name'] . " (ID: " . $p['id'] . ")\n";
}
