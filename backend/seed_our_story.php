<?php
require_once __DIR__ . '/config/database.php';

try {
    $db = (new Database())->getConnection();

    $seeds = [
        [
            'key' => 'about_story_badge',
            'type' => 'text',
            'value' => 'The Journey',
            'group' => 'about',
            'desc' => 'Our Story Page - Badge text'
        ],
        [
            'key' => 'about_story_title',
            'type' => 'text',
            'value' => 'Our Story',
            'group' => 'about',
            'desc' => 'Our Story Page - Title'
        ],
        [
            'key' => 'about_story_highlight',
            'type' => 'text',
            'value' => 'Our journey started in 2015 when we began experimenting with tech that was fun, stylish and complimentary to modern lifestyles.',
            'group' => 'about',
            'desc' => 'Our Story Page - Highlighted lead paragraph'
        ],
        [
            'key' => 'about_story_description_html',
            'type' => 'html',
            'value' => '<p>We noticed a rise in the popularity of electric assisted products like electric scooters and e-bikes. Since our interest grew, we carried out extensive research and wanted to create something of our own.</p>
<p>We have worked tirelessly making sure safety, design and user experience were optimised and our products are fun whilst fitting perfectly into everyday lifestyle and making commuting more environmentally friendly.</p>
<p>And so our first product – the fully electric Cruzaa scoota – was launched. Although we couldn’t be prouder of our electric scoota we have since launched further unique products to fit into the Cruzaa portfolio.</p>
<p>Tim Cahill joining Cruzaa has brought a wealth of entrepreneurial experience and creativity whilst continually driving our strategy and fulfilling the vision.</p>',
            'group' => 'about',
            'desc' => 'Our Story Page - Main content paragraphs'
        ],
        [
            'key' => 'about_story_squad_title',
            'type' => 'text',
            'value' => 'Cruzaa Squad',
            'group' => 'about',
            'desc' => 'Our Story Page - Squad Section Title'
        ],
        [
            'key' => 'about_story_squad_quote',
            'type' => 'text',
            'value' => '“Move your own way”',
            'group' => 'about',
            'desc' => 'Our Story Page - Squad Section Quote'
        ],
        [
            'key' => 'about_story_image',
            'type' => 'image',
            'value' => '',
            'group' => 'about',
            'desc' => 'Our Story Page - Main Image'
        ]
    ];

    $stmtCheck = $db->prepare("SELECT COUNT(*) FROM dynamic_content WHERE content_key = ?");
    $stmtInsert = $db->prepare("INSERT INTO dynamic_content (content_key, content_type, content_value, content_group, description, is_active) VALUES (?, ?, ?, ?, ?, 1)");

    $inserted = 0;
    foreach ($seeds as $seed) {
        $stmtCheck->execute([$seed['key']]);
        if ($stmtCheck->fetchColumn() == 0) {
            $stmtInsert->execute([
                $seed['key'],
                $seed['type'],
                $seed['value'],
                $seed['group'],
                $seed['desc']
            ]);
            $inserted++;
            echo "Seeded key: {$seed['key']}\n";
        } else {
            echo "Key already exists: {$seed['key']}\n";
        }
    }

    echo "\nDatabase seeding completed successfully. {$inserted} keys inserted.\n";

} catch (Exception $e) {
    echo "Error seeding database: " . $e->getMessage() . "\n";
}
