import { Button } from '@/components/ui/button';
import { BookOpen, Circle, Book, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {

  return (
    <section className="relative overflow-hidden">
      {/* Hero Background */}
      <div className="py-20 lg:py-32 relative" style={{ background: 'linear-gradient(135deg, #1c1403 0%, #f1b227 100%)', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Logo */}
            <div className="mb-12 flex justify-center">
              <div className="w-24 h-24 lg:w-32 lg:h-32 flex items-center justify-center hover:scale-110 transition-transform duration-500">
                <img 
                  src="/royal-study-logo.png" 
                  alt="ROYAL STUDY Logo" 
                  className="w-20 h-20 lg:w-28 lg:h-28 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <BookOpen className="w-16 h-16 lg:w-24 lg:h-24 text-royal-black hidden" />
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-black text-white mb-6 tracking-tight">
              <span className="text-[#EDB413] font-black">المكتبة الملكية</span>
              <br />
              <span className="text-2xl lg:text-4xl font-bold text-white/90">Royal Study</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 mb-8 font-medium leading-relaxed">
              وجهتك الأولى للتفوق الأكاديمي - دوسيات، كتب، قرطاسية وكورسات تعليمية
            </p>
            <p className="text-lg text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              متخصصون في خدمة طلاب التوجيهي الأردني بأفضل المواد التعليمية والدعم الأكاديمي
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                className="bg-[#EDB413] hover:bg-[#EDB413]/90 text-black font-bold px-8 py-4 text-lg rounded-xl shadow-xl hover:shadow-2xl hover-scale hover-glow transition-all duration-300"
                onClick={() => window.open('https://wa.me/962785462983?text=مرحباً، أرغب في الاستفسار عن خدماتكم', '_blank')}
              >
                ابدأ رحلتك التعليمية
              </Button>
              <Link to="/books">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-[#EDB413] text-[#EDB413] hover:bg-[#EDB413] hover:text-black hover:border-[#EDB413] font-bold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl hover-scale hover-glow transition-all duration-300"
                >
                  تصفح المنتجات
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Services Preview */}
      <div className="py-20" style={{ background: 'linear-gradient(135deg, #1c1403 0%, #f1b227 100%)', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">
              خدماتنا الأساسية
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed font-medium">
              كل ما تحتاجه للتفوق الأكاديمي في مكان واحد
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/books" className="group relative">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden border border-[#EDB413]/30">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#EDB413]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-16 h-16 bg-[#EDB413] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg relative z-10">
                  <Book className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 relative z-10">سوق الطلاب</h3>
                <p className="text-white/70 leading-relaxed relative z-10">كتب ودوسيات وقرطاسية</p>
              </div>
            </Link>
            
            <Link to="/quizzes" className="group relative">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden border border-[#EDB413]/30">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#EDB413]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-16 h-16 bg-[#EDB413] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg relative z-10">
                  <Circle className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 relative z-10">كويزاتك التفاعلية</h3>
                <p className="text-white/70 leading-relaxed relative z-10">اختبر معلوماتك في جميع المواد</p>
              </div>
            </Link>
            
            <Link to="/calendar" className="group relative">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden border border-[#EDB413]/30">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#EDB413]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-16 h-16 bg-[#EDB413] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg relative z-10">
                  <Calendar className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 relative z-10">الرزنامة الطلابية</h3>
                <p className="text-white/70 leading-relaxed relative z-10">جداول ومواعيد مهمة</p>
              </div>
            </Link>
          </div>
        </div>
      </div>


    </section>
  );
};

export default Hero;
