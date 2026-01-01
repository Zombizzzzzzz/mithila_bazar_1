import Link from "next/link"
import { getCategories } from "@/lib/db"
import { Package, Sparkles, Watch, Shirt } from "lucide-react"
import { GlobalSearch } from "@/components/global-search"

const categoryIcons = {
  electronics: Package,
  "hand-mades": Sparkles,
  watches: Watch,
  clothings: Shirt,
}

export async function CategoryNav() {
  const categories = await getCategories()

  return (
    <>
      {/* Global Search Bar */}
      <div className="sticky top-16 z-40 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <GlobalSearch />
        </div>
      </div>

      {/* Category Navigation */}
      <div className="sticky top-16 z-40 hidden border-b border-border/40 bg-card/50 backdrop-blur md:block">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-center gap-8 py-4">
            {categories.map((category) => {
              const Icon = categoryIcons[category.slug as keyof typeof categoryIcons]
              return (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="group flex flex-col items-center gap-2 transition-all hover:scale-105"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/50 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    {Icon && <Icon className="h-6 w-6" />}
                  </div>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                    {category.name}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 z-50 w-full border-t border-border/40 bg-background/95 pb-safe backdrop-blur md:hidden">
        <nav className="flex items-center justify-around p-2">
          {categories.map((category) => {
            const Icon = categoryIcons[category.slug as keyof typeof categoryIcons]
            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="flex flex-col items-center gap-1 p-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/50 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                  {Icon && <Icon className="h-5 w-5" />}
                </div>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
