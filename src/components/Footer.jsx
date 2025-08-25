import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-royal-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center mb-4">
              <div className="w-16 h-16 bg-royal-gold rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                <img 
                  src="/royal-study-logo.png" 
                  alt="ROYAL STUDY Logo" 
                  className="w-14 h-14 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <BookOpen className="w-8 h-8 text-royal-black hidden" />
              </div>
            </Link>
            <p className="text-royal-beige/80 mb-4 max-w-md">
              وجهتك الأولى للتفوق الأكاديمي - دوسيات، كتب، قرطاسية وكورسات تعليمية. 
              متخصصون في خدمة طلاب التوجيهي الأردني بأفضل المواد التعليمية والدعم الأكاديمي.
            </p>
            <p className="text-royal-gold font-medium">
              📍 الأردن - الزرقاء
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-royal-gold mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              {[
                { name: 'الرئيسية', href: '/' },
                { name: 'كويزاتك', href: '/quizzes' },
                { name: 'سوق الطلاب', href: '/books' },
                { name: 'دليل النجاح', href: '/success-guide' },
                { name: 'نصائح وإرشادات', href: '/study-tips' },
                { name: 'الرزنامة الطلابية', href: '/calendar' },
              ].map((link) => (
                <li key={link.name}>
                                     <Link 
                     to={link.href}
                     className="text-royal-beige/80 hover:text-royal-gold hover:underline transition-colors"
                   >
                     {link.name}
                   </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-royal-gold mb-4">تواصل معنا</h4>
            <div className="space-y-3">
              <a href="tel:+962785462983" className="text-royal-beige/80 hover:text-royal-gold hover:underline transition-colors block">
                📞 <span className="ltr inline-block">0785462983</span>
              </a>
              <a href="mailto:info@royalstudy.jo" className="text-royal-beige/80 hover:text-royal-gold hover:underline transition-colors block">
                📧 info@royalstudy.jo
              </a>
              <button
                onClick={() => window.open('https://wa.me/962785462983?text=مرحباً، أرغب في الاستفسار عن خدماتكم', '_blank')}
                className="bg-[#EDB413] hover:bg-[#EDB413]/90 text-black px-4 py-2 rounded-lg font-medium transition-colors inline-block mt-2"
              >
                تواصل معنا
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-royal-gold/20 mt-8 pt-8 text-center">
          <p className="text-royal-beige/60">
            © 2025 Royal Study. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
