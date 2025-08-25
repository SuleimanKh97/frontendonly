import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Book, 
  Calendar, 
  Circle, 
  X, 
  Award, 
  Lightbulb, 
  User, 
  LogOut, 
  Settings,
  Shield
} from 'lucide-react';

const Header = ({ currentUser, onLogout, onOpenAdmin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'الرئيسية', href: '/', icon: BookOpen },
    { name: 'كويزاتك', href: '/quizzes', icon: Circle },
    { name: 'سوق الطلاب', href: '/books', icon: Book },
    { name: 'دليل النجاح', href: '/success-guide', icon: Award },
    { name: 'نصائح وإرشادات', href: '/study-tips', icon: Lightbulb },
    { name: 'الرزنامة الطلابية', href: '/calendar', icon: Calendar },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <header className="bg-royal-black text-white shadow-md relative z-50 border-b border-royal-gold/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
                     <Link to="/" className="flex items-center group">
             <div className="w-16 h-16 bg-[#EDB413] rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 overflow-hidden">
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

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-3 space-x-reverse">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                    isActive(item.href)
                      ? 'bg-[#EDB413] text-royal-black shadow-sm hover:shadow-md hover-scale hover-glow'
                      : 'text-white hover:text-royal-gold hover:bg-white/10 hover-scale hover-glow'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

                     {/* Desktop Actions */}
           <div className="hidden lg:flex items-center gap-6">
            {/* WhatsApp Button */}
            <Button 
              className="bg-[#EDB413] hover:bg-yellow-500 text-royal-black font-bold shadow-sm hover:shadow-md hover-scale hover-glow transition-all duration-300 rounded-lg px-6 py-2 text-sm"
              onClick={() => window.open('https://wa.me/962785462983', '_blank')}
            >
              تواصل معنا
            </Button>

            {/* User Actions */}
            {currentUser ? (
              <>
                {/* User Profile Button */}
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2">
                    <User className="w-4 h-4 text-[#EDB413]" />
                    <span className="text-sm font-medium text-white">
                      {currentUser.firstName} {currentUser.lastName || ''}
                    </span>
                  </div>
                  
                  {/* Admin Panel Button (if admin) */}
                  {currentUser.role === 'Admin' && (
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm hover:shadow-md hover-scale hover-glow transition-all duration-300 rounded-lg px-6 py-2 text-sm"
                      onClick={onOpenAdmin}
                    >
                      <Shield className="w-4 h-4 ml-1" />
                      لوحة التحكم
                    </Button>
                  )}
                  
                  {/* Logout Button */}
                  <Button 
                    variant="outline"
                    className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold shadow-sm hover:shadow-md hover-scale hover-glow transition-all duration-300 rounded-lg px-6 py-2 text-sm"
                    onClick={onLogout}
                  >
                    <LogOut className="w-4 h-4 ml-1" />
                    تسجيل الخروج
                  </Button>
                </div>
              </>
                         ) : (
               <div className="flex items-center gap-6">
                                 {/* Login Button */}
                                   <Button 
                    variant="outline"
                    className="border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-bold shadow-sm hover:shadow-md hover-scale hover-glow transition-all duration-300 rounded-lg px-6 py-2 text-sm"
                    onClick={handleLogin}
                  >
                    تسجيل الدخول
                  </Button>

                  {/* Register Button */}
                  <Button 
                    className="bg-green-500 hover:bg-green-600 text-white font-bold shadow-sm hover:shadow-md hover-scale hover-glow transition-all duration-300 rounded-lg px-6 py-2 text-sm"
                    onClick={handleRegister}
                  >
                    التسجيل
                  </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className="w-full h-0.5 bg-white rounded-full"></div>
                <div className="w-full h-0.5 bg-white rounded-full"></div>
                <div className="w-full h-0.5 bg-white rounded-full"></div>
              </div>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-royal-black/95 backdrop-blur-sm border-t border-royal-gold/20 shadow-lg">
            <nav className="py-6 px-4 space-y-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-6 px-4 py-4 rounded-xl text-sm font-bold transition-all duration-300 min-w-[140px] justify-center ${
                      isActive(item.href)
                        ? 'bg-[#EDB413] text-royal-black shadow-sm hover:shadow-md hover-scale hover-glow'
                        : 'text-white hover:text-royal-gold hover:bg-white/10 hover-scale hover-glow'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-6 h-6" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
                             {/* Mobile Action Buttons */}
              <div className="pt-6 border-t border-royal-gold/20 space-y-5">
                <Button 
                  className="w-full bg-[#EDB413] hover:bg-yellow-500 text-royal-black font-bold rounded-xl shadow-sm hover:shadow-md hover-scale hover-glow transition-all duration-300"
                  onClick={() => {
                    window.open('https://wa.me/962785462983', '_blank');
                    setIsMenuOpen(false);
                  }}
                >
                  تواصل معنا عبر واتساب
                </Button>
                
                {currentUser ? (
                  <>
                    {/* User Profile */}
                    <div className="flex items-center justify-center space-x-2 bg-white/10 rounded-xl px-4 py-3">
                      <User className="w-5 h-5 text-[#EDB413]" />
                      <span className="text-sm font-medium text-white">
                        {currentUser.firstName} {currentUser.lastName || ''}
                      </span>
                    </div>
                    
                    {/* Admin Panel Button (if admin) */}
                    {currentUser.role === 'Admin' && (
                      <Button 
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm hover:shadow-md hover-scale hover-glow transition-all duration-300"
                        onClick={() => {
                          onOpenAdmin();
                          setIsMenuOpen(false);
                        }}
                      >
                        <Shield className="w-4 h-4 ml-1" />
                        لوحة التحكم
                      </Button>
                    )}
                    
                    {/* Logout Button */}
                    <Button 
                      variant="outline"
                      className="w-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold rounded-xl shadow-sm hover:shadow-md hover-scale hover-glow transition-all duration-300"
                      onClick={() => {
                        onLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 ml-1" />
                      تسجيل الخروج
                    </Button>
                  </>
                                 ) : (
                   <div className="space-y-4">
                     <Button 
                       variant="outline"
                       className="w-full border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-bold rounded-xl shadow-sm hover:shadow-md hover-scale hover-glow transition-all duration-300"
                       onClick={() => {
                         handleLogin();
                         setIsMenuOpen(false);
                       }}
                     >
                       تسجيل الدخول
                     </Button>
                     
                     <Button 
                       className="w-full bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-sm hover:shadow-md hover-scale hover-glow transition-all duration-300"
                       onClick={() => {
                         handleRegister();
                         setIsMenuOpen(false);
                       }}
                     >
                       التسجيل
                     </Button>
                   </div>
                 )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
