import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      {/* Loading Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Spinner className="size-8" />
          <h2 className="text-xl font-semibold text-foreground">Loading Category...</h2>
        </div>
        <p className="text-muted-foreground">Please wait while we load the products</p>
      </div>

      {/* Category Content Skeleton */}
      <div className="w-full max-w-6xl px-4">
        {/* Category Header */}
        <div className="text-center mb-8">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <Skeleton className="h-12 w-full max-w-2xl mx-auto" />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full rounded-lg" />
              <div className="space-y-2 px-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}