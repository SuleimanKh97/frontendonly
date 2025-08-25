import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  BookOpen,
  FileText,
  Brain,
  Download,
  Star
} from 'lucide-react';
import apiService from '@/lib/api.js';
import { showSuccess, showError } from '@/lib/sweetAlert.js';

const StudyMaterialsManagement = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    subject: '',
    search: '',
    isActive: true
  });

  const [formData, setFormData] = useState({
    title: '',
    titleArabic: '',
    category: '',
    subject: '',
    teacher: '',
    description: '',
    descriptionArabic: '',
    price: 0,
    status: 'متوفر',
    delivery: 'PDF / طباعة',
    duration: '',
    features: [],
    isActive: true
  });

  useEffect(() => {
    loadMaterials();
    loadCategories();
    loadSubjects();
  }, [filters]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      // Filter out "all" values before sending to API
      const apiFilters = { ...filters };
      if (apiFilters.category === 'all') delete apiFilters.category;
      if (apiFilters.subject === 'all') delete apiFilters.subject;
      
      const response = await apiService.getStudyMaterials(apiFilters);
      setMaterials(response || []);
    } catch (error) {
      console.error('Error loading materials:', error);
      showError('فشل في تحميل المواد الدراسية');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiService.getStudyMaterialCategories();
      setCategories(response || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await apiService.getStudyMaterialSubjects();
      setSubjects(response || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await apiService.createStudyMaterial(formData);
      showSuccess('تم إنشاء المادة الدراسية بنجاح');
      setShowCreateDialog(false);
      resetForm();
      loadMaterials();
    } catch (error) {
      console.error('Error creating material:', error);
      showError('فشل في إنشاء المادة الدراسية');
    }
  };

  const handleUpdate = async () => {
    try {
      await apiService.updateStudyMaterial(editingMaterial.id, formData);
      showSuccess('تم تحديث المادة الدراسية بنجاح');
      setEditingMaterial(null);
      resetForm();
      loadMaterials();
    } catch (error) {
      console.error('Error updating material:', error);
      showError('فشل في تحديث المادة الدراسية');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المادة الدراسية؟')) {
      try {
        await apiService.deleteStudyMaterial(id);
        showSuccess('تم حذف المادة الدراسية بنجاح');
        loadMaterials();
      } catch (error) {
        console.error('Error deleting material:', error);
        showError('فشل في حذف المادة الدراسية');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleArabic: '',
      category: '',
      subject: '',
      teacher: '',
      description: '',
      descriptionArabic: '',
      price: 0,
      status: 'متوفر',
      delivery: 'PDF / طباعة',
      duration: '',
      features: [],
      isActive: true
    });
  };

  const openEditDialog = (material) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title || '',
      titleArabic: material.titleArabic || '',
      category: material.category || '',
      subject: material.subject || '',
      teacher: material.teacher || '',
      description: material.description || '',
      descriptionArabic: material.descriptionArabic || '',
      price: material.price || 0,
      status: material.status || 'متوفر',
      delivery: material.delivery || 'PDF / طباعة',
      duration: material.duration || '',
      features: material.features || [],
      isActive: material.isActive !== undefined ? material.isActive : true
    });
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'summaries': return <BookOpen className="w-4 h-4" />;
      case 'past-questions': return <FileText className="w-4 h-4" />;
      case 'worksheets': return <Brain className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'summaries': return 'الملخصات الشاملة';
      case 'past-questions': return 'أسئلة السنوات السابقة';
      case 'worksheets': return 'أوراق العمل التفاعلية';
      default: return category;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-royal-black">إدارة المواد الدراسية</h1>
          <p className="text-royal-black/60">إدارة الملخصات، الأسئلة السابقة وأوراق العمل</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-royal-gold hover:bg-yellow-500 text-royal-black">
              <Plus className="w-4 h-4 ml-2" />
              إضافة مادة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة مادة دراسية جديدة</DialogTitle>
              <DialogDescription>أدخل تفاصيل المادة الدراسية</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>العنوان (إنجليزي)</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Material Title"
                  />
                </div>
                <div>
                  <Label>العنوان (عربي)</Label>
                  <Input
                    value={formData.titleArabic}
                    onChange={(e) => setFormData({...formData, titleArabic: e.target.value})}
                    placeholder="عنوان المادة"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الفئة</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summaries">الملخصات الشاملة</SelectItem>
                      <SelectItem value="past-questions">أسئلة السنوات السابقة</SelectItem>
                      <SelectItem value="worksheets">أوراق العمل التفاعلية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>المادة</Label>
                  <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المادة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arabic">اللغة العربية</SelectItem>
                      <SelectItem value="english">اللغة الإنجليزية</SelectItem>
                      <SelectItem value="islamic">التربية الإسلامية</SelectItem>
                      <SelectItem value="history">تاريخ الأردن</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>الأستاذ</Label>
                <Input
                  value={formData.teacher}
                  onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                  placeholder="اسم الأستاذ"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الوصف (إنجليزي)</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Material description"
                  />
                </div>
                <div>
                  <Label>الوصف (عربي)</Label>
                  <Textarea
                    value={formData.descriptionArabic}
                    onChange={(e) => setFormData({...formData, descriptionArabic: e.target.value})}
                    placeholder="وصف المادة"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>السعر</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>الحالة</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="متوفر">متوفر</SelectItem>
                      <SelectItem value="غير متوفر">غير متوفر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>التوصيل</Label>
                  <Input
                    value={formData.delivery}
                    onChange={(e) => setFormData({...formData, delivery: e.target.value})}
                    placeholder="PDF / طباعة"
                  />
                </div>
              </div>

              <div>
                <Label>المدة</Label>
                <Input
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  placeholder="45 صفحة"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreate} className="bg-royal-gold hover:bg-yellow-500 text-royal-black">
                  إنشاء
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            الفلاتر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label>البحث</Label>
              <Input
                placeholder="ابحث في المواد..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            <div>
              <Label>الفئة</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الفئات" />
                </SelectTrigger>
                                 <SelectContent>
                   <SelectItem value="all">جميع الفئات</SelectItem>
                   <SelectItem value="summaries">الملخصات الشاملة</SelectItem>
                   <SelectItem value="past-questions">أسئلة السنوات السابقة</SelectItem>
                   <SelectItem value="worksheets">أوراق العمل التفاعلية</SelectItem>
                 </SelectContent>
              </Select>
            </div>
            <div>
              <Label>المادة</Label>
              <Select value={filters.subject} onValueChange={(value) => setFilters({...filters, subject: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع المواد" />
                </SelectTrigger>
                                 <SelectContent>
                   <SelectItem value="all">جميع المواد</SelectItem>
                   <SelectItem value="arabic">اللغة العربية</SelectItem>
                   <SelectItem value="english">اللغة الإنجليزية</SelectItem>
                   <SelectItem value="islamic">التربية الإسلامية</SelectItem>
                   <SelectItem value="history">تاريخ الأردن</SelectItem>
                 </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الحالة</Label>
              <Select value={filters.isActive.toString()} onValueChange={(value) => setFilters({...filters, isActive: value === 'true'})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">نشط</SelectItem>
                  <SelectItem value="false">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materials Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-gold mx-auto"></div>
          <p className="mt-2 text-royal-black/60">جاري التحميل...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(material.category)}
                    <Badge variant="outline">{getCategoryLabel(material.category)}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(material)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(material.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-right">{material.titleArabic || material.title}</CardTitle>
                <CardDescription className="text-right">
                  {material.teacher && `الأستاذ: ${material.teacher}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-royal-black/70 text-right">
                    {material.descriptionArabic || material.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-royal-gold">
                      {material.price} د.أ
                    </span>
                    <Badge className={material.status === 'متوفر' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {material.status}
                    </Badge>
                  </div>

                  <div className="flex justify-between text-sm text-royal-black/60">
                    <span>{material.duration}</span>
                    <span>{material.delivery}</span>
                  </div>

                  {material.features && material.features.length > 0 && (
                    <div className="space-y-1">
                      {material.features.slice(0, 2).map((feature, index) => (
                        <div key={index} className="flex items-center gap-1 text-sm">
                          <Star className="w-3 h-3 text-royal-gold" />
                          <span className="text-royal-black/70">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingMaterial} onOpenChange={() => setEditingMaterial(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل المادة الدراسية</DialogTitle>
            <DialogDescription>عدل تفاصيل المادة الدراسية</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>العنوان (إنجليزي)</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Material Title"
                />
              </div>
              <div>
                <Label>العنوان (عربي)</Label>
                <Input
                  value={formData.titleArabic}
                  onChange={(e) => setFormData({...formData, titleArabic: e.target.value})}
                  placeholder="عنوان المادة"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الفئة</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summaries">الملخصات الشاملة</SelectItem>
                    <SelectItem value="past-questions">أسئلة السنوات السابقة</SelectItem>
                    <SelectItem value="worksheets">أوراق العمل التفاعلية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>المادة</Label>
                <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المادة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arabic">اللغة العربية</SelectItem>
                    <SelectItem value="english">اللغة الإنجليزية</SelectItem>
                    <SelectItem value="islamic">التربية الإسلامية</SelectItem>
                    <SelectItem value="history">تاريخ الأردن</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>الأستاذ</Label>
              <Input
                value={formData.teacher}
                onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                placeholder="اسم الأستاذ"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الوصف (إنجليزي)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Material description"
                />
              </div>
              <div>
                <Label>الوصف (عربي)</Label>
                <Textarea
                  value={formData.descriptionArabic}
                  onChange={(e) => setFormData({...formData, descriptionArabic: e.target.value})}
                  placeholder="وصف المادة"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>السعر</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>الحالة</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="متوفر">متوفر</SelectItem>
                    <SelectItem value="غير متوفر">غير متوفر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>التوصيل</Label>
                <Input
                  value={formData.delivery}
                  onChange={(e) => setFormData({...formData, delivery: e.target.value})}
                  placeholder="PDF / طباعة"
                />
              </div>
            </div>

            <div>
              <Label>المدة</Label>
              <Input
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                placeholder="45 صفحة"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUpdate} className="bg-royal-gold hover:bg-yellow-500 text-royal-black">
                تحديث
              </Button>
              <Button variant="outline" onClick={() => setEditingMaterial(null)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudyMaterialsManagement;
