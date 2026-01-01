import { ProductCard } from "@/components/product-card"
import { getProducts, getCategories, getCategoryBySlug } from "@/lib/db"
import { notFound } from "next/navigation"
import { GlobalSearch } from "@/components/global-search"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((category) => ({
    slug: category.slug,
  }))
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const products = await getProducts(slug)

  return (
    <main>
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="font-serif text-5xl font-bold text-foreground">{category.name}</h1>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{category.description}</p>
        </div>

        {/* Category-specific Search */}
        <div className="mb-12">
          <GlobalSearch
            products={products}
            placeholder={`Search within ${category.name}...`}
          />
        </div>

        {/* All products in category (shown when not searching) */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg text-muted-foreground">No products found in this category.</p>
          </div>
        )}
      </section>
    </main>
  )
}
