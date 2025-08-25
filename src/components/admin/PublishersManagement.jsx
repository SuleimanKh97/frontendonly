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
  Building,
  Phone,
  Mail,
  Globe
} from 'lucide-react'
import apiService from '../../lib/api.js'
import { showError, showDeleteConfirm } from '../../lib/sweetAlert.js'

// Separate PublisherForm component to prevent re-rendering issues
const PublisherForm = ({ formData, handleInputChange, selectedPublisher, onSubmit, onCancel }) => (
  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl">
    <form onSubmit={onSubmit} className="space-y-8" dir="rtl">
      {/* معلومات الناشر الأساسية */}
      <div className="bg-white p-6 rounded-xl border-2 border-amber-300 shadow-lg">
        <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
          🏢 معلومات الناشر الأساسية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-lg font-bold text-amber-800 flex items-center">
              🏢 الاسم (إنجليزي) *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
              placeholder="أدخل اسم الناشر بالإنجليزية..."
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="nameArabic" className="text-lg font-bold text-amber-800 flex items-center">
              🏢 الاسم (عربي) *
            </Label>
            <Input
              id="nameArabic"
              value={formData.nameArabic}
              onChange={(e) => handleInputChange('nameArabic', e.target.value)}
              required
              className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
              placeholder="أدخل اسم الناشر بالعربية..."
            />
          </div>
        </div>
      </div>

      {/* معلومات الاتصال */}
      <div className="bg-white p-6 rounded-xl border-2 border-amber-300 shadow-lg">
        <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
          📞 معلومات الاتصال
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="phone" className="text-lg font-bold text-amber-800 flex items-center">
              📱 رقم الهاتف
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
              placeholder="أدخل رقم الهاتف..."
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="email" className="text-lg font-bold text-amber-800 flex items-center">
              📧 البريد الإلكتروني
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
              placeholder="أدخل البريد الإلكتروني..."
            />
          </div>
        </div>
        
        <div className="space-y-3 mt-6">
          <Label htmlFor="website" className="text-lg font-bold text-amber-800 flex items-center">
            🌐 الموقع الإلكتروني
          </Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
            placeholder="أدخل الموقع الإلكتروني..."
          />
        </div>
      </div>

      {/* العنوان */}
      <div className="bg-white p-6 rounded-xl border-2 border-amber-300 shadow-lg">
        <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
          📍 العنوان
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="address" className="text-lg font-bold text-amber-800 flex items-center">
              📍 العنوان (إنجليزي)
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={3}
              className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
              placeholder="أدخل العنوان بالإنجليزية..."
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="addressArabic" className="text-lg font-bold text-amber-800 flex items-center">
              📍 العنوان (عربي)
            </Label>
            <Textarea
              id="addressArabic"
              value={formData.addressArabic}
              onChange={(e) => handleInputChange('addressArabic', e.target.value)}
              rows={3}
              className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white transition-all duration-300"
              placeholder="أدخل العنوان بالعربية..."
            />
          </div>
        </div>
      </div>

      {/* الوصف */}
      <div className="bg-white p-6 rounded-xl border-2 border-amber-300 shadow-lg">
        <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
          📝 الوصف
        </h3>
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
              placeholder="أدخل وصف الناشر بالإنجليزية..."
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
              placeholder="أدخل وصف الناشر بالعربية..."
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
          {selectedPublisher ? '✅ تحديث الناشر' : '➕ إضافة الناشر'}
        </Button>
      </div>
    </form>
  </div>
)

