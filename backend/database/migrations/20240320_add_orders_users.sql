-- ============================================
-- Users Table (Customers)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Orders Table
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    user_id INT NULL, -- NULL for guest checkout
    customer_name VARCHAR(255), -- For guest checkout
    customer_email VARCHAR(100), -- For guest checkout
    customer_phone VARCHAR(20),
    
    subtotal DECIMAL(10, 2) DEFAULT 0.00,
    tax_total DECIMAL(10, 2) DEFAULT 0.00,
    shipping_total DECIMAL(10, 2) DEFAULT 0.00,
    discount_total DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    payment_method VARCHAR(50),
    payment_intent_id VARCHAR(255),
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    order_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    
    shipping_address TEXT,
    billing_address TEXT,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order_number (order_number),
    INDEX idx_user (user_id),
    INDEX idx_status (order_status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Order Items Table
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NULL,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Sample Data
-- ============================================
INSERT INTO users (first_name, last_name, email, phone, is_active) VALUES
('John', 'Doe', 'john@example.com', '1234567890', 1),
('Jane', 'Smith', 'jane@example.com', '0987654321', 1);

INSERT INTO orders (order_number, user_id, total_amount, payment_method, payment_status, order_status, shipping_address) VALUES
('ORD-1001', 1, 1299.00, 'stripe', 'paid', 'processing', '123 E-Bike St, London, UK'),
('ORD-1002', NULL, 850.00, 'cod', 'pending', 'pending', '45 Scooter Rd, Manchester, UK');

INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price) VALUES
(1, NULL, 'Commuta Pro Max Electric Scooter', 1, 1299.00, 1299.00),
(2, NULL, 'Cruzaa E-Bike', 1, 850.00, 850.00);

-- Default Slide Content (JSON)
INSERT INTO dynamic_content (content_key, content_type, content_value, content_group, description) VALUES
('homepage_slider', 'json', '[{"id":1,"title":"Move your own way","subtitle":"Electric Mobility Revolution","description":"Experience the future of urban commuting with Cruzaas innovative electric scooters and bikes.","image":"/assets/hero-scooter.jpg","ctaText":"Shop Now","ctaLink":"/products","badge":"New Collection"},{"id":2,"title":"Commuta Pro Max","subtitle":"Our Most Powerful Scooter","description":"22 mph top speed, 35 miles range. The ultimate electric scooter for serious riders.","image":"/assets/scooter-main.jpg","ctaText":"View Details","ctaLink":"/product/commuta-pro-max-electric-scooter","badge":"Best Seller"}]', 'homepage', 'Main Homepage Hero Slider Data')
ON DUPLICATE KEY UPDATE content_value = VALUES(content_value);
