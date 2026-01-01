import { neon } from '@neondatabase/serverless'

// Hardcode the database URL
const DATABASE_URL = 'postgresql://neondb_owner:npg_3wKDZgEeuMI6@ep-falling-mud-adre5n6s-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const sql = neon(DATABASE_URL)

async function checkTables() {
  try {
    console.log('Checking database tables...')

    // Check if tables exist
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `

    console.log('Tables found:', tables.map(t => t.table_name))

    // Check products table specifically
    if (tables.some(t => t.table_name === 'products')) {
      console.log('✅ Products table exists!')

      const products = await sql`SELECT COUNT(*) as count FROM products;`
      console.log(`📦 Products in table: ${products[0].count}`)

      if (products[0].count > 0) {
        const sampleProducts = await sql`SELECT name, slug FROM products LIMIT 3;`
        console.log('Sample products:', sampleProducts)
      }
    } else {
      console.log('❌ Products table does not exist!')
    }

    // Check categories table
    if (tables.some(t => t.table_name === 'categories')) {
      console.log('✅ Categories table exists!')

      const categories = await sql`SELECT COUNT(*) as count FROM categories;`
      console.log(`📂 Categories in table: ${categories[0].count}`)
    }

    // Check admins table
    if (tables.some(t => t.table_name === 'admins')) {
      console.log('✅ Admins table exists!')

      const admins = await sql`SELECT COUNT(*) as count FROM admins;`
      console.log(`👥 Admins in table: ${admins[0].count}`)
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error)
  }
}

checkTables()