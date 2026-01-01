-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  image_url TEXT,
  features JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Categories
INSERT INTO categories (name, slug, description) VALUES
('Electronics', 'electronics', 'Cutting-edge gadgets and devices'),
('Hand-Mades', 'hand-mades', 'Traditional Mithila artisan crafts'),
('Watches', 'watches', 'Precision timepieces for every occasion'),
('Clothings', 'clothings', 'Premium apparel and traditional wear')
ON CONFLICT (slug) DO NOTHING;

-- Seed Admins (password: matkarlala@345)
INSERT INTO admins (email, password_hash) VALUES
('siddhantdahal@mithilabazar.auth', '$2b$10$Dv1mCPtvguCPrYOqLR.lDeR4EYK0aeSNAOpnnWxwsm5A9afryS1YK'),
('yashwantsah@mithilabazar.auth', '$2b$10$Dv1mCPtvguCPrYOqLR.lDeR4EYK0aeSNAOpnnWxwsm5A9afryS1YK'),
('himanshu@mithibazar.auth', '$2b$10$Dv1mCPtvguCPrYOqLR.lDeR4EYK0aeSNAOpnnWxwsm5A9afryS1YK')
ON CONFLICT (email) DO NOTHING;

-- Seed Products
INSERT INTO products (name, slug, description, price, category_id, image_url) VALUES
('Mithila Art Wall Hanging', 'mithila-art-wall-hanging', 'Authentic hand-painted Madhubani art', 45.00, (SELECT id FROM categories WHERE slug = 'hand-mades'), '/placeholder.svg?height=400&width=400'),
('Premium Silk Saree', 'premium-silk-saree', 'Pure silk saree with intricate borders', 120.00, (SELECT id FROM categories WHERE slug = 'clothings'), '/placeholder.svg?height=400&width=400'),
('Modern Smart Watch', 'modern-smart-watch', 'Sleek design with advanced health tracking', 199.99, (SELECT id FROM categories WHERE slug = 'watches'), '/placeholder.svg?height=400&width=400'),
('Noise Cancelling Headphones', 'noise-cancelling-headphones', 'Premium audio with active noise cancellation', 299.00, (SELECT id FROM categories WHERE slug = 'electronics'), '/placeholder.svg?height=400&width=400')
ON CONFLICT (slug) DO NOTHING;
