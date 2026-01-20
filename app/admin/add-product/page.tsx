'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageUpload } from '@/components/image-upload'
import { MultiImageUpload } from '@/components/multi-image-upload'
import { Checkbox } from '@/components/ui/checkbox'
import { VideoUpload } from '@/components/video-upload'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Category } from '@/lib/db'

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
  color_variants: { color: string; price: string; stock: string }[]
  sizes: { size: string; stock: string }[] | string[]
}

export default function AddProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [newFeature, setNewFeature] = useState('')
  const [newVariantColor, setNewVariantColor] = useState('')
  const [newVariantPrice, setNewVariantPrice] = useState('')
  const [newVariantStock, setNewVariantStock] = useState('')
  const [newSize, setNewSize] = useState('')
  const [newSizeStock, setNewSizeStock] = useState('')
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
    color_variants: [],
    sizes: [],
  })

  useEffect(() => {
    checkAuth()
    fetchCategories()
  }, [])

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
      }
    } catch (error) {
      localStorage.removeItem('admin_session')
      router.push('/admin/login')
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

  const addVariant = () => {
    if (newVariantColor.trim() && newVariantPrice.trim() && newVariantStock.trim()) {
      const priceNum = parseFloat(newVariantPrice)
      const stockNum = parseInt(newVariantStock)
      if (!isNaN(priceNum) && !isNaN(stockNum) && stockNum >= 0) {
        setFormData(prev => ({ ...prev, color_variants: [...prev.color_variants, { color: newVariantColor.trim(), price: newVariantPrice.trim(), stock: newVariantStock.trim() }] }))
        setNewVariantColor('')
        setNewVariantPrice('')
        setNewVariantStock('')
      }
    }
  }

  const removeVariant = (index: number) => {
    setFormData(prev => ({ ...prev, color_variants: prev.color_variants.filter((_, i) => i !== index) }))
  }

  const addSize = () => {
    if (newSize.trim() && newSizeStock.trim()) {
      const stockNum = parseInt(newSizeStock)
      if (!isNaN(stockNum) && stockNum >= 0) {
        const currentSizes = Array.isArray(formData.sizes) && formData.sizes.length > 0
          ? formData.sizes.map(s => typeof s === 'string' ? { size: s, stock: '0' } : s)
          : []
        setFormData(prev => ({ 
          ...prev, 
          sizes: [...currentSizes, { size: newSize.trim(), stock: newSizeStock.trim() }] as any
        }))
        setNewSize('')
        setNewSizeStock('')
      }
    }
  }

  const removeSize = (index: number) => {
    setFormData(prev => ({ ...prev, sizes: Array.isArray(prev.sizes) ? prev.sizes.filter((_, i) => i !== index) : [] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    if (!formData.name.trim() || !formData.description.trim() || !formData.price.trim() || !formData.category_id || !formData.stock.trim()) {
      alert('Please fill all required fields')
      setLoading(false)
      return
    }

    const priceNum = parseFloat(formData.price)
    const categoryIdNum = parseInt(formData.category_id)
    const stockNum = parseInt(formData.stock)

    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid price greater than 0')
      setLoading(false)
      return
    }

    if (isNaN(categoryIdNum) || categoryIdNum <= 0) {
      alert('Please select a valid category')
      setLoading(false)
      return
    }

    if (isNaN(stockNum) || stockNum < 0) {
      alert('Please enter a valid stock quantity (0 or more)')
      setLoading(false)
      return
    }

    try {
      // Generate unique slug from name
      const baseSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Add timestamp to ensure uniqueness
      const timestamp = Date.now()
      const slug = `${baseSlug}-${timestamp}`

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          slug,
          price: priceNum,
          category_id: categoryIdNum,
          stock: stockNum,
          is_mithila_thing: formData.is_mithila_thing,
          sizes: formData.sizes && Array.isArray(formData.sizes) && formData.sizes.length > 0 
            ? formData.sizes.map((s: any) => (typeof s === 'string' ? { size: s, stock: 0 } : { size: s.size, stock: parseInt(s.stock) || 0 }))
            : null,
          color_variants: formData.color_variants.length > 0 ? formData.color_variants.map(v => ({ color: v.color, price: parseFloat(v.price), stock: parseInt(v.stock) || 0 })).filter(v => !isNaN(v.price)) : null,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        throw new Error('Failed to create product')
      }

      router.push('/admin/products')
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Failed to create product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ProductFormData, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
            <CardTitle>Add New Product</CardTitle>
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
                  <Label htmlFor="stock">Total Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
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

                {categories.find(cat => cat.id.toString() === formData.category_id)?.slug === 'watches' && (
                  <div className="md:col-span-2">
                    <Label>Color Variants (optional)</Label>
                    <div className="space-y-2">
                      {formData.color_variants.map((variant, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={variant.color}
                            onChange={(e) => setFormData(prev => ({ ...prev, color_variants: prev.color_variants.map((v, i) => i === index ? { ...v, color: e.target.value } : v) }))}
                            placeholder="Color"
                          />
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={variant.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, color_variants: prev.color_variants.map((v, i) => i === index ? { ...v, price: e.target.value } : v) }))}
                            placeholder="Price"
                          />
                          <Input
                            type="number"
                            min="0"
                            value={variant.stock || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, color_variants: prev.color_variants.map((v, i) => i === index ? { ...v, stock: e.target.value } : v) }))}
                            placeholder="Stock"
                          />
                          <Button type="button" variant="outline" size="sm" onClick={() => removeVariant(index)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                      <div className="flex items-center gap-2">
                        <Input
                          value={newVariantColor}
                          onChange={(e) => setNewVariantColor(e.target.value)}
                          placeholder="Color"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={newVariantPrice}
                          onChange={(e) => setNewVariantPrice(e.target.value)}
                          placeholder="Price"
                        />
                        <Input
                          type="number"
                          min="0"
                          value={newVariantStock}
                          onChange={(e) => setNewVariantStock(e.target.value)}
                          placeholder="Stock"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                          Add Variant
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {categories.find(cat => cat.id.toString() === formData.category_id)?.slug === 'clothings' && (
                  <div className="md:col-span-2">
                    <Label>Sizes (with stock)</Label>
                    <div className="space-y-2">
                      {Array.isArray(formData.sizes) && formData.sizes.map((size, index) => {
                        const sizeObj = typeof size === 'string' ? { size, stock: '0' } : (size as any)
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={sizeObj.size}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                sizes: Array.isArray(prev.sizes) 
                                  ? prev.sizes.map((s: any, i) => i === index ? { ...sizeObj, size: e.target.value } : s)
                                  : []
                              }))}
                              placeholder="Size"
                            />
                            <Input
                              type="number"
                              min="0"
                              value={sizeObj.stock}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                sizes: Array.isArray(prev.sizes) 
                                  ? prev.sizes.map((s: any, i) => i === index ? { ...sizeObj, stock: e.target.value } : s)
                                  : []
                              }))}
                              placeholder="Stock"
                            />
                            <Button type="button" variant="outline" size="sm" onClick={() => removeSize(index)}>
                              Remove
                            </Button>
                          </div>
                        )
                      })}
                      <div className="flex items-center gap-2">
                        <Input
                          value={newSize}
                          onChange={(e) => setNewSize(e.target.value)}
                          placeholder="Add new size"
                        />
                        <Input
                          type="number"
                          min="0"
                          value={newSizeStock}
                          onChange={(e) => setNewSizeStock(e.target.value)}
                          placeholder="Stock"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={addSize}>
                          Add Size
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

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
                  {loading ? 'Creating...' : 'Create Product'}
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