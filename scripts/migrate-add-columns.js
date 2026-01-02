import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_3wKDZgEeuMI6@ep-falling-mud-adre5n6s-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const sql = neon(DATABASE_URL)

async function runMigration() {
  try {
    console.log('Adding missing columns to products table...')

    // Add images column
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}'`
    console.log('✅ Images column added')

    // Add videos column
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}'`
    console.log('✅ Videos column added')

    // Add stock column if it doesn't exist
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0`
    console.log('✅ Stock column added')

    console.log('✅ All missing columns added successfully')
  } catch (error) {
    console.error('❌ Error adding columns:', error)
  }
}

runMigration()