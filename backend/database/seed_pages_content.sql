-- =========================================================================
-- Seeding script for Our Story and Contact Us dynamic pages content
-- Table: dynamic_content
-- =========================================================================

-- --- 1. Our Story (About Page) Content ---
INSERT INTO dynamic_content (content_key, content_type, content_value, content_group, description, is_active) 
VALUES 
('about_story_badge', 'text', 'The Journey', 'about', 'Our Story Page - Badge text', 1),
('about_story_title', 'text', 'Our Story', 'about', 'Our Story Page - Title', 1),
('about_story_highlight', 'text', 'Our journey started in 2015 when we began experimenting with tech that was fun, stylish and complimentary to modern lifestyles.', 'about', 'Our Story Page - Highlighted lead paragraph', 1),
('about_story_description_html', 'html', '<p>We noticed a rise in the popularity of electric assisted products like electric scooters and e-bikes. Since our interest grew, we carried out extensive research and wanted to create something of our own.</p>\n<p>We have worked tirelessly making sure safety, design and user experience were optimised and our products are fun whilst fitting perfectly into everyday lifestyle and making commuting more environmentally friendly.</p>\n<p>And so our first product – the fully electric Cruzaa scoota – was launched. Although we couldn’t be prouder of our electric scoota we have since launched further unique products to fit into the Cruzaa portfolio.</p>\n<p>Tim Cahill joining Cruzaa has brought a wealth of entrepreneurial experience and creativity whilst continually driving our strategy and fulfilling the vision.</p>', 'about', 'Our Story Page - Main content paragraphs', 1),
('about_story_squad_title', 'text', 'Cruzaa Squad', 'about', 'Our Story Page - Squad Section Title', 1),
('about_story_squad_quote', 'text', '“Move your own way”', 'about', 'Our Story Page - Squad Section Quote', 1),
('about_story_image', 'image', '', 'about', 'Our Story Page - Main Image', 1);

-- --- 2. Contact Us Page Content ---
INSERT INTO dynamic_content (content_key, content_type, content_value, content_group, description, is_active) 
VALUES 
('contact_hero_badge', 'text', 'Get in Touch', 'contact', 'Contact Page - Hero Badge', 1),
('contact_hero_title', 'html', 'We\'re here to <span class="text-primary">help</span>', 'contact', 'Contact Page - Hero Title', 1),
('contact_hero_subtitle', 'text', 'Have a question about our products or need support? Our team is ready to assist you.', 'contact', 'Contact Page - Hero Subtitle', 1),
('contact_form_title', 'text', 'Send us a message', 'contact', 'Contact Page - Form Title', 1),
('contact_faq_title', 'text', 'Frequently Asked Questions', 'contact', 'Contact Page - FAQ Section Title', 1),
('contact_cta_title', 'text', 'Need immediate help?', 'contact', 'Contact Page - Bottom CTA Title', 1),
('contact_cta_subtitle', 'text', 'Our support team is available via phone during business hours.', 'contact', 'Contact Page - Bottom CTA Subtitle', 1),
('contact_cta_phone', 'text', 'tel:02033268888', 'contact', 'Contact Page - Bottom CTA Phone Link', 1),
('contact_cta_btn_text', 'text', 'Call 0203 326 8888', 'contact', 'Contact Page - Bottom CTA Button Text', 1),
('contact_info_json', 'json', '[\n  {"icon": "Phone", "title": "Phone", "value": "0203 326 8888", "description": "Mon-Fri 9am-6pm"},\n  {"icon": "Mail", "title": "Email", "value": "hi@cruzaa.com", "description": "We reply within 24 hours"},\n  {"icon": "MapPin", "title": "Office", "value": "London, UK", "description": "Registered in England & Wales"},\n  {"icon": "Clock", "title": "Hours", "value": "Mon-Fri 9-6", "description": "Weekend support available"}\n]', 'contact', 'Contact Page - Contact Cards Info JSON', 1),
('contact_faq_json', 'json', '[\n  {"question": "What is the warranty on Cruzaa products?", "answer": "All Cruzaa products come with a 2-year manufacturer warranty covering defects in materials and workmanship. Extended warranty options are also available at checkout."},\n  {"question": "How long does delivery take?", "answer": "Standard UK delivery takes 3-5 business days. Express delivery (1-2 business days) is available for an additional fee. International shipping times vary by destination."},\n  {"question": "Can I return my Cruzaa product?", "answer": "Yes! We offer a 30-day return policy. Products must be in original condition with all packaging. Contact our support team to initiate a return."},\n  {"question": "Do I need insurance for my electric scooter?", "answer": "UK law currently does not require insurance for private e-scooters. However, we recommend checking local regulations and considering insurance for peace of mind."},\n  {"question": "How do I maintain my Cruzaa scooter?", "answer": "Regular maintenance includes keeping tires properly inflated, checking brakes monthly, and charging the battery according to the manual. We also offer annual service packages."}\n]', 'contact', 'Contact Page - FAQs JSON list', 1);
