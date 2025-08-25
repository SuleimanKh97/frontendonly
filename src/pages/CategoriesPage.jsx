import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Tag, 
  Search, 
  Book,
  ArrowLeft,
  Eye,
  TrendingUp,
  Star,
  Grid3X3
} from 'lucide-react'
import apiService from '../lib/api.js'

export default function CategoriesPage({ onBack, onViewCategory }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const categoriesResponse = await apiService.getCategories()
      
      if (categoriesResponse) {
        setCategories(categoriesResponse)
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(category => {
    const name = (category.nameArabic || category.name || '').toLowerCase()
    const description = (category.descriptionArabic || category.description || '').toLowerCase()
    const search = searchTerm.toLowerCase()
    return name.includes(search) || description.includes(search)
  })

  const getCategoryIcon = (category) => {
    if (category.iconUrl) {
      return category.iconUrl
    }
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNDAiIHk9IjQ1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzAiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5OaPC90ZXh0Pgo8L3N2Zz4='
  }

  const getCategoryName = (category) => {
    return category.nameArabic || category.name || 'تصنيف غير محدد'
  }

  const getCategoryDescription = (category) => {
    return category.descriptionArabic || category.description || 'لا يوجد وصف متاح'
  }

  const getCategoryColor = (index) => {
    const colors = [
      'bg-blue-50 border-blue-200 text-blue-800',
      'bg-green-50 border-green-200 text-green-800',
      'bg-purple-50 border-purple-200 text-purple-800',
      'bg-orange-50 border-orange-200 text-orange-800',
      'bg-red-50 border-red-200 text-red-800',
      'bg-indigo-50 border-indigo-200 text-indigo-800',
      'bg-pink-50 border-pink-200 text-pink-800',
      'bg-yellow-50 border-yellow-200 text-yellow-800'
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200" dir="rtl">
      {/* Header */}
              <div className="bg-gradient-to-r from-black via-gray-900 to-gray-800 shadow-xl border-b-4 border-yellow-400">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button variant="outline" size="sm" onClick={onBack} className="flex items-center bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-bold border-2 border-amber-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <ArrowLeft className="h-4 w-4 ml-2" />
                🏠 العودة للرئيسية
              </Button>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl shadow-lg">
                  <Tag className="h-8 w-8 text-black" />
                </div>
                <h1 className="text-4xl font-bold text-amber-100 drop-shadow-lg">🏷️ التصنيفات</h1>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl text-amber-200 font-medium">📚 تصفح الكتب حسب التصنيف المفضل</p>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-md mt-6">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-600 h-5 w-5" />
              <Input
                type="text"
                placeholder="🔍 ابحث في التصنيفات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-12 text-right bg-white border-2 border-amber-400 focus:border-amber-500 focus:shadow-lg transition-all duration-300 rounded-xl font-medium text-black placeholder:text-amber-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-500 mx-auto"></div>
            <p className="mt-6 text-2xl text-amber-800 font-bold">🏷️ جاري تحميل التصنيفات الرائعة...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-r from-amber-100 to-amber-200 rounded-2xl shadow-xl border-2 border-amber-400">
            <div className="p-8">
              <Tag className="h-24 w-24 text-amber-600 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-amber-900 mb-4">😔 لا توجد تصنيفات</h3>
              <p className="text-xl text-amber-700 font-medium">
                {searchTerm ? 'لم يتم العثور على تصنيفات تطابق البحث' : 'لا توجد تصنيفات متاحة حالياً'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCategories.map((category, index) => (
              <Card 
                key={category.id} 
                className="bg-gradient-to-br from-white to-amber-50 border-2 border-amber-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer rounded-2xl overflow-hidden"
                onClick={() => onViewCategory(category)}
              >
                <CardHeader className="text-center pb-6 bg-gradient-to-r from-amber-100 to-amber-200">
                  <div className="relative mx-auto mb-6">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-300 to-amber-400 shadow-xl flex items-center justify-center border-4 border-amber-500">
                      <img
                        src={getCategoryIcon(category)}
                        alt={getCategoryName(category)}
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                    {category.isPopular && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full p-2 shadow-lg">
                        <TrendingUp className="h-6 w-6 text-white fill-current" />
                      </div>
                    )}
                    {category.isFeatured && (
                      <div className="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full p-2 shadow-lg">
                        <Star className="h-6 w-6 text-white fill-current" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-2xl font-bold text-black">🏷️ {getCategoryName(category)}</CardTitle>
                  {category.parentCategory && (
                    <Badge variant="outline" className="mt-3 bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800 font-bold border-blue-400 rounded-xl">
                      📂 {category.parentCategory.nameArabic || category.parentCategory.name}
                    </Badge>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-6 p-6">
                  {/* Description */}
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-300">
                    <p className="text-lg line-clamp-3 font-medium text-amber-800">
                      📝 {getCategoryDescription(category)}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3">
                    {category.booksCount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-2 space-x-reverse text-amber-700 font-bold text-lg">
                          <Book className="h-5 w-5" />
                          <span>📚 عدد الكتب:</span>
                        </span>
                        <Badge variant="secondary" className="bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold px-4 py-2 rounded-xl shadow-md text-lg">
                          {category.booksCount}
                        </Badge>
                      </div>
                    )}
                    
                    {category.subCategoriesCount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-2 space-x-reverse text-amber-700 font-bold text-lg">
                          <Grid3X3 className="h-5 w-5" />
                          <span>🗂️ التصنيفات الفرعية:</span>
                        </span>
                        <Badge variant="outline" className="bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800 font-bold border-blue-400 rounded-xl px-4 py-2 text-lg">
                          {category.subCategoriesCount}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {category.tags && category.tags.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">الكلمات المفتاحية:</div>
                      <div className="flex flex-wrap gap-1">
                        {category.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {category.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{category.tags.length - 3} أكثر
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action */}
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewCategory(category)
                      }}
                    >
                      <Eye className="h-4 w-4 ml-1" />
                      عرض الكتب
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {filteredCategories.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">إحصائيات التصنيفات</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{filteredCategories.length}</div>
                <div className="text-sm text-gray-600">إجمالي التصنيفات</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {filteredCategories.filter(c => c.isPopular).length}
                </div>
                <div className="text-sm text-gray-600">التصنيفات الشائعة</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredCategories.filter(c => c.isFeatured).length}
                </div>
                <div className="text-sm text-gray-600">التصنيفات المميزة</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {filteredCategories.reduce((sum, c) => sum + (c.booksCount || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">إجمالي الكتب</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 