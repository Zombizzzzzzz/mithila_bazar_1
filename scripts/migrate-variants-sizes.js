import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_3wKDZgEeuMI6@ep-falling-mud-adre5n6s-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const sql = neon(DATABASE_URL)

async function runMigration() {
  try {
    console.log('Adding color_variants and sizes columns to products table...')

    // Add color_variants column
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS color_variants JSONB DEFAULT NULL`
    console.log('✅ color_variants column added')

    // Add sizes column
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes JSONB DEFAULT NULL`
    console.log('✅ sizes column added')

    console.log('✅ Migration completed successfully')
  } catch (error) {
    console.error('❌ Error during migration:', error)
  }
}

runMigration()