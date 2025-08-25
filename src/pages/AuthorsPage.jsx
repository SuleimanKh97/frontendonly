import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  User, 
  Search, 
  Book,
  Calendar,
  MapPin,
  Mail,
  Globe,
  ArrowLeft,
  Eye,
  Star,
  Award
} from 'lucide-react'
import apiService from '../lib/api.js'

export default function AuthorsPage({ onBack, onViewAuthor, onViewAuthorBooks }) {
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadAuthors()
  }, [])

  const loadAuthors = async () => {
    setLoading(true)
    try {
      const authorsResponse = await apiService.getAuthors()
      
      if (authorsResponse) {
        setAuthors(authorsResponse)
      } else {
        setAuthors([])
      }
    } catch (error) {
      console.error('Error loading authors:', error)
      setAuthors([])
    } finally {
      setLoading(false)
    }
  }

  const filteredAuthors = authors.filter(author => {
    const name = (author.nameArabic || author.name || '').toLowerCase()
    const bio = (author.biographyArabic || author.biography || '').toLowerCase()
    const search = searchTerm.toLowerCase()
    return name.includes(search) || bio.includes(search)
  })

  const getAuthorImage = (author) => {
    if (author.imageUrl) {
      return author.imageUrl
    }
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7Zg9in2YbYqDwvdGV4dD4KPC9zdmc+'
  }

  const getAuthorName = (author) => {
    return author.nameArabic || author.name || 'مؤلف غير محدد'
  }

  const getAuthorBio = (author) => {
    return author.biographyArabic || author.biography || 'لا توجد سيرة ذاتية متاحة'
  }

  const getAuthorLocation = (author) => {
    return author.country || author.city || 'غير محدد'
  }

  const getAuthorBirthYear = (author) => {
    if (author.birthYear) {
      return author.birthYear
    }
    if (author.birthDate) {
      return new Date(author.birthDate).getFullYear()
    }
    return 'غير محدد'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-gray-800 shadow-xl border-b-4 border-yellow-400">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button variant="outline" size="sm" onClick={onBack} className="flex items-center bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold border-2 border-yellow-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <ArrowLeft className="h-4 w-4 ml-2" />
                🏠 العودة للرئيسية
              </Button>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl shadow-lg">
                  <User className="h-8 w-8 text-black" />
                </div>
                <h1 className="text-4xl font-bold text-yellow-100 drop-shadow-lg">✍️ المؤلفون</h1>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl text-yellow-200 font-medium">📚 اكتشف مؤلفي الكتب العربية المميزين</p>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-md mt-6">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-yellow-600 h-5 w-5" />
              <Input
                type="text"
                placeholder="🔍 ابحث عن مؤلفك المفضل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-12 text-right bg-white border-2 border-yellow-400 focus:border-yellow-500 focus:shadow-lg transition-all duration-300 rounded-xl font-medium text-black placeholder:text-yellow-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500 mx-auto"></div>
            <p className="mt-6 text-2xl text-gray-800 font-bold">✍️ جاري تحميل المؤلفين الرائعين...</p>
          </div>
        ) : filteredAuthors.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl shadow-xl border-2 border-yellow-400">
            <div className="p-8">
              <User className="h-24 w-24 text-yellow-600 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-gray-900 mb-4">😔 لا يوجد مؤلفون</h3>
              <p className="text-xl text-gray-700 font-medium">
                {searchTerm ? 'لم يتم العثور على مؤلفين يطابقون البحث' : 'لا توجد مؤلفين متاحين حالياً'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAuthors.map((author) => (
              <Card key={author.id} className="bg-gradient-to-br from-white to-yellow-50 border-2 border-yellow-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-2xl overflow-hidden">
                <CardHeader className="text-center pb-6 bg-gradient-to-r from-yellow-100 to-yellow-200">
                  <div className="relative mx-auto mb-6">
                    <img
                      src={getAuthorImage(author)}
                      alt={getAuthorName(author)}
                      className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-yellow-400 shadow-xl transition-transform duration-300 hover:scale-110"
                    />
                    {author.isFamous && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full p-2 shadow-lg">
                        <Star className="h-6 w-6 text-white fill-current" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-2xl font-bold text-black">✍️ {getAuthorName(author)}</CardTitle>
                  {author.specialization && (
                    <Badge variant="secondary" className="mt-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold px-4 py-2 rounded-xl shadow-md">
                      🎯 {author.specialization}
                    </Badge>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-6 p-6">
                  {/* Bio */}
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-300">
                    <p className="text-yellow-800 text-lg line-clamp-3 font-medium">
                      📖 {getAuthorBio(author)}
                    </p>
                  </div>

                  {/* Info */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 space-x-reverse text-yellow-700">
                      <Calendar className="h-5 w-5" />
                      <span className="font-bold text-lg">🎂 سنة الميلاد: {getAuthorBirthYear(author)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 space-x-reverse text-yellow-700">
                      <MapPin className="h-5 w-5" />
                      <span className="font-bold text-lg">🌍 {getAuthorLocation(author)}</span>
                    </div>
                    
                    {author.booksCount > 0 && (
                      <div className="flex items-center space-x-3 space-x-reverse text-yellow-700">
                        <Book className="h-5 w-5" />
                        <span className="font-bold text-lg">📚 {author.booksCount} كتاب</span>
                      </div>
                    )}
                  </div>

                  {/* Awards */}
                  {author.awards && author.awards.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 space-x-reverse text-yellow-700">
                        <Award className="h-5 w-5" />
                        <span className="font-bold text-lg">🏆 الجوائز:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {author.awards.slice(0, 2).map((award, index) => (
                          <Badge key={index} variant="outline" className="bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-800 font-bold border-yellow-400 rounded-xl">
                            🏆 {award}
                          </Badge>
                        ))}
                        {author.awards.length > 2 && (
                          <Badge variant="outline" className="bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-800 font-bold border-yellow-400 rounded-xl">
                            +{author.awards.length - 2} أكثر ✨
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-3 space-x-reverse pt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewAuthor(author)}
                      className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold border-2 border-yellow-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Eye className="h-4 w-4 ml-1" />
                      👁️ عرض التفاصيل
                    </Button>
                    {author.booksCount > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewAuthorBooks(author)}
                        className="flex-1 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold border-2 border-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Book className="h-4 w-4 ml-1" />
                        📚 عرض الكتب
                      </Button>
                    )}
                    {author.website && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(author.website, '_blank')}
                      >
                        <Globe className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 