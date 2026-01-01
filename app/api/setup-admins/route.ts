import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    // Create categories table
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        image_url TEXT
      )
    `

    // Seed categories
    await sql`
      INSERT INTO categories (name, slug, description) VALUES
      ('Electronics', 'electronics', 'Cutting-edge gadgets and devices'),
      ('Hand-Mades', 'hand-mades', 'Traditional Mithila artisan crafts'),
      ('Watches', 'watches', 'Precision timepieces for every occasion'),
      ('Clothings', 'clothings', 'Premium apparel and traditional wear')
      ON CONFLICT (slug) DO NOTHING
    `

    // Create products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        image_url TEXT,
        features JSONB DEFAULT '[]',
        stock INTEGER DEFAULT 0,
        sales_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Ensure products table has all required columns (idempotent for existing DBs)
    await sql`
      ALTER TABLE IF EXISTS products
      ADD COLUMN IF NOT EXISTS image_url TEXT,
      ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    `

    // Seed sample products
    await sql`
      INSERT INTO products (name, slug, description, price, category_id, image_url, features, stock) VALUES
      ('Wireless Bluetooth Headphones', 'wireless-bluetooth-headphones', 'High-quality wireless headphones with noise cancellation', 2999.99, (SELECT id FROM categories WHERE slug = 'electronics'), 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg', '["Noise Cancellation", "40hr Battery", "Bluetooth 5.0"]', 50),
      ('Traditional Mithila Painting', 'traditional-mithila-painting', 'Authentic hand-painted Mithila art on canvas', 4999.99, (SELECT id FROM categories WHERE slug = 'hand-mades'), 'https://res.cloudinary.com/demo/image/upload/v1/sample2.jpg', '["Hand Painted", "Traditional Design", "Canvas Material"]', 10),
      ('Luxury Wrist Watch', 'luxury-wrist-watch', 'Elegant timepiece with leather strap', 7999.99, (SELECT id FROM categories WHERE slug = 'watches'), 'https://res.cloudinary.com/demo/image/upload/v1/sample3.jpg', '["Leather Strap", "Water Resistant", "Swiss Movement"]', 25),
      ('Traditional Kurta Set', 'traditional-kurta-set', 'Premium cotton kurta with matching pajamas', 2499.99, (SELECT id FROM categories WHERE slug = 'clothings'), 'https://res.cloudinary.com/demo/image/upload/v1/sample4.jpg', '["Cotton Fabric", "Traditional Design", "Comfort Fit"]', 30)
      ON CONFLICT (slug) DO NOTHING
    `
    // Create customers table
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create orders table (associate with customers)
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        customer_id INTEGER REFERENCES customers(id),
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        delivery_city TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        order_status TEXT DEFAULT 'pending',
        payment_method TEXT DEFAULT 'cash_on_delivery',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create admins table
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Seed admin users
    await sql`
      INSERT INTO admins (email, password_hash) VALUES
      ('siddhantdahal@mithilabazar.auth', '$2b$10$Dv1mCPtvguCPrYOqLR.lDeR4EYK0aeSNAOpnnWxwsm5A9afryS1YK'),
      ('yashwantsah@mithilabazar.auth', '$2b$10$Dv1mCPtvguCPrYOqLR.lDeR4EYK0aeSNAOpnnWxwsm5A9afryS1YK'),
      ('himanshu@mithibazar.auth', '$2b$10$Dv1mCPtvguCPrYOqLR.lDeR4EYK0aeSNAOpnnWxwsm5A9afryS1YK')
      ON CONFLICT (email) DO NOTHING
    `

    return NextResponse.json({
      success: true,
      message: 'Database setup complete! Categories, products, orders, and admin tables created with sample data.',
      credentials: {
        emails: ['siddhantdahal@mithilabazar.auth', 'yashwantsah@mithilabazar.auth', 'himanshu@mithibazar.auth'],
        password: 'matkarlala@345'
      },
      categories: ['Electronics', 'Hand-Mades', 'Watches', 'Clothings']
    })
  } catch (error) {
    console.error('Error setting up admins:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to setup admins: ' + errorMessage }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Create categories table
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        image_url TEXT
      )
    `

    // Seed categories
    await sql`
      INSERT INTO categories (name, slug, description) VALUES
      ('Electronics', 'electronics', 'Cutting-edge gadgets and devices'),
      ('Hand-Mades', 'hand-mades', 'Traditional Mithila artisan crafts'),
      ('Watches', 'watches', 'Precision timepieces for every occasion'),
      ('Clothings', 'clothings', 'Premium apparel and traditional wear')
      ON CONFLICT (slug) DO NOTHING
    `

    // Create products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        image_url TEXT,
        features JSONB DEFAULT '[]',
        stock INTEGER DEFAULT 0,
        sales_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Ensure products table has all required columns (idempotent for existing DBs)
    await sql`
      ALTER TABLE IF EXISTS products
      ADD COLUMN IF NOT EXISTS image_url TEXT,
      ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    `

    // Seed sample products
    await sql`
      INSERT INTO products (name, slug, description, price, category_id, image_url, features, stock) VALUES
      ('Wireless Bluetooth Headphones', 'wireless-bluetooth-headphones', 'High-quality wireless headphones with noise cancellation', 2999.99, (SELECT id FROM categories WHERE slug = 'electronics'), 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg', '["Noise Cancellation", "40hr Battery", "Bluetooth 5.0"]', 50),
      ('Traditional Mithila Painting', 'traditional-mithila-painting', 'Authentic hand-painted Mithila art on canvas', 4999.99, (SELECT id FROM categories WHERE slug = 'hand-mades'), 'https://res.cloudinary.com/demo/image/upload/v1/sample2.jpg', '["Hand Painted", "Traditional Design", "Canvas Material"]', 10),
      ('Luxury Wrist Watch', 'luxury-wrist-watch', 'Elegant timepiece with leather strap', 7999.99, (SELECT id FROM categories WHERE slug = 'watches'), 'https://res.cloudinary.com/demo/image/upload/v1/sample3.jpg', '["Leather Strap", "Water Resistant", "Swiss Movement"]', 25),
      ('Traditional Kurta Set', 'traditional-kurta-set', 'Premium cotton kurta with matching pajamas', 2499.99, (SELECT id FROM categories WHERE slug = 'clothings'), 'https://res.cloudinary.com/demo/image/upload/v1/sample4.jpg', '["Cotton Fabric", "Traditional Design", "Comfort Fit"]', 30)
      ON CONFLICT (slug) DO NOTHING
    `

    // Create orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        delivery_city TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        order_status TEXT DEFAULT 'pending',
        payment_method TEXT DEFAULT 'cash_on_delivery',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create admins table
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Seed admin users
    await sql`
      INSERT INTO admins (email, password_hash) VALUES
      ('siddhantdahal@mithilabazar.auth', '$2b$10$Dv1mCPtvguCPrYOqLR.lDeR4EYK0aeSNAOpnnWxwsm5A9afryS1YK'),
      ('yashwantsah@mithilabazar.auth', '$2b$10$Dv1mCPtvguCPrYOqLR.lDeR4EYK0aeSNAOpnnWxwsm5A9afryS1YK'),
      ('himanshu@mithibazar.auth', '$2b$10$Dv1mCPtvguCPrYOqLR.lDeR4EYK0aeSNAOpnnWxwsm5A9afryS1YK')
      ON CONFLICT (email) DO NOTHING
    `

    return NextResponse.json({
      success: true,
      message: 'Database setup complete! Categories, products, orders, and admin tables created with sample data.',
      credentials: {
        emails: ['siddhantdahal@mithilabazar.auth', 'yashwantsah@mithilabazar.auth', 'himanshu@mithibazar.auth'],
        password: 'matkarlala@345'
      },
      categories: ['Electronics', 'Hand-Mades', 'Watches', 'Clothings']
    })
  } catch (error) {
    console.error('Error setting up admins:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to setup admins: ' + errorMessage }, { status: 500 })
  }
}