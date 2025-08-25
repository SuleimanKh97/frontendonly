import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { 
  User, 
  Mail, 
  Lock, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Eye,
  EyeOff
} from 'lucide-react'
import apiService from '../lib/api.js'

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح'
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const response = await apiService.login(formData.email, formData.password)
      
      if (response && response.token) {
        setSuccess(true)
        
        // Auto redirect after successful login
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(response.user, response.token)
          }
          navigate('/')
        }, 1500)
      } else {
        setErrors({ general: 'فشل في تسجيل الدخول. يرجى المحاولة مرة أخرى.' })
      }
    } catch (error) {
      console.error('Login error:', error)
      
      if (error.response) {
        const errorData = error.response
        if (errorData.message) {
          setErrors({ general: errorData.message })
        } else {
          setErrors({ general: 'بيانات تسجيل الدخول غير صحيحة' })
        }
      } else {
        setErrors({ general: 'حدث خطأ في الاتصال بالخادم' })
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center px-4 py-12" dir="rtl">
        <div className="w-full max-w-md">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl overflow-hidden">
                <img
                  src="/royal-study-logo.png"
                  alt="ROYAL STUDY Logo"
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <CheckCircle className="h-10 w-10 text-white hidden" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🎉 تم تسجيل الدخول بنجاح!</h2>
              <p className="text-gray-600 mb-6">مرحباً بك في المكتبة الملكية الدراسية</p>
              <div className="animate-pulse">
                <p className="text-sm text-yellow-600">جاري التوجيه إلى الصفحة الرئيسية...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(135deg, #1c1403 0%, #f1b227 100%)', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }} dir="rtl">
      <div className="w-full max-w-lg">
        {/* Logo and Welcome */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl overflow-hidden">
            <img
              src="/royal-study-logo.png"
              alt="ROYAL STUDY Logo"
              className="w-20 h-20 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <BookOpen className="w-12 h-12 text-white hidden" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">مرحباً بعودتك</h1>
          <p className="text-white/90 text-lg">سجل دخولك للوصول إلى حسابك</p>
        </div>

        {/* Login Form */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-3xl">
          <CardHeader className="text-center pb-6">
            <h2 className="text-2xl font-bold text-gray-800">تسجيل الدخول</h2>
          </CardHeader>
          
          <CardContent className="p-8">
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700 font-medium">{errors.general}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-800 font-semibold text-right flex items-center justify-end">
                  <Mail className="w-4 h-4 ml-2" />
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="h-12 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 text-right"
                  dir="ltr"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-800 font-semibold text-right flex items-center justify-end">
                  <Lock className="w-4 h-4 ml-2" />
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="أدخل كلمة المرور"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 pr-12 text-right"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-yellow-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="text-left">
                <Link 
                  to="#" 
                  className="text-yellow-600 hover:text-yellow-700 font-semibold text-sm transition-colors"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent ml-2"></div>
                    جاري تسجيل الدخول...
                  </div>
                ) : (
                  'تسجيل الدخول'
                )}
              </Button>
            </form>

            {/* Test Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 font-bold mb-2 text-center">للاختبار، استخدم:</p>
              <div className="text-xs text-gray-500 space-y-1 text-center">
                <p>البريد الإلكتروني: admin@library.com</p>
                <p>كلمة المرور: Admin123!</p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="text-center p-6">
            <p className="text-gray-600 w-full">
              لا تملك حساباً؟{' '}
              <Link 
                to="/register" 
                className="text-yellow-600 hover:text-yellow-700 font-bold transition-colors"
              >
                إنشاء حساب جديد
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl px-6"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    </div>
  )
}
