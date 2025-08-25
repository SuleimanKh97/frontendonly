import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Label } from '@/components/ui/label.jsx'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  MessageCircle,
  Send,
  ArrowLeft,
  Book,
  Users,
  Globe,
  CheckCircle
} from 'lucide-react'

export default function ContactPage({ onBack }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    }, 2000)
  }

  const contactInfo = [
    {
      icon: Phone,
      title: 'الهاتف',
      value: '+962785462983',
      description: 'متاح من الأحد إلى الخميس'
    },
    {
      icon: Mail,
      title: 'البريد الإلكتروني',
      value: 'info@royalstudy.com',
      description: 'رد سريع خلال 24 ساعة'
    },
    {
      icon: MapPin,
      title: 'العنوان',
      value: 'إربد، الأردن',
      description: 'مكتبة إربد الأولى للكتب العربية'
    },
    {
      icon: Clock,
      title: 'ساعات العمل',
      value: 'الأحد - الخميس: 8 ص - 6 م',
      description: 'الجمعة - السبت: 10 ص - 4 م'
    }
  ]

  const services = [
    {
      icon: Book,
      title: 'بيع الكتب',
      description: 'كتب عربية ومترجمة في مختلف المجالات'
    },
    {
      icon: Users,
      title: 'استشارات القراءة',
      description: 'نصائح لاختيار الكتب المناسبة'
    },
    {
      icon: Globe,
      title: 'التوصيل السريع',
      description: 'توصيل لجميع أنحاء الأردن'
    },
    {
      icon: MessageCircle,
      title: 'دعم العملاء',
      description: 'خدمة عملاء متاحة على مدار الساعة'
    }
  ]

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">تم إرسال الرسالة بنجاح!</h2>
            <p className="text-gray-600 mb-6">
              شكراً لك على التواصل معنا. سنقوم بالرد عليك في أقرب وقت ممكن.
            </p>
            <Button onClick={onBack} className="w-full">
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200" dir="rtl">
      {/* Header */}
              <div className="bg-gradient-to-r from-black via-gray-900 to-gray-800 text-white border-b border-yellow-400/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={onBack} className="flex items-center border-amber-300 text-amber-900 hover:bg-amber-100">
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة للرئيسية
              </Button>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-7 w-7 text-amber-300" />
                <h1 className="text-2xl font-bold">اتصل بنا</h1>
              </div>
            </div>
            <div className="text-right text-amber-200">
              <p>نحن هنا لمساعدتك</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="text-2xl text-amber-900">أرسل لنا رسالة</CardTitle>
              <CardDescription className="text-amber-800">
                املأ النموذج أدناه وسنقوم بالرد عليك في أقرب وقت ممكن
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="أدخل اسمك الكامل"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="أدخل بريدك الإلكتروني"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="أدخل رقم هاتفك"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">الموضوع</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="موضوع الرسالة"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">الرسالة</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="اكتب رسالتك هنا..."
                    rows={5}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-amber-500 text-black hover:bg-amber-400" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 ml-2" />
                      إرسال الرسالة
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contactInfo.map((info, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <info.icon className="h-5 w-5 text-amber-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-amber-900">{info.title}</h3>
                        <p className="text-amber-800 text-sm">{info.value}</p>
                        <p className="text-amber-700 text-xs mt-1">{info.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Services */}
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900">خدماتنا</CardTitle>
                <CardDescription className="text-amber-800">نقدم مجموعة متنوعة من الخدمات لقرائنا</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-start space-x-3 space-x-reverse">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <service.icon className="h-5 w-5 text-amber-700" />
                      </div>
                      <div>
                        <h4 className="font-medium text-amber-900">{service.title}</h4>
                        <p className="text-amber-800 text-sm">{service.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900">موقعنا</CardTitle>
                <CardDescription className="text-amber-800">يمكنك زيارتنا في مقرنا الرئيسي</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-amber-100 rounded-lg h-48 flex items-center justify-center">
                  <div className="text-center text-amber-800">
                    <MapPin className="h-12 w-12 mx-auto mb-2" />
                    <p>خريطة تفاعلية</p>
                    <p className="text-sm">الرياض، المملكة العربية السعودية</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 