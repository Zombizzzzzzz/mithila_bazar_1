-- Add videos column to products table
ALTER TABLE products ADD COLUMN videos TEXT[] DEFAULT '{}';