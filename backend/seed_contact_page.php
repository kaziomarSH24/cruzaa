<?php
require_once __DIR__ . '/config/database.php';

try {
    $db = (new Database())->getConnection();

    $seeds = [
        [
            'key' => 'contact_hero_badge',
            'type' => 'text',
            'value' => 'Get in Touch',
            'group' => 'contact',
            'desc' => 'Contact Page - Hero Badge'
        ],
        [
            'key' => 'contact_hero_title',
            'type' => 'html',
            'value' => 'We\'re here to <span class="text-primary">help</span>',
            'group' => 'contact',
            'desc' => 'Contact Page - Hero Title'
        ],
        [
            'key' => 'contact_hero_subtitle',
            'type' => 'text',
            'value' => 'Have a question about our products or need support? Our team is ready to assist you.',
            'group' => 'contact',
            'desc' => 'Contact Page - Hero Subtitle'
        ],
        [
            'key' => 'contact_form_title',
            'type' => 'text',
            'value' => 'Send us a message',
            'group' => 'contact',
            'desc' => 'Contact Page - Form Title'
        ],
        [
            'key' => 'contact_faq_title',
            'type' => 'text',
            'value' => 'Frequently Asked Questions',
            'group' => 'contact',
            'desc' => 'Contact Page - FAQ Section Title'
        ],
        [
            'key' => 'contact_cta_title',
            'type' => 'text',
            'value' => 'Need immediate help?',
            'group' => 'contact',
            'desc' => 'Contact Page - Bottom CTA Title'
        ],
        [
            'key' => 'contact_cta_subtitle',
            'type' => 'text',
            'value' => 'Our support team is available via phone during business hours.',
            'group' => 'contact',
            'desc' => 'Contact Page - Bottom CTA Subtitle'
        ],
        [
            'key' => 'contact_cta_phone',
            'type' => 'text',
            'value' => 'tel:02033268888',
            'group' => 'contact',
            'desc' => 'Contact Page - Bottom CTA Phone Link'
        ],
        [
            'key' => 'contact_cta_btn_text',
            'type' => 'text',
            'value' => 'Call 0203 326 8888',
            'group' => 'contact',
            'desc' => 'Contact Page - Bottom CTA Button Text'
        ],
        [
            'key' => 'contact_info_json',
            'type' => 'json',
            'value' => '[
  {"icon": "Phone", "title": "Phone", "value": "0203 326 8888", "description": "Mon-Fri 9am-6pm"},
  {"icon": "Mail", "title": "Email", "value": "hi@cruzaa.com", "description": "We reply within 24 hours"},
  {"icon": "MapPin", "title": "Office", "value": "London, UK", "description": "Registered in England & Wales"},
  {"icon": "Clock", "title": "Hours", "value": "Mon-Fri 9-6", "description": "Weekend support available"}
]',
            'group' => 'contact',
            'desc' => 'Contact Page - Contact Cards Info JSON'
        ],
        [
            'key' => 'contact_faq_json',
            'type' => 'json',
            'value' => '[
  {"question": "What is the warranty on Cruzaa products?", "answer": "All Cruzaa products come with a 2-year manufacturer warranty covering defects in materials and workmanship. Extended warranty options are also available at checkout."},
  {"question": "How long does delivery take?", "answer": "Standard UK delivery takes 3-5 business days. Express delivery (1-2 business days) is available for an additional fee. International shipping times vary by destination."},
  {"question": "Can I return my Cruzaa product?", "answer": "Yes! We offer a 30-day return policy. Products must be in original condition with all packaging. Contact our support team to initiate a return."},
  {"question": "Do I need insurance for my electric scooter?", "answer": "UK law currently does not require insurance for private e-scooters. However, we recommend checking local regulations and considering insurance for peace of mind."},
  {"question": "How do I maintain my Cruzaa scooter?", "answer": "Regular maintenance includes keeping tires properly inflated, checking brakes monthly, and charging the battery according to the manual. We also offer annual service packages."}
]',
            'group' => 'contact',
            'desc' => 'Contact Page - FAQs JSON list'
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
