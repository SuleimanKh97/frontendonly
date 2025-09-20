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

  // Missing images state
  const [showMissingImagesDialog, setShowMissingImagesDialog] = useState(false);
  const [missingImagesProducts, setMissingImagesProducts] = useState([]);
  const [loadingMissingImages, setLoadingMissingImages] = useState(false);
  const [selectedProductsForUpload, setSelectedProductsForUpload] = useState(new Set());
  const [productsWithMissingImages, setProductsWithMissingImages] = useState(new Set());

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

      // Check for missing images in loaded products
      if (response && response.length > 0) {
        const productsWithMissing = new Set();
        for (const product of response) {
          try {
            if (await hasMissingImages(product)) {
              productsWithMissing.add(product.id);
            }
          } catch (error) {
            console.error(`Error checking images for product ${product.id}:`, error);
            // If we can't check, assume it might have missing images
            productsWithMissing.add(product.id);
          }
        }
        setProductsWithMissingImages(productsWithMissing);
      }
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

  // Missing Images Functions
  const loadMissingImagesProducts = async () => {
    try {
      setLoadingMissingImages(true);
      const response = await apiService.get('/Products/missing-images');
      setMissingImagesProducts(response.products || []);
      setShowMissingImagesDialog(true);
    } catch (error) {
      console.error('Error loading products with missing images:', error);
      showError('فشل في تحميل المنتجات التي تحتاج صور');
    } finally {
      setLoadingMissingImages(false);
    }
  };

  const handleBulkImageUpload = async (files) => {
    if (selectedProductsForUpload.size === 0) {
      showWarning('يرجى اختيار منتج واحد على الأقل');
      return;
    }

    if (files.length === 0) {
      showWarning('يرجى اختيار صور للرفع');
      return;
    }

    try {
      // First upload all images
      const uploadedUrls = [];
      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append('file', file);

          const response = await apiService.uploadImage(formData);
          if (response.imageUrl) {
            uploadedUrls.push(response.imageUrl);
          }
        } catch (error) {
          console.error(`Failed to upload image:`, error);
        }
      }

      if (uploadedUrls.length === 0) {
        showError('فشل في رفع أي صورة');
        return;
      }

      // Then update all selected products with the uploaded images
      const updatePromises = Array.from(selectedProductsForUpload).map(async (productId) => {
        const product = missingImagesProducts.find(p => p.id === productId);
        if (!product) return;

        try {
          // Prepare update data - add new images to existing ones
          const existingImages = product.productImages || [];
          const newImages = uploadedUrls.map((url, index) => ({
            imageUrl: url,
            isCover: index === 0 && existingImages.length === 0 // Set first image as cover if no existing images
          }));

          const updateData = {
            ...product,
            images: [...existingImages, ...newImages]
          };

          await apiService.updateProduct(productId, updateData);
          return { productId, success: true };
        } catch (error) {
          console.error(`Failed to update product ${product.title}:`, error);
          return { productId, success: false };
        }
      });

      const results = await Promise.all(updatePromises);
      const successCount = results.filter(r => r.success).length;

      showSuccess(`تم رفع ${uploadedUrls.length} صورة بنجاح لـ ${successCount} منتج`);

      // Refresh data
      loadMissingImagesProducts();
      loadProducts();
      setSelectedProductsForUpload(new Set());

    } catch (error) {
      console.error('Error in bulk image upload:', error);
      showError('فشل في رفع الصور');
    }
  };

  const toggleProductSelection = (productId) => {
    const newSelection = new Set(selectedProductsForUpload);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProductsForUpload(newSelection);
  };

  // Check if a product has missing images
  const hasMissingImages = async (product) => {
    if (!product.coverImageUrl && (!product.productImages || product.productImages.length === 0)) {
      return true; // No images at all
    }

    // Check cover image
    if (product.coverImageUrl) {
      try {
        const response = await fetch(product.coverImageUrl, { method: 'HEAD' });
        if (!response.ok) return true;
      } catch {
        return true;
      }
    }

    // Check product images
    if (product.productImages) {
      for (const image of product.productImages) {
        if (image.imageUrl) {
          try {
            const response = await fetch(image.imageUrl, { method: 'HEAD' });
            if (!response.ok) return true;
          } catch {
            return true;
          }
        }
      }
    }

    return false;
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
          id: img.id, // Include the ID for existing images
          imageUrl: img.imageUrl,
          imageType: img.imageType || 'Gallery',
          displayOrder: index,
          isActive: img.isActive !== undefined ? img.isActive : true
        })),
        isAvailable: formData.isAvailable !== undefined ? formData.isAvailable : true,
        isFeatured: formData.isFeatured !== undefined ? formData.isFeatured : false,
        isNewRelease: formData.isNewRelease !== undefined ? formData.isNewRelease : false
      };


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
          id: img.id, // Include the ID for existing images
          imageUrl: img.imageUrl,
          imageType: img.imageType || 'Gallery',
          displayOrder: index,
          isActive: img.isActive !== undefined ? img.isActive : true
        })),
        isAvailable: formData.isAvailable !== undefined ? formData.isAvailable : true,
        isFeatured: formData.isFeatured !== undefined ? formData.isFeatured : false,
        isNewRelease: formData.isNewRelease !== undefined ? formData.isNewRelease : false
      };




      const result = await apiService.updateProduct(editingProduct.id, productData);

      showSuccess('تم تحديث المنتج بنجاح');

      // Close the dialog and reset state
      setShowCreateDialog(false);
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
    const mappedImages = product.images ? product.images.map(img => ({
      id: img.id,
      imageUrl: img.imageUrl,
      imageType: img.imageType || 'Gallery',
      displayOrder: img.displayOrder || 0,
      isActive: img.isActive !== undefined ? img.isActive : true
    })) : [];

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
      images: mappedImages,
      isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
      isFeatured: product.isFeatured !== undefined ? product.isFeatured : false,
      isNewRelease: product.isNewRelease !== undefined ? product.isNewRelease : false
    });

    setShowCreateDialog(true); // Open the dialog for editing
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
      setFormData(prev => {
        const updatedImages = [...prev.images, ...uploadedImages];

        // If no cover image is set, automatically set the first image as cover
        const newCoverImageUrl = prev.coverImageUrl || (uploadedImages.length > 0 ? uploadedImages[0].imageUrl : null);

        return {
          ...prev,
          images: updatedImages,
          coverImageUrl: newCoverImageUrl
        };
      });

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
      const fixedUrl = fixImageUrl(product.coverImageUrl);
      return fixedUrl;
    }
    if (product.images && product.images.length > 0) {
      const fixedUrl = fixImageUrl(product.images[0].imageUrl);
      return fixedUrl;
    }
    if (product.productImages && product.productImages.length > 0) {
      const fixedUrl = fixImageUrl(product.productImages[0].imageUrl);
      return fixedUrl;
    }
    // Use a data URL placeholder that works offline
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1lbnRhaiAo0LHWkdWZ0LHWaSk8L3RleHQ+PC9zdmc+';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-royal-black">إدارة المنتجات</h1>
          <p className="text-royal-black/60">إدارة الكتب والقرطاسية والمواد التعليمية</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={loadMissingImagesProducts}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
            disabled={loadingMissingImages}
          >
            {loadingMissingImages ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500 mr-2"></div>
            ) : (
              <Upload className="w-4 h-4 ml-2" />
            )}
            فحص الصور المفقودة
          </Button>
          <Button
            data-add-product
            onClick={() => {
              setEditingProduct(null);
              resetForm();
              setShowCreateDialog(true);
            }}
            className="bg-royal-gold hover:bg-yellow-500 text-royal-black"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة منتج جديد
          </Button>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? 'قم بتعديل تفاصيل المنتج' : 'أدخل تفاصيل المنتج'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Images Upload - TOP SECTION */}
              <div className="bg-red-100 border-4 border-red-500 p-6 rounded-2xl">
                <h3 className="text-2xl font-bold text-red-900 mb-4">🖼️ صور المنتج</h3>
                <div className="text-center p-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload-simple"
                  />
                  <label htmlFor="image-upload-simple" className="cursor-pointer">
                    <div className="text-6xl mb-4">📤</div>
                    <div className="text-xl font-bold text-gray-700 mb-2">اضغط هنا لاختيار الصور</div>
                    <div className="text-sm text-gray-500">أو اسحب وأفلت الصور</div>
                  </label>
                </div>
                {formData.images && formData.images.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-bold mb-4">الصور المختارة ({formData.images.length})</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image.imageUrl}
                            alt={`صورة ${index + 1}`}
                            className={`w-full h-24 object-cover rounded-lg border ${
                              formData.coverImageUrl === image.imageUrl
                                ? 'border-yellow-500 ring-2 ring-yellow-300'
                                : 'border-gray-300'
                            }`}
                            onError={(e) => {
                              console.error('Image failed to load:', image.imageUrl);
                              // Prevent infinite loop by checking if we're already using the placeholder
                              if (!e.target.src.includes('data:image/svg+xml')) {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                              }
                            }}
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                          >
                            ✕
                          </button>
                          <button
                            onClick={() => setCoverImage(image.imageUrl)}
                            className={`absolute bottom-1 left-1 rounded-full w-6 h-6 flex items-center justify-center text-sm ${
                              formData.coverImageUrl === image.imageUrl
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-500 text-white hover:bg-yellow-400'
                            }`}
                            title="تعيين كصورة غلاف"
                          >
                            ★
                          </button>
                          {formData.coverImageUrl === image.imageUrl && (
                            <div className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                              غلاف
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {formData.coverImageUrl && (
                      <p className="text-sm text-yellow-700 mt-2 flex items-center gap-2">
                        <span className="text-yellow-500">★</span>
                        تم تعيين صورة الغلاف
                      </p>
                    )}
                  </div>
                )}
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
                      // Prevent infinite loop by checking if we're already using the placeholder
                      if (!e.target.src.includes('data:image/svg+xml')) {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1lbnRhaiAo0LHWkdWZ0LHWaSk8L3RleHQ+PC9zdmc+';
                      }
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
                  {productsWithMissingImages.has(product.id) && (
                    <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">
                      <Upload className="w-3 h-3 ml-1" />
                      صور مفقودة
                    </Badge>
                  )}
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

      {/* Missing Images Dialog */}
      <Dialog open={showMissingImagesDialog} onOpenChange={setShowMissingImagesDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-red-500" />
              منتجات تحتاج صور ({missingImagesProducts.length})
            </DialogTitle>
            <DialogDescription>
              المنتجات التالية لها صور مفقودة أو لا تحتوي على صور. يمكنك رفع صور جديدة لها.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Bulk Upload Section */}
            <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-blue-900 mb-3">رفع صور جماعي</h3>
              <div className="flex gap-4 items-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleBulkImageUpload(Array.from(e.target.files))}
                  className="hidden"
                  id="bulk-image-upload"
                />
                <label htmlFor="bulk-image-upload" className="cursor-pointer">
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                    <Upload className="w-4 h-4 ml-2" />
                    اختر صور للرفع
                  </Button>
                </label>
                <span className="text-sm text-blue-700">
                  تم اختيار {selectedProductsForUpload.size} منتج
                </span>
                <Button
                  onClick={() => setSelectedProductsForUpload(new Set())}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  إلغاء الاختيار
                </Button>
              </div>
            </div>

            {/* Products List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missingImagesProducts.map((product) => (
                <Card key={product.id} className={`border-2 ${
                  selectedProductsForUpload.has(product.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedProductsForUpload.has(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg truncate">
                          {product.titleArabic || product.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          SKU: {product.sku} | النوع: {product.productType}
                        </p>

                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {product.hasNoImages && (
                            <Badge variant="destructive" className="text-xs">
                              لا توجد صور
                            </Badge>
                          )}
                          {product.missingImagesCount > 0 && (
                            <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                              {product.missingImagesCount} صورة مفقودة
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {product.totalImages} صورة إجمالي
                          </Badge>
                        </div>

                        {/* Broken Image URLs */}
                        {product.missingImageUrls && product.missingImageUrls.length > 0 && (
                          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                            <strong>روابط مكسورة:</strong>
                            <ul className="mt-1 space-y-1">
                              {product.missingImageUrls.slice(0, 2).map((url, idx) => (
                                <li key={idx} className="truncate" title={url}>
                                  {url.length > 50 ? `${url.substring(0, 50)}...` : url}
                                </li>
                              ))}
                              {product.missingImageUrls.length > 2 && (
                                <li>... و {product.missingImageUrls.length - 2} روابط أخرى</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {missingImagesProducts.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">
                  جميع المنتجات تحتوي على صور صحيحة
                </h3>
                <p className="text-gray-500">
                  لا توجد منتجات تحتاج إلى إصلاح صورها
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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

