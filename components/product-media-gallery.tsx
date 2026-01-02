'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProductMediaGalleryProps {
  imageUrl?: string
  images?: string[]
  videos?: string[]
  productName: string
}

export function ProductMediaGallery({ imageUrl, images = [], videos = [], productName }: ProductMediaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Combine all media: primary image first, then additional images, then videos
  const allMedia = [
    ...(imageUrl ? [{ type: 'image', url: imageUrl }] : []),
    ...images.map(url => ({ type: 'image', url })),
    ...videos.map(url => ({ type: 'video', url }))
  ]

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % allMedia.length)
  }

  const prevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length)
  }

  const goToMedia = (index: number) => {
    setCurrentIndex(index)
  }

  if (allMedia.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted flex items-center justify-center">
        <Image
          src="/placeholder.svg"
          alt={productName}
          width={400}
          height={400}
          className="opacity-50"
        />
      </div>
    )
  }

  const currentMedia = allMedia[currentIndex]

  return (
    <div className="relative">
      {/* Main Media Display */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
        {currentMedia.type === 'image' ? (
          <Image
            src={currentMedia.url}
            alt={`${productName} - ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority={currentIndex === 0}
          />
        ) : (
          <video
            src={currentMedia.url}
            className="w-full h-full object-cover"
            controls
            poster={imageUrl || "/placeholder.svg"}
          />
        )}

        {/* Navigation Arrows */}
        {allMedia.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full p-0 bg-white/80 hover:bg-white"
              onClick={prevMedia}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full p-0 bg-white/80 hover:bg-white"
              onClick={nextMedia}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {allMedia.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {allMedia.map((media, index) => (
            <button
              key={index}
              onClick={() => goToMedia(index)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                index === currentIndex ? 'border-primary' : 'border-muted'
              }`}
            >
              {media.type === 'image' ? (
                <Image
                  src={media.url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <video
                    src={media.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-black rounded-full"></div>
                    </div>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Media Counter */}
      {allMedia.length > 1 && (
        <div className="text-sm text-muted-foreground mt-2">
          {currentIndex + 1} of {allMedia.length}
        </div>
      )}
    </div>
  )
}