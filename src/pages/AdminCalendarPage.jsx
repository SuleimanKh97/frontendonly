import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, BookOpen, Download, MessageCircle, Plus, Edit, Trash2, FileText, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/lib/sweetAlert';
import apiService from '@/lib/api';

const AdminCalendarPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'امتحانات',
    date: '',
    status: 'نشط',
    downloadable: true,
    fileUrl: ''
  });

  // Load schedules from API on component mount
  useEffect(() => {
    const loadSchedules = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getSchedules();
        if (response.success) {
          setSchedules(response.data || []);
        } else {
          setError(response.message || 'حدث خطأ في تحميل الجداول');
        }
      } catch (err) {
        console.error('Error loading schedules:', err);
        setError('حدث خطأ في الاتصال بالخادم');
        // Fallback to default schedules if API fails
        const defaultSchedules = [
          {
            id: 1,
            title: 'جدول امتحانات الشهر الأول',
            description: 'جدول مواعيد امتحانات الشهر الأول لجميع المواد',
            type: 'امتحانات',
            date: '2024-03-15',
            status: 'نشط',
            downloadable: true,
            fileUrl: '/schedules/exam-schedule-1.pdf'
          },
          {
            id: 2,
            title: 'رزنامة الفصل الدراسي الثاني',
            description: 'جدول زمني كامل للفصل الدراسي الثاني مع المناسبات المهمة',
            type: 'رزنامة',
            date: '2024-02-01',
            status: 'نشط',
            downloadable: true,
            fileUrl: '/schedules/semester-2.pdf'
          }
        ];
        setSchedules(defaultSchedules);
      } finally {
        setLoading(false);
      }
    };

    loadSchedules();
  }, []);

  const getTypeColor = (type) => {
    switch (type) {
      case 'امتحانات': return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'رزنامة': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'مشاريع': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'مراجعة': return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getStatusColor = (status) => {
    return status === 'نشط' 
      ? 'bg-green-500/20 text-green-700 border-green-500/30' 
      : 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-JO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAddSchedule = async () => {
    if (!formData.title || !formData.description || !formData.date) {
      showError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const response = await apiService.createSchedule(formData);
      if (response.success) {
        setSchedules([...schedules, response.data]);
        setFormData({
          title: '',
          description: '',
          type: 'امتحانات',
          date: '',
          status: 'نشط',
          downloadable: true,
          fileUrl: ''
        });
        setIsAddDialogOpen(false);
        showSuccess('تم إضافة الجدول بنجاح');
      } else {
        showError(response.message || 'حدث خطأ في إضافة الجدول');
      }
    } catch (err) {
      console.error('Error adding schedule:', err);
      showError('حدث خطأ في الاتصال بالخادم');
    }
  };

  const handleEditSchedule = async () => {
    if (!formData.title || !formData.description || !formData.date) {
      showError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const response = await apiService.updateSchedule(editingSchedule.id, formData);
      if (response.success) {
        const updatedSchedules = schedules.map(schedule => 
          schedule.id === editingSchedule.id 
            ? { ...schedule, ...formData }
            : schedule
        );
        setSchedules(updatedSchedules);
        setEditingSchedule(null);
        setFormData({
          title: '',
          description: '',
          type: 'امتحانات',
          date: '',
          status: 'نشط',
          downloadable: true,
          fileUrl: ''
        });
        setIsEditDialogOpen(false);
        showSuccess('تم تحديث الجدول بنجاح');
      } else {
        showError(response.message || 'حدث خطأ في تحديث الجدول');
      }
    } catch (err) {
      console.error('Error updating schedule:', err);
      showError('حدث خطأ في الاتصال بالخادم');
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      const response = await apiService.deleteSchedule(id);
      if (response.success) {
        const updatedSchedules = schedules.filter(schedule => schedule.id !== id);
        setSchedules(updatedSchedules);
        showSuccess('تم حذف الجدول بنجاح');
      } else {
        showError(response.message || 'حدث خطأ في حذف الجدول');
      }
    } catch (err) {
      console.error('Error deleting schedule:', err);
      showError('حدث خطأ في الاتصال بالخادم');
    }
  };

  const openEditDialog = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      title: schedule.title,
      description: schedule.description,
      type: schedule.type,
      date: schedule.date,
      status: schedule.status,
      downloadable: schedule.downloadable,
      fileUrl: schedule.fileUrl || ''
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'امتحانات',
      date: '',
      status: 'نشط',
      downloadable: true,
      fileUrl: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-beige to-royal-dark-beige py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-royal-gold to-yellow-500 rounded-2xl flex items-center justify-center shadow-xl">
              <CalendarIcon className="w-10 h-10 text-royal-black" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-royal-black mb-4 tracking-tight">
            إدارة الرزنامة الطلابية
          </h1>
          <p className="text-xl text-royal-black/70 max-w-3xl mx-auto leading-relaxed">
            إضافة وتعديل وحذف الجداول الزمنية للطلاب
          </p>
        </div>

        {/* Add New Schedule Button */}
        <div className="text-center mb-8">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-royal-gold to-yellow-500 hover:from-yellow-500 hover:to-royal-gold text-royal-black font-bold px-8 py-4 text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                onClick={resetForm}
              >
                <Plus className="w-5 h-5 ml-2" />
                إضافة جدول جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-royal-black border-2 border-royal-gold/30 shadow-2xl" dir="rtl">
              <DialogHeader className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-royal-gold to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FileText className="w-8 h-8 text-royal-black" />
                </div>
                <DialogTitle className="text-2xl font-black text-royal-gold text-center">
                  إضافة جدول جديد
                </DialogTitle>
                <DialogDescription className="text-royal-beige text-center">
                  أدخل تفاصيل الجدول الجديد
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-right block text-royal-beige font-bold text-sm">
                    عنوان الجدول
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="text-right bg-royal-black/50 border-2 border-royal-gold/30 text-royal-beige placeholder:text-royal-beige/50 focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/20 rounded-xl transition-all duration-300"
                    placeholder="أدخل عنوان الجدول"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-right block text-royal-beige font-bold text-sm">
                    وصف الجدول
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="text-right bg-royal-black/50 border-2 border-royal-gold/30 text-royal-beige placeholder:text-royal-beige/50 focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/20 rounded-xl transition-all duration-300"
                    placeholder="أدخل وصف الجدول"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type" className="text-right block text-royal-beige font-bold text-sm">
                      نوع الجدول
                    </Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger className="bg-royal-black/50 border-2 border-royal-gold/30 text-royal-beige focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/20 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-royal-black border-2 border-royal-gold/30">
                        <SelectItem value="امتحانات">امتحانات</SelectItem>
                        <SelectItem value="رزنامة">رزنامة</SelectItem>
                        <SelectItem value="مشاريع">مشاريع</SelectItem>
                        <SelectItem value="مراجعة">مراجعة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status" className="text-right block text-royal-beige font-bold text-sm">
                      الحالة
                    </Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                      <SelectTrigger className="bg-royal-black/50 border-2 border-royal-gold/30 text-royal-beige focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/20 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-royal-black border-2 border-royal-gold/30">
                        <SelectItem value="نشط">نشط</SelectItem>
                        <SelectItem value="قريباً">قريباً</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="date" className="text-right block text-royal-beige font-bold text-sm">
                    تاريخ النشر
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="text-right bg-royal-black/50 border-2 border-royal-gold/30 text-royal-beige focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/20 rounded-xl transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="fileUrl" className="text-right block text-royal-beige font-bold text-sm">
                    رابط الملف (اختياري)
                  </Label>
                  <Input
                    id="fileUrl"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({...formData, fileUrl: e.target.value})}
                    className="text-right bg-royal-black/50 border-2 border-royal-gold/30 text-royal-beige placeholder:text-royal-beige/50 focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/20 rounded-xl transition-all duration-300"
                    placeholder="أدخل رابط الملف"
                  />
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    id="downloadable"
                    type="checkbox"
                    checked={formData.downloadable}
                    onChange={(e) => setFormData({...formData, downloadable: e.target.checked})}
                    className="w-4 h-4 text-royal-gold bg-royal-black border-royal-gold rounded focus:ring-royal-gold"
                  />
                  <Label htmlFor="downloadable" className="text-royal-beige font-bold text-sm">
                    متاح للتحميل
                  </Label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1 border-2 border-royal-gold/50 text-royal-gold hover:bg-royal-gold hover:text-royal-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleAddSchedule}
                  className="flex-1 bg-gradient-to-r from-royal-gold to-yellow-500 hover:from-yellow-500 hover:to-royal-gold text-royal-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  إضافة الجدول
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <Loader2 className="w-12 h-12 text-royal-gold animate-spin" />
            </div>
            <p className="text-xl text-royal-black/70">جاري تحميل الجداول...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 max-w-2xl mx-auto">
              <p className="text-xl text-red-700 mb-4">⚠️ حدث خطأ في تحميل الجداول</p>
              <p className="text-royal-black/70 mb-6">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-royal-gold to-yellow-500 hover:from-yellow-500 hover:to-royal-gold text-royal-black font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                إعادة المحاولة
              </Button>
            </div>
          </div>
        )}

        {/* Schedules Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {schedules.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <div className="bg-royal-beige/30 border border-royal-gold/20 rounded-2xl p-8">
                  <p className="text-xl text-royal-black/70">لا توجد جداول متاحة حالياً</p>
                  <p className="text-royal-black/50 mt-2">اضغط "إضافة جدول جديد" لبدء إضافة الجداول</p>
                </div>
              </div>
            ) : (
              schedules.map((schedule) => (
            <Card key={schedule.id} className="bg-white hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-royal-gold/20 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 bg-gradient-to-br from-royal-gold to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-7 h-7 text-royal-black" />
                  </div>
                  <div className="flex gap-2 flex-col items-end">
                    <Badge className={`${getStatusColor(schedule.status)} border font-bold`}>
                      {schedule.status}
                    </Badge>
                    <Badge className={`${getTypeColor(schedule.type)} border font-bold`}>
                      {schedule.type}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-royal-black text-right text-xl font-black mt-4">
                  {schedule.title}
                </CardTitle>
                <CardDescription className="text-royal-black/70 text-right text-base leading-relaxed">
                  {schedule.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-sm text-royal-black/70 text-right bg-royal-beige/30 p-3 rounded-xl">
                    📅 تاريخ النشر: {formatDate(schedule.date)}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      className="flex-1 border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      onClick={() => openEditDialog(schedule)}
                    >
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="flex-1 border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
              ))
            )}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md bg-royal-black border-2 border-royal-gold/30 shadow-2xl" dir="rtl">
            <DialogHeader className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-royal-gold to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Edit className="w-8 h-8 text-royal-black" />
              </div>
              <DialogTitle className="text-2xl font-black text-royal-gold text-center">
                تعديل الجدول
              </DialogTitle>
              <DialogDescription className="text-royal-beige text-center">
                عدل تفاصيل الجدول
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title" className="text-right block text-royal-beige font-bold text-sm">
                  عنوان الجدول
                </Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="text-right bg-royal-black/50 border-2 border-royal-gold/30 text-royal-beige placeholder:text-royal-beige/50 focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/20 rounded-xl transition-all duration-300"
                  placeholder="أدخل عنوان الجدول"
                />
              </div>

              <div>
                <Label htmlFor="edit-description" className="text-right block text-royal-beige font-bold text-sm">
                  وصف الجدول
                </Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="text-right bg-royal-black/50 border-2 border-royal-gold/30 text-royal-beige placeholder:text-royal-beige/50 focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/20 rounded-xl transition-all duration-300"
                  placeholder="أدخل وصف الجدول"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-type" className="text-right block text-royal-beige font-bold text-sm">
                    نوع الجدول
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger className="bg-royal-black/50 border-2 border-royal-gold/30 text-royal-beige focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/20 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-royal-black border-2 border-royal-gold/30">
                      <SelectItem value="امتحانات">امتحانات</SelectItem>
                      <SelectItem value="رزنامة">رزنامة</SelectItem>
                      <SelectItem value="مشاريع">مشاريع</SelectItem>
                      <SelectItem value="مراجعة">مراجعة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-status" className="text-right block text-royal-beige font-bold text-sm">
                    الحالة
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger className="bg-royal-black/50 border-2 border-royal-gold/30 text-royal-beige focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/20 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-royal-black border-2 border-royal-gold/30">
                      <SelectItem value="نشط">نشط</SelectItem>
                      <SelectItem value="قريباً">قريباً</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-date" className="text-right block text-royal-beige font-bold text-sm">
                  تاريخ النشر
                </Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="text-right bg-royal-black/50 border-2 border-royal-gold/30 text-royal-beige focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/20 rounded-xl transition-all duration-300"
                />
              </div>

              <div>
                <Label htmlFor="edit-fileUrl" className="text-right block text-royal-beige font-bold text-sm">
                  رابط الملف (اختياري)
                </Label>
                <Input
                  id="edit-fileUrl"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({...formData, fileUrl: e.target.value})}
                  className="text-right bg-royal-black/50 border-2 border-royal-gold/30 text-royal-beige placeholder:text-royal-beige/50 focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/20 rounded-xl transition-all duration-300"
                  placeholder="أدخل رابط الملف"
                />
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  id="edit-downloadable"
                  type="checkbox"
                  checked={formData.downloadable}
                  onChange={(e) => setFormData({...formData, downloadable: e.target.checked})}
                  className="w-4 h-4 text-royal-gold bg-royal-black border-royal-gold rounded focus:ring-royal-gold"
                />
                <Label htmlFor="edit-downloadable" className="text-royal-beige font-bold text-sm">
                  متاح للتحميل
                </Label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1 border-2 border-royal-gold/50 text-royal-gold hover:bg-royal-gold hover:text-royal-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleEditSchedule}
                className="flex-1 bg-gradient-to-r from-royal-gold to-yellow-500 hover:from-yellow-500 hover:to-royal-gold text-royal-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                حفظ التعديلات
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminCalendarPage;
