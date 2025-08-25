import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Save,
  MessageCircle,
  Phone,
  Mail,
  User,
  Book,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import apiService from '../../lib/api.js'
import { showError, showDeleteConfirm } from '../../lib/sweetAlert.js'

export default function InquiriesManagement() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [formData, setFormData] = useState({
    status: 'Pending',
    responseMessage: '',
    whatsAppMessageSent: false
  })

  useEffect(() => {
    loadInquiries()
  }, [])

  const loadInquiries = async () => {
    setLoading(true)
    try {
      const response = await apiService.getBookInquiries(1, 100)
      setInquiries(response.items || [])
    } catch (error) {
      console.error('Error loading inquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    try {
      await apiService.updateBookInquiry(selectedInquiry.id, formData)
      setShowEditDialog(false)
      setSelectedInquiry(null)
      resetForm()
      loadInquiries()
    } catch (error) {
      console.error('Error updating inquiry:', error)
      showError('حدث خطأ أثناء تحديث الاستفسار')
    }
  }

  const handleDelete = async (inquiryId) => {
    const result = await showDeleteConfirm('الاستفسار')
    if (result.isConfirmed) {
      try {
        await apiService.deleteBookInquiry(inquiryId)
        loadInquiries()
      } catch (error) {
        console.error('Error deleting inquiry:', error)
        showError('حدث خطأ أثناء حذف الاستفسار')
      }
    }
  }

  const handleEdit = (inquiry) => {
    setSelectedInquiry(inquiry)
    setFormData({
      status: inquiry.status || 'Pending',
      responseMessage: inquiry.responseMessage || '',
      whatsAppMessageSent: inquiry.whatsAppMessageSent || false
    })
    setShowEditDialog(true)
  }

  const handleView = (inquiry) => {
    setSelectedInquiry(inquiry)
    setShowViewDialog(true)
  }

  const resetForm = () => {
    setFormData({
      status: 'Pending',
      responseMessage: '',
      whatsAppMessageSent: false
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { variant: 'secondary', text: 'في الانتظار', icon: Clock },
      'Responded': { variant: 'default', text: 'تم الرد', icon: CheckCircle },
      'Completed': { variant: 'default', text: 'مكتمل', icon: CheckCircle },
      'Cancelled': { variant: 'destructive', text: 'ملغي', icon: XCircle }
    }
    
    const config = statusConfig[status] || statusConfig['Pending']
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredInquiries = inquiries.filter(inquiry =>
    inquiry.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.customerPhone?.includes(searchTerm) ||
    inquiry.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.book?.titleArabic?.includes(searchTerm) ||
    inquiry.message?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const InquiryForm = ({ onSubmit, onCancel, title }) => (
    <form onSubmit={onSubmit} className="space-y-4" dir="rtl">
      <div className="space-y-2">
        <Label htmlFor="status">حالة الاستفسار</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pending">في الانتظار</SelectItem>
            <SelectItem value="Responded">تم الرد</SelectItem>
            <SelectItem value="Completed">مكتمل</SelectItem>
            <SelectItem value="Cancelled">ملغي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="responseMessage">رسالة الرد</Label>
        <Textarea
          id="responseMessage"
          value={formData.responseMessage}
          onChange={(e) => setFormData({...formData, responseMessage: e.target.value})}
          rows={4}
          placeholder="أدخل رسالة الرد على الاستفسار..."
        />
      </div>

      <div className="flex items-center space-x-2 space-x-reverse">
        <input
          type="checkbox"
          id="whatsAppMessageSent"
          checked={formData.whatsAppMessageSent}
          onChange={(e) => setFormData({...formData, whatsAppMessageSent: e.target.checked})}
        />
        <Label htmlFor="whatsAppMessageSent">تم إرسال رسالة واتساب</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 ml-1" />
          تحديث
        </Button>
      </div>
    </form>
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
          <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-black to-amber-900 bg-clip-text">💬 إدارة الاستفسارات</h2>
          <p className="text-2xl text-amber-800 font-medium">📞 عرض وإدارة استفسارات العملاء</p>
        </div>
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold px-6 py-3 rounded-xl shadow-lg text-lg">
          📊 إجمالي الاستفسارات: {inquiries.length}
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ابحث في الاستفسارات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="space-y-4">
        {filteredInquiries.map((inquiry) => (
          <Card key={inquiry.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <CardTitle className="text-lg">
                      {inquiry.customerName || 'عميل غير محدد'}
                    </CardTitle>
                  </div>
                  <CardDescription>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Book className="h-3 w-3" />
                        {inquiry.book?.titleArabic || inquiry.book?.title || 'كتاب غير محدد'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(inquiry.createdAt)}
                      </span>
                    </div>
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(inquiry.status)}
                  {inquiry.whatsAppMessageSent && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <MessageCircle className="h-3 w-3 ml-1" />
                      تم الإرسال
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {inquiry.customerEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-blue-600">{inquiry.customerEmail}</span>
                    </div>
                  )}
                  
                  {inquiry.customerPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{inquiry.customerPhone}</span>
                    </div>
                  )}
                </div>
                
                {/* Message */}
                {inquiry.message && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <Label className="font-bold text-sm mb-2 block">رسالة العميل:</Label>
                    <p className="text-gray-700 text-sm">{inquiry.message}</p>
                  </div>
                )}
                
                {/* Response */}
                {inquiry.responseMessage && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Label className="font-bold text-sm mb-2 block">الرد:</Label>
                    <p className="text-gray-700 text-sm">{inquiry.responseMessage}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => handleView(inquiry)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleEdit(inquiry)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(inquiry.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Inquiry Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل الاستفسار</DialogTitle>
            <DialogDescription>
              تعديل حالة الاستفسار والرد عليه
            </DialogDescription>
          </DialogHeader>
          <InquiryForm
            onSubmit={handleUpdateStatus}
            onCancel={() => {
              setShowEditDialog(false)
              setSelectedInquiry(null)
              resetForm()
            }}
            title="تعديل الاستفسار"
          />
        </DialogContent>
      </Dialog>

      {/* View Inquiry Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الاستفسار</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4 text-right">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-3">معلومات العميل</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-bold">الاسم:</Label>
                    <p>{selectedInquiry.customerName || 'غير محدد'}</p>
                  </div>
                  {selectedInquiry.customerEmail && (
                    <div>
                      <Label className="font-bold">البريد الإلكتروني:</Label>
                      <p className="text-blue-600">{selectedInquiry.customerEmail}</p>
                    </div>
                  )}
                  {selectedInquiry.customerPhone && (
                    <div>
                      <Label className="font-bold">رقم الهاتف:</Label>
                      <p>{selectedInquiry.customerPhone}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Book Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold mb-3">معلومات الكتاب</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-bold">العنوان:</Label>
                    <p>{selectedInquiry.book?.titleArabic || selectedInquiry.book?.title || 'غير محدد'}</p>
                  </div>
                  <div>
                    <Label className="font-bold">المؤلف:</Label>
                    <p>{selectedInquiry.book?.author?.nameArabic || selectedInquiry.book?.author?.name || 'غير محدد'}</p>
                  </div>
                  <div>
                    <Label className="font-bold">السعر:</Label>
                    <p>{selectedInquiry.book?.price ? `${selectedInquiry.book.price} د.أ` : 'غير محدد'}</p>
                  </div>
                  <div>
                    <Label className="font-bold">المخزون:</Label>
                    <p>{selectedInquiry.book?.stockQuantity || 0} نسخة</p>
                  </div>
                </div>
              </div>
              
              {/* Inquiry Details */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold mb-3">تفاصيل الاستفسار</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="font-bold">تاريخ الاستفسار:</Label>
                    <p>{formatDate(selectedInquiry.createdAt)}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label className="font-bold">الحالة:</Label>
                    {getStatusBadge(selectedInquiry.status)}
                  </div>
                  
                  {selectedInquiry.whatsAppMessageSent && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">تم إرسال رسالة واتساب</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Messages */}
              {selectedInquiry.message && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <Label className="font-bold mb-2 block">رسالة العميل:</Label>
                  <p className="text-gray-700">{selectedInquiry.message}</p>
                </div>
              )}
              
              {selectedInquiry.responseMessage && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Label className="font-bold mb-2 block">الرد:</Label>
                  <p className="text-gray-700">{selectedInquiry.responseMessage}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 