import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { 
  Book, 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  User,
  X,
  Package
} from 'lucide-react'
import apiService from '../lib/api.js'

// Import admin components
import Dashboard from './admin/Dashboard.jsx'
import BooksManagement from './admin/BooksManagement.jsx'
import ProductsManagement from './admin/ProductsManagement.jsx'
import AuthorsManagement from './admin/AuthorsManagement.jsx'
import CategoriesManagement from './admin/CategoriesManagement.jsx'
import PublishersManagement from './admin/PublishersManagement.jsx'
import InquiriesManagement from './admin/InquiriesManagement.jsx'
import QuizzesManagement from './admin/QuizzesManagement.jsx'
import StudyMaterialsManagement from './admin/StudyMaterialsManagement.jsx'







// Main Admin Panel Component
export default function AdminPanel({ currentUser, onClose }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    setLoading(true)
    try {
      const response = await apiService.getDashboardStats()
      setStats(response)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
      // Set mock stats for demo
      setStats({
        totalBooks: 156,
        newInquiries: 23,
        activeUsers: 89,
        monthlySales: 12500
      })
    } finally {
      setLoading(false)
    }
  }

  // Debug: Log current user and admin status
  console.log('AdminPanel - currentUser:', currentUser);
  console.log('AdminPanel - isAdmin():', apiService.isAdmin());
  console.log('AdminPanel - user role:', currentUser?.role);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">غير مصرح بالدخول</h2>
            <p className="text-gray-600 mb-4">
              يجب تسجيل الدخول أولاً
            </p>
            <Button onClick={onClose}>العودة للصفحة الرئيسية</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if user has admin role
  const isUserAdmin = currentUser.role === 'Admin' || currentUser.role === 'Librarian';
  
  if (!isUserAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">غير مصرح بالدخول</h2>
            <p className="text-gray-600 mb-4">
              يجب أن تكون مديراً للوصول إلى لوحة التحكم
            </p>
            <p className="text-sm text-gray-500 mb-4">
              دورك الحالي: {currentUser.role || 'غير محدد'}
            </p>
            <Button onClick={onClose}>العودة للصفحة الرئيسية</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl shadow-lg ml-4">
                <img
                  src="/royal-study-logo.png"
                  alt="ROYAL STUDY Logo"
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <Settings className="h-8 w-8 text-royal-gold hidden" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-900">لوحة التحكم</h1>
                <p className="text-sm text-gray-600">إدارة المكتبة الملكية</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Stats Summary */}
              {!loading && (
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span>{stats.totalBooks || 0} كتب</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    <span>{stats.newInquiries || 0} استفسار</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span>{stats.activeUsers || 0} مستخدم</span>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-600">
                مرحباً، <span className="font-medium">{currentUser.firstName}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Quick Navigation Buttons */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('products')}
                  className={`text-xs ${activeTab === 'products' ? 'bg-blue-50 border-blue-300' : ''}`}
                >
                  <Package className="h-3 w-3 ml-1" />
                  منتجات
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('books')}
                  className={`text-xs ${activeTab === 'books' ? 'bg-blue-50 border-blue-300' : ''}`}
                >
                  <Book className="h-3 w-3 ml-1" />
                  كتب
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('inquiries')}
                  className={`text-xs ${activeTab === 'inquiries' ? 'bg-blue-50 border-blue-300' : ''}`}
                >
                  <MessageCircle className="h-3 w-3 ml-1" />
                  استفسارات
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('dashboard')}
                  className={`text-xs ${activeTab === 'dashboard' ? 'bg-blue-50 border-blue-300' : ''}`}
                >
                  <BarChart3 className="h-3 w-3 ml-1" />
                  تحليلات
                </Button>
              </div>
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 ml-1" />
                العودة للموقع
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Sidebar with Quick Actions */}
          <aside className="hidden lg:block w-64 bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-4 w-4 ml-2" />
              إجراءات سريعة
            </h3>
            <div className="space-y-2">
              <Button
                variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                className="w-full justify-start text-right"
                onClick={() => setActiveTab('dashboard')}
              >
                <BarChart3 className="h-4 w-4 ml-2" />
                لوحة المعلومات
              </Button>
              <Button
                variant={activeTab === 'products' ? 'default' : 'ghost'}
                className="w-full justify-start text-right"
                onClick={() => setActiveTab('products')}
              >
                <Package className="h-4 w-4 ml-2" />
                إدارة المنتجات
              </Button>
              <Button
                variant={activeTab === 'books' ? 'default' : 'ghost'}
                className="w-full justify-start text-right"
                onClick={() => setActiveTab('books')}
              >
                <Book className="h-4 w-4 ml-2" />
                إدارة الكتب
              </Button>
              <Button
                variant={activeTab === 'inquiries' ? 'default' : 'ghost'}
                className="w-full justify-start text-right"
                onClick={() => setActiveTab('inquiries')}
              >
                <MessageCircle className="h-4 w-4 ml-2" />
                الاستفسارات
                {!loading && stats.newInquiries > 0 && (
                  <Badge variant="destructive" className="mr-2 text-xs">
                    {stats.newInquiries}
                  </Badge>
                )}
              </Button>
              <Button
                variant={activeTab === 'authors' ? 'default' : 'ghost'}
                className="w-full justify-start text-right"
                onClick={() => setActiveTab('authors')}
              >
                <Users className="h-4 w-4 ml-2" />
                المؤلفون
              </Button>
              <Button
                variant={activeTab === 'categories' ? 'default' : 'ghost'}
                className="w-full justify-start text-right"
                onClick={() => setActiveTab('categories')}
              >
                <Filter className="h-4 w-4 ml-2" />
                التصنيفات
              </Button>
              <Button
                variant={activeTab === 'publishers' ? 'default' : 'ghost'}
                className="w-full justify-start text-right"
                onClick={() => setActiveTab('publishers')}
              >
                <Upload className="h-4 w-4 ml-2" />
                الناشرون
              </Button>
              <Button
                variant={activeTab === 'quizzes' ? 'default' : 'ghost'}
                className="w-full justify-start text-right"
                onClick={() => setActiveTab('quizzes')}
              >
                <CheckCircle className="h-4 w-4 ml-2" />
                الاختبارات
              </Button>
              <Button
                variant={activeTab === 'study-materials' ? 'default' : 'ghost'}
                className="w-full justify-start text-right"
                onClick={() => setActiveTab('study-materials')}
              >
                <Download className="h-4 w-4 ml-2" />
                المواد الدراسية
              </Button>

              {/* Quick Action Buttons */}
              <div className="pt-4 border-t mt-4">
                <h4 className="font-medium text-gray-900 mb-3 text-sm">إجراءات سريعة</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-right bg-green-50 border-green-200 hover:bg-green-100"
                    onClick={() => {
                      setActiveTab('products');
                      // Trigger add product after navigation
                      setTimeout(() => {
                        const addButton = document.querySelector('[data-add-product]');
                        if (addButton) addButton.click();
                      }, 100);
                    }}
                  >
                    <Plus className="h-3 w-3 ml-2" />
                    إضافة منتج جديد
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-right bg-blue-50 border-blue-200 hover:bg-blue-100"
                    onClick={() => {
                      setActiveTab('books');
                      // Trigger add book after navigation
                      setTimeout(() => {
                        const addButton = document.querySelector('[data-add-book]');
                        if (addButton) addButton.click();
                      }, 100);
                    }}
                  >
                    <Plus className="h-3 w-3 ml-2" />
                    إضافة كتاب جديد
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-right bg-purple-50 border-purple-200 hover:bg-purple-100"
                    onClick={() => {
                      setActiveTab('categories');
                      // Trigger add category after navigation
                      setTimeout(() => {
                        const addButton = document.querySelector('[data-add-category]');
                        if (addButton) addButton.click();
                      }, 100);
                    }}
                  >
                    <Plus className="h-3 w-3 ml-2" />
                    إضافة تصنيف جديد
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-right bg-orange-50 border-orange-200 hover:bg-orange-100"
                    onClick={() => {
                      setActiveTab('authors');
                      // Trigger add author after navigation
                      setTimeout(() => {
                        const addButton = document.querySelector('[data-add-author]');
                        if (addButton) addButton.click();
                      }, 100);
                    }}
                  >
                    <Plus className="h-3 w-3 ml-2" />
                    إضافة مؤلف جديد
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-right bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
                    onClick={() => {
                      setActiveTab('publishers');
                      // Trigger add publisher after navigation
                      setTimeout(() => {
                        const addButton = document.querySelector('[data-add-publisher]');
                        if (addButton) addButton.click();
                      }, 100);
                    }}
                  >
                    <Plus className="h-3 w-3 ml-2" />
                    إضافة ناشر جديد
                  </Button>
                </div>
              </div>

              {/* System Actions */}
              <div className="pt-4 border-t mt-4">
                <h4 className="font-medium text-gray-900 mb-3 text-sm">أدوات النظام</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-right"
                    onClick={() => window.open('/api/Analytics/overview', '_blank')}
                  >
                    <BarChart3 className="h-3 w-3 ml-2" />
                    تصدير التقارير
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-right"
                    onClick={() => {
                      if (window.confirm('هل أنت متأكد من أنك تريد تحديث البيانات؟')) {
                        window.location.reload();
                      }
                    }}
                  >
                    <Settings className="h-3 w-3 ml-2" />
                    تحديث النظام
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-right"
                    onClick={() => {
                      const printContent = document.querySelector('.space-y-6');
                      if (printContent) {
                        window.print();
                      }
                    }}
                  >
                    <Download className="h-3 w-3 ml-2" />
                    طباعة الصفحة
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {!loading && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-3">إحصائيات سريعة</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الكتب:</span>
                    <span className="font-medium">{stats.totalBooks || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الاستفسارات:</span>
                    <span className="font-medium">{stats.newInquiries || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المستخدمين:</span>
                    <span className="font-medium">{stats.activeUsers || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-9 gap-1">
                <TabsTrigger value="dashboard">لوحة المعلومات</TabsTrigger>
                <TabsTrigger value="products">المنتجات</TabsTrigger>
                <TabsTrigger value="books">الكتب</TabsTrigger>
                <TabsTrigger value="authors">المؤلفون</TabsTrigger>
                <TabsTrigger value="categories">التصنيفات</TabsTrigger>
                <TabsTrigger value="publishers">الناشرون</TabsTrigger>
                <TabsTrigger value="quizzes">الكويزات</TabsTrigger>
                <TabsTrigger value="study-materials">المواد الدراسية</TabsTrigger>
                <TabsTrigger value="inquiries">الاستفسارات</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <Dashboard />
              </TabsContent>

              <TabsContent value="products" className="space-y-6">
                <ProductsManagement />
              </TabsContent>

              <TabsContent value="books" className="space-y-6">
                <BooksManagement />
              </TabsContent>

              <TabsContent value="authors" className="space-y-6">
                <AuthorsManagement />
              </TabsContent>

              <TabsContent value="categories" className="space-y-6">
                <CategoriesManagement />
              </TabsContent>

              <TabsContent value="publishers" className="space-y-6">
                <PublishersManagement />
              </TabsContent>

              <TabsContent value="quizzes" className="space-y-6">
                <QuizzesManagement />
              </TabsContent>

              <TabsContent value="study-materials" className="space-y-6">
                <StudyMaterialsManagement />
              </TabsContent>

              <TabsContent value="inquiries" className="space-y-6">
                <InquiriesManagement />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

