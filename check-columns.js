import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_3wKDZgEeuMI6@ep-falling-mud-adre5n6s-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const sql = neon(DATABASE_URL)

async function checkColumns() {
  try {
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'products' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `
    console.log('Products table columns:')
    columns.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type}`)
    })
  } catch (error) {
    console.error('Error:', error)
  }
}

checkColumns()