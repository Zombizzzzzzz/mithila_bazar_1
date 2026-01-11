'use client'

import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageUpload } from '@/components/image-upload'
import { MultiImageUpload } from '@/components/multi-image-upload'
import { VideoUpload } from '@/components/video-upload'
import { Checkbox } from '@/components/ui/checkbox'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Product, Category } from '@/lib/db'

interface ProductFormData {
  name: string
  description: string
  price: string
  category_id: string
  image_url: string
  images: string[]
  videos: string[]
  stock: string
  is_mithila_thing: boolean
  features: string[]
}

function EditProductForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get('id')

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [newFeature, setNewFeature] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    images: [],
    videos: [],
    stock: '',
    is_mithila_thing: false,
    features: [],
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    const session = localStorage.getItem('admin_session')
    if (!session) {
      router.push('/admin/login')
      return
    }

    try {
      const adminData = JSON.parse(session)
      const loggedInAt = new Date(adminData.loggedInAt)
      const now = new Date()
      const hoursDiff = (now.getTime() - loggedInAt.getTime()) / (1000 * 60 * 60)

      if (hoursDiff > 24) {
        localStorage.removeItem('admin_session')
        router.push('/admin/login')
        return
      }

      // If authenticated, load product and categories
      if (productId) {
        loadProduct(productId)
      }
      fetchCategories()
    } catch (error) {
      localStorage.removeItem('admin_session')
      router.push('/admin/login')
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const cats = await response.json()
        setCategories(cats)
      } else {
        console.error('Failed to fetch categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }))
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }))
  }

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({ ...prev, features: prev.features.map((f, i) => i === index ? value : f) }))
  }

  const loadProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch product')
      }
      const product: Product = await response.json()

      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category_id: product.category_id.toString(),
        image_url: product.image_url || '',
        images: product.images || [],
        videos: product.videos || [],
        stock: product.stock.toString(),
        is_mithila_thing: product.is_mithila_thing || false,
        features: Array.isArray(product.features) ? product.features : (typeof product.features === 'string' ? product.features.split(',').map(f => f.trim()).filter(f => f) : []),
      })
    } catch (error) {
      console.error('Error loading product:', error)
      alert('Failed to load product')
      router.push('/admin/products')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: productId,
          ...formData,
          price: parseFloat(formData.price),
          category_id: parseInt(formData.category_id),
          stock: parseInt(formData.stock),
          is_mithila_thing: formData.is_mithila_thing,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update product')
      }

      router.push('/admin/products')
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ProductFormData, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (fetchLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/admin/products')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Features</Label>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder="Feature"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={() => removeFeature(index)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Input
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="Add new feature"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="price">Price (रु)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_mithila_thing"
                    checked={formData.is_mithila_thing}
                    onCheckedChange={(checked) => handleInputChange('is_mithila_thing', checked as boolean)}
                  />
                  <Label htmlFor="is_mithila_thing">Is Mithila Thing?</Label>
                </div>

                <div className="md:col-span-2">
                  <ImageUpload
                    value={formData.image_url}
                    onChange={(url) => handleInputChange('image_url', url)}
                  />
                </div>

                <div className="md:col-span-2">
                  <MultiImageUpload
                    value={formData.images}
                    onChange={(urls) => handleInputChange('images', urls)}
                  />
                </div>

                <div className="md:col-span-2">
                  <VideoUpload
                    value={formData.videos}
                    onChange={(urls) => handleInputChange('videos', urls)}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Product'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function EditProductPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditProductForm />
    </Suspense>
  )
}