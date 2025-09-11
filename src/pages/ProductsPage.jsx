import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const ProductsPage = ({ onBack, initialCategory, initialAuthor, onWhatsAppInquiry }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [categories, setCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [filters, setFilters] = useState({
    productType: 'all',
    category: 'all',
    author: 'all',
    search: '',
    isAvailable: true,
    itemType: 'all' // 'all', 'books', 'products'
  });

  useEffect(() => {
    console.log('Filters changed, reloading data:', filters);
    loadProducts();
    loadBooks();
    loadCategories();
    loadProductTypes();
    loadAuthors();
  }, [filters]);

  // Update filters when initialCategory or initialAuthor props change
  useEffect(() => {
    if (initialCategory && initialCategory !== filters.category) {
      setFilters(prev => ({ ...prev, category: initialCategory }));
    } else if (!initialCategory && filters.category !== 'all') {
      setFilters(prev => ({ ...prev, category: 'all' }));
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialAuthor && initialAuthor !== filters.author) {
      setFilters(prev => ({ ...prev, author: initialAuthor }));
    } else if (!initialAuthor && filters.author !== 'all') {
      setFilters(prev => ({ ...prev, author: 'all' }));
    }
  }, [initialAuthor]);

  // Merge and filter items based on itemType
  useEffect(() => {
    let combinedItems = [];

    if (filters.itemType === 'all') {
      // Combine books and products
      const booksWithType = books.map(book => ({ ...book, itemType: 'book' }));
      const productsWithType = products.map(product => ({ ...product, itemType: 'product' }));
      combinedItems = [...booksWithType, ...productsWithType];
    } else if (filters.itemType === 'books') {
      combinedItems = books.map(book => ({ ...book, itemType: 'book' }));
    } else if (filters.itemType === 'products') {
      combinedItems = products.map(product => ({ ...product, itemType: 'product' }));
    }

    // Apply additional filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      combinedItems = combinedItems.filter(item => {
        const title = item.titleArabic || item.title || '';
        const description = item.descriptionArabic || item.description || '';
        return title.toLowerCase().includes(searchLower) ||
               description.toLowerCase().includes(searchLower);
      });
    }

    if (filters.category && filters.category !== '' && filters.category !== 'all') {
      combinedItems = combinedItems.filter(item => {
        if (item.itemType === 'book') {
          return item.categoryId?.toString() === filters.category;
        } else {
          return item.categoryId?.toString() === filters.category;
        }
      });
    }

    if (filters.productType && filters.productType !== '' && filters.productType !== 'all') {
      combinedItems = combinedItems.filter(item => {
        if (item.itemType === 'book') {
          return true; // Books don't have productType filter
        } else {
          return item.productType === filters.productType;
        }
      });
    }

    if (filters.author && filters.author !== '' && filters.author !== 'all') {
      combinedItems = combinedItems.filter(item => {
        if (item.itemType === 'book') {
          return item.authorId?.toString() === filters.author;
        } else {
          return true; // Products don't have author filter
        }
      });
    }

    if (!filters.isAvailable) {
      // Show only available items
      combinedItems = combinedItems.filter(item => {
        if (item.itemType === 'book') {
          return item.stockQuantity > 0;
        } else {
          return item.stockQuantity > 0;
        }
      });
    }

    setAllItems(combinedItems);
    console.log('Combined items:', combinedItems.length, 'books:', books.length, 'products:', products.length);
  }, [books, products, filters]);

  // Update loading state when all data is loaded
  useEffect(() => {
    if (books.length >= 0 && products.length >= 0 && categories.length >= 0 && productTypes.length >= 0 && authors.length >= 0) {
      setDataLoaded(true);
      setLoading(false);
    }
  }, [books, products, categories, productTypes, authors]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const apiFilters = { ...filters };
      // Remove filters that shouldn't be sent to the API
      if (apiFilters.productType === '' || apiFilters.productType === 'all') delete apiFilters.productType;
      if (apiFilters.category === '' || apiFilters.category === 'all') delete apiFilters.category;
      if (apiFilters.author === '' || apiFilters.author === 'all') delete apiFilters.author;
      // Remove itemType as it's not a backend filter
      delete apiFilters.itemType;

      console.log('Loading products with filters:', apiFilters);
      const response = await apiService.getProducts(apiFilters);
      console.log('Products response:', response);
      setProducts(response || []);
      console.log('Products loaded:', (response || []).length);
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

  const loadBooks = async () => {
    try {
      // Don't send 'all' or empty string values to the API, send null instead
      const categoryId = filters.category && filters.category !== '' && filters.category !== 'all' ? filters.category : null;
      const authorId = filters.author && filters.author !== '' && filters.author !== 'all' ? filters.author : null;

      console.log('Loading books with filters:', { categoryId, authorId, search: filters.search, originalFilters: { category: filters.category, author: filters.author } });
      const response = await apiService.getBooks(1, 100, filters.search || '', categoryId, authorId);
      console.log('Books response:', response);
      if (response && response.items) {
        setBooks(response.items);
        console.log('Books loaded:', response.items.length);
      } else {
        setBooks([]);
        console.log('No books found');
      }
    } catch (error) {
      console.error('Error loading books:', error);
      setBooks([]);
    }
  };

  const loadAuthors = async () => {
    try {
      const response = await apiService.getAuthors();
      setAuthors(response || []);
    } catch (error) {
      console.error('Error loading authors:', error);
      setAuthors([]);
    }
  };

  const handleWhatsAppInquiry = async (item) => {
    try {
      // If onWhatsAppInquiry prop is provided, use it (for compatibility with existing functionality)
      if (onWhatsAppInquiry) {
        await onWhatsAppInquiry(item);
        return;
      }

      // Default WhatsApp message generation
      const itemType = item.itemType === 'book' ? 'الكتاب' : 'المنتج';
      const message = `مرحباً، أريد الاستفسار عن ${itemType}: ${item.titleArabic || item.title}`;
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

  const getProductImage = (item) => {
    console.log('🎯 getProductImage called for item:', item.id, item.titleArabic || item.title, 'Type:', item.itemType);

    // Handle books differently from products
    if (item.itemType === 'book') {
      console.log('📖 Processing book image...');
      if (item.coverImageUrl) {
        console.log('✅ Found book coverImageUrl, fixing URL...');
        const fixedUrl = fixImageUrl(item.coverImageUrl);
        console.log('🔗 Fixed book coverImageUrl:', fixedUrl);
        return fixedUrl;
      }

      if (item.images && item.images.length > 0) {
        console.log('✅ Found book images array with', item.images.length, 'images');
        const firstImage = item.images[0];
        const imageUrl = firstImage.imageUrl || firstImage.ImageUrl;
        if (!imageUrl) {
          console.log('❌ Book image URL is empty/null');
          return null;
        }
        const fixedUrl = fixImageUrl(imageUrl);
        console.log('🔗 Fixed book image URL:', fixedUrl);
        return fixedUrl;
      }
    } else {
      // Handle products
      console.log('📦 Processing product image...');
      if (item.coverImageUrl) {
        console.log('✅ Found product coverImageUrl, fixing URL...');
        const fixedUrl = fixImageUrl(item.coverImageUrl);
        console.log('🔗 Fixed product coverImageUrl:', fixedUrl);
        return fixedUrl;
      }

      if (item.Images && item.Images.length > 0) {
        console.log('✅ Found product Images array with', item.Images.length, 'images');
        const firstImage = item.Images[0];
        const imageUrl = firstImage.imageUrl || firstImage.ImageUrl;
        if (!imageUrl) {
          console.log('❌ Product image URL is empty/null');
          return null;
        }
        const fixedUrl = fixImageUrl(imageUrl);
        console.log('🔗 Fixed product image URL:', fixedUrl);
        return fixedUrl;
      }

      if (item.images && item.images.length > 0) {
        console.log('⚠️ Using fallback: images array');
        const firstImage = item.images[0];
        const imageUrl = firstImage.imageUrl || firstImage.ImageUrl;
        if (!imageUrl) {
          console.log('❌ Fallback image URL is empty/null');
          return null;
        }
        const fixedUrl = fixImageUrl(imageUrl);
        console.log('🔗 Fixed fallback image URL:', fixedUrl);
        return fixedUrl;
      }

      if (item.productImages && item.productImages.length > 0) {
        console.log('⚠️ Using fallback: productImages array');
        const firstImage = item.productImages[0];
        const imageUrl = firstImage.imageUrl || firstImage.ImageUrl;
        if (!imageUrl) {
          console.log('❌ Fallback image URL is empty/null');
          return null;
        }
        const fixedUrl = fixImageUrl(imageUrl);
        console.log('🔗 Fixed fallback image URL:', fixedUrl);
        return fixedUrl;
      }
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
                <h1 className="text-3xl font-bold text-royal-black">سوق الطلاب والمنتجات</h1>
                <p className="text-royal-black/60">اكتشف مجموعتنا الشاملة من الكتب والقرطاسية والمواد التعليمية</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {/* Item Type Filter */}
              <div className="space-y-2">
                <Label className="text-lg font-semibold text-amber-800">نوع العنصر</Label>
                <Select value={filters.itemType} onValueChange={(value) => setFilters({...filters, itemType: value})}>
                  <SelectTrigger className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع العناصر</SelectItem>
                    <SelectItem value="books">الكتب فقط</SelectItem>
                    <SelectItem value="products">المنتجات فقط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                <Label className="text-lg font-semibold text-amber-800">المؤلف</Label>
                <Select value={filters.author} onValueChange={(value) => setFilters({...filters, author: value})}>
                  <SelectTrigger className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white">
                    <SelectValue placeholder="جميع المؤلفين" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المؤلفين</SelectItem>
                    {authors.map(author => (
                      <SelectItem key={author.id} value={author.id.toString()}>
                        {author.nameArabic || author.name}
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
            <p className="mt-6 text-xl text-royal-black/60">جاري تحميل العناصر...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {console.log('Rendering allItems:', allItems.length, 'items')}
            {allItems.map((item) => (
              <Card key={`${item.itemType}-${item.id}`} className="glass-card hover-lift transition-all duration-500 overflow-hidden border-2 border-amber-200 hover:border-amber-400">
                <div className="relative">
                  {/* Product Image */}
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={getProductImage(item) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1lbnRhaiAo0LHWkdWZ0LHWaSk8L3RleHQ+PC9zdmc+'}
                      alt={item.titleArabic || item.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      onError={(e) => {
                        console.error('❌ Image failed to load for item:', item.id);
                        // Prevent infinite loop by checking if we're already using the placeholder
                        if (!e.target.src.includes('data:image/svg+xml')) {
                          console.log('🔄 Setting placeholder image due to error');
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1lbnRhaiAo0LHWkdWZ0LHWaSk8L3RleHQ+PC9zdmc+';
                        }
                      }}
                      onLoad={() => console.log('✅ Image loaded successfully for item:', item.id)}
                    />
                  </div>
                  
                  {/* Item Type Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className={`flex items-center gap-1 ${item.itemType === 'book' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>
                      {item.itemType === 'book' ? (
                        <>
                          <BookOpen className="w-3 h-3" />
                          كتاب
                        </>
                      ) : (
                        <>
                          {getProductTypeIcon(item.productType)}
                          {getProductTypeLabel(item.productType)}
                        </>
                      )}
                    </Badge>
                  </div>
                  
                  {/* Status Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {item.isFeatured && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">مميز</Badge>
                    )}
                    {item.isNewRelease && (
                      <Badge className="bg-green-100 text-green-800 border-green-300">جديد</Badge>
                    )}
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Product Title */}
                    <div>
                      <CardTitle className="text-xl font-bold text-royal-black mb-2 line-clamp-2">
                        {item.titleArabic || item.title}
                      </CardTitle>
                      {item.titleArabic && item.title && (
                        <CardDescription className="text-sm text-gray-600 line-clamp-2">
                          {item.title}
                        </CardDescription>
                      )}
                    </div>

                    {/* Product Description */}
                    {(item.descriptionArabic || item.description) && (
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {item.descriptionArabic || item.description}
                      </p>
                    )}
                    
                    {/* Product Details */}
                    <div className="space-y-2">
                      {item.grade && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">الصف:</span>
                          <span className="text-sm font-semibold">{item.grade}</span>
                        </div>
                      )}
                      {item.subject && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">المادة:</span>
                          <span className="text-sm font-semibold">{item.subject}</span>
                        </div>
                      )}
                      {item.language && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">اللغة:</span>
                          <span className="text-sm font-semibold">{item.language}</span>
                        </div>
                      )}
                      {item.itemType === 'book' && item.authorNameArabic && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">المؤلف:</span>
                          <span className="text-sm font-semibold">{item.authorNameArabic}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Price and Rating */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">{item.rating || 0}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-royal-gold">
                          {item.price} د.أ
                        </div>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <div className="text-sm text-gray-500 line-through">
                            {item.originalPrice} د.أ
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Stock Status */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">المخزون:</span>
                      <span className={`text-sm font-semibold ${item.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.stockQuantity > 0 ? `${item.stockQuantity} متوفر` : 'غير متوفر'}
                      </span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => handleWhatsAppInquiry(item)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-105"
                        disabled={item.stockQuantity <= 0}
                      >
                        <Phone className="w-4 h-4 ml-2" />
                        استفسار
                      </Button>
                      <Button
                        variant="outline"
                        className="px-4 py-3 border-2 border-amber-300 text-amber-700 hover:bg-amber-50 rounded-xl transition-all duration-300"
                        onClick={() => navigate(`/products/${item.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                        التفاصيل
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && allItems.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-600 mb-4">لا توجد عناصر</h3>
            <p className="text-gray-500 text-lg">جرب تغيير الفلاتر أو البحث بكلمات مختلفة</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductsPage;
