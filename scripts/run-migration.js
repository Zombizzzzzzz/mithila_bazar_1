import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { join } from 'path'

// Hardcode the database URL for now (remove quotes)
const DATABASE_URL = 'postgresql://neondb_owner:npg_3wKDZgEeuMI6@ep-falling-mud-adre5n6s-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const sql = neon(DATABASE_URL)

async function runMigration() {
  try {
    console.log('Running migration: Fix reviews table order_id...')

    await sql`
      ALTER TABLE reviews ALTER COLUMN order_id DROP NOT NULL
    `

    console.log('✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()