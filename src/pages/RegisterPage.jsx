import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Calendar,
  MapPin,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Eye,
  EyeOff,
  GraduationCap,
  Check,
  X
} from 'lucide-react'
import apiService from '../lib/api.js'

export default function RegisterPage({ onBack, onLoginSuccess }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    educationLevel: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const educationLevels = [
    { value: 'tawjihi-scientific', label: 'توجيهي علمي' },
    { value: 'tawjihi-literary', label: 'توجيهي أدبي' },
    { value: 'tawjihi-commercial', label: 'توجيهي تجاري' },
    { value: 'tawjihi-industrial', label: 'توجيهي صناعي' },
    { value: 'tawjihi-agricultural', label: 'توجيهي زراعي' },
    { value: 'tawjihi-hotel', label: 'توجيهي فندقي' },
    { value: 'university', label: 'جامعي' },
    { value: 'other', label: 'أخرى' }
  ];

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    const strength = score < 2 ? 'ضعيف' : score < 4 ? 'متوسط' : 'قوي';
    const percentage = (score / 5) * 100;
    
    return { checks, score, strength, percentage };
  };

  const passwordStrength = checkPasswordStrength(formData.password);

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

    // First Name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'الاسم الأول مطلوب'
    } else if (!/^[a-zA-Z\u0600-\u06FF\s]+$/.test(formData.firstName)) {
      newErrors.firstName = 'الاسم الأول يجب أن يحتوي على أحرف فقط'
    }

    // Last Name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'الاسم الأخير مطلوب'
    } else if (!/^[a-zA-Z\u0600-\u06FF\s]+$/.test(formData.lastName)) {
      newErrors.lastName = 'الاسم الأخير يجب أن يحتوي على أحرف فقط'
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح'
    }

    // Username
    if (!formData.username.trim()) {
      newErrors.username = 'اسم المستخدم مطلوب'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'اسم المستخدم يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطة سفلية فقط'
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة'
    } else if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      newErrors.password = 'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم ورمز خاص'
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور وتأكيدها غير متطابقين'
    }

    // Phone Number
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'رقم الهاتف مطلوب'
    } else if (!/^[+]?[0-9\s\-\(\)]{10,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'رقم الهاتف غير صحيح'
    }

    // Date of Birth
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'تاريخ الميلاد مطلوب'
    } else {
      const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear()
      if (age < 13) {
        newErrors.dateOfBirth = 'يجب أن يكون عمرك 13 سنة على الأقل'
      }
    }

    // Gender
    if (!formData.gender) {
      newErrors.gender = 'الجنس مطلوب'
    } else if (!['ذكر', 'أنثى'].includes(formData.gender)) {
      newErrors.gender = 'الجنس يجب أن يكون ذكر أو أنثى'
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
      // Convert dateOfBirth to proper format for backend
      const registrationData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null
      }
      
      const result = await apiService.registerCustomer(registrationData)
      
      if (result && result.token) {
        setSuccess(true)
        
        // Auto login after successful registration
        setTimeout(() => {
          onLoginSuccess(result.user, result.token)
        }, 2000)
      } else {
        setErrors({ general: 'فشل في إنشاء الحساب. يرجى المحاولة مرة أخرى.' })
      }
    } catch (error) {
      console.error('Registration error:', error)
      
      if (error.response) {
        const errorData = error.response
        if (errorData.message) {
          setErrors({ general: errorData.message })
        } else if (errorData.errors) {
          // Handle validation errors from backend
          const backendErrors = {}
          Object.keys(errorData.errors).forEach(key => {
            backendErrors[key] = errorData.errors[key][0]
          })
          setErrors(backendErrors)
        } else {
          setErrors({ general: 'حدث خطأ أثناء التسجيل' })
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
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🎉 تم التسجيل بنجاح!</h2>
              <p className="text-gray-600 mb-6">مرحباً بك في المكتبة الملكية الدراسية</p>
              <div className="animate-pulse">
                <p className="text-sm text-yellow-600">جاري تسجيل الدخول تلقائياً...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(135deg, #1c1403 0%, #f1b227 100%)', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }} dir="rtl">
      <div className="w-full max-w-2xl">
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
          <h1 className="text-4xl font-black text-white mb-2">انضم إلينا</h1>
          <p className="text-white/90 text-lg">أنشئ حسابك وابدأ رحلة التفوق</p>
        </div>

        {/* Signup Form */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-3xl">
          <CardHeader className="text-center pb-6">
            <h2 className="text-2xl font-bold text-gray-800">إنشاء حساب جديد</h2>
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
              {/* Personal Information - Grouped */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-800 font-semibold text-right flex items-center justify-end">
                    <User className="w-4 h-4 ml-2" />
                    الاسم الأول
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="الاسم الأول"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 text-right"
                  />
                  {errors.firstName && (
                    <p className="text-red-600 text-sm">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-800 font-semibold text-right flex items-center justify-end">
                    <User className="w-4 h-4 ml-2" />
                    اسم العائلة
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="اسم العائلة"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 text-right"
                  />
                  {errors.lastName && (
                    <p className="text-red-600 text-sm">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Contact Information - Grouped */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-gray-800 font-semibold text-right flex items-center justify-end">
                    <Phone className="w-4 h-4 ml-2" />
                    رقم الهاتف
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+962785462983"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    required
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 text-right"
                    dir="ltr"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-600 text-sm">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>

              {/* Account Information - Grouped */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-800 font-semibold text-right flex items-center justify-end">
                    <User className="w-4 h-4 ml-2" />
                    اسم المستخدم
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="اسم المستخدم"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    required
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 text-right"
                  />
                  {errors.username && (
                    <p className="text-red-600 text-sm">{errors.username}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-800 font-semibold text-right flex items-center justify-end">
                    <GraduationCap className="w-4 h-4 ml-2" />
                    المستوى التعليمي
                  </Label>
                  <Select onValueChange={(value) => handleInputChange('educationLevel', value)}>
                    <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 text-right">
                      <SelectValue placeholder="اختر مستواك التعليمي" />
                    </SelectTrigger>
                    <SelectContent>
                      {educationLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Password Section with Strength Indicator */}
              <div className="space-y-4">
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
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">قوة كلمة المرور:</span>
                        <span className={`text-sm font-bold ${
                          passwordStrength.strength === 'قوي' ? 'text-green-600' :
                          passwordStrength.strength === 'متوسط' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {passwordStrength.strength}
                        </span>
                      </div>
                      
                      <Progress value={passwordStrength.percentage} className="h-2" />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className={`flex items-center space-x-2 space-x-reverse ${passwordStrength.checks.length ? 'text-green-600' : 'text-gray-500'}`}>
                          {passwordStrength.checks.length ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>8 أحرف على الأقل</span>
                        </div>
                        <div className={`flex items-center space-x-2 space-x-reverse ${passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                          {passwordStrength.checks.uppercase ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>حرف كبير</span>
                        </div>
                        <div className={`flex items-center space-x-2 space-x-reverse ${passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                          {passwordStrength.checks.lowercase ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>حرف صغير</span>
                        </div>
                        <div className={`flex items-center space-x-2 space-x-reverse ${passwordStrength.checks.number ? 'text-green-600' : 'text-gray-500'}`}>
                          {passwordStrength.checks.number ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>رقم</span>
                        </div>
                        <div className={`flex items-center space-x-2 space-x-reverse ${passwordStrength.checks.special ? 'text-green-600' : 'text-gray-500'}`}>
                          {passwordStrength.checks.special ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>رمز خاص (@$!%*?&)</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {errors.password && (
                    <p className="text-red-600 text-sm">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-800 font-semibold text-right flex items-center justify-end">
                    <Lock className="w-4 h-4 ml-2" />
                    تأكيد كلمة المرور
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="أعد إدخال كلمة المرور"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                      className="h-12 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 pr-12 text-right"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-yellow-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Personal Details - Grouped */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-gray-800 font-semibold text-right flex items-center justify-end">
                    <Calendar className="w-4 h-4 ml-2" />
                    تاريخ الميلاد
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    required
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 text-right"
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-600 text-sm">{errors.dateOfBirth}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-gray-800 font-semibold text-right flex items-center justify-end">
                    <User className="w-4 h-4 ml-2" />
                    الجنس
                  </Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 text-right">
                      <SelectValue placeholder="اختر الجنس" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ذكر">👨 ذكر</SelectItem>
                      <SelectItem value="أنثى">👩 أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-red-600 text-sm">{errors.gender}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-800 font-semibold text-right flex items-center justify-end">
                  <MapPin className="w-4 h-4 ml-2" />
                  العنوان
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="أدخل عنوانك"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="h-12 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 text-right"
                />
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2 space-x-reverse">
                <input 
                  type="checkbox" 
                  id="terms"
                  required
                  className="mt-1 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500" 
                />
                <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                  أوافق على{' '}
                  <Link to="#" className="text-yellow-600 hover:text-yellow-700 font-semibold">
                    شروط الاستخدام
                  </Link>
                  {' '}و{' '}
                  <Link to="#" className="text-yellow-600 hover:text-yellow-700 font-semibold">
                    سياسة الخصوصية
                  </Link>
                </label>
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
                    جاري التسجيل...
                  </div>
                ) : (
                  'إنشاء الحساب'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="text-center p-6">
            <p className="text-gray-600 w-full">
              تملك حساباً بالفعل؟{' '}
              <Link 
                to="/login" 
                className="text-yellow-600 hover:text-yellow-700 font-bold transition-colors"
              >
                تسجيل الدخول
              </Link>
            </p>
          </CardFooter>
        </Card>


      </div>
    </div>
  )
}