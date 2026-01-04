-- Add reviews table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending';

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);