import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, BookOpen, Download, MessageCircle, Loader2 } from 'lucide-react';
import apiService from '@/lib/api';

const CalendarPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            الرزنامة الطلابية
          </h1>
          <p className="text-xl text-royal-black/70 max-w-3xl mx-auto leading-relaxed">
            جداول زمنية ومواعيد مهمة لتنظيم رحلتك الدراسية بكفاءة
          </p>
        </div>

        {/* Current Month Highlight */}
        <div className="bg-gradient-to-r from-royal-gold/20 to-yellow-500/20 rounded-2xl p-8 mb-12 text-center border-2 border-royal-gold/30 shadow-lg">
          <h2 className="text-3xl font-black text-royal-black mb-4">
            شهر مارس 2024
          </h2>
          <p className="text-lg text-royal-black/80 font-medium">
            📅 امتحانات الشهر الأول • 📚 بداية المراجعة المكثفة • 📝 تسليم المشاريع
          </p>
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
                  <p className="text-royal-black/50 mt-2">سيتم إضافة الجداول قريباً</p>
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
                        {schedule.downloadable ? (
                          <Button 
                            className="flex-1 bg-gradient-to-r from-royal-gold to-yellow-500 hover:from-yellow-500 hover:to-royal-gold text-royal-black font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                            onClick={() => {
                              if (schedule.fileUrl) {
                                // Create a temporary link to download the file
                                const link = document.createElement('a');
                                link.href = schedule.fileUrl;
                                link.download = schedule.title + '.pdf';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              } else {
                                // If no file URL, show a message
                                alert('سيتم إضافة الملف قريباً!');
                              }
                            }}
                          >
                            <Download className="w-4 h-4 ml-2" />
                            تحميل الجدول
                          </Button>
                        ) : (
                          <Button 
                            disabled
                            className="flex-1 bg-gray-300 text-gray-500 cursor-not-allowed"
                          >
                            قريباً
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline"
                          className="flex-1 border-2 border-royal-gold text-royal-gold hover:bg-royal-gold hover:text-royal-black font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                          onClick={() => window.open(`https://wa.me/962791234567?text=مرحباً، أرغب في الاستفسار عن ${schedule.title}`, '_blank')}
                        >
                          <MessageCircle className="w-4 h-4 ml-2" />
                          استفسر
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Study Tips Section */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-royal-gold/20">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-black text-royal-black mb-4">
              نصائح لتنظيم الوقت والدراسة
            </h3>
            <p className="text-lg text-royal-black/70 max-w-2xl mx-auto">
              استخدم هذه النصائح لتحسين أدائك الدراسي وتحقيق أفضل النتائج
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '📚',
                title: 'تنظيم الجدول',
                tip: 'خصص وقتاً ثابتاً لكل مادة يومياً'
              },
              {
                icon: '⏰',
                title: 'إدارة الوقت',
                tip: 'استخدم تقنية البومودورو للتركيز'
              },
              {
                icon: '📝',
                title: 'المراجعة',
                tip: 'راجع ما درسته كل يوم لمدة 15 دقيقة'
              },
              {
                icon: '🎯',
                title: 'الأهداف',
                tip: 'ضع أهدافاً واقعية وقابلة للتحقيق'
              },
              {
                icon: '💪',
                title: 'الاستراحة',
                tip: 'خذ استراحة كل ساعة دراسة'
              },
              {
                icon: '🌟',
                title: 'التحفيز',
                tip: 'كافئ نفسك عند تحقيق الأهداف'
              }
            ].map((tip, index) => (
              <div key={index} className="text-center p-6 bg-gradient-to-br from-royal-beige/30 to-royal-dark-beige/30 rounded-xl border border-royal-gold/20 hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-4">{tip.icon}</div>
                <h4 className="font-black text-royal-black mb-3 text-lg">{tip.title}</h4>
                <p className="text-sm text-royal-black/70 leading-relaxed">{tip.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-royal-gold/20 to-yellow-500/20 rounded-2xl p-8 border-2 border-royal-gold/30">
            <h3 className="text-2xl font-black text-royal-black mb-4">
              تحتاج مساعدة في تنظيم جدولك؟
            </h3>
            <p className="text-royal-black/70 mb-6">
              تواصل معنا للحصول على نصائح شخصية وتنظيم جدولك الدراسي
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-royal-gold to-yellow-500 hover:from-yellow-500 hover:to-royal-gold text-royal-black font-bold px-8 py-4 text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              onClick={() => window.open('https://wa.me/962791234567?text=مرحباً، أحتاج مساعدة في تنظيم جدولي الدراسي', '_blank')}
            >
              تواصل معنا الآن
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
