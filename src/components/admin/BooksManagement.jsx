import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  Book,
  Save,
  X,
  CheckCircle,
  XCircle
} from 'lucide-react'
import apiService from '../../lib/api.js'
import { showError, showWarning, showDeleteConfirm } from '../../lib/sweetAlert.js'

// Separate BookForm component to prevent re-rendering issues
const BookForm = ({ formData, handleInputChange, authors, categories, publishers, selectedBook, onSubmit, onCancel }) => {
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadedImages, setUploadedImages] = useState([])
  const [imageError, setImageError] = useState('')

  const testImageLoad = (imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(imageUrl)
      img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`))
      img.src = imageUrl
    })
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setImageError('نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG, PNG, GIF, أو WebP')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت')
      return
    }

    setImageError('')
    setUploadingImage(true)

    try {
      const result = await apiService.uploadImage(file)
      console.log('Upload result:', result)
      
      const imageUrl = result.imageUrl
      console.log('Image URL:', imageUrl)
      
      // Test if image loads
      try {
        await testImageLoad(imageUrl)
        console.log('Image loaded successfully:', imageUrl)
        setUploadedImages(prev => [...prev, imageUrl])
        
        // Update cover image if this is the first image
        if (uploadedImages.length === 0) {
          handleInputChange('coverImageUrl', imageUrl)
        }
      } catch (loadError) {
        console.error('Image load test failed:', loadError)
        setImageError('تم رفع الصورة لكن لا يمكن عرضها. يرجى المحاولة مرة أخرى.')
      }
      
    } catch (error) {
      console.error('Upload error:', error)
      setImageError(error.message || 'حدث خطأ أثناء رفع الصورة')
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = (index) => {
    setUploadedImages(prev => {
      const newImages = prev.filter((_, i) => i !== index)
      // Update cover image if we removed the first image
      if (index === 0 && newImages.length > 0) {
        handleInputChange('coverImageUrl', newImages[0])
      } else if (newImages.length === 0) {
        handleInputChange('coverImageUrl', '')
      }
      return newImages
    })
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl">
      <form onSubmit={onSubmit} className="space-y-8" dir="rtl">
        {/* معلومات الكتاب الأساسية */}
        <div className="bg-white p-6 rounded-xl border-2 border-amber-300 shadow-lg">
          <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
            📚 معلومات الكتاب الأساسية
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-lg font-bold text-amber-800 flex items-center">
                🏷️ العنوان (إنجليزي) *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
                placeholder="أدخل عنوان الكتاب بالإنجليزية..."
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="titleArabic" className="text-lg font-bold text-amber-800 flex items-center">
                🏷️ العنوان (عربي) *
              </Label>
              <Input
                id="titleArabic"
                value={formData.titleArabic}
                onChange={(e) => handleInputChange('titleArabic', e.target.value)}
                required
                className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
                placeholder="أدخل عنوان الكتاب بالعربية..."
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <Label htmlFor="description" className="text-lg font-bold text-amber-800 flex items-center">
                📝 الوصف (إنجليزي)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300 min-h-[100px]"
                placeholder="أدخل وصف الكتاب بالإنجليزية..."
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <Label htmlFor="descriptionArabic" className="text-lg font-bold text-amber-800 flex items-center">
                📝 الوصف (عربي)
              </Label>
              <Textarea
                id="descriptionArabic"
                value={formData.descriptionArabic}
                onChange={(e) => handleInputChange('descriptionArabic', e.target.value)}
                className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300 min-h-[100px]"
                placeholder="أدخل وصف الكتاب بالعربية..."
              />
            </div>
          </div>
        </div>

        {/* رفع الصور */}
        <div className="bg-white p-6 rounded-xl border-2 border-amber-300 shadow-lg">
          <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
            🖼️ صور الكتاب
          </h3>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="imageUpload" className="text-lg font-bold text-amber-800 flex items-center">
                📸 رفع صورة جديدة
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-white hover:file:bg-amber-600"
                />
                {uploadingImage && (
                  <div className="flex items-center gap-2 text-amber-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-amber-500 border-t-transparent"></div>
                    <span>جاري الرفع...</span>
                  </div>
                )}
              </div>
              {imageError && (
                <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{imageError}</p>
              )}
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                📋 الصيغ المدعومة: JPG, PNG, GIF, WebP | الحد الأقصى: 5 ميجابايت
              </p>
            </div>

            {/* عرض الصور المرفوعة */}
            {uploadedImages.length > 0 && (
              <div className="space-y-3">
                <Label className="text-lg font-bold text-amber-800">
                  🖼️ الصور المرفوعة ({uploadedImages.length})
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`صورة ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-amber-300"
                        onLoad={() => {
                          console.log('Image loaded in preview:', imageUrl)
                        }}
                        onError={(e) => {
                          console.error('Error loading image in preview:', imageUrl)
                          e.target.style.display = 'none'
                          const errorDiv = e.target.nextElementSibling
                          if (errorDiv) {
                            errorDiv.style.display = 'flex'
                          }
                        }}
                      />
                      <div 
                        className="w-full h-32 bg-gray-200 rounded-lg border-2 border-amber-300 flex items-center justify-center text-gray-500"
                        style={{ display: 'none' }}
                      >
                        <div className="text-center">
                          <div className="text-red-500 mb-1">⚠️</div>
                          <span className="text-sm">خطأ في تحميل الصورة</span>
                          <div className="text-xs mt-1 text-gray-400">{imageUrl}</div>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImage(index)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          ❌ حذف
                        </Button>
                      </div>
                      {index === 0 && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                          غلاف
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* رابط الصورة اليدوي */}
            <div className="space-y-3">
              <Label htmlFor="coverImageUrl" className="text-lg font-bold text-amber-800 flex items-center">
                🔗 رابط صورة الغلاف
              </Label>
              <Input
                id="coverImageUrl"
                value={formData.coverImageUrl}
                onChange={(e) => handleInputChange('coverImageUrl', e.target.value)}
                className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
                placeholder="أدخل رابط صورة الغلاف..."
              />
            </div>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="bg-white p-6 rounded-xl border-2 border-amber-300 shadow-lg">
          <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
            📋 معلومات إضافية
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label htmlFor="isbn" className="text-lg font-bold text-amber-800 flex items-center">
                🔢 رقم ISBN
              </Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => handleInputChange('isbn', e.target.value)}
                className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
                placeholder="أدخل رقم ISBN..."
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="language" className="text-lg font-bold text-amber-800 flex items-center">
                🌐 اللغة
              </Label>
              <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                <SelectTrigger className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white">
                  <SelectValue placeholder="اختر اللغة..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-amber-300 rounded-xl">
                  <SelectItem value="Arabic" className="text-lg hover:bg-amber-100">🇸🇦 العربية</SelectItem>
                  <SelectItem value="English" className="text-lg hover:bg-amber-100">🇺🇸 الإنجليزية</SelectItem>
                  <SelectItem value="French" className="text-lg hover:bg-amber-100">🇫🇷 الفرنسية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="pages" className="text-lg font-bold text-amber-800 flex items-center">
                📄 عدد الصفحات
              </Label>
              <Input
                id="pages"
                type="number"
                value={formData.pages}
                onChange={(e) => handleInputChange('pages', e.target.value)}
                className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
                placeholder="أدخل عدد الصفحات..."
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="publicationDate" className="text-lg font-bold text-amber-800 flex items-center">
                📅 تاريخ النشر
              </Label>
              <Input
                id="publicationDate"
                type="date"
                value={formData.publicationDate}
                onChange={(e) => handleInputChange('publicationDate', e.target.value)}
                className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="price" className="text-lg font-bold text-amber-800 flex items-center">
                💰 السعر (د.أ) *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                required
                className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
                placeholder="أدخل السعر..."
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="originalPrice" className="text-lg font-bold text-amber-800 flex items-center">
                💰 السعر الأصلي (د.أ)
              </Label>
              <Input
                id="originalPrice"
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
                placeholder="أدخل السعر الأصلي..."
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="stockQuantity" className="text-lg font-bold text-amber-800 flex items-center">
                📦 الكمية المتوفرة *
              </Label>
              <Input
                id="stockQuantity"
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
                required
                className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
                placeholder="أدخل الكمية المتوفرة..."
              />
            </div>
          </div>
        </div>

        {/* المؤلف والناشر والتصنيف */}
        <div className="bg-white p-6 rounded-xl border-2 border-amber-300 shadow-lg">
          <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
            👥 المؤلف والناشر والتصنيف
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label htmlFor="authorId" className="text-lg font-bold text-amber-800 flex items-center">
                ✍️ المؤلف *
              </Label>
              <Select value={formData.authorId} onValueChange={(value) => handleInputChange('authorId', value)}>
                <SelectTrigger className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white">
                  <SelectValue placeholder="اختر المؤلف..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-amber-300 rounded-xl">
                  {authors.map(author => (
                    <SelectItem key={author.id} value={author.id.toString()} className="text-lg hover:bg-amber-100">
                      ✍️ {author.nameArabic || author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="publisherId" className="text-lg font-bold text-amber-800 flex items-center">
                🏢 الناشر *
              </Label>
              <Select value={formData.publisherId} onValueChange={(value) => handleInputChange('publisherId', value)}>
                <SelectTrigger className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white">
                  <SelectValue placeholder="اختر الناشر..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-amber-300 rounded-xl">
                  {publishers.map(publisher => (
                    <SelectItem key={publisher.id} value={publisher.id.toString()} className="text-lg hover:bg-amber-100">
                      🏢 {publisher.nameArabic || publisher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="categoryId" className="text-lg font-bold text-amber-800 flex items-center">
                🏷️ التصنيف *
              </Label>
              <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                <SelectTrigger className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white">
                  <SelectValue placeholder="اختر التصنيف..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-amber-300 rounded-xl">
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()} className="text-lg hover:bg-amber-100">
                      🏷️ {category.nameArabic || category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* خيارات الكتاب */}
        <div className="bg-white p-6 rounded-xl border-2 border-amber-300 shadow-lg">
          <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
            ⚙️ خيارات الكتاب
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 space-x-reverse p-4 bg-amber-50 rounded-xl border border-amber-200">
              <input
                type="checkbox"
                id="isAvailable"
                checked={formData.isAvailable}
                onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                className="w-5 h-5 text-amber-600 bg-amber-50 border-amber-300 rounded focus:ring-amber-500 focus:ring-2"
              />
              <Label htmlFor="isAvailable" className="text-lg font-bold text-amber-800">
                ✅ متوفر للبيع
              </Label>
            </div>

            <div className="flex items-center space-x-3 space-x-reverse p-4 bg-amber-50 rounded-xl border border-amber-200">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                className="w-5 h-5 text-amber-600 bg-amber-50 border-amber-300 rounded focus:ring-amber-500 focus:ring-2"
              />
              <Label htmlFor="isFeatured" className="text-lg font-bold text-amber-800">
                ⭐ كتاب مميز
              </Label>
            </div>

            <div className="flex items-center space-x-3 space-x-reverse p-4 bg-amber-50 rounded-xl border border-amber-200">
              <input
                type="checkbox"
                id="isNewRelease"
                checked={formData.isNewRelease}
                onChange={(e) => handleInputChange('isNewRelease', e.target.checked)}
                className="w-5 h-5 text-amber-600 bg-amber-50 border-amber-300 rounded focus:ring-amber-500 focus:ring-2"
              />
              <Label htmlFor="isNewRelease" className="text-lg font-bold text-amber-800">
                🆕 إصدار جديد
              </Label>
            </div>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-6 pt-8 justify-center">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white border-2 border-red-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            ❌ إلغاء
          </Button>
          <Button 
            type="submit"
            className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white border-2 border-green-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Save className="h-5 w-5 ml-2" />
            {selectedBook ? '✅ تحديث الكتاب' : '➕ إضافة الكتاب'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function BooksManagement() {
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [authors, setAuthors] = useState([])
  const [publishers, setPublishers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBook, setSelectedBook] = useState(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    titleArabic: '',
    isbn: '',
    description: '',
    descriptionArabic: '',
    authorId: '',
    publisherId: '',
    categoryId: '',
    publicationDate: '',
    pages: '',
    language: 'Arabic',
    price: '',
    originalPrice: '',
    stockQuantity: 0,
    coverImageUrl: '',
    isAvailable: true,
    isFeatured: false,
    isNewRelease: false
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [booksRes, categoriesRes, authorsRes, publishersRes] = await Promise.all([
        apiService.getBooks(1, 100),
        apiService.getCategories(),
        apiService.getAuthors(),
        apiService.getPublishers()
      ])

      setBooks(booksRes.items || [])
      setCategories(categoriesRes || [])
      setAuthors(authorsRes || [])
      setPublishers(publishersRes || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      console.log('Submitting book data:', formData)
      
      // Convert string IDs to numbers for backend
      const submitData = {
        title: formData.title.trim(),
        titleArabic: formData.titleArabic?.trim() || null,
        description: formData.description?.trim() || null,
        descriptionArabic: formData.descriptionArabic?.trim() || null,
        isbn: formData.isbn?.trim() || null,
        authorId: formData.authorId ? parseInt(formData.authorId) : null,
        publisherId: formData.publisherId ? parseInt(formData.publisherId) : null,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        price: formData.price ? parseFloat(formData.price) : 0,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : 0,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        pages: formData.pages ? parseInt(formData.pages) : null,
        publicationDate: formData.publicationDate || null,
        coverImageUrl: formData.coverImageUrl?.trim() || null,
        language: formData.language || 'Arabic',
        isAvailable: formData.isAvailable !== false,
        isFeatured: formData.isFeatured || false,
        isNewRelease: formData.isNewRelease || false
      }

      // Remove null values to avoid backend issues
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === null || submitData[key] === '') {
          delete submitData[key]
        }
      })

      // Ensure required fields are present
      if (!submitData.title) {
        showWarning('يرجى إدخال عنوان الكتاب')
        return
      }
      
      if (!submitData.authorId) {
        showWarning('يرجى اختيار المؤلف')
        return
      }
      
      if (!submitData.publisherId) {
        showWarning('يرجى اختيار الناشر')
        return
      }
      
      if (!submitData.categoryId) {
        showWarning('يرجى اختيار التصنيف')
        return
      }

      console.log('Final submit data:', JSON.stringify(submitData, null, 2))

      if (selectedBook) {
        // Update existing book
        console.log('Updating book with ID:', selectedBook.id)
        const updateResult = await apiService.updateBook(selectedBook.id, submitData)
        console.log('Book updated successfully:', updateResult)
      } else {
        // Create new book
        console.log('Creating new book')
        const result = await apiService.createBook(submitData)
        console.log('Book created successfully:', result)
      }
      
      setShowAddDialog(false)
      setShowEditDialog(false)
      setSelectedBook(null)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Error saving book:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      })
      
      // Show more detailed error message
      let errorMessage = 'حدث خطأ أثناء حفظ الكتاب'
      if (error.message) {
        errorMessage += `\nالتفاصيل: ${error.message}`
      }
      if (error.response) {
        errorMessage += `\nالاستجابة: ${JSON.stringify(error.response)}`
      }
      
      showError(errorMessage)
    }
  }

  const handleDelete = async (bookId) => {
    const result = await showDeleteConfirm('الكتاب')
    if (result.isConfirmed) {
      try {
        await apiService.deleteBook(bookId)
        loadData()
      } catch (error) {
        console.error('Error deleting book:', error)
        showError('حدث خطأ أثناء حذف الكتاب')
      }
    }
  }

  const handleEdit = (book) => {
    setSelectedBook(book)
    setFormData({
      title: book.title || '',
      titleArabic: book.titleArabic || '',
      isbn: book.isbn || '',
      description: book.description || '',
      descriptionArabic: book.descriptionArabic || '',
      authorId: book.authorId?.toString() || '',
      publisherId: book.publisherId?.toString() || '',
      categoryId: book.categoryId?.toString() || '',
      publicationDate: book.publicationDate ? new Date(book.publicationDate).toISOString().split('T')[0] : '',
      pages: book.pages?.toString() || '',
      language: book.language || 'Arabic',
      price: book.price?.toString() || '',
      originalPrice: book.originalPrice?.toString() || '',
      stockQuantity: book.stockQuantity?.toString() || '0',
      coverImageUrl: book.coverImageUrl || '',
      isAvailable: book.isAvailable !== false,
      isFeatured: book.isFeatured || false,
      isNewRelease: book.isNewRelease || false
    })
    setShowEditDialog(true)
  }

  const handleView = (book) => {
    setSelectedBook(book)
    setShowViewDialog(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      titleArabic: '',
      isbn: '',
      description: '',
      descriptionArabic: '',
      authorId: '',
      publisherId: '',
      categoryId: '',
      publicationDate: '',
      pages: '',
      language: 'Arabic',
      price: '',
      originalPrice: '',
      stockQuantity: 0,
      coverImageUrl: '',
      isAvailable: true,
      isFeatured: false,
      isNewRelease: false
    })
  }

  const filteredBooks = books.filter(book =>
    book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.titleArabic?.includes(searchTerm) ||
    book.isbn?.includes(searchTerm) ||
    book.authorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.authorNameArabic?.includes(searchTerm) ||
    book.author?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author?.nameArabic?.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-amber-200 to-amber-300 p-6 rounded-2xl shadow-xl border-2 border-amber-400">
        <div>
          <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-black to-amber-900 bg-clip-text">📚 إدارة الكتب</h2>
          <p className="text-2xl text-amber-800 font-medium">➕ إضافة وتعديل وحذف الكتب</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold border-2 border-green-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-3 text-lg">
          <Plus className="h-5 w-5 ml-2" />
          ➕ إضافة كتاب جديد
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-600 h-5 w-5" />
            <Input
              placeholder="🔍 ابحث عن كتاب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-12 text-right bg-white border-2 border-amber-400 focus:border-amber-500 focus:shadow-lg transition-all duration-300 rounded-xl font-medium text-black placeholder:text-amber-600"
            />
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBooks.map((book) => (
          <Card key={book.id} className="bg-gradient-to-br from-white to-amber-50 border-2 border-amber-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-2xl overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2 text-amber-900 font-bold">
                    {book.titleArabic || book.title}
                  </CardTitle>
                  <CardDescription className="text-amber-700 font-medium">
                    ✍️ {book.authorNameArabic || book.authorName || book.author?.nameArabic || book.author?.name}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  {book.isFeatured && <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold">⭐ مميز</Badge>}
                  {book.isNewRelease && <Badge variant="secondary" className="bg-gradient-to-r from-green-400 to-green-500 text-white font-bold">🆕 جديد</Badge>}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm bg-amber-50 p-2 rounded-lg">
                  <span className="font-bold text-amber-800">🏷️ التصنيف:</span>
                  <span className="text-amber-700">{book.categoryNameArabic || book.category?.nameArabic || book.category?.name}</span>
                </div>
                
                <div className="flex justify-between text-sm bg-amber-50 p-2 rounded-lg">
                  <span className="font-bold text-amber-800">🏢 الناشر:</span>
                  <span className="text-amber-700">{book.publisherNameArabic || book.publisher?.nameArabic || book.publisher?.name}</span>
                </div>
                
                <div className="flex justify-between text-sm bg-amber-50 p-2 rounded-lg">
                  <span className="font-bold text-amber-800">💰 السعر:</span>
                  <span className="text-amber-700 font-bold">{book.price ? `${book.price} د.أ` : 'غير محدد'}</span>
                </div>
                
                <div className="flex justify-between text-sm bg-amber-50 p-2 rounded-lg">
                  <span className="font-bold text-amber-800">📦 المخزون:</span>
                  <span className={`font-bold ${book.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {book.stockQuantity > 0 ? `${book.stockQuantity} نسخة` : 'غير متوفر'}
                  </span>
                </div>
                
                <div className="flex gap-2 pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleView(book)}
                    className="flex-1 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold border-2 border-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Eye className="h-4 w-4 ml-1" />
                    👁️ عرض
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(book)}
                    className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold border-2 border-amber-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Edit className="h-4 w-4 ml-1" />
                    ✏️ تعديل
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(book.id)}
                    className="flex-1 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-bold border-2 border-red-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Trash2 className="h-4 w-4 ml-1" />
                    🗑️ حذف
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Book Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-amber-50 to-amber-100">
          <DialogHeader className="bg-gradient-to-r from-amber-200 to-amber-300 p-6 rounded-xl border-2 border-amber-400 mb-6">
            <DialogTitle className="text-3xl font-bold text-amber-900 flex items-center">
              📚 إضافة كتاب جديد
            </DialogTitle>
            <DialogDescription className="text-lg text-amber-800 font-medium">
              أدخل بيانات الكتاب الجديد بالتفصيل
            </DialogDescription>
          </DialogHeader>
          <BookForm
            formData={formData}
            handleInputChange={handleInputChange}
            authors={authors}
            categories={categories}
            publishers={publishers}
            selectedBook={selectedBook}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowAddDialog(false)
              resetForm()
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Book Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-amber-50 to-amber-100">
          <DialogHeader className="bg-gradient-to-r from-amber-200 to-amber-300 p-6 rounded-xl border-2 border-amber-400 mb-6">
            <DialogTitle className="text-3xl font-bold text-amber-900 flex items-center">
              ✏️ تعديل الكتاب
            </DialogTitle>
            <DialogDescription className="text-lg text-amber-800 font-medium">
              تعديل بيانات الكتاب: {selectedBook?.titleArabic || selectedBook?.title}
            </DialogDescription>
          </DialogHeader>
          <BookForm
            formData={formData}
            handleInputChange={handleInputChange}
            authors={authors}
            categories={categories}
            publishers={publishers}
            selectedBook={selectedBook}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowEditDialog(false)
              setSelectedBook(null)
              resetForm()
            }}
          />
        </DialogContent>
      </Dialog>

      {/* View Book Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl bg-gradient-to-br from-amber-50 to-amber-100">
          <DialogHeader className="bg-gradient-to-r from-amber-200 to-amber-300 p-6 rounded-xl border-2 border-amber-400 mb-6">
            <DialogTitle className="text-3xl font-bold text-amber-900 flex items-center">
              👁️ تفاصيل الكتاب
            </DialogTitle>
          </DialogHeader>
          {selectedBook && (
            <div className="space-y-6 text-right">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl border-2 border-amber-300 shadow-lg">
                  <Label className="font-bold text-lg text-amber-800">🏷️ العنوان:</Label>
                  <p className="text-lg text-amber-900 font-medium">{selectedBook.titleArabic || selectedBook.title}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-amber-300 shadow-lg">
                  <Label className="font-bold text-lg text-amber-800">✍️ المؤلف:</Label>
                  <p className="text-lg text-amber-900 font-medium">{selectedBook.authorNameArabic || selectedBook.authorName || selectedBook.author?.nameArabic || selectedBook.author?.name}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-amber-300 shadow-lg">
                  <Label className="font-bold text-lg text-amber-800">🏷️ التصنيف:</Label>
                  <p className="text-lg text-amber-900 font-medium">{selectedBook.categoryNameArabic || selectedBook.categoryName || selectedBook.category?.nameArabic || selectedBook.category?.name}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-amber-300 shadow-lg">
                  <Label className="font-bold text-lg text-amber-800">🏢 الناشر:</Label>
                  <p className="text-lg text-amber-900 font-medium">{selectedBook.publisherNameArabic || selectedBook.publisherName || selectedBook.publisher?.nameArabic || selectedBook.publisher?.name}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-amber-300 shadow-lg">
                  <Label className="font-bold text-lg text-amber-800">💰 السعر:</Label>
                  <p className="text-lg text-amber-900 font-medium">{selectedBook.price ? `${selectedBook.price} د.أ` : 'غير محدد'}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-amber-300 shadow-lg">
                  <Label className="font-bold text-lg text-amber-800">📦 المخزون:</Label>
                  <p className={`text-lg font-medium ${selectedBook.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedBook.stockQuantity > 0 ? `${selectedBook.stockQuantity} نسخة` : 'غير متوفر'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-amber-300 shadow-lg">
                  <Label className="font-bold text-lg text-amber-800">🔢 رقم ISBN:</Label>
                  <p className="text-lg text-amber-900 font-medium">{selectedBook.isbn || 'غير محدد'}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-amber-300 shadow-lg">
                  <Label className="font-bold text-lg text-amber-800">📄 عدد الصفحات:</Label>
                  <p className="text-lg text-amber-900 font-medium">{selectedBook.pages || 'غير محدد'}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-amber-300 shadow-lg">
                  <Label className="font-bold text-lg text-amber-800">🌐 اللغة:</Label>
                  <p className="text-lg text-amber-900 font-medium">{selectedBook.language || 'العربية'}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-amber-300 shadow-lg">
                  <Label className="font-bold text-lg text-amber-800">📅 تاريخ النشر:</Label>
                  <p className="text-lg text-amber-900 font-medium">{selectedBook.publicationDate ? new Date(selectedBook.publicationDate).toLocaleDateString('ar-SA') : 'غير محدد'}</p>
                </div>
              </div>
              
              {(selectedBook.description || selectedBook.descriptionArabic) && (
                <div className="bg-white p-6 rounded-xl border-2 border-amber-300 shadow-lg">
                  <Label className="font-bold text-lg text-amber-800 mb-3 block">📝 الوصف:</Label>
                  {selectedBook.descriptionArabic && (
                    <div className="mb-4">
                      <p className="text-sm text-amber-600 font-medium mb-2">العربية:</p>
                      <p className="text-amber-900 leading-relaxed">{selectedBook.descriptionArabic}</p>
                    </div>
                  )}
                  {selectedBook.description && (
                    <div>
                      <p className="text-sm text-amber-600 font-medium mb-2">English:</p>
                      <p className="text-amber-900 leading-relaxed">{selectedBook.description}</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-4 justify-center pt-6">
                <Button
                  onClick={() => {
                    handleEdit(selectedBook)
                    setShowViewDialog(false)
                  }}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold border-2 border-amber-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Edit className="h-4 w-4 ml-2" />
                  ✏️ تعديل
                </Button>
                <Button
                  onClick={() => setShowViewDialog(false)}
                  className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold border-2 border-gray-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  ❌ إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 