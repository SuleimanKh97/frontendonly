import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus,
  Edit,
  Trash2,
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
  Upload,
  X
} from 'lucide-react';
import apiService, { fixImageUrl } from '@/lib/api.js';
import { showSuccess, showError, showWarning } from '@/lib/sweetAlert.js';

const ProductsManagement = () => {
  console.log('🛒 ProductsManagement component loaded');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({
    productType: '',
    category: '',
    search: '',
    isAvailable: true
  });

  const [formData, setFormData] = useState({
    title: '',
    titleArabic: '',
    sku: '',
    description: '',
    descriptionArabic: '',
    productType: 'Book',
    authorId: null,
    publisherId: null,
    categoryId: null,
    grade: '',
    subject: '',
    publicationDate: null,
    pages: null,
    language: 'Arabic',
    price: null,
    originalPrice: null,
    stockQuantity: 0,
    coverImageUrl: '',
    images: [], // Array of product images
    isAvailable: true,
    isFeatured: false,
    isNewRelease: false
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadAuthors();
    loadPublishers();
    loadProductTypes();
    loadGrades();
    loadSubjects();
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

  const loadAuthors = async () => {
    try {
      const response = await apiService.getAuthors();
      setAuthors(response || []);
    } catch (error) {
      console.error('Error loading authors:', error);
    }
  };

  const loadPublishers = async () => {
    try {
      const response = await apiService.getPublishers();
      setPublishers(response || []);
    } catch (error) {
      console.error('Error loading publishers:', error);
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

  const loadGrades = async () => {
    try {
      const response = await apiService.getGrades();
      setGrades(response || []);
    } catch (error) {
      console.error('Error loading grades:', error);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await apiService.getSubjects();
      setSubjects(response || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const handleCreate = async () => {
    try {
      // Helper function to safely parse integers
      const safeParseInt = (value) => {
        if (value === null || value === undefined || value === '') return null;
        const parsed = parseInt(value);
        return isNaN(parsed) ? null : parsed;
      };

      // Helper function to safely parse floats
      const safeParseFloat = (value) => {
        if (value === null || value === undefined || value === '') return null;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
      };

      // Prepare data with proper type conversion
      const productData = {
        title: formData.title || '',
        titleArabic: formData.titleArabic || null,
        sku: formData.sku || null,
        description: formData.description || null,
        descriptionArabic: formData.descriptionArabic || null,
        productType: formData.productType || 'Book',
        authorId: safeParseInt(formData.authorId),
        publisherId: safeParseInt(formData.publisherId),
        categoryId: safeParseInt(formData.categoryId),
        grade: formData.grade || null,
        subject: formData.subject || null,
        publicationDate: formData.publicationDate || null,
        pages: safeParseInt(formData.pages),
        language: formData.language || 'Arabic',
        price: safeParseFloat(formData.price),
        originalPrice: safeParseFloat(formData.originalPrice),
        stockQuantity: safeParseInt(formData.stockQuantity) || 0,
        coverImageUrl: formData.coverImageUrl || null,
        images: formData.images.map((img, index) => ({
          imageUrl: img.imageUrl,
          imageType: img.imageType || 'Gallery',
          displayOrder: index,
          isActive: img.isActive !== undefined ? img.isActive : true
        })),
        isAvailable: formData.isAvailable !== undefined ? formData.isAvailable : true,
        isFeatured: formData.isFeatured !== undefined ? formData.isFeatured : false,
        isNewRelease: formData.isNewRelease !== undefined ? formData.isNewRelease : false
      };

      console.log('Sending product data:', productData);

      await apiService.createProduct(productData);
      showSuccess('تم إنشاء المنتج بنجاح');
      setShowCreateDialog(false);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
        showError(`فشل في إنشاء المنتج: ${JSON.stringify(error.response.data.errors)}`);
      } else {
        showError('فشل في إنشاء المنتج');
      }
    }
  };

  const handleUpdate = async () => {
    try {
      // Helper function to safely parse integers
      const safeParseInt = (value) => {
        if (value === null || value === undefined || value === '') return null;
        const parsed = parseInt(value);
        return isNaN(parsed) ? null : parsed;
      };

      // Helper function to safely parse floats
      const safeParseFloat = (value) => {
        if (value === null || value === undefined || value === '') return null;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
      };

      // Prepare data with proper type conversion
      const productData = {
        title: formData.title || '',
        titleArabic: formData.titleArabic || null,
        sku: formData.sku || null,
        description: formData.description || null,
        descriptionArabic: formData.descriptionArabic || null,
        productType: formData.productType || 'Book',
        authorId: safeParseInt(formData.authorId),
        publisherId: safeParseInt(formData.publisherId),
        categoryId: safeParseInt(formData.categoryId),
        grade: formData.grade || null,
        subject: formData.subject || null,
        publicationDate: formData.publicationDate || null,
        pages: safeParseInt(formData.pages),
        language: formData.language || 'Arabic',
        price: safeParseFloat(formData.price),
        originalPrice: safeParseFloat(formData.originalPrice),
        stockQuantity: safeParseInt(formData.stockQuantity) || 0,
        coverImageUrl: formData.coverImageUrl || null,
        images: formData.images.map((img, index) => ({
          imageUrl: img.imageUrl,
          imageType: img.imageType || 'Gallery',
          displayOrder: index,
          isActive: img.isActive !== undefined ? img.isActive : true
        })),
        isAvailable: formData.isAvailable !== undefined ? formData.isAvailable : true,
        isFeatured: formData.isFeatured !== undefined ? formData.isFeatured : false,
        isNewRelease: formData.isNewRelease !== undefined ? formData.isNewRelease : false
      };

      console.log('Updating product data:', productData);

      await apiService.updateProduct(editingProduct.id, productData);
      showSuccess('تم تحديث المنتج بنجاح');
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
        showError(`فشل في تحديث المنتج: ${JSON.stringify(error.response.data.errors)}`);
      } else {
        showError('فشل في تحديث المنتج');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        await apiService.deleteProduct(id);
        showSuccess('تم حذف المنتج بنجاح');
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        showError('فشل في حذف المنتج');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleArabic: '',
      sku: '',
      description: '',
      descriptionArabic: '',
      productType: 'Book',
      authorId: null,
      publisherId: null,
      categoryId: null,
      grade: '',
      subject: '',
      publicationDate: null,
      pages: null,
      language: 'Arabic',
      price: null,
      originalPrice: null,
      stockQuantity: 0,
      coverImageUrl: '',
      images: [],
      isAvailable: true,
      isFeatured: false,
      isNewRelease: false
    });
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title || '',
      titleArabic: product.titleArabic || '',
      sku: product.sku || '',
      description: product.description || '',
      descriptionArabic: product.descriptionArabic || '',
      productType: product.productType || 'Book',
      authorId: product.authorId || null,
      publisherId: product.publisherId || null,
      categoryId: product.categoryId || null,
      grade: product.grade || '',
      subject: product.subject || '',
      publicationDate: product.publicationDate || null,
      pages: product.pages || null,
      language: product.language || 'Arabic',
      price: product.price || null,
      originalPrice: product.originalPrice || null,
      stockQuantity: product.stockQuantity || 0,
      coverImageUrl: product.coverImageUrl || '',
      images: product.productImages ? product.productImages.map(img => ({
        id: img.id,
        imageUrl: img.imageUrl,
        imageType: img.imageType,
        displayOrder: img.displayOrder,
        isActive: img.isActive
      })) : [],
      isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
      isFeatured: product.isFeatured !== undefined ? product.isFeatured : false,
      isNewRelease: product.isNewRelease !== undefined ? product.isNewRelease : false
    });
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

  // Image handling functions
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    console.log('📸 Image upload triggered with files:', files);
    if (files.length === 0) return;

    try {
      const uploadedImages = [];

      for (const file of files) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          showError(`نوع الملف غير مدعوم: ${file.name}`);
          continue;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          showError(`حجم الملف كبير جداً: ${file.name}`);
          continue;
        }

        // Create FormData for upload
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        // Upload image
        const uploadResponse = await fetch(`${apiService.baseURL}/Products/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formDataUpload
        });

        if (!uploadResponse.ok) {
          throw new Error(`فشل في رفع الصورة: ${file.name}`);
        }

        const uploadResult = await uploadResponse.json();

        // Add to uploaded images
        uploadedImages.push({
          imageUrl: uploadResult.imageUrl,
          imageType: 'Gallery',
          displayOrder: formData.images.length + uploadedImages.length,
          isActive: true
        });
      }

      // Update form data with new images
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages]
      }));

      if (uploadedImages.length > 0) {
        showSuccess(`تم رفع ${uploadedImages.length} صورة بنجاح`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      showError('فشل في رفع الصور');
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const setCoverImage = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      coverImageUrl: imageUrl
    }));
  };

  const getProductTypeLabel = (type) => {
    const typeObj = productTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getProductImage = (product) => {
    if (product.coverImageUrl) {
      return fixImageUrl(product.coverImageUrl);
    }
    if (product.productImages && product.productImages.length > 0) {
      return fixImageUrl(product.productImages[0].imageUrl);
    }
    return 'https://via.placeholder.com/300x400/f0f0f0/666?text=منتج';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-royal-black">إدارة المنتجات</h1>
          <p className="text-royal-black/60">إدارة الكتب والقرطاسية والمواد التعليمية</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={(open) => {
          console.log('📝 Dialog open state changed:', open);
          setShowCreateDialog(open);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-royal-gold hover:bg-yellow-500 text-royal-black">
              <Plus className="w-4 h-4 ml-2" />
              إضافة منتج جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة منتج جديد</DialogTitle>
              <DialogDescription>أدخل تفاصيل المنتج</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Images Upload - Moved to top for visibility */}
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl border-4 border-pink-300">
                <div className="bg-pink-200 text-pink-800 px-4 py-2 rounded-lg mb-4 text-center font-bold">
                  🎯 يمكنك رفع الصور أولاً ثم إدخال باقي التفاصيل
                </div>
                <h3 className="text-2xl font-bold text-pink-900 mb-6 flex items-center">
                  📸 صور المنتج
                </h3>

                {/* Cover Image Selection */}
                {formData.images.length > 0 && (
                  <div className="mb-6">
                    <Label className="flex items-center gap-2 text-lg font-bold text-pink-800 mb-4">
                      🖼️ صورة الغلاف
                    </Label>
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative flex-shrink-0">
                          <img
                            src={image.imageUrl}
                            alt={`Product image ${index + 1}`}
                            className={`w-32 h-32 object-cover rounded-xl border-4 cursor-pointer ${
                              formData.coverImageUrl === image.imageUrl
                                ? 'border-pink-500 shadow-lg'
                                : 'border-gray-300 hover:border-pink-400'
                            }`}
                            onClick={() => setCoverImage(image.imageUrl)}
                          />
                          {formData.coverImageUrl === image.imageUrl && (
                            <div className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1">
                              <Star className="w-4 h-4 fill-current" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    {formData.coverImageUrl && (
                      <p className="text-sm text-pink-700 mt-2">
                        ✅ تم تعيين صورة الغلاف
                      </p>
                    )}
                  </div>
                )}

                {/* Gallery Images */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-lg font-bold text-pink-800">
                    🖼️ معرض الصور
                  </Label>

                  {/* Upload Button */}
                  <div className="border-4 border-dashed border-pink-400 rounded-xl p-8 text-center bg-pink-50 hover:bg-pink-100 transition-colors shadow-lg">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-4"
                    >
                      <div className="w-16 h-16 bg-pink-200 rounded-full flex items-center justify-center">
                        📤
                      </div>
                      <div>
                        <p className="text-lg font-bold text-pink-800">
                          اضغط لاختيار الصور
                        </p>
                        <p className="text-sm text-pink-600">
                          أو اسحب وأفلت الصور هنا
                        </p>
                        <p className="text-xs text-pink-500 mt-2">
                          PNG, JPG, GIF, WebP - حد أقصى 5MB لكل صورة
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Uploaded Images Grid */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.imageUrl}
                            alt={`Product image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-xl border-2 border-pink-200"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-xl flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              🗑️
                            </button>
                          </div>
                          <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.images.length === 0 && (
                    <div className="text-center py-8 text-pink-600">
                      📷 لم يتم رفع أي صور بعد
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl">
                <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
                  📝 المعلومات الأساسية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-lg font-bold text-amber-800">
                      📖 العنوان (إنجليزي) *
                    </Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Product Title"
                      className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-lg font-bold text-amber-800">
                      📖 العنوان (عربي)
                    </Label>
                    <Input
                      value={formData.titleArabic}
                      onChange={(e) => setFormData({...formData, titleArabic: e.target.value})}
                      placeholder="عنوان المنتج"
                      className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-lg font-bold text-amber-800">
                      🏷️ رمز المنتج (SKU)
                    </Label>
                    <Input
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      placeholder="SKU-001"
                      className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-lg font-bold text-amber-800">
                      📦 نوع المنتج *
                    </Label>
                    <Select value={formData.productType} onValueChange={(value) => setFormData({...formData, productType: value})}>
                      <SelectTrigger className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white">
                        <SelectValue placeholder="اختر نوع المنتج" />
                      </SelectTrigger>
                      <SelectContent>
                        {productTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-lg font-bold text-amber-800">
                      📝 الوصف (إنجليزي)
                    </Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Product description"
                      className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-lg font-bold text-amber-800">
                      📝 الوصف (عربي)
                    </Label>
                    <Textarea
                      value={formData.descriptionArabic}
                      onChange={(e) => setFormData({...formData, descriptionArabic: e.target.value})}
                      placeholder="وصف المنتج"
                      className="text-lg p-4 border-2 border-amber-300 focus:border-amber-500 rounded-xl bg-amber-50 focus:bg-white"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Educational Information */}
              {(formData.productType === 'Book' || formData.productType === 'Educational') && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
                  <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
                    🎓 المعلومات التعليمية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-lg font-bold text-blue-800">
                        📚 الصف
                      </Label>
                      <Select value={formData.grade} onValueChange={(value) => setFormData({...formData, grade: value})}>
                        <SelectTrigger className="text-lg p-4 border-2 border-blue-300 focus:border-blue-500 rounded-xl bg-blue-50 focus:bg-white">
                          <SelectValue placeholder="اختر الصف" />
                        </SelectTrigger>
                        <SelectContent>
                          {grades.map(grade => (
                            <SelectItem key={grade.value} value={grade.value}>
                              {grade.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-lg font-bold text-blue-800">
                        📖 المادة
                      </Label>
                      <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
                        <SelectTrigger className="text-lg p-4 border-2 border-blue-300 focus:border-blue-500 rounded-xl bg-blue-50 focus:bg-white">
                          <SelectValue placeholder="اختر المادة" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map(subject => (
                            <SelectItem key={subject.value} value={subject.value}>
                              {subject.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-lg font-bold text-blue-800">
                        🌐 اللغة
                      </Label>
                      <Select value={formData.language} onValueChange={(value) => setFormData({...formData, language: value})}>
                        <SelectTrigger className="text-lg p-4 border-2 border-blue-300 focus:border-blue-500 rounded-xl bg-blue-50 focus:bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Arabic">العربية</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Both">كلاهما</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {formData.productType === 'Book' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-lg font-bold text-blue-800">
                          📅 تاريخ النشر
                        </Label>
                        <Input
                          type="date"
                          value={formData.publicationDate}
                          onChange={(e) => setFormData({...formData, publicationDate: e.target.value})}
                          className="text-lg p-4 border-2 border-blue-300 focus:border-blue-500 rounded-xl bg-blue-50 focus:bg-white"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-lg font-bold text-blue-800">
                          📄 عدد الصفحات
                        </Label>
                        <Input
                          type="number"
                          value={formData.pages}
                          onChange={(e) => setFormData({...formData, pages: e.target.value})}
                          placeholder="200"
                          className="text-lg p-4 border-2 border-blue-300 focus:border-blue-500 rounded-xl bg-blue-50 focus:bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Author, Publisher, Category */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl">
                <h3 className="text-2xl font-bold text-green-900 mb-6 flex items-center">
                  👥 المؤلف والناشر والتصنيف
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {formData.productType === 'Book' && (
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-lg font-bold text-green-800">
                        ✍️ المؤلف
                      </Label>
                      <Select value={formData.authorId ? formData.authorId.toString() : ''} onValueChange={(value) => setFormData({...formData, authorId: value === '' ? null : value})}>
                        <SelectTrigger className="text-lg p-4 border-2 border-green-300 focus:border-green-500 rounded-xl bg-green-50 focus:bg-white">
                          <SelectValue placeholder="اختر المؤلف" />
                        </SelectTrigger>
                        <SelectContent>
                          {authors.map(author => (
                            <SelectItem key={author.id} value={author.id.toString()}>
                              {author.nameArabic || author.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {formData.productType === 'Book' && (
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-lg font-bold text-green-800">
                        🏢 الناشر
                      </Label>
                      <Select value={formData.publisherId ? formData.publisherId.toString() : ''} onValueChange={(value) => setFormData({...formData, publisherId: value === '' ? null : value})}>
                        <SelectTrigger className="text-lg p-4 border-2 border-green-300 focus:border-green-500 rounded-xl bg-green-50 focus:bg-white">
                          <SelectValue placeholder="اختر الناشر" />
                        </SelectTrigger>
                        <SelectContent>
                          {publishers.map(publisher => (
                            <SelectItem key={publisher.id} value={publisher.id.toString()}>
                              {publisher.nameArabic || publisher.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-lg font-bold text-green-800">
                      🏷️ التصنيف *
                    </Label>
                    <Select value={formData.categoryId ? formData.categoryId.toString() : ''} onValueChange={(value) => setFormData({...formData, categoryId: value === '' ? null : value})}>
                      <SelectTrigger className="text-lg p-4 border-2 border-green-300 focus:border-green-500 rounded-xl bg-green-50 focus:bg-white">
                        <SelectValue placeholder="اختر التصنيف" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.nameArabic || category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Pricing and Stock */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl">
                <h3 className="text-2xl font-bold text-purple-900 mb-6 flex items-center">
                  💰 السعر والمخزون
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-lg font-bold text-purple-800">
                      💵 السعر الحالي
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                      className="text-lg p-4 border-2 border-purple-300 focus:border-purple-500 rounded-xl bg-purple-50 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-lg font-bold text-purple-800">
                      💸 السعر الأصلي
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({...formData, originalPrice: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                      className="text-lg p-4 border-2 border-purple-300 focus:border-purple-500 rounded-xl bg-purple-50 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-lg font-bold text-purple-800">
                      📦 الكمية المتوفرة
                    </Label>
                    <Input
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({...formData, stockQuantity: parseInt(e.target.value) || 0})}
                      placeholder="0"
                      className="text-lg p-4 border-2 border-purple-300 focus:border-purple-500 rounded-xl bg-purple-50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Status and Features */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl">
                <h3 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center">
                  ⚙️ الحالة والمميزات
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-lg font-bold text-indigo-800">
                      ✅ متوفر
                    </Label>
                    <Select value={formData.isAvailable.toString()} onValueChange={(value) => setFormData({...formData, isAvailable: value === 'true'})}>
                      <SelectTrigger className="text-lg p-4 border-2 border-indigo-300 focus:border-indigo-500 rounded-xl bg-indigo-50 focus:bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">متوفر</SelectItem>
                        <SelectItem value="false">غير متوفر</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-lg font-bold text-indigo-800">
                      ⭐ مميز
                    </Label>
                    <Select value={formData.isFeatured.toString()} onValueChange={(value) => setFormData({...formData, isFeatured: value === 'true'})}>
                      <SelectTrigger className="text-lg p-4 border-2 border-indigo-300 focus:border-indigo-500 rounded-xl bg-indigo-50 focus:bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">نعم</SelectItem>
                        <SelectItem value="false">لا</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-lg font-bold text-indigo-800">
                      🆕 إصدار جديد
                    </Label>
                    <Select value={formData.isNewRelease.toString()} onValueChange={(value) => setFormData({...formData, isNewRelease: value === 'true'})}>
                      <SelectTrigger className="text-lg p-4 border-2 border-indigo-300 focus:border-indigo-500 rounded-xl bg-indigo-50 focus:bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">نعم</SelectItem>
                        <SelectItem value="false">لا</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>


              {/* Action Buttons */}
              <div className="flex gap-6 pt-8 justify-center">
                <Button 
                  onClick={editingProduct ? handleUpdate : handleCreate} 
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-primary/90 h-9 has-[>svg]:px-3 px-8 py-4 text-lg font-bold bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white border-2 border-green-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {editingProduct ? 'تحديث المنتج' : 'إنشاء المنتج'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="px-8 py-4 text-lg font-bold border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            الفلاتر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label>البحث</Label>
              <Input
                placeholder="ابحث في المنتجات..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            <div>
              <Label>نوع المنتج</Label>
              <Select value={filters.productType} onValueChange={(value) => setFilters({...filters, productType: value})}>
                <SelectTrigger>
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
            <div>
              <Label>التصنيف</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                <SelectTrigger>
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
            <div>
              <Label>الحالة</Label>
              <Select value={filters.isAvailable.toString()} onValueChange={(value) => setFilters({...filters, isAvailable: value === 'true'})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">متوفر</SelectItem>
                  <SelectItem value="false">غير متوفر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-gold mx-auto"></div>
          <p className="mt-4 text-royal-black/60">جاري تحميل المنتجات...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className="relative">
                {/* Product Image */}
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={getProductImage(product)}
                    alt={product.titleArabic || product.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x400/f0f0f0/666?text=منتج';
                    }}
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
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg">{product.titleArabic || product.title}</CardTitle>
                <CardDescription className="text-sm">
                  {product.descriptionArabic || product.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">السعر:</span>
                    <span className="font-bold text-lg text-royal-gold">
                      {product.price} د.أ
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">المخزون:</span>
                    <span className={`font-semibold ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stockQuantity}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">التقييم:</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{product.rating}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {product.isAvailable ? (
                      <Badge className="bg-green-100 text-green-800">متوفر</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">غير متوفر</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-8">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد منتجات</h3>
          <p className="text-gray-500">ابدأ بإضافة منتج جديد</p>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;
