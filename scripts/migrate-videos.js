import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_3wKDZgEeuMI6@ep-falling-mud-adre5n6s-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const sql = neon(DATABASE_URL)

async function runMigration() {
  try {
    console.log('Adding videos column to products table...')
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}'`
    console.log('✅ Videos column added successfully')
  } catch (error) {
    console.error('❌ Error adding videos column:', error)
  }
}

runMigration()