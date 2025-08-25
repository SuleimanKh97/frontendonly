import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  BookOpen, 
  FileText, 
  Brain,
  Download,
  Eye,
  MessageCircle,
  Star,
  Clock,
  Users,
  CheckCircle,
  Play,
  Loader2
} from 'lucide-react';
import apiService from '../lib/api.js';

const SuccessGuidePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { value: 'all', label: 'جميع الفئات' },
    { value: 'summaries', label: 'الملخصات الشاملة' },
    { value: 'past-questions', label: 'أسئلة السنوات السابقة' },
    { value: 'worksheets', label: 'أوراق العمل التفاعلية' }
  ];

  const subjects = [
    { value: 'all', label: 'جميع المواد' },
    { value: 'arabic', label: 'اللغة العربية' },
    { value: 'english', label: 'اللغة الإنجليزية' },
    { value: 'islamic', label: 'التربية الإسلامية' },
    { value: 'history', label: 'تاريخ الأردن' }
  ];

  // Fetch materials from API
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Prepare filters
        const filters = {};
        if (selectedCategory !== 'all') filters.category = selectedCategory;
        if (selectedSubject !== 'all') filters.subject = selectedSubject;
        
        const response = await apiService.getStudyMaterials(filters);
        setMaterials(response || []);
      } catch (err) {
        console.error('Error fetching materials:', err);
        setError('حدث خطأ في تحميل البيانات');
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [selectedCategory, selectedSubject]);

  const filteredMaterials = materials.filter(material => {
    const categoryMatch = selectedCategory === 'all' || material.category === selectedCategory;
    const subjectMatch = selectedSubject === 'all' || material.subject === selectedSubject;
    return categoryMatch && subjectMatch;
  });

  const getStatusColor = (status) => {
    return status === 'متوفر' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'summaries': return 'bg-blue-500';
      case 'past-questions': return 'bg-green-500';
      case 'worksheets': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getSubjectColor = (subject) => {
    switch (subject) {
      case 'arabic': return 'bg-blue-600 text-white';
      case 'english': return 'bg-green-600 text-white';
      case 'islamic': return 'bg-purple-600 text-white';
      case 'history': return 'bg-orange-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'summaries': return <BookOpen className="w-6 h-6 text-white" />;
      case 'past-questions': return <FileText className="w-6 h-6 text-white" />;
      case 'worksheets': return <Brain className="w-6 h-6 text-white" />;
      default: return <BookOpen className="w-6 h-6 text-white" />;
    }
  };

  const handleWhatsAppMessage = (material) => {
    const message = `مرحباً، أريد معلومات عن: ${material.titleArabic || material.title}`;
    const whatsappUrl = `https://wa.me/0785462983?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">جاري التحميل...</h2>
            <p className="text-gray-600">يرجى الانتظار بينما نقوم بتحميل المواد الدراسية</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">خطأ في التحميل</p>
              <p>{error}</p>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-royal-beige py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-royal-gold rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-royal-black" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-royal-black mb-4">دليل النجاح</h1>
          <p className="text-lg text-royal-black/70 max-w-2xl mx-auto">
            مجموعة شاملة من الملخصات، الأسئلة السابقة وأوراق العمل التفاعلية لضمان النجاح في التوجيهي
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-royal-black mb-2">
                فئة المنتج
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-royal-gold/30 focus:border-royal-gold">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-royal-black mb-2">
                المادة
              </label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="border-royal-gold/30 focus:border-royal-gold">
                  <SelectValue placeholder="اختر المادة" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.value} value={subject.value}>
                      {subject.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedCategory !== 'all' || selectedSubject !== 'all') && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-royal-gold/20">
              <span className="text-sm text-royal-black/70">الفلاتر النشطة:</span>
              {selectedCategory !== 'all' && (
                <Badge className="bg-royal-gold/20 text-royal-black">
                  {categories.find(c => c.value === selectedCategory)?.label}
                </Badge>
              )}
              {selectedSubject !== 'all' && (
                <Badge className={getSubjectColor(selectedSubject)}>
                  {subjects.find(s => s.value === selectedSubject)?.label}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="hover-lift bg-white shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 ${getCategoryColor(material.category)} rounded-lg flex items-center justify-center mb-2`}>
                    {getCategoryIcon(material.category)}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getStatusColor(material.status)}>
                      {material.status}
                    </Badge>
                    <Badge className={getSubjectColor(material.subject)}>
                      {subjects.find(s => s.value === material.subject)?.label}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-royal-black text-right">{material.titleArabic || material.title}</CardTitle>
                <CardDescription className="text-royal-black/60 text-right">
                  {categories.find(c => c.value === material.category)?.label} • {material.teacher}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-royal-black/70 text-right">
                    {material.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-royal-gold">
                      {material.price} د.أ
                    </span>
                    <span className="text-sm text-royal-black/60">
                      {material.duration}
                    </span>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-royal-black/60">التقييم:</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-royal-gold fill-current" />
                        <span className="text-royal-black font-medium">{material.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-royal-black/60">التحميلات:</span>
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4 text-royal-gold" />
                        <span className="text-royal-black font-medium">{material.downloads}</span>
                      </div>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-1">
                    {material.features.slice(0, 2).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-royal-black/70">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      className="flex-1 border-royal-gold text-royal-gold hover:bg-royal-gold hover:text-royal-black"
                    >
                      <Eye className="h-4 w-4 ml-1" />
                      معاينة
                    </Button>
                    <Button 
                      className="flex-1 bg-royal-gold hover:bg-royal-gold/90 text-royal-black font-medium"
                      onClick={() => handleWhatsAppMessage(material)}
                    >
                      <MessageCircle className="h-4 w-4 ml-1" />
                      طلب
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredMaterials.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-royal-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-royal-gold" />
            </div>
            <h3 className="text-xl font-semibold text-royal-black mb-2">
              لا توجد مواد متاحة
            </h3>
            <p className="text-royal-black/60">
              لم نجد مواد تطابق الفلاتر المحددة. جرب تغيير الفلاتر أو اختيار "جميع الفئات".
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessGuidePage;
