-- Sample data. Passwords for all seeded accounts: Password123

INSERT INTO categories (name, slug, icon) VALUES
  ('Cobbler', 'cobbler', 'boot'),
  ('Potter (Kumhar)', 'potter', 'pot'),
  ('Tailor', 'tailor', 'needle'),
  ('Artisan', 'artisan', 'palette'),
  ('Small Vendor', 'vendor', 'basket');

INSERT INTO users (name, email, password_hash, role, phone, location) VALUES
  ('Admin User', 'admin@hunarhub.in', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Q1z8OyLwF8V9V0z0mzTX0S/E4EJ0O', 'admin', '9000000000', 'Coimbatore'),
  ('Ravi Kumar', 'ravi.cobbler@hunarhub.in', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Q1z8OyLwF8V9V0z0mzTX0S/E4EJ0O', 'entrepreneur', '9000000001', 'Coimbatore'),
  ('Meena Devi', 'meena.potter@hunarhub.in', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Q1z8OyLwF8V9V0z0mzTX0S/E4EJ0O', 'entrepreneur', '9000000002', 'Madurai'),
  ('Sunita Tailor', 'sunita.tailor@hunarhub.in', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Q1z8OyLwF8V9V0z0mzTX0S/E4EJ0O', 'entrepreneur', '9000000003', 'Coimbatore'),
  ('Arun Vendor', 'arun.vendor@hunarhub.in', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Q1z8OyLwF8V9V0z0mzTX0S/E4EJ0O', 'entrepreneur', '9000000004', 'Salem'),
  ('Priya Sharma', 'priya.customer@hunarhub.in', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Q1z8OyLwF8V9V0z0mzTX0S/E4EJ0O', 'customer', '9000000005', 'Coimbatore');

INSERT INTO entrepreneurs (user_id, category_id, business_name, bio, skills, experience_years, location, price_range_min, price_range_max, is_verified, is_available) VALUES
  (2, 1, 'Ravi Shoe Repairs', 'Third-generation cobbler specialising in leather repair and custom-fit footwear.', ARRAY['Leather repair','Custom footwear','Sole replacement'], 15, 'Coimbatore', 100, 1500, true, true),
  (3, 2, 'Meena Clay Studio', 'Traditional kumhar craft passed down four generations, now with modern glaze finishes.', ARRAY['Wheel pottery','Terracotta','Glazing'], 22, 'Madurai', 200, 3000, true, true),
  (4, 3, 'Sunita Stitch House', 'Bespoke tailoring for everyday wear, blouses, and alterations, turnaround in 3 days.', ARRAY['Blouse stitching','Alterations','Embroidery'], 10, 'Coimbatore', 150, 2500, true, true),
  (5, 5, 'Arun General Store', 'Neighbourhood vendor for fresh produce, spices, and daily essentials.', ARRAY['Groceries','Spices','Household items'], 8, 'Salem', 20, 800, false, true);

INSERT INTO products (entrepreneur_id, name, description, price, stock) VALUES
  (2, 'Handthrown Terracotta Vase', 'Medium sized vase, air-dried and kiln-fired, natural clay finish.', 450, 12),
  (2, 'Clay Diya Set (12 pcs)', 'Hand-shaped oil lamps, perfect for festivals.', 220, 40),
  (3, 'Custom Cotton Kurti', 'Made-to-measure kurti in cotton, choice of colour.', 899, 8),
  (1, 'Leather Belt (Handcrafted)', 'Genuine leather belt, hand-stitched edges.', 350, 20);

INSERT INTO service_requests (customer_id, entrepreneur_id, description, status, requested_date) VALUES
  (6, 1, 'Need sole replacement for two pairs of formal shoes.', 'pending', CURRENT_DATE + 3),
  (6, 3, 'Alter the sleeves of a blouse, need it shorter.', 'accepted', CURRENT_DATE + 5);

INSERT INTO orders (customer_id, entrepreneur_id, product_id, quantity, total_price, status) VALUES
  (6, 2, 1, 1, 450, 'confirmed'),
  (6, 2, 2, 2, 440, 'delivered');

INSERT INTO reviews (customer_id, entrepreneur_id, order_id, rating, comment) VALUES
  (6, 2, 2, 5, 'Beautiful diyas, exactly as pictured and delivered on time.');
