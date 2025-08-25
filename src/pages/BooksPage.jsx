import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { 
  Book, 
  BookOpen,
  Search, 
  Filter,
  Grid,
  List,
  Star,
  ShoppingCart,
  Eye,
  MessageCircle,
  Calendar,
  User,
  Tag,
  ArrowLeft
} from 'lucide-react'
import apiService, { fixImageUrl } from '../lib/api'

export default function BooksPage({ onBack, onWhatsAppInquiry, onViewDetails, initialCategory, initialAuthor }) {
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all')
  const [selectedAuthor, setSelectedAuthor] = useState(initialAuthor || 'all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedBook, setSelectedBook] = useState(null)
  const [showBookDetails, setShowBookDetails] = useState(false)

  useEffect(() => {
    loadData()
  }, [currentPage, selectedCategory, selectedAuthor])

  // Update selectedCategory when initialCategory prop changes
  useEffect(() => {
    if (initialCategory && initialCategory !== selectedCategory) {
      setSelectedCategory(initialCategory)
    } else if (!initialCategory && selectedCategory !== 'all') {
      setSelectedCategory('all')
    }
  }, [initialCategory])

  // Update selectedAuthor when initialAuthor prop changes
  useEffect(() => {
    if (initialAuthor && initialAuthor !== selectedAuthor) {
      setSelectedAuthor(initialAuthor)
    } else if (!initialAuthor && selectedAuthor !== 'all') {
      setSelectedAuthor('all')
    }
  }, [initialAuthor])

  const loadData = async () => {
    setLoading(true)
    try {
      // Build API request parameters
      const params = {
        page: currentPage,
        pageSize: 12
      }

      if (searchTerm) {
        params.search = searchTerm
      }

      if (selectedCategory && selectedCategory !== 'all') {
        params.categoryId = selectedCategory
      }

      if (selectedAuthor && selectedAuthor !== 'all') {
        params.authorId = selectedAuthor
      }

      // Fetch data from API
      const [booksResponse, categoriesResponse, authorsResponse] = await Promise.all([
        apiService.getBooks(params.page, params.pageSize, params.search, params.categoryId, params.authorId),
        apiService.getCategories(),
        apiService.getAuthors()
      ])

      if (booksResponse && booksResponse.items) {
        setBooks(booksResponse.items)
        setTotalPages(Math.ceil(booksResponse.totalCount / params.pageSize))
      } else {
        setBooks([])
        setTotalPages(1)
      }

      if (categoriesResponse) {
        setCategories(categoriesResponse)
      } else {
        setCategories([])
      }

      if (authorsResponse) {
        setAuthors(authorsResponse)
      } else {
        setAuthors([])
      }
      
    } catch (error) {
      console.error('Error loading books data:', error)
      setBooks([])
      setCategories([])
      setAuthors([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setCurrentPage(1)
    await loadData()
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    setCurrentPage(1)
  }

  const handleAuthorChange = (authorId) => {
    setSelectedAuthor(authorId)
    setCurrentPage(1)
  }

  const getBookImage = (book) => {
    // Debug: Log book data
    console.log('Book data for image in BooksPage:', {
      id: book.id,
      title: book.title,
      coverImageUrl: book.coverImageUrl,
      images: book.images
    })
    
    // First try coverImageUrl
    if (book.coverImageUrl) {
      const fixedUrl = fixImageUrl(book.coverImageUrl);
      console.log('Using coverImageUrl:', fixedUrl)
      return fixedUrl
    }
    // Then try images array
    if (book.images && book.images.length > 0) {
      const fixedUrl = fixImageUrl(book.images[0].imageUrl);
      console.log('Using images[0].imageUrl:', fixedUrl)
      return fixedUrl
    }
    // Fallback to placeholder
    console.log('Using placeholder image')
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YwZjBmMCIvPgogIDx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7Zhtin2YbYqDwvdGV4dD4KPC9zdmc+'
  }

  const handleImageError = (event) => {
    console.log('Image failed to load:', event.target.src);
    // Set fallback image
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YwZjBmMCIvPgogIDx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7Zhtin2YbYqDwvdGV4dD4KPC9zdmc+';
  }

  const getBookTitle = (book) => {
    return book.titleArabic || book.title || 'عنوان غير محدد'
  }

  const getAuthorName = (book) => {
    return book.authorNameArabic || book.authorName || book.author?.nameArabic || book.author?.name || 'مؤلف غير محدد'
  }

  const getCategoryName = (book) => {
    return book.categoryNameArabic || book.categoryName || book.category?.nameArabic || book.category?.name || 'تصنيف غير محدد'
  }

  const getPrice = (book) => {
    return book.price ? `${book.price} د.أ` : 'غير متوفر'
  }

  const isAvailable = (book) => {
    return book.stockQuantity > 0
  }

  const handleViewDetails = (book) => {
    setSelectedBook(book)
    setShowBookDetails(true)
  }

  const getStatusColor = (isAvailable) => {
    return isAvailable 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getCategoryColor = (categoryName) => {
    switch (categoryName) {
      case 'الرياضيات': return 'bg-blue-500';
      case 'العلوم': return 'bg-green-500';
      case 'اللغة العربية': return 'bg-purple-500';
      case 'اللغة الإنجليزية': return 'bg-orange-500';
      case 'التاريخ': return 'bg-red-500';
      case 'الجغرافيا': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };

  const getAuthorColor = (authorName) => {
    // Simple hash function for consistent colors
    const hash = authorName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const colors = ['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-orange-600', 'bg-red-600', 'bg-teal-600'];
    return colors[Math.abs(hash) % colors.length] + ' text-white';
  };

  return (
    <div className="min-h-screen bg-royal-beige py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-royal-gold rounded-full flex items-center justify-center">
              <Book className="w-8 h-8 text-royal-black" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-royal-black mb-4">سوق الطلاب</h1>
          <p className="text-lg text-royal-black/70 max-w-2xl mx-auto">
            تسوق من مجموعة واسعة من الكتب، الدوسيات، القرطاسية والكورسات التعليمية
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Search Filter */}
            <div>
              <label className="block text-sm font-medium text-royal-black mb-2">
                البحث
              </label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-royal-gold/60 h-4 w-4" />
                <Input
                  placeholder="ابحث في الكتب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pr-10 border-royal-gold/30 focus:border-royal-gold"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-royal-black mb-2">
                التصنيف
              </label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="border-royal-gold/30 focus:border-royal-gold">
                  <SelectValue placeholder="جميع التصنيفات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التصنيفات</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.nameArabic || category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Author Filter */}
            <div>
              <label className="block text-sm font-medium text-royal-black mb-2">
                المؤلف
              </label>
              <Select value={selectedAuthor} onValueChange={handleAuthorChange}>
                <SelectTrigger className="border-royal-gold/30 focus:border-royal-gold">
                  <SelectValue placeholder="جميع المؤلفين" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المؤلفين</SelectItem>
                  {authors.map((author) => (
                    <SelectItem key={author.id} value={author.id.toString()}>
                      {author.nameArabic || author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-royal-gold text-royal-black' : 'text-royal-black/60'}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-royal-gold text-royal-black' : 'text-royal-black/60'}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedCategory !== 'all' || selectedAuthor !== 'all' || searchTerm) && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-royal-gold/20">
              <span className="text-sm text-royal-black/70">الفلاتر النشطة:</span>
              {searchTerm && (
                <Badge className="bg-royal-gold/20 text-royal-black">
                  البحث: {searchTerm}
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge className="bg-royal-gold/20 text-royal-black">
                  {categories.find(c => c.id.toString() === selectedCategory)?.nameArabic || 'تصنيف'}
                </Badge>
              )}
              {selectedAuthor !== 'all' && (
                <Badge className={getAuthorColor(authors.find(a => a.id.toString() === selectedAuthor)?.nameArabic || 'مؤلف')}>
                  {authors.find(a => a.id.toString() === selectedAuthor)?.nameArabic || 'مؤلف'}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-gold"></div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-royal-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Book className="w-8 h-8 text-royal-gold" />
            </div>
            <h3 className="text-xl font-semibold text-royal-black mb-2">
              لا توجد كتب متاحة
            </h3>
            <p className="text-royal-black/60">
              لم نجد كتب تطابق الفلاتر المحددة. جرب تغيير الفلاتر أو اختيار "جميع التصنيفات".
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
            {books.map((book) => (
              <Card key={book.id} className={`${viewMode === 'list' ? 'flex' : ''} hover-lift bg-white shadow-lg`}>
                <div className={viewMode === 'list' ? 'flex-shrink-0 w-40' : ''}>
                  <img
                    src={getBookImage(book)}
                    alt={getBookTitle(book)}
                    className={`w-full object-cover ${viewMode === 'list' ? 'h-40' : 'h-48'} transition-transform duration-300 hover:scale-105`}
                    onError={handleImageError}
                  />
                </div>
                <CardContent className={viewMode === 'list' ? 'flex-1 p-6' : 'p-6'}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 ${getCategoryColor(getCategoryName(book))} rounded-lg flex items-center justify-center mb-2`}>
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={getStatusColor(isAvailable(book))}>
                          {isAvailable(book) ? "متوفر" : "غير متوفر"}
                        </Badge>
                        <Badge className={getAuthorColor(getAuthorName(book))}>
                          {getAuthorName(book)}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardTitle className="text-royal-black text-right">{getBookTitle(book)}</CardTitle>
                    <CardDescription className="text-royal-black/60 text-right">
                      {getCategoryName(book)} • {getAuthorName(book)}
                    </CardDescription>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-royal-gold">
                          {getPrice(book)}
                        </span>
                        <span className="text-sm text-royal-black/60">
                          {book.stockQuantity || 0} نسخة
                        </span>
                      </div>
                      
                      {book.isFeatured && (
                        <div className="flex items-center space-x-2 bg-royal-gold/20 px-3 py-2 rounded-lg">
                          <Star className="h-4 w-4 text-royal-gold fill-current" />
                          <span className="text-sm font-medium text-royal-gold">كتاب مميز</span>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleViewDetails(book)}
                          className="flex-1 border-royal-gold text-royal-gold hover:bg-royal-gold hover:text-royal-black"
                        >
                          <Eye className="h-4 w-4 ml-1" />
                          التفاصيل
                        </Button>
                        <Button
                          onClick={() => onWhatsAppInquiry(book)}
                          className="flex-1 bg-royal-gold hover:bg-royal-gold/90 text-royal-black font-medium"
                          disabled={!isAvailable(book)}
                        >
                          <MessageCircle className="h-4 w-4 ml-1" />
                          استفسار
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center space-x-2 bg-white rounded-lg p-2 shadow-lg">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-royal-gold text-royal-gold hover:bg-royal-gold hover:text-royal-black"
              >
                السابق
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? 'bg-royal-gold text-royal-black' : 'border-royal-gold text-royal-gold hover:bg-royal-gold hover:text-royal-black'}
                  >
                    {page}
                  </Button>
                )
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="border-royal-gold text-royal-gold hover:bg-royal-gold hover:text-royal-black"
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Book Details Modal */}
      <BookDetailsModal
        book={selectedBook}
        isOpen={showBookDetails}
        onClose={() => {
          setShowBookDetails(false)
          setSelectedBook(null)
        }}
        onWhatsAppInquiry={onWhatsAppInquiry}
      />
    </div>
  )
}

// Book Details Modal Component
function BookDetailsModal({ book, isOpen, onClose, onWhatsAppInquiry }) {
  if (!book) return null

  const getBookImage = () => {
    if (book.coverImageUrl) {
      return fixImageUrl(book.coverImageUrl)
    }
    if (book.images && book.images.length > 0) {
      return fixImageUrl(book.images[0].imageUrl)
    }
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YwZjBmMCIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7Zhtin2YbYqDwvdGV4dD4KPC9zdmc+'
  }

  const handleImageError = (event) => {
    console.log('Modal image failed to load:', event.target.src);
    // Set fallback image
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YwZjBmMCIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7Zhtin2YbYqDwvdGV4dD4KPC9zdmc+';
  }

  const getStatusColor = (isAvailable) => {
    return isAvailable 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right text-2xl text-royal-black">
            {book.titleArabic || book.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Book Image */}
          <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={getBookImage()}
              alt={book.titleArabic || book.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </div>
          
          {/* Book Details */}
          <div className="space-y-4 text-right">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-royal-black">معلومات الكتاب</h3>
              <div className="space-y-2 text-royal-black/80">
                <p><span className="font-medium">العنوان:</span> {book.titleArabic || book.title}</p>
                <p><span className="font-medium">المؤلف:</span> {book.authorNameArabic || book.authorName || book.author?.nameArabic || book.author?.name || 'غير محدد'}</p>
                <p><span className="font-medium">التصنيف:</span> {book.categoryNameArabic || book.categoryName || book.category?.nameArabic || book.category?.name || 'غير محدد'}</p>
                <p><span className="font-medium">الناشر:</span> {book.publisherNameArabic || book.publisherName || book.publisher?.nameArabic || book.publisher?.name || 'غير محدد'}</p>
                <p><span className="font-medium">السعر:</span> <span className="text-royal-gold font-bold">{book.price ? `${book.price} د.أ` : 'غير محدد'}</span></p>
                <p><span className="font-medium">المخزون:</span> {book.stockQuantity || 0} نسخة</p>
                <p><span className="font-medium">الحالة:</span> 
                  <Badge className={`mr-2 ${getStatusColor(book.isAvailable && book.stockQuantity > 0)}`}>
                    {book.isAvailable && book.stockQuantity > 0 ? 'متوفر' : 'غير متوفر'}
                  </Badge>
                </p>
              </div>
            </div>
            
            {book.descriptionArabic || book.description ? (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-royal-black">وصف الكتاب</h3>
                <p className="text-royal-black/70 leading-relaxed">
                  {book.descriptionArabic || book.description}
                </p>
              </div>
            ) : null}
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => {
                  onWhatsAppInquiry(book)
                  onClose()
                }}
                className="flex-1 bg-royal-gold hover:bg-royal-gold/90 text-royal-black font-medium"
              >
                <MessageCircle className="h-4 w-4 ml-1" />
                استفسار واتساب
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 