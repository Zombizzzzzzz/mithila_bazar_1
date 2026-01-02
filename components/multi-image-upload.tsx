'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface MultiImageUploadProps {
  value?: string[]
  onChange: (urls: string[]) => void
  className?: string
}

export function MultiImageUpload({ value = [], onChange, className }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previews, setPreviews] = useState<string[]>(value || [])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setUploading(true)

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const data = await response.json()
        return data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const newPreviews = [...previews, ...uploadedUrls]
      setPreviews(newPreviews)
      onChange(newPreviews)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image(s). Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index)
    setPreviews(newPreviews)
    onChange(newPreviews)
  }

  return (
    <div className={className}>
      <Label htmlFor="multi-image-upload">Additional Product Images</Label>

      {previews.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {previews.map((url, index) => (
            <div key={index} className="relative">
              <div className="relative aspect-square overflow-hidden rounded-lg border">
                <Image
                  src={url}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={() => handleRemove(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2">
        <Input
          ref={fileInputRef}
          id="multi-image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          multiple
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-24 border-2 border-dashed"
        >
          <div className="flex flex-col items-center gap-2">
            <ImageIcon className="h-6 w-6" />
            <span className="text-sm">
              {uploading ? 'Uploading...' : 'Upload Additional Images'}
            </span>
            <span className="text-xs text-muted-foreground">
              Multiple images supported
            </span>
          </div>
        </Button>
      </div>
    </div>
  )
}