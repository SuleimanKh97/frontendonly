import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Save,
  Tag,
  BookOpen
} from 'lucide-react'
import apiService from '../../lib/api.js'
import { showError, showDeleteConfirm } from '../../lib/sweetAlert.js'

// Separate CategoryForm component to prevent re-rendering issues
const CategoryForm = ({ formData, handleInputChange, selectedCategory, onSubmit, onCancel }) => (
  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl">
    <form onSubmit={onSubmit} className="space-y-8" dir="rtl">
      {/* معلومات التصنيف الأساسية */}
      <div className="bg-white p-6 rounded-xl border-2 border-amber-300 shadow-lg">
        <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
          🏷️ معلومات التصنيف الأساسية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-lg font-bold text-amber-800 flex items-center">
              🏷️ الاسم (إنجليزي) *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
              placeholder="أدخل اسم التصنيف بالإنجليزية..."
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="nameArabic" className="text-lg font-bold text-amber-800 flex items-center">
              🏷️ الاسم (عربي) *
            </Label>
            <Input
              id="nameArabic"
              value={formData.nameArabic}
              onChange={(e) => handleInputChange('nameArabic', e.target.value)}
              required
              className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
              placeholder="أدخل اسم التصنيف بالعربية..."
            />
          </div>
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="bg-white p-6 rounded-xl border-2 border-amber-300 shadow-lg">
        <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
          📋 معلومات إضافية
        </h3>
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="icon" className="text-lg font-bold text-amber-800 flex items-center">
              🎨 الأيقونة
            </Label>
            <Input
              id="icon"
              placeholder="مثال: fas fa-book"
              value={formData.icon}
              onChange={(e) => handleInputChange('icon', e.target.value)}
              className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="description" className="text-lg font-bold text-amber-800 flex items-center">
                📝 الوصف (إنجليزي)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
                placeholder="أدخل وصف التصنيف بالإنجليزية..."
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="descriptionArabic" className="text-lg font-bold text-amber-800 flex items-center">
                📝 الوصف (عربي)
              </Label>
              <Textarea
                id="descriptionArabic"
                value={formData.descriptionArabic}
                onChange={(e) => handleInputChange('descriptionArabic', e.target.value)}
                rows={3}
                className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
                placeholder="أدخل وصف التصنيف بالعربية..."
              />
            </div>
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
          {selectedCategory ? '✅ تحديث التصنيف' : '➕ إضافة التصنيف'}
        </Button>
      </div>
    </form>
  </div>
)

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    nameArabic: '',
    description: '',
    descriptionArabic: '',
    icon: '',
    isActive: true
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const response = await apiService.getCategories()
      setCategories(response || [])
    } catch (error) {
      console.error('Error loading categories:', error)
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
      if (selectedCategory) {
        // Update existing category
        await apiService.updateCategory(selectedCategory.id, formData)
      } else {
        // Create new category
        await apiService.createCategory(formData)
      }
      
      setShowAddDialog(false)
      setShowEditDialog(false)
      setSelectedCategory(null)
      resetForm()
      loadCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      showError('حدث خطأ أثناء حفظ التصنيف')
    }
  }

  const handleDelete = async (categoryId) => {
    const result = await showDeleteConfirm('التصنيف')
    if (result.isConfirmed) {
      try {
        await apiService.deleteCategory(categoryId)
        loadCategories()
      } catch (error) {
        console.error('Error deleting category:', error)
        showError('حدث خطأ أثناء حذف التصنيف')
      }
    }
  }

  const handleEdit = (category) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name || '',
      nameArabic: category.nameArabic || '',
      description: category.description || '',
      descriptionArabic: category.descriptionArabic || '',
      icon: category.icon || '',
      isActive: category.isActive
    })
    setShowEditDialog(true)
  }

  const handleView = (category) => {
    setSelectedCategory(category)
    setShowViewDialog(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      nameArabic: '',
      description: '',
      descriptionArabic: '',
      icon: '',
      isActive: true
    })
  }

  const filteredCategories = categories.filter(category =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.nameArabic?.includes(searchTerm) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.descriptionArabic?.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-amber-50 to-amber-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-400 border-t-transparent mx-auto mb-6"></div>
          <p className="text-2xl font-bold text-amber-800">🔄 جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-amber-200 to-amber-300 p-6 rounded-2xl shadow-xl border-2 border-amber-400">
        <div>
          <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-black to-amber-900 bg-clip-text">🏷️ إدارة التصنيفات</h2>
          <p className="text-2xl text-amber-800 font-medium">📂 إضافة وتعديل وحذف التصنيفات</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold border-2 border-green-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-3 text-lg">
          <Plus className="h-5 w-5 ml-2" />
          ➕ إضافة تصنيف جديد
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ابحث عن تصنيف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {category.icon && (
                      <i className={`${category.icon} text-lg text-blue-600`}></i>
                    )}
                    <CardTitle className="text-lg">
                      {category.nameArabic || category.name}
                    </CardTitle>
                  </div>
                  <CardDescription>
                    {category.name !== category.nameArabic && category.name}
                  </CardDescription>
                </div>
                <Badge variant={category.isActive ? "default" : "secondary"}>
                  {category.isActive ? 'نشط' : 'غير نشط'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                {category.descriptionArabic && (
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {category.descriptionArabic}
                  </div>
                )}
                
                {category.description && category.description !== category.descriptionArabic && (
                  <div className="text-sm text-gray-500 line-clamp-2">
                    {category.description}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => handleView(category)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(category.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Category Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة تصنيف جديد</DialogTitle>
            <DialogDescription>
              أدخل بيانات التصنيف الجديد
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            formData={formData}
            handleInputChange={handleInputChange}
            selectedCategory={selectedCategory}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowAddDialog(false)
              resetForm()
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل التصنيف</DialogTitle>
            <DialogDescription>
              تعديل بيانات التصنيف: {selectedCategory?.nameArabic || selectedCategory?.name}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            formData={formData}
            handleInputChange={handleInputChange}
            selectedCategory={selectedCategory}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowEditDialog(false)
              setSelectedCategory(null)
              resetForm()
            }}
          />
        </DialogContent>
      </Dialog>

      {/* View Category Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل التصنيف</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4 text-right">
              <div className="flex items-center gap-2">
                {selectedCategory.icon && (
                  <i className={`${selectedCategory.icon} text-2xl text-blue-600`}></i>
                )}
                <div>
                  <Label className="font-bold text-lg">{selectedCategory.nameArabic || selectedCategory.name}</Label>
                  {selectedCategory.name !== selectedCategory.nameArabic && (
                    <p className="text-gray-600">{selectedCategory.name}</p>
                  )}
                </div>
              </div>
              
              {selectedCategory.descriptionArabic && (
                <div>
                  <Label className="font-bold">الوصف:</Label>
                  <p className="text-gray-700">{selectedCategory.descriptionArabic}</p>
                </div>
              )}
              
              {selectedCategory.description && selectedCategory.description !== selectedCategory.descriptionArabic && (
                <div>
                  <Label className="font-bold">الوصف (إنجليزي):</Label>
                  <p className="text-gray-700">{selectedCategory.description}</p>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Label className="font-bold">الحالة:</Label>
                <Badge variant={selectedCategory.isActive ? "default" : "secondary"}>
                  {selectedCategory.isActive ? 'نشط' : 'غير نشط'}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 