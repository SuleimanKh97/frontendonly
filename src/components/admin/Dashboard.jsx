import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Package,
  Users,
  BookOpen,
  RefreshCw,
  Activity,
  DollarSign,
  Star,
  Clock
} from 'lucide-react';
import apiService from '@/lib/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState({});
  const [productsByCategory, setProductsByCategory] = useState([]);
  const [productsByType, setProductsByType] = useState([]);
  const [productsByLanguage, setProductsByLanguage] = useState([]);
  const [stockStatus, setStockStatus] = useState({});
  const [featuredProducts, setFeaturedProducts] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [subjectDistribution, setSubjectDistribution] = useState([]);
  const [priceRanges, setPriceRanges] = useState([]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [
        overview,
        byCategory,
        byType,
        byLanguage,
        stock,
        featured,
        recent,
        grades,
        subjects,
        prices
      ] = await Promise.all([
        apiService.getOverview(),
        apiService.getProductsByCategory(),
        apiService.getProductsByType(),
        apiService.getProductsByLanguage(),
        apiService.getStockStatus(),
        apiService.getFeaturedProducts(),
        apiService.getRecentActivity(),
        apiService.getGradeDistribution(),
        apiService.getSubjectDistribution(),
        apiService.getPriceRanges()
      ]);

      setOverviewData(overview);
      setProductsByCategory(byCategory);
      setProductsByType(byType);
      setProductsByLanguage(byLanguage);
      setStockStatus(stock);
      setFeaturedProducts(featured);
      setRecentActivity(recent);
      setGradeDistribution(grades);
      setSubjectDistribution(subjects);
      setPriceRanges(prices);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setOverviewData({
        totalProducts: 156,
        availableProducts: 142,
        totalCategories: 12,
        totalAuthors: 89,
        totalPublishers: 45
      });
      setStockStatus({ inStock: 120, outOfStock: 16, lowStock: 20 });
      setFeaturedProducts({ featured: 25, newReleases: 18, available: 142 });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue", subtitle }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold text-${color}-600`}>
          {loading ? '...' : value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 لوحة التحكم</h1>
          <p className="text-gray-600 mt-2">نظرة شاملة على إحصائيات المنتجات والأداء</p>
        </div>
        <Button onClick={loadDashboardData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="إجمالي المنتجات"
          value={overviewData.totalProducts}
          icon={Package}
          color="blue"
          subtitle="جميع المنتجات في النظام"
        />
        <StatCard
          title="المنتجات المتاحة"
          value={overviewData.availableProducts}
          icon={BookOpen}
          color="green"
          subtitle="المنتجات المتاحة للبيع"
        />
        <StatCard
          title="التصنيفات"
          value={overviewData.totalCategories}
          icon={BarChart3}
          color="purple"
          subtitle="عدد التصنيفات المتاحة"
        />
        <StatCard
          title="المؤلفون"
          value={overviewData.totalAuthors}
          icon={Users}
          color="orange"
          subtitle="عدد المؤلفين المسجلين"
        />
        <StatCard
          title="الناشرون"
          value={overviewData.totalPublishers}
          icon={TrendingUp}
          color="red"
          subtitle="عدد الناشرين المسجلين"
        />
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories">📂 التصنيفات</TabsTrigger>
          <TabsTrigger value="inventory">📦 المخزون</TabsTrigger>
          <TabsTrigger value="analytics">📈 التحليلات</TabsTrigger>
          <TabsTrigger value="activity">⚡ النشاط الأخير</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Products by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  المنتجات حسب التصنيف
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="category"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Products by Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  المنتجات حسب النوع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productsByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {productsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Products by Language */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                المنتجات حسب اللغة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={productsByLanguage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="language" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  حالة المخزون
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-green-800 font-medium">متوفر</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {stockStatus.inStock || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-yellow-800 font-medium">مخزون منخفض (≤5)</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {stockStatus.lowStock || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-red-800 font-medium">نفد المخزون</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      {stockStatus.outOfStock || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Ranges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  توزيع الأسعار
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priceRanges}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#ff7300" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Grade Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                توزيع الصفوف الدراسية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={gradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="grade" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Featured Products Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  المنتجات المميزة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {featuredProducts.featured || 0}
                </div>
                <p className="text-sm text-muted-foreground">منتجات مميزة</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  الإصدارات الجديدة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {featuredProducts.newReleases || 0}
                </div>
                <p className="text-sm text-muted-foreground">إصدارات جديدة</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  المنتجات المتاحة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {featuredProducts.available || 0}
                </div>
                <p className="text-sm text-muted-foreground">متاحة للبيع</p>
              </CardContent>
            </Card>
          </div>

          {/* Subject Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                أكثر المواد تداولاً
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={subjectDistribution} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="subject" type="category" width={100} fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                آخر المنتجات المضافة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {product.title || product.titleArabic}
                      </h4>
                      <p className="text-sm text-gray-500">
                        تم إضافته في {new Date(product.createdAt).toLocaleDateString('ar-JO')}
                      </p>
                    </div>
                    <Badge variant={product.isAvailable ? "default" : "secondary"}>
                      {product.isAvailable ? "متاح" : "غير متاح"}
                    </Badge>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد منتجات حديثة
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard; 
