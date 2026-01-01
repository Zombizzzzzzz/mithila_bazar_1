import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { join } from 'path'

// Hardcode the database URL for now (remove quotes)
const DATABASE_URL = 'postgresql://neondb_owner:npg_3wKDZgEeuMI6@ep-falling-mud-adre5n6s-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const sql = neon(DATABASE_URL)

async function runSchema() {
  try {
    console.log('Executing schema step by step...')

    // Create categories table
    console.log('1. Creating categories table...')
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        image_url TEXT
      )
    `
    console.log('✅ Categories table created')

    // Create products table
    console.log('2. Creating products table...')
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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✅ Products table created')

    // Create admins table
    console.log('3. Creating admins table...')
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✅ Admins table created')

    // Seed categories
    console.log('4. Seeding categories...')
    await sql`
      INSERT INTO categories (name, slug, description) VALUES
      ('Electronics', 'electronics', 'Cutting-edge gadgets and devices'),
      ('Hand-Mades', 'hand-mades', 'Traditional Mithila artisan crafts'),
      ('Watches', 'watches', 'Precision timepieces for every occasion'),
      ('Clothings', 'clothings', 'Premium apparel and traditional wear')
      ON CONFLICT (slug) DO NOTHING
    `
    console.log('✅ Categories seeded')

    // Seed admins
    console.log('5. Seeding admins...')
    await sql`
      INSERT INTO admins (email, password_hash) VALUES
      ('siddhantdahal@mithilabazar.auth', '$2b$10$Dv1mCPtvguCPrYOqLR.lDeR4EYK0aeSNAOpnnWxwsm5A9afryS1YK'),
      ('yashwantsah@mithilabazar.auth', '$2b$10$Dv1mCPtvguCPrYOqLR.lDeR4EYK0aeSNAOpnnWxwsm5A9afryS1YK'),
      ('himanshu@mithibazar.auth', '$2b$10$Dv1mCPtvguCPrYOqLR.lDeR4EYK0aeSNAOpnnWxwsm5A9afryS1YK')
      ON CONFLICT (email) DO NOTHING
    `
    console.log('✅ Admins seeded')

    // Seed products
    console.log('6. Seeding products...')
    await sql`
      INSERT INTO products (name, slug, description, price, category_id, image_url) VALUES
      ('Mithila Art Wall Hanging', 'mithila-art-wall-hanging', 'Authentic hand-painted Madhubani art', 45.00, (SELECT id FROM categories WHERE slug = 'hand-mades'), '/placeholder.svg?height=400&width=400'),
      ('Premium Silk Saree', 'premium-silk-saree', 'Pure silk saree with intricate borders', 120.00, (SELECT id FROM categories WHERE slug = 'clothings'), '/placeholder.svg?height=400&width=400'),
      ('Modern Smart Watch', 'modern-smart-watch', 'Sleek design with advanced health tracking', 199.99, (SELECT id FROM categories WHERE slug = 'watches'), '/placeholder.svg?height=400&width=400'),
      ('Noise Cancelling Headphones', 'noise-cancelling-headphones', 'Premium audio with active noise cancellation', 299.00, (SELECT id FROM categories WHERE slug = 'electronics'), '/placeholder.svg?height=400&width=400')
      ON CONFLICT (slug) DO NOTHING
    `
    console.log('✅ Products seeded')

    console.log('🎉 All schema operations completed successfully!')
    console.log('Admin login credentials:')
    console.log('Emails: siddhantdahal@mithilabazar.auth, yashwantsah@mithilabazar.auth, himanshu@mithibazar.auth')
    console.log('Password: matkarlala@345')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error executing schema:', error)
    console.error('Error details:', error.message)
    console.error('Full error:', error)
    process.exit(1)
  }
}

runSchema()