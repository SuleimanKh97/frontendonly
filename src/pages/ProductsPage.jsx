import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter,
  BookOpen,
  PenTool,
  Palette,
  Laptop,
  Package,
  Star,
  Eye,
  ShoppingCart,
  ArrowLeft,
  Phone,
  Mail
} from 'lucide-react';
import apiService, { fixImageUrl } from '@/lib/api.js';
import { showSuccess, showError } from '@/lib/sweetAlert.js';

const ProductsPage = ({ onBack }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [filters, setFilters] = useState({
    productType: '',
    category: '',
    search: '',
    isAvailable: true
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadProductTypes();
  }, [filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const apiFilters = { ...filters };
      if (apiFilters.productType === 'all') delete apiFilters.productType;
      if (apiFilters.category === 'all') delete apiFilters.category;
      
      const response = await apiService.getProducts(apiFilters);
      setProducts(response || []);
    } catch (error) {
      console.error('Error loading products:', error);
      showError('فشل في تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      setCategories(response || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProductTypes = async () => {
    try {
      const response = await apiService.getProductTypes();
      setProductTypes(response || []);
    } catch (error) {
      console.error('Error loading product types:', error);
    }
  };

  const handleWhatsAppInquiry = async (product) => {
    try {
      const message = `مرحباً، أريد الاستفسار عن المنتج: ${product.titleArabic || product.title}`;
      const libraryPhone = '+962785462983'; // Correct library WhatsApp number
      const whatsappUrl = `https://wa.me/${libraryPhone.replace('+', '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      showSuccess('تم فتح WhatsApp للتواصل معنا');
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      showError('فشل في فتح WhatsApp');
    }
  };

  const getProductTypeIcon = (type) => {
    switch (type) {
      case 'Book': return <BookOpen className="w-4 h-4" />;
      case 'Stationery': return <PenTool className="w-4 h-4" />;
      case 'Art': return <Palette className="w-4 h-4" />;
      case 'Technology': return <Laptop className="w-4 h-4" />;
      case 'Educational': return <BookOpen className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getProductTypeLabel = (type) => {
    const typeObj = productTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getProductImage = (product) => {
    console.log('🎯 getProductImage called for product:', product.id, product.titleArabic || product.title);
    console.log('📸 coverImageUrl:', product.coverImageUrl);
    console.log('🖼️ Images array:', product.Images);
    console.log('🔍 images array:', product.images);
    console.log('📦 productImages array:', product.productImages);

    if (product.coverImageUrl) {
      console.log('✅ Found coverImageUrl, fixing URL...');
      const fixedUrl = fixImageUrl(product.coverImageUrl);
      console.log('🔗 Fixed coverImageUrl:', fixedUrl);
      if (fixedUrl && fixedUrl !== product.coverImageUrl) {
        console.log('⚠️ URL was modified by fixImageUrl');
      }
      return fixedUrl;
    }

    if (product.Images && product.Images.length > 0) {
      console.log('✅ Found Images array with', product.Images.length, 'images');
      const firstImage = product.Images[0];
      console.log('🖼️ First image:', firstImage);
      console.log('🔗 Image URL (camelCase):', firstImage.imageUrl);
      console.log('🔗 Image URL (PascalCase):', firstImage.ImageUrl);
      const imageUrl = firstImage.imageUrl || firstImage.ImageUrl;
      console.log('🔗 Selected image URL:', imageUrl);
      if (!imageUrl) {
        console.log('❌ Image URL is empty/null');
        return null;
      }
      const fixedUrl = fixImageUrl(imageUrl);
      console.log('🔗 Fixed image URL:', fixedUrl);
      return fixedUrl;
    }

    if (product.images && product.images.length > 0) {
      console.log('⚠️ Using fallback: images array');
      const firstImage = product.images[0];
      const imageUrl = firstImage.imageUrl || firstImage.ImageUrl;
      if (!imageUrl) {
        console.log('❌ Fallback image URL is empty/null');
        return null;
      }
      const fixedUrl = fixImageUrl(imageUrl);
      console.log('🔗 Fixed fallback image URL:', fixedUrl);
      return fixedUrl;
    }

    if (product.productImages && product.productImages.length > 0) {
      console.log('⚠️ Using fallback: productImages array');
      const firstImage = product.productImages[0];
      const imageUrl = firstImage.imageUrl || firstImage.ImageUrl;
      if (!imageUrl) {
        console.log('❌ Fallback image URL is empty/null');
        return null;
      }
      const fixedUrl = fixImageUrl(imageUrl);
      console.log('🔗 Fixed fallback image URL:', fixedUrl);
      return fixedUrl;
    }

    console.log('❌ No images found, using placeholder');
    // Use a data URL placeholder that works offline
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1lbnRhaiAo0LHWkdWZ0LHWaSk8L3RleHQ+PC9zdmc+';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-royal-gold hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="mr-4 hover:bg-amber-100"
              >
                <ArrowLeft className="w-5 h-5 ml-2" />
                العودة للرئيسية
              </Button>
              <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl shadow-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div className="mr-4">
                <h1 className="text-3xl font-bold text-royal-black">المنتجات</h1>
                <p className="text-royal-black/60">اكتشف مجموعتنا المتنوعة من الكتب والقرطاسية</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>+962785462983</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>info@royallibrary.com</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8 shadow-lg border-2 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-amber-900">
              <Filter className="w-6 h-6" />
              البحث والفلترة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-lg font-semibold text-amber-800">البحث</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="ابحث في المنتجات..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pr-10 text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-lg font-semibold text-amber-800">نوع المنتج</Label>
                <Select value={filters.productType} onValueChange={(value) => setFilters({...filters, productType: value})}>
                  <SelectTrigger className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white">
                    <SelectValue placeholder="جميع الأنواع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    {productTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-lg font-semibold text-amber-800">التصنيف</Label>
                <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                  <SelectTrigger className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white">
                    <SelectValue placeholder="جميع التصنيفات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التصنيفات</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.nameArabic || category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-lg font-semibold text-amber-800">الحالة</Label>
                <Select value={filters.isAvailable.toString()} onValueChange={(value) => setFilters({...filters, isAvailable: value === 'true'})}>
                  <SelectTrigger className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">متوفر</SelectItem>
                    <SelectItem value="false">جميع المنتجات</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-royal-gold mx-auto"></div>
            <p className="mt-6 text-xl text-royal-black/60">جاري تحميل المنتجات...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <Card key={product.id} className="glass-card hover-lift transition-all duration-500 overflow-hidden border-2 border-amber-200 hover:border-amber-400">
                <div className="relative">
                  {/* Product Image */}
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={getProductImage(product) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1lbnRhaiAo0LHWkdWZ0LHWaSk8L3RleHQ+PC9zdmc+'}
                      alt={product.titleArabic || product.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      onError={(e) => {
                        console.error('❌ Image failed to load for product:', product.id);
                        // Prevent infinite loop by checking if we're already using the placeholder
                        if (!e.target.src.includes('data:image/svg+xml')) {
                          console.log('🔄 Setting placeholder image due to error');
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1lbnRhaiAo0LHWkdWZ0LHWaSk8L3RleHQ+PC9zdmc+';
                        }
                      }}
                      onLoad={() => console.log('✅ Image loaded successfully for product:', product.id)}
                    />
                  </div>
                  
                  {/* Product Type Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1">
                      {getProductTypeIcon(product.productType)}
                      {getProductTypeLabel(product.productType)}
                    </Badge>
                  </div>
                  
                  {/* Status Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.isFeatured && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">مميز</Badge>
                    )}
                    {product.isNewRelease && (
                      <Badge className="bg-green-100 text-green-800 border-green-300">جديد</Badge>
                    )}
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Product Title */}
                    <div>
                      <CardTitle className="text-xl font-bold text-royal-black mb-2 line-clamp-2">
                        {product.titleArabic || product.title}
                      </CardTitle>
                      {product.titleArabic && product.title && (
                        <CardDescription className="text-sm text-gray-600 line-clamp-2">
                          {product.title}
                        </CardDescription>
                      )}
                    </div>
                    
                    {/* Product Description */}
                    {(product.descriptionArabic || product.description) && (
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {product.descriptionArabic || product.description}
                      </p>
                    )}
                    
                    {/* Product Details */}
                    <div className="space-y-2">
                      {product.grade && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">الصف:</span>
                          <span className="text-sm font-semibold">{product.grade}</span>
                        </div>
                      )}
                      {product.subject && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">المادة:</span>
                          <span className="text-sm font-semibold">{product.subject}</span>
                        </div>
                      )}
                      {product.language && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">اللغة:</span>
                          <span className="text-sm font-semibold">{product.language}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Price and Rating */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">{product.rating || 0}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-royal-gold">
                          {product.price} د.أ
                        </div>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="text-sm text-gray-500 line-through">
                            {product.originalPrice} د.أ
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Stock Status */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">المخزون:</span>
                      <span className={`text-sm font-semibold ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stockQuantity > 0 ? `${product.stockQuantity} متوفر` : 'غير متوفر'}
                      </span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button 
                        onClick={() => handleWhatsAppInquiry(product)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-105"
                      >
                        <Phone className="w-4 h-4 ml-2" />
                        استفسار
                      </Button>
                      <Button 
                        variant="outline"
                        className="px-4 py-3 border-2 border-amber-300 text-amber-700 hover:bg-amber-50 rounded-xl transition-all duration-300"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-600 mb-4">لا توجد منتجات</h3>
            <p className="text-gray-500 text-lg">جرب تغيير الفلاتر أو البحث بكلمات مختلفة</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductsPage;
