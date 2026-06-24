-- ============================================
-- Cruzaa Admin Panel Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS cruzaa_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cruzaa_admin;

-- ============================================
-- Admin Users Table
-- ============================================ 
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('super_admin', 'admin', 'editor') DEFAULT 'admin',
    two_fa_enabled TINYINT(1) DEFAULT 0,
    two_fa_secret VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Categories Table
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id INT DEFAULT NULL,
    image VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_parent (parent_id),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Products Table
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    sku VARCHAR(100) UNIQUE,
    description TEXT,
    short_description VARCHAR(500),
    category_id INT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    sale_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    stock_quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    manage_stock TINYINT(1) DEFAULT 1,
    stock_status ENUM('in_stock', 'out_of_stock', 'on_backorder') DEFAULT 'in_stock',
    featured_image VARCHAR(255),
    is_featured TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    weight DECIMAL(8, 2),
    dimensions VARCHAR(100),
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords VARCHAR(255),
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_sku (sku),
    INDEX idx_category (category_id),
    INDEX idx_featured (is_featured),
    INDEX idx_active (is_active),
    FULLTEXT idx_search (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Product Images Table
-- ============================================
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    is_primary TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Contact Form Submissions Table
-- ============================================
CREATE TABLE IF NOT EXISTS contact_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_read TINYINT(1) DEFAULT 0,
    is_replied TINYINT(1) DEFAULT 0,
    status ENUM('new', 'in_progress', 'resolved', 'spam') DEFAULT 'new',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_read (is_read),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Dynamic Content Table (WordPress-like)
-- ============================================
CREATE TABLE IF NOT EXISTS dynamic_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content_key VARCHAR(100) UNIQUE NOT NULL,
    content_type ENUM('text', 'html', 'image', 'json') DEFAULT 'text',
    content_value LONGTEXT,
    content_group VARCHAR(50),
    description VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (content_key),
    INDEX idx_group (content_group)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Navigation Menu Table
-- ============================================
CREATE TABLE IF NOT EXISTS navigation_menu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    url VARCHAR(255),
    target VARCHAR(20) DEFAULT '_self',
    parent_id INT DEFAULT NULL,
    menu_location ENUM('header', 'footer', 'sidebar') DEFAULT 'header',
    sort_order INT DEFAULT 0,
    icon VARCHAR(100),
    css_class VARCHAR(100),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES navigation_menu(id) ON DELETE CASCADE,
    INDEX idx_location (menu_location),
    INDEX idx_parent (parent_id),
    INDEX idx_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Settings Table
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value LONGTEXT,
    setting_type ENUM('general', 'smtp', 'seo', 'payment', 'appearance', 'stripe', 'cart') DEFAULT 'general',
    description VARCHAR(255),
    is_encrypted TINYINT(1) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key),
    INDEX idx_type (setting_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Payment Methods Table
-- ============================================
CREATE TABLE IF NOT EXISTS payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    config JSON,
    is_active TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Activity Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Insert Default Data
-- ============================================

-- Default Admin User (password: admin123)
INSERT INTO admin_users (username, email, password, full_name, role) VALUES
('admin', 'admin@cruzaa.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Admin', 'super_admin');

-- Default Settings
INSERT INTO settings (setting_key, setting_value, setting_type, description) VALUES
('site_name', 'Cruzaa E-Commerce', 'general', 'Website Name'),
('site_tagline', 'Your One-Stop E-Mobility Shop', 'general', 'Website Tagline'),
('site_logo', '', 'appearance', 'Site Logo URL'),
('site_favicon', '', 'appearance', 'Site Favicon URL'),
('header_code', '', 'appearance', 'Header Custom Code/Scripts'),
('footer_code', '', 'appearance', 'Footer Custom Code/Scripts'),
('contact_email', 'contact@cruzaa.com', 'general', 'Contact Email'),
('contact_phone', '', 'general', 'Contact Phone'),

-- SMTP Settings
('smtp_enabled', '0', 'smtp', 'Enable SMTP Email'),
('smtp_host', '', 'smtp', 'SMTP Host'),
('smtp_port', '587', 'smtp', 'SMTP Port'),
('smtp_username', '', 'smtp', 'SMTP Username'),
('smtp_password', '', 'smtp', 'SMTP Password'),
('smtp_encryption', 'tls', 'smtp', 'SMTP Encryption (tls/ssl)'),
('smtp_from_email', '', 'smtp', 'From Email Address'),
('smtp_from_name', '', 'smtp', 'From Name'),

-- SEO Settings
('seo_meta_title', 'Cruzaa - E-Mobility Hub', 'seo', 'Default Meta Title'),
('seo_meta_description', 'Premium e-bikes and e-mobility solutions', 'seo', 'Default Meta Description'),
('seo_meta_keywords', 'e-bike, e-mobility, electric bikes', 'seo', 'Default Meta Keywords'),
('seo_og_image', '', 'seo', 'Default OG Image'),
('seo_analytics_code', '', 'seo', 'Google Analytics Code'),

-- Stripe Settings
('stripe_enabled', '0', 'stripe', 'Enable Stripe Payments'),
('stripe_mode', 'test', 'stripe', 'Stripe Mode (test/live)'),
('stripe_publishable_key', '', 'stripe', 'Stripe Publishable Key'),
('stripe_secret_key', '', 'stripe', 'Stripe Secret Key'),
('stripe_webhook_secret', '', 'stripe', 'Stripe Webhook Secret'),

-- Cart Settings
('cart_enabled', '1', 'cart', 'Enable Shopping Cart'),
('guest_checkout_enabled', '1', 'cart', 'Enable Guest Checkout'),
('currency', 'USD', 'cart', 'Default Currency'),
('currency_symbol', '$', 'cart', 'Currency Symbol');

-- Default Payment Methods
INSERT INTO payment_methods (name, code, description, is_active) VALUES
('Stripe', 'stripe', 'Pay securely with credit/debit card via Stripe', 1),
('Cash on Delivery', 'cod', 'Pay when you receive your order', 1),
('Bank Transfer', 'bank_transfer', 'Direct bank transfer', 0);

-- Default Dynamic Content
INSERT INTO dynamic_content (content_key, content_type, content_value, content_group, description) VALUES
('homepage_hero_title', 'text', 'Welcome to Cruzaa', 'homepage', 'Homepage Hero Title'),
('homepage_hero_subtitle', 'text', 'Your Premium E-Mobility Hub', 'homepage', 'Homepage Hero Subtitle'),
('footer_about', 'html', '<p>Cruzaa is your trusted partner for premium e-mobility solutions.</p>', 'footer', 'Footer About Section'),
('footer_copyright', 'text', '© 2024 Cruzaa. All rights reserved.', 'footer', 'Footer Copyright Text');
