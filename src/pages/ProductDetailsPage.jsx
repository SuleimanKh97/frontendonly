import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Phone,
  BookOpen,
  PenTool,
  Palette,
  Laptop,
  Package,
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  Award
} from 'lucide-react';
import apiService, { fixImageUrl } from '@/lib/api.js';
import { showSuccess, showError } from '@/lib/sweetAlert.js';

const ProductDetailsPage = ({ onBack }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isBook, setIsBook] = useState(false);

  useEffect(() => {
    loadProductDetails();
  }, [id]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);

      // First try to get as product
      try {
        const productResponse = await apiService.getProductById(id);
        if (productResponse) {
          setProduct(productResponse);
          setIsBook(false);
          return;
        }
      } catch (productError) {
        console.log('Product not found, trying as book...');
      }

      // If not found as product, try as book
      try {
        // Get all books and find the one with matching ID
        const booksResponse = await apiService.getBooks(1, 1000);
        if (booksResponse && booksResponse.items) {
          const book = booksResponse.items.find(b => b.id.toString() === id.toString());
          if (book) {
            setProduct(book);
            setIsBook(true);
            return;
          }
        }
      } catch (bookError) {
        console.log('Book not found either');
      }

      throw new Error('Product/Book not found');
    } catch (error) {
      console.error('Error loading product details:', error);
      showError('فشل في تحميل تفاصيل المنتج');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppInquiry = () => {
    if (!product) return;

    const itemType = isBook ? 'الكتاب' : 'المنتج';
    const message = `مرحباً، أريد الاستفسار عن ${itemType}: ${product.titleArabic || product.title}`;
    const libraryPhone = '+962785462983';
    const whatsappUrl = `https://wa.me/${libraryPhone.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    showSuccess('تم فتح WhatsApp للتواصل معنا');
  };

  const getProductTypeIcon = (type) => {
    switch (type) {
      case 'Book': return <BookOpen className="w-6 h-6" />;
      case 'Stationery': return <PenTool className="w-6 h-6" />;
      case 'Art': return <Palette className="w-6 h-6" />;
      case 'Technology': return <Laptop className="w-6 h-6" />;
      case 'Educational': return <BookOpen className="w-6 h-6" />;
      default: return <Package className="w-6 h-6" />;
    }
  };

  const getProductTypeLabel = (type) => {
    const typeObj = [
      { value: 'Book', label: 'كتاب' },
      { value: 'Stationery', label: 'قرطاسية' },
      { value: 'Art', label: 'أدوات فنية' },
      { value: 'Technology', label: 'تقنية' },
      { value: 'Educational', label: 'تعليمي' }
    ].find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getAllImages = () => {
    if (!product) return [];

    const images = [];

    // Main cover image
    if (product.coverImageUrl) {
      images.push(fixImageUrl(product.coverImageUrl));
    }

    // Additional images
    if (isBook) {
      if (product.images && product.images.length > 0) {
        product.images.forEach(img => {
          if (img.imageUrl) images.push(fixImageUrl(img.imageUrl));
        });
      }
    } else {
      if (product.Images && product.Images.length > 0) {
        product.Images.forEach(img => {
          if (img.imageUrl) images.push(fixImageUrl(img.imageUrl));
        });
      }
      if (product.images && product.images.length > 0) {
        product.images.forEach(img => {
          if (img.imageUrl) images.push(fixImageUrl(img.imageUrl));
        });
      }
      if (product.productImages && product.productImages.length > 0) {
        product.productImages.forEach(img => {
          if (img.imageUrl) images.push(fixImageUrl(img.imageUrl));
        });
      }
    }

    // If no images, return placeholder
    if (images.length === 0) {
      images.push('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjIwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7Zhtin2YbYqDwvdGV4dD4KPC9zdmc+');
    }

    return images;
  };

  const handleImageError = (event) => {
    console.log('Image failed to load:', event.target.src);
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjIwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7Zhtin2YbYqDwvdGV4dD4KPC9zdmc+';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-royal-gold mx-auto"></div>
          <p className="mt-6 text-xl text-royal-black/60">جاري تحميل تفاصيل المنتج...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-24 h-24 text-gray-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-600 mb-4">المنتج غير موجود</h3>
          <Button onClick={() => navigate('/products')} className="mt-4">
            العودة للمنتجات
          </Button>
        </div>
      </div>
    );
  }

  const images = getAllImages();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-royal-gold hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/products')}
                className="mr-4 hover:bg-amber-100"
              >
                <ArrowLeft className="w-5 h-5 ml-2" />
                العودة للمنتجات
              </Button>
              <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl shadow-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div className="mr-4">
                <h1 className="text-3xl font-bold text-royal-black">تفاصيل المنتج</h1>
                <p className="text-royal-black/60">معلومات شاملة عن المنتج</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden rounded-2xl shadow-2xl bg-white">
              <img
                src={images[selectedImage]}
                alt={product.titleArabic || product.title}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                      selectedImage === index
                        ? 'border-royal-gold shadow-lg'
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.titleArabic || product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Title and Badges */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-royal-black mb-2">
                    {product.titleArabic || product.title}
                  </h1>
                  {product.titleArabic && product.title && (
                    <p className="text-lg text-gray-600 mb-4">
                      {product.title}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  {/* Product Type Badge */}
                  <Badge className={`flex items-center gap-2 px-4 py-2 text-sm ${
                    isBook ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {isBook ? (
                      <>
                        <BookOpen className="w-4 h-4" />
                        كتاب
                      </>
                    ) : (
                      <>
                        {getProductTypeIcon(product.productType)}
                        {getProductTypeLabel(product.productType)}
                      </>
                    )}
                  </Badge>

                  {/* Status Badges */}
                  {product.isFeatured && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 px-4 py-2">
                      ⭐ مميز
                    </Badge>
                  )}
                  {product.isNewRelease && (
                    <Badge className="bg-green-100 text-green-800 border-green-300 px-4 py-2">
                      🆕 جديد
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-4xl font-bold text-royal-gold">
                      {product.price} د.أ
                    </div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="text-xl text-gray-500 line-through">
                        {product.originalPrice} د.أ
                      </div>
                    )}
                  </div>
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-semibold">{product.rating}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stock Status */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">حالة المخزون:</span>
                  <span className={`font-semibold ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stockQuantity > 0 ? `${product.stockQuantity} متوفر` : 'غير متوفر'}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <Card className="shadow-lg border border-amber-200">
              <CardHeader>
                <CardTitle className="text-2xl text-royal-black">معلومات المنتج</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.grade && (
                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <span className="text-gray-600">الصف:</span>
                      <span className="font-semibold text-royal-black">{product.grade}</span>
                    </div>
                  )}
                  {product.subject && (
                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <span className="text-gray-600">المادة:</span>
                      <span className="font-semibold text-royal-black">{product.subject}</span>
                    </div>
                  )}
                  {product.language && (
                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <span className="text-gray-600">اللغة:</span>
                      <span className="font-semibold text-royal-black">{product.language}</span>
                    </div>
                  )}
                  {isBook && product.authorNameArabic && (
                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <span className="text-gray-600">المؤلف:</span>
                      <span className="font-semibold text-royal-black">{product.authorNameArabic}</span>
                    </div>
                  )}
                  {!isBook && product.publisherNameArabic && (
                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <span className="text-gray-600">الناشر:</span>
                      <span className="font-semibold text-royal-black">{product.publisherNameArabic}</span>
                    </div>
                  )}
                  {product.categoryNameArabic && (
                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <span className="text-gray-600">التصنيف:</span>
                      <span className="font-semibold text-royal-black">{product.categoryNameArabic}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {(product.descriptionArabic || product.description) && (
              <Card className="shadow-lg border border-amber-200">
                <CardHeader>
                  <CardTitle className="text-2xl text-royal-black">وصف المنتج</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {product.descriptionArabic || product.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleWhatsAppInquiry}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 hover:scale-105 text-lg"
                disabled={product.stockQuantity <= 0}
              >
                <Phone className="w-5 h-5 ml-2" />
                استفسار واتساب
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="py-4 border-2 border-blue-300 text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-300"
                >
                  <Heart className="w-5 h-5 ml-2" />
                  المفضلة
                </Button>
                <Button
                  variant="outline"
                  className="py-4 border-2 border-purple-300 text-purple-700 hover:bg-purple-50 rounded-xl transition-all duration-300"
                >
                  <Share2 className="w-5 h-5 ml-2" />
                  مشاركة
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              <div className="bg-white rounded-xl p-4 shadow-lg border border-amber-200 text-center">
                <Truck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-royal-black">شحن مجاني</h4>
                <p className="text-sm text-gray-600">للطلبات فوق 50 دينار</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border border-amber-200 text-center">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-royal-black">ضمان الجودة</h4>
                <p className="text-sm text-gray-600">منتجات أصلية 100%</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border border-amber-200 text-center">
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-royal-black">دعم فني</h4>
                <p className="text-sm text-gray-600">استشارة مجانية</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetailsPage;
