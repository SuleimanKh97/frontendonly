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
  User,
  BookOpen
} from 'lucide-react'
import apiService from '../../lib/api.js'
import { showError, showDeleteConfirm } from '../../lib/sweetAlert.js'

// Separate AuthorForm component to prevent re-rendering issues
const AuthorForm = ({ formData, handleInputChange, selectedAuthor, onSubmit, onCancel }) => (
  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl">
    <form onSubmit={onSubmit} className="space-y-8" dir="rtl">
      {/* معلومات المؤلف الأساسية */}
      <div className="bg-white p-6 rounded-xl border-2 border-amber-300 shadow-lg">
        <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
          ✍️ معلومات المؤلف الأساسية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-lg font-bold text-amber-800 flex items-center">
              👤 الاسم (إنجليزي) *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
              placeholder="أدخل اسم المؤلف بالإنجليزية..."
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="nameArabic" className="text-lg font-bold text-amber-800 flex items-center">
              👤 الاسم (عربي) *
            </Label>
            <Input
              id="nameArabic"
              value={formData.nameArabic}
              onChange={(e) => handleInputChange('nameArabic', e.target.value)}
              required
              className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
              placeholder="أدخل اسم المؤلف بالعربية..."
            />
          </div>
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="bg-white p-6 rounded-xl border-2 border-amber-300 shadow-lg">
        <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
          📋 معلومات إضافية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="nationality" className="text-lg font-bold text-amber-800 flex items-center">
              🌍 الجنسية
            </Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
              className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
              placeholder="أدخل جنسية المؤلف..."
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="birthDate" className="text-lg font-bold text-amber-800 flex items-center">
              🎂 تاريخ الميلاد
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* السيرة الذاتية */}
      <div className="bg-white p-6 rounded-xl border-2 border-amber-300 shadow-lg">
        <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
          📖 السيرة الذاتية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="biography" className="text-lg font-bold text-amber-800 flex items-center">
              📝 السيرة الذاتية (إنجليزي)
            </Label>
            <Textarea
              id="biography"
              value={formData.biography}
              onChange={(e) => handleInputChange('biography', e.target.value)}
              className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300 min-h-[120px]"
              placeholder="أدخل السيرة الذاتية بالإنجليزية..."
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="biographyArabic" className="text-lg font-bold text-amber-800 flex items-center">
              📝 السيرة الذاتية (عربي)
            </Label>
            <Textarea
              id="biographyArabic"
              value={formData.biographyArabic}
              onChange={(e) => handleInputChange('biographyArabic', e.target.value)}
              className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300 min-h-[120px]"
              placeholder="أدخل السيرة الذاتية بالعربية..."
            />
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
          {selectedAuthor ? '✅ تحديث المؤلف' : '➕ إضافة المؤلف'}
        </Button>
      </div>
    </form>
  </div>
)

