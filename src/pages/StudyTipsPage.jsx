import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Lightbulb, 
  Calendar,
  Clock,
  BookOpen,
  Target,
  CheckCircle,
  Star,
  Users,
  Brain,
  Coffee,
  Moon,
  Sun,
  Book,
  PenTool,
  Headphones,
  Timer,
  Award,
  TrendingUp,
  Zap,
  Heart,
  Loader2
} from 'lucide-react';
import apiService from '../lib/api.js';

const StudyTipsPage = () => {
  const [selectedGrade, setSelectedGrade] = useState('first-year');
  const [studyTips, setStudyTips] = useState([]);
  const [studySchedules, setStudySchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const grades = [
    { value: 'first-year', label: 'توجيهي سنة أولى' },
    { value: 'second-year', label: 'توجيهي سنة ثانية' }
  ];

  const subjects = [
    { value: 'arabic', label: 'اللغة العربية', icon: BookOpen, color: 'bg-blue-500' },
    { value: 'english', label: 'اللغة الإنجليزية', icon: BookOpen, color: 'bg-green-500' },
    { value: 'islamic', label: 'التربية الإسلامية', icon: BookOpen, color: 'bg-purple-500' },
    { value: 'history', label: 'تاريخ الأردن', icon: BookOpen, color: 'bg-orange-500' },
    { value: 'math', label: 'الرياضيات', icon: BookOpen, color: 'bg-red-500' },
    { value: 'science', label: 'العلوم', icon: BookOpen, color: 'bg-teal-500' }
  ];

  // Fetch study tips and schedules from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch study tips
        const tipsResponse = await apiService.getStudyTips({ grade: selectedGrade });
        setStudyTips(tipsResponse || []);
        
        // Fetch study schedules
        const schedulesResponse = await apiService.getStudySchedules({ grade: selectedGrade });
        setStudySchedules(schedulesResponse || []);
        
      } catch (err) {
        console.error('Error fetching study data:', err);
        setError('حدث خطأ في تحميل البيانات');
        setStudyTips([]);
        setStudySchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedGrade]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">جاري التحميل...</h2>
            <p className="text-gray-600">يرجى الانتظار بينما نقوم بتحميل النصائح والجداول الدراسية</p>
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

  const dailySchedule = [
    {
      time: '06:00 - 07:00',
      activity: 'الاستيقاظ والتمارين الصباحية',
      icon: Sun,
      color: 'bg-yellow-500'
    },
    {
      time: '07:00 - 08:00',
      activity: 'الفطور والاستعداد للمدرسة',
      icon: Coffee,
      color: 'bg-orange-500'
    },
    {
      time: '08:00 - 14:00',
      activity: 'الدراسة في المدرسة',
      icon: Book,
      color: 'bg-blue-500'
    },
    {
      time: '14:00 - 15:00',
      activity: 'الغداء والراحة',
      icon: Heart,
      color: 'bg-green-500'
    },
    {
      time: '15:00 - 17:00',
      activity: 'الواجبات المدرسية',
      icon: PenTool,
      color: 'bg-purple-500'
    },
    {
      time: '17:00 - 18:00',
      activity: 'الراحة والترفيه',
      icon: Headphones,
      color: 'bg-pink-500'
    },
    {
      time: '18:00 - 20:00',
      activity: 'الدراسة المسائية',
      icon: Brain,
      color: 'bg-indigo-500'
    },
    {
      time: '20:00 - 21:00',
      activity: 'العشاء والراحة',
      icon: Moon,
      color: 'bg-gray-500'
    },
    {
      time: '21:00 - 22:00',
      activity: 'المراجعة الخفيفة',
      icon: BookOpen,
      color: 'bg-teal-500'
    },
    {
      time: '22:00',
      activity: 'النوم',
      icon: Moon,
      color: 'bg-blue-900'
    }
  ];

  const weeklySchedule = [
    {
      day: 'الأحد',
      subjects: ['اللغة العربية', 'الرياضيات', 'اللغة الإنجليزية'],
      focus: 'التركيز على المواد الأساسية'
    },
    {
      day: 'الاثنين',
      subjects: ['العلوم', 'التربية الإسلامية', 'تاريخ الأردن'],
      focus: 'المواد الاجتماعية والدينية'
    },
    {
      day: 'الثلاثاء',
      subjects: ['اللغة العربية', 'الرياضيات', 'اللغة الإنجليزية'],
      focus: 'مراجعة المواد الأساسية'
    },
    {
      day: 'الأربعاء',
      subjects: ['العلوم', 'التربية الإسلامية', 'تاريخ الأردن'],
      focus: 'تعمق في المواد الاجتماعية'
    },
    {
      day: 'الخميس',
      subjects: ['اللغة العربية', 'الرياضيات', 'اللغة الإنجليزية'],
      focus: 'حل تمارين إضافية'
    },
    {
      day: 'الجمعة',
      subjects: ['الراحة والترفيه', 'المراجعة الخفيفة'],
      focus: 'يوم راحة مع مراجعة خفيفة'
    },
    {
      day: 'السبت',
      subjects: ['مراجعة شاملة', 'حل أسئلة سنوات سابقة'],
      focus: 'مراجعة شاملة للأسبوع'
    }
  ];

  const generalTips = [
    {
      category: 'إعداد البيئة الدراسية',
      tips: [
        'اختر مكان هادئ ومريح للدراسة',
        'تأكد من إضاءة جيدة في مكان الدراسة',
        'احتفظ بجميع الأدوات المطلوبة قريبة منك',
        'نظف مكتبك قبل البدء بالدراسة'
      ],
      icon: Target,
      color: 'bg-blue-500'
    },
    {
      category: 'تقنيات الدراسة الفعالة',
      tips: [
        'استخدم تقنية بومودورو (25 دقيقة دراسة + 5 دقائق راحة)',
        'اكتب ملاحظات بخط يدك لتحسين التذكر',
        'اشرح المادة لنفسك أو لشخص آخر',
        'استخدم الخرائط الذهنية لتنظيم المعلومات'
      ],
      icon: Brain,
      color: 'bg-green-500'
    },
    {
      category: 'إدارة الوقت',
      tips: [
        'ضع جدول زمني واقعي وقابل للتنفيذ',
        'ابدأ بالمواد الصعبة عندما تكون أكثر تركيزاً',
        'خذ فترات راحة منتظمة لتجنب الإرهاق',
        'استخدم التطبيقات لتنظيم المهام والمواعيد'
      ],
      icon: Clock,
      color: 'bg-purple-500'
    },
    {
      category: 'الصحة والتغذية',
      tips: [
        'احصل على 8 ساعات نوم على الأقل',
        'تناول وجبات متوازنة وغنية بالعناصر الغذائية',
        'اشرب كمية كافية من الماء',
        'مارس التمارين الرياضية بانتظام'
      ],
      icon: Heart,
      color: 'bg-red-500'
    },
    {
      category: 'التغلب على التوتر',
      tips: [
        'مارس تمارين التنفس العميق',
        'خذ فترات راحة قصيرة بين جلسات الدراسة',
        'تحدث مع الأصدقاء والعائلة',
        'مارس هواياتك المفضلة'
      ],
      icon: Zap,
      color: 'bg-yellow-500'
    },
    {
      category: 'التحضير للامتحانات',
      tips: [
        'ابدأ التحضير مبكراً وليس في اللحظة الأخيرة',
        'راجع الأسئلة السابقة لفهم نمط الامتحان',
        'احضر جميع الدروس وشارك في النقاشات',
        'اطلب المساعدة من المعلمين عند الحاجة'
      ],
      icon: Award,
      color: 'bg-indigo-500'
    }
  ];

  const gradeSpecificTips = {
    'first-year': {
      title: 'نصائح خاصة بتوجيهي سنة أولى',
      tips: [
        'ركز على بناء أساس قوي في المواد الأساسية',
        'تعرف على نظام الامتحانات الجديد',
        'ابدأ في جمع المواد والملخصات مبكراً',
        'شارك في الأنشطة المدرسية لتحسين ملفك الشخصي',
        'تعلم تقنيات الدراسة الفعالة',
        'احتفظ بملف منظم لجميع المواد'
      ]
    },
    'second-year': {
      title: 'نصائح خاصة بتوجيهي سنة ثانية',
      tips: [
        'راجع المواد السابقة بانتظام',
        'حل أسئلة سنوات سابقة بكثرة',
        'ركز على نقاط الضعف وحسنها',
        'احضر الدورات التحضيرية إذا أمكن',
        'مارس الامتحانات التجريبية',
        'حافظ على صحتك النفسية والجسدية'
      ]
    }
  };

  return (
    <div className="min-h-screen bg-royal-beige py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-royal-gold rounded-full flex items-center justify-center">
              <Lightbulb className="w-8 h-8 text-royal-black" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-royal-black mb-4">نصائح وإرشادات</h1>
          <p className="text-lg text-royal-black/70 max-w-2xl mx-auto">
            دليل شامل للنجاح في التوجيهي مع جداول دراسية ونصائح عملية
          </p>
        </div>

        {/* Grade Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-royal-black mb-2">اختيار الصف</h2>
            <p className="text-royal-black/60">اختر صفك للحصول على نصائح مخصصة</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grades.map((grade) => (
              <div
                key={grade.value}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedGrade === grade.value
                    ? 'border-royal-gold bg-royal-gold/10'
                    : 'border-gray-200 hover:border-royal-gold/50'
                }`}
                onClick={() => setSelectedGrade(grade.value)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-royal-black mb-2">
                      {grade.label}
                    </h3>
                    <p className="text-royal-black/60 text-sm">
                      نصائح وجداول مخصصة لـ {grade.label}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${selectedGrade === grade.value ? 'bg-royal-gold' : 'bg-gray-200'} rounded-lg flex items-center justify-center`}>
                    <BookOpen className={`w-6 h-6 ${selectedGrade === grade.value ? 'text-royal-black' : 'text-gray-500'}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="daily" className="w-full">
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100">
              <TabsTrigger value="daily" className="data-[state=active]:bg-royal-gold data-[state=active]:text-royal-black">
                <Calendar className="w-4 h-4 ml-2" />
                الجدول اليومي
              </TabsTrigger>
              <TabsTrigger value="weekly" className="data-[state=active]:bg-royal-gold data-[state=active]:text-royal-black">
                <Clock className="w-4 h-4 ml-2" />
                الجدول الأسبوعي
              </TabsTrigger>
              <TabsTrigger value="tips" className="data-[state=active]:bg-royal-gold data-[state=active]:text-royal-black">
                <Lightbulb className="w-4 h-4 ml-2" />
                النصائح العامة
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Daily Schedule Tab */}
          <TabsContent value="daily" className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-royal-black mb-6 text-center">الجدول اليومي المثالي</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dailySchedule.map((item, index) => (
                  <Card key={index} className="hover-lift">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <Badge className="bg-royal-gold/20 text-royal-black">
                          {item.time}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-royal-black font-medium text-right">
                        {item.activity}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Weekly Schedule Tab */}
          <TabsContent value="weekly" className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-royal-black mb-6 text-center">الجدول الأسبوعي</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeklySchedule.map((day, index) => (
                  <Card key={index} className="hover-lift">
                    <CardHeader>
                      <CardTitle className="text-royal-black text-center">
                        {day.day}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-royal-black mb-2">المواد:</h4>
                        <div className="space-y-1">
                          {day.subjects.map((subject, subIndex) => (
                            <div key={subIndex} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-royal-black/70">{subject}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <h4 className="font-semibold text-royal-black mb-1">التركيز:</h4>
                        <p className="text-sm text-royal-black/60">{day.focus}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* General Tips Tab */}
          <TabsContent value="tips" className="space-y-6">
            {/* Grade Specific Tips */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-royal-black mb-6 text-center">
                {gradeSpecificTips[selectedGrade].title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gradeSpecificTips[selectedGrade].tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-royal-gold/10 rounded-lg">
                    <div className="w-8 h-8 bg-royal-gold rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="w-4 h-4 text-royal-black" />
                    </div>
                    <p className="text-royal-black font-medium">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* General Study Tips */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-royal-black mb-6 text-center">نصائح عامة للدراسة</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generalTips.map((category, index) => (
                  <Card key={index} className="hover-lift">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                          <category.icon className="w-5 h-5 text-white" />
                        </div>
                        <CardTitle className="text-royal-black">{category.category}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {category.tips.map((tip, tipIndex) => (
                          <div key={tipIndex} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-royal-black/70">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Motivation Section */}
        <div className="bg-gradient-to-r from-royal-gold to-yellow-500 rounded-2xl p-8 shadow-lg text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">نصيحة مهمة</h2>
          <p className="text-white/90 text-lg leading-relaxed max-w-3xl mx-auto">
            "النجاح ليس نهاية، والفشل ليس قاتلاً: ما يهم هو الشجاعة للاستمرار"
            <br />
            <span className="text-sm">- ونستون تشرشل</span>
          </p>
          <div className="mt-6">
            <Button 
              className="bg-white text-royal-black hover:bg-white/90 font-bold"
              onClick={() => window.open('https://wa.me/962785462983?text=مرحباً، أحتاج مساعدة في التخطيط الدراسي', '_blank')}
            >
              احصل على استشارة مجانية
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyTipsPage;
