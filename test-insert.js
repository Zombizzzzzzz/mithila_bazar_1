import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_3wKDZgEeuMI6@ep-falling-mud-adre5n6s-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const sql = neon(DATABASE_URL)

async function testInsert() {
  try {
    console.log('Testing product insert with features...')

    const result = await sql`
      INSERT INTO products (name, slug, description, price, category_id, image_url, images, videos, stock, is_mithila_thing, features, color_variants, sizes)
      VALUES ('Test Product', 'test-product', 'Test description', 100.00, 1, 'test.jpg', '{}', '{}', 10, false, '["feature1", "feature2"]', null, null)
      RETURNING *
    `

    console.log('Insert successful:', result[0])
  } catch (error) {
    console.error('Insert failed:', error)
  }
}

testInsert()