export default function AuthorsManagement() {
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    nameArabic: '',
    nationality: '',
    biography: '',
    biographyArabic: '',
    birthDate: '',
    deathDate: '',
    website: '',
    email: '',
    isActive: true
  })

  useEffect(() => {
    loadAuthors()
  }, [])

  const loadAuthors = async () => {
    setLoading(true)
    try {
      const response = await apiService.getAuthors()
      setAuthors(response || [])
    } catch (error) {
      console.error('Error loading authors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Prepare data with only the fields that the backend expects
      const authorData = {
        name: formData.name,
        nameArabic: formData.nameArabic || null,
        biography: formData.biography || null,
        biographyArabic: formData.biographyArabic || null,
        birthDate: formData.birthDate ? new Date(formData.birthDate) : null,
        nationality: formData.nationality || null,
        isActive: formData.isActive
      }

      if (selectedAuthor) {
        await apiService.updateAuthor(selectedAuthor.id, authorData)
      } else {
        await apiService.createAuthor(authorData)
      }
      await loadAuthors()
      setShowAddDialog(false)
      setShowEditDialog(false)
      setSelectedAuthor(null)
      resetForm()
    } catch (error) {
      console.error('Error saving author:', error)
    }
  }

  const handleDelete = async (authorId) => {
    const result = await showDeleteConfirm('المؤلف')
    if (result.isConfirmed) {
      try {
        await apiService.deleteAuthor(authorId)
        await loadAuthors()
      } catch (error) {
        console.error('Error deleting author:', error)
        showError('حدث خطأ أثناء حذف المؤلف')
      }
    }
  }

  const handleEdit = (author) => {
    setSelectedAuthor(author)
    setFormData({
      name: author.name || '',
      nameArabic: author.nameArabic || '',
      nationality: author.nationality || '',
      biography: author.biography || '',
      biographyArabic: author.biographyArabic || '',
      birthDate: author.birthDate ? author.birthDate.split('T')[0] : '',
      isActive: author.isActive
    })
    setShowEditDialog(true)
  }

  const handleView = (author) => {
    setSelectedAuthor(author)
    setShowViewDialog(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      nameArabic: '',
      nationality: '',
      biography: '',
      biographyArabic: '',
      birthDate: '',
      isActive: true
    })
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const filteredAuthors = authors.filter(author =>
    author.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    author.nameArabic?.includes(searchTerm) ||
    author.nationality?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-black to-amber-900 bg-clip-text">✍️ إدارة المؤلفين</h2>
          <p className="text-2xl text-amber-800 font-medium">👥 إضافة وتعديل وحذف المؤلفين</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold border-2 border-green-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-3 text-lg">
          <Plus className="h-5 w-5 ml-2" />
          ➕ إضافة مؤلف جديد
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ابحث عن مؤلف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>
      </div>

      {/* Authors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuthors.map((author) => (
          <Card key={author.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {author.nameArabic || author.name}
                  </CardTitle>
                  <CardDescription>
                    {author.nationality}
                  </CardDescription>
                </div>
                <Badge variant={author.isActive ? "default" : "secondary"}>
                  {author.isActive ? 'نشط' : 'غير نشط'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                {author.birthDate && (
                  <div className="flex justify-between text-sm">
                    <span>تاريخ الميلاد:</span>
                    <span>{new Date(author.birthDate).toLocaleDateString('ar-SA')}</span>
                  </div>
                )}
                
                {author.biographyArabic && (
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {author.biographyArabic}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => handleView(author)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleEdit(author)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(author.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Author Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة مؤلف جديد</DialogTitle>
            <DialogDescription>
              أدخل بيانات المؤلف الجديد
            </DialogDescription>
          </DialogHeader>
          <AuthorForm
            formData={formData}
            handleInputChange={handleInputChange}
            selectedAuthor={selectedAuthor}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowAddDialog(false)
              resetForm()
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Author Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل المؤلف</DialogTitle>
            <DialogDescription>
              تعديل بيانات المؤلف: {selectedAuthor?.nameArabic || selectedAuthor?.name}
            </DialogDescription>
          </DialogHeader>
          <AuthorForm
            formData={formData}
            handleInputChange={handleInputChange}
            selectedAuthor={selectedAuthor}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowEditDialog(false)
              setSelectedAuthor(null)
              resetForm()
            }}
          />
        </DialogContent>
      </Dialog>

      {/* View Author Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل المؤلف</DialogTitle>
          </DialogHeader>
          {selectedAuthor && (
            <div className="space-y-4 text-right">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold">الاسم:</Label>
                  <p>{selectedAuthor.nameArabic || selectedAuthor.name}</p>
                </div>
                <div>
                  <Label className="font-bold">الجنسية:</Label>
                  <p>{selectedAuthor.nationality || 'غير محدد'}</p>
                </div>
                {selectedAuthor.birthDate && (
                  <div>
                    <Label className="font-bold">تاريخ الميلاد:</Label>
                    <p>{new Date(selectedAuthor.birthDate).toLocaleDateString('ar-SA')}</p>
                  </div>
                )}
              </div>
              
              {selectedAuthor.biographyArabic && (
                <div>
                  <Label className="font-bold">السيرة الذاتية:</Label>
                  <p className="text-gray-700">{selectedAuthor.biographyArabic}</p>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Label className="font-bold">الحالة:</Label>
                <Badge variant={selectedAuthor.isActive ? "default" : "secondary"}>
                  {selectedAuthor.isActive ? 'نشط' : 'غير نشط'}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 