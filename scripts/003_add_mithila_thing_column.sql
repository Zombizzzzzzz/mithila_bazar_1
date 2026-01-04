-- Add is_mithila_thing column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_mithila_thing BOOLEAN DEFAULT FALSE;

-- Update existing products that are in 'Hand-Mades' category to be mithila things
UPDATE products SET is_mithila_thing = TRUE WHERE category_id = (SELECT id FROM categories WHERE slug = 'hand-mades');