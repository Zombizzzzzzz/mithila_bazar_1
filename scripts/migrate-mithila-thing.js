import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_3wKDZgEeuMI6@ep-falling-mud-adre5n6s-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const sql = neon(DATABASE_URL)

async function runMigration() {
  try {
    console.log('Adding is_mithila_thing column to products table...')

    // Add is_mithila_thing column
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_mithila_thing BOOLEAN DEFAULT FALSE`
    console.log('✅ is_mithila_thing column added')

    // Update existing products that are in 'Hand-Mades' category to be mithila things
    await sql`UPDATE products SET is_mithila_thing = TRUE WHERE category_id = (SELECT id FROM categories WHERE slug = 'hand-mades')`
    console.log('✅ Existing hand-made products marked as mithila things')

    console.log('✅ Migration completed successfully')
  } catch (error) {
    console.error('❌ Error during migration:', error)
  }
}

runMigration()