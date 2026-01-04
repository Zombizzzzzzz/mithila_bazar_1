import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_3wKDZgEeuMI6@ep-falling-mud-adre5n6s-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const sql = neon(DATABASE_URL)

async function runMigration() {
  try {
    console.log('Adding reviews table and delivery_status column...')

    // Add delivery_status column to orders
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending'`
    console.log('✅ delivery_status column added to orders')

    // Create reviews table
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        customer_id INTEGER REFERENCES customers(id),
        customer_name TEXT NOT NULL,
        customer_email TEXT,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(order_id)
      )
    `
    console.log('✅ reviews table created')

    console.log('✅ Migration completed successfully')
  } catch (error) {
    console.error('❌ Error during migration:', error)
  }
}

runMigration()