import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_3wKDZgEeuMI6@ep-falling-mud-adre5n6s-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const sql = neon(DATABASE_URL)

async function runMigration() {
  try {
    console.log('Adding selected_variant and selected_size columns to orders table...')

    // Add selected_variant column
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS selected_variant JSONB DEFAULT NULL`
    console.log('✅ selected_variant column added')

    // Add selected_size column
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS selected_size TEXT DEFAULT NULL`
    console.log('✅ selected_size column added')

    console.log('✅ Migration completed successfully')
  } catch (error) {
    console.error('❌ Error during migration:', error)
  }
}

runMigration()