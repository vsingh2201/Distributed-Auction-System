-- data.sql for catalogue.db
-- Preload sample items into the "items" table

DELETE FROM items;

INSERT INTO items (
    item_id,
    ends_at,
    expedited_cost,
    keywords,
    name,
    ship_in_days,
    standard_cost,
    start_price,
    status
) VALUES
-- 1: Wireless Mouse (already sold – good for testing)
(1,
 1764954000000,
 10.0,
 'electronics,mouse,wireless',
 'Wireless Mouse',
 2,
 5.0,
 25.99,
 'SOLD'),

-- 2: Wireless Mouse (active)
(2,
 1765040400000,
 10.0,
 'electronics,mouse,wireless',
 'Wireless Mouse',
 2,
 5.0,
 25.99,
 'ACTIVE'),

-- 3: Wireless Keyboard
(3,
 1765126800000,
 10.0,
 'electronics,keyboard,wireless',
 'Wireless Keyboard',
 2,
 5.0,
 32.99,
 'ACTIVE'),

-- 4: Laptop (MacBook)
(4,
 1765213200000,
 0.0,
 'electronics,laptop,macbook',
 'Macbook',
 0,
 0.0,
 1500.00,
 'ACTIVE'),

-- 5: Laptop (Windows)
(5,
 1765299600000,
 0.0,
 'electronics,laptop,windows',
 'Windows Laptop',
 0,
 0.0,
 1500.00,
 'ACTIVE'),

-- 6: 24" Monitor
(6,
 1765386000000,
 15.0,
 'electronics,monitor,display,24inch',
 '24-inch Monitor',
 3,
 8.0,
 199.99,
 'ACTIVE'),

-- 7: Noise-Cancelling Headphones
(7,
 1765472400000,
 12.0,
 'electronics,audio,headphones,wireless',
 'Noise Cancelling Headphones',
 3,
 6.0,
 129.99,
 'ACTIVE'),

-- 8: External SSD 1TB
(8,
 1765558800000,
 10.0,
 'electronics,storage,ssd,external',
 'External SSD 1TB',
 4,
 5.0,
 89.99,
 'ACTIVE');
