import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Book, 
  Users, 
  MessageCircle, 
  TrendingUp,
  Eye,
  Star,
  ShoppingCart,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'
import apiService from '../../lib/api.js'

export default function Dashboard() {
  const [stats, setStats] = useState({})
  const [recentBooks, setRecentBooks] = useState([])
  const [recentInquiries, setRecentInquiries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [statsRes, booksRes, inquiriesRes] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getBooks(1, 5),
        apiService.getBookInquiries(1, 5)
      ])

      setStats(statsRes || {})
      setRecentBooks(booksRes?.items || [])
      setRecentInquiries(inquiriesRes?.items || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // Set mock data for demo
      setStats({
        totalBooks: 156,
        totalAuthors: 89,
        totalCategories: 12,
        totalPublishers: 45,
        newInquiries: 23,
        activeUsers: 89,
        monthlySales: 12500,
        totalViews: 4567,
        averageRating: 4.2
      })
    } finally {
      setLoading(false)
    }
  }

  const statsData = [
    {
      title: 'إجمالي الكتب',
      value: stats?.totalBooks || 0,
      icon: Book,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'الاستفسارات الجديدة',
      value: stats?.newInquiries || 0,
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'المستخدمين النشطين',
      value: stats?.activeUsers || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'المبيعات الشهرية',
      value: stats?.monthlySales ? `${stats.monthlySales} د.أ` : '0 د.أ',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '+23%',
      changeType: 'positive'
    }
  ]

  const chartData = [
    { name: 'يناير', كتب: 12, استفسارات: 8 },
    { name: 'فبراير', كتب: 19, استفسارات: 12 },
    { name: 'مارس', كتب: 15, استفسارات: 10 },
    { name: 'أبريل', كتب: 22, استفسارات: 15 },
    { name: 'مايو', كتب: 18, استفسارات: 11 },
    { name: 'يونيو', كتب: 25, استفسارات: 18 }
  ]

  const pieData = [
    { name: 'أدب', value: 35, color: '#3B82F6' },
    { name: 'علوم', value: 25, color: '#10B981' },
    { name: 'تاريخ', value: 20, color: '#F59E0B' },
    { name: 'فلسفة', value: 15, color: '#EF4444' },
    { name: 'أخرى', value: 5, color: '#8B5CF6' }
  ]

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-500 mx-auto mb-6"></div>
          <p className="text-2xl text-amber-800 font-bold">📊 جاري تحميل لوحة المعلومات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl" dir="rtl">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-black to-amber-900 bg-clip-text mb-4">📊 لوحة المعلومات</h2>
        <p className="text-2xl text-amber-800 font-medium">📈 نظرة عامة على أداء المكتبة الرقمية</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statsData.map((stat, index) => (
          <Card key={index} className="bg-gradient-to-br from-white to-amber-50 border-2 border-amber-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-amber-800 mb-3">{stat.title}</p>
                  <p className="text-4xl font-bold text-black mb-3">{stat.value}</p>
                  <div className="flex items-center">
                    <TrendingUp className={`h-5 w-5 ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'} ml-2`} />
                    <span className={`text-lg font-bold ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg">
                  <stat.icon className="h-8 w-8 text-black" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Books vs Inquiries Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 ml-2" />
              الكتب والاستفسارات الشهرية
            </CardTitle>
            <CardDescription>
              مقارنة بين عدد الكتب المضافة والاستفسارات المستلمة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="كتب" fill="#3B82F6" />
                <Bar dataKey="استفسارات" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Categories Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 ml-2" />
              توزيع الكتب حسب التصنيف
            </CardTitle>
            <CardDescription>
              نسبة الكتب في كل تصنيف
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Books */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Book className="h-5 w-5 ml-2" />
              أحدث الكتب المضافة
            </CardTitle>
            <CardDescription>
              آخر الكتب التي تم إضافتها للمكتبة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBooks.map((book) => (
                <div key={book.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-12 bg-blue-100 rounded flex items-center justify-center">
                      <Book className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{book.titleArabic || book.title}</p>
                      <p className="text-sm text-gray-600">{book.authorNameArabic || book.authorName || book.author?.nameArabic || book.author?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{formatDate(book.createdAt)}</p>
                    <Badge variant={book.isAvailable ? "default" : "secondary"}>
                      {book.isAvailable ? 'متوفر' : 'غير متوفر'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Inquiries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 ml-2" />
              أحدث الاستفسارات
            </CardTitle>
            <CardDescription>
              آخر استفسارات العملاء
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInquiries.map((inquiry) => (
                <div key={inquiry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{inquiry.customerName || 'عميل غير محدد'}</p>
                      <p className="text-sm text-gray-600">
                        {inquiry.book?.titleArabic || inquiry.book?.title || 'كتاب غير محدد'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{formatDate(inquiry.createdAt)}</p>
                    <Badge 
                      variant={
                        inquiry.status === 'Pending' ? 'secondary' : 
                        inquiry.status === 'Completed' ? 'default' : 'outline'
                      }
                    >
                      {inquiry.status === 'Pending' ? 'في الانتظار' :
                       inquiry.status === 'Responded' ? 'تم الرد' :
                       inquiry.status === 'Completed' ? 'مكتمل' : 'ملغي'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 ml-2" />
              إجمالي المشاهدات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{stats?.totalViews || 0}</p>
            <p className="text-sm text-gray-600">مشاهدة للكتب</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 ml-2" />
              متوسط التقييم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{stats?.averageRating || 0}</p>
            <p className="text-sm text-gray-600">من 5 نجوم</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 ml-2" />
              النشاط اليومي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats?.dailyActivity || 0}</p>
            <p className="text-sm text-gray-600">تفاعل اليوم</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 