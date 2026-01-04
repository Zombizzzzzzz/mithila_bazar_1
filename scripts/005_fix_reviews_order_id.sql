-- Fix reviews table to allow null order_id
ALTER TABLE reviews ALTER COLUMN order_id DROP NOT NULL;