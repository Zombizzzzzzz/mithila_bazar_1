"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/db"

interface GlobalSearchProps {
  products?: Product[]
  placeholder?: string
}

export function GlobalSearch({ products: initialProducts = [], placeholder = "Search all products..." }: GlobalSearchProps) {
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Lazy load products when user starts searching
  const loadProducts = async () => {
    if (products.length > 0) return // Already loaded

    setIsLoading(true)
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
        setFilteredProducts(data)
      }
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (query.trim() === "") {
      setFilteredProducts(products)
      setIsSearching(false)
    } else {
      // Load products if not already loaded
      if (products.length === 0) {
        loadProducts()
      }

      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredProducts(filtered)
      setIsSearching(true)
    }
  }, [query, products])

  const clearSearch = () => {
    setQuery("")
    setIsSearching(false)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 pr-12 py-4 text-lg h-14 bg-background border-2 border-border focus:border-primary"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {isSearching && (
        <div className="mb-8">
          <p className="text-muted-foreground mb-4">
            Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} for "{query}"
          </p>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">
                No products found for "{query}". Try different keywords.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}