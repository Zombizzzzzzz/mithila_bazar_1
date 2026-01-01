import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import type { Product } from "@/lib/db"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.slug}`} className="group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardContent className="p-0">
          <div className="relative aspect-[3/2] sm:aspect-[4/3] overflow-hidden bg-muted">
            <Image
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-1.5 p-2 sm:p-3">
          <h3 className="text-pretty font-serif text-sm sm:text-base font-semibold leading-tight text-foreground line-clamp-2 group-hover:text-primary">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-serif text-lg sm:text-xl font-bold text-foreground">रु {Number(product.price).toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <span>Stock: {product.stock}</span>
            <span>Sold: {product.sales_count}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