export default function PublishersManagement() {
  const [publishers, setPublishers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPublisher, setSelectedPublisher] = useState(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    nameArabic: '',
    description: '',
    descriptionArabic: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    addressArabic: '',
    isActive: true
  })

  useEffect(() => {
    loadPublishers()
  }, [])

  const loadPublishers = async () => {
    setLoading(true)
    try {
      const response = await apiService.getPublishers()
      setPublishers(response || [])
    } catch (error) {
      console.error('Error loading publishers:', error)
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
      if (selectedPublisher) {
        // Update existing publisher
        await apiService.updatePublisher(selectedPublisher.id, formData)
      } else {
        // Create new publisher
        await apiService.createPublisher(formData)
      }
      
      setShowAddDialog(false)
      setShowEditDialog(false)
      setSelectedPublisher(null)
      resetForm()
      loadPublishers()
    } catch (error) {
      console.error('Error saving publisher:', error)
      showError('حدث خطأ أثناء حفظ الناشر')
    }
  }

  const handleDelete = async (publisherId) => {
    const result = await showDeleteConfirm('الناشر')
    if (result.isConfirmed) {
      try {
        await apiService.deletePublisher(publisherId)
        loadPublishers()
      } catch (error) {
        console.error('Error deleting publisher:', error)
        showError('حدث خطأ أثناء حذف الناشر')
      }
    }
  }

  const handleEdit = (publisher) => {
    setSelectedPublisher(publisher)
    setFormData({
      name: publisher.name || '',
      nameArabic: publisher.nameArabic || '',
      description: publisher.description || '',
      descriptionArabic: publisher.descriptionArabic || '',
      phone: publisher.phone || '',
      email: publisher.email || '',
      website: publisher.website || '',
      address: publisher.address || '',
      addressArabic: publisher.addressArabic || '',
      isActive: publisher.isActive
    })
    setShowEditDialog(true)
  }

  const handleView = (publisher) => {
    setSelectedPublisher(publisher)
    setShowViewDialog(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      nameArabic: '',
      description: '',
      descriptionArabic: '',
      phone: '',
      email: '',
      website: '',
      address: '',
      addressArabic: '',
      isActive: true
    })
  }

  const filteredPublishers = publishers.filter(publisher =>
    publisher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    publisher.nameArabic?.includes(searchTerm) ||
    publisher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    publisher.phone?.includes(searchTerm)
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
          <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-black to-amber-900 bg-clip-text">🏢 إدارة الناشرين</h2>
          <p className="text-2xl text-amber-800 font-medium">🏭 إضافة وتعديل وحذف الناشرين</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold border-2 border-green-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 py-3 text-lg">
          <Plus className="h-5 w-5 ml-2" />
          ➕ إضافة ناشر جديد
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ابحث عن ناشر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>
      </div>

      {/* Publishers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPublishers.map((publisher) => (
          <Card key={publisher.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {publisher.nameArabic || publisher.name}
                  </CardTitle>
                  <CardDescription>
                    {publisher.name !== publisher.nameArabic && publisher.name}
                  </CardDescription>
                </div>
                <Badge variant={publisher.isActive ? "default" : "secondary"}>
                  {publisher.isActive ? 'نشط' : 'غير نشط'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                {publisher.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-blue-600">{publisher.email}</span>
                  </div>
                )}
                
                {publisher.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{publisher.phone}</span>
                  </div>
                )}
                
                {publisher.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="text-blue-600">{publisher.website}</span>
                  </div>
                )}
                
                {publisher.descriptionArabic && (
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {publisher.descriptionArabic}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => handleView(publisher)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleEdit(publisher)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(publisher.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Publisher Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة ناشر جديد</DialogTitle>
            <DialogDescription>
              أدخل بيانات الناشر الجديد
            </DialogDescription>
          </DialogHeader>
          <PublisherForm
            formData={formData}
            handleInputChange={handleInputChange}
            selectedPublisher={selectedPublisher}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowAddDialog(false)
              resetForm()
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Publisher Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الناشر</DialogTitle>
            <DialogDescription>
              تعديل بيانات الناشر: {selectedPublisher?.nameArabic || selectedPublisher?.name}
            </DialogDescription>
          </DialogHeader>
          <PublisherForm
            formData={formData}
            handleInputChange={handleInputChange}
            selectedPublisher={selectedPublisher}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowEditDialog(false)
              setSelectedPublisher(null)
              resetForm()
            }}
          />
        </DialogContent>
      </Dialog>

      {/* View Publisher Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الناشر</DialogTitle>
          </DialogHeader>
          {selectedPublisher && (
            <div className="space-y-4 text-right">
              <div>
                <Label className="font-bold text-lg">{selectedPublisher.nameArabic || selectedPublisher.name}</Label>
                {selectedPublisher.name !== selectedPublisher.nameArabic && (
                  <p className="text-gray-600">{selectedPublisher.name}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedPublisher.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="font-bold">البريد الإلكتروني:</Label>
                      <p className="text-blue-600">{selectedPublisher.email}</p>
                    </div>
                  </div>
                )}
                
                {selectedPublisher.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="font-bold">رقم الهاتف:</Label>
                      <p>{selectedPublisher.phone}</p>
                    </div>
                  </div>
                )}
                
                {selectedPublisher.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="font-bold">الموقع الإلكتروني:</Label>
                      <p className="text-blue-600">{selectedPublisher.website}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedPublisher.addressArabic && (
                <div>
                  <Label className="font-bold">العنوان:</Label>
                  <p className="text-gray-700">{selectedPublisher.addressArabic}</p>
                </div>
              )}
              
              {selectedPublisher.descriptionArabic && (
                <div>
                  <Label className="font-bold">الوصف:</Label>
                  <p className="text-gray-700">{selectedPublisher.descriptionArabic}</p>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Label className="font-bold">الحالة:</Label>
                <Badge variant={selectedPublisher.isActive ? "default" : "secondary"}>
                  {selectedPublisher.isActive ? 'نشط' : 'غير نشط'}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 