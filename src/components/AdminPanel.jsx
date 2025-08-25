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
  X
} from 'lucide-react'
import apiService from '../lib/api.js'

// Import admin components
import Dashboard from './admin/Dashboard.jsx'
import BooksManagement from './admin/BooksManagement.jsx'
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
              <div className="text-sm text-gray-600">
                مرحباً، <span className="font-medium">{currentUser.firstName}</span>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard">لوحة المعلومات</TabsTrigger>
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
      </main>
    </div>
  )
}

