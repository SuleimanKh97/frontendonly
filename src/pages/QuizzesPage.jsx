import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import QuizPlayer from '../components/QuizPlayer';
import { Brain, BookOpen } from 'lucide-react';
import apiService from '../lib/api';
import { showError, showSuccess } from '../lib/sweetAlert';

const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [filters, setFilters] = useState({
    subject: 'all',
    grade: 'all',
    search: ''
  });
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const defaultSubjects = [
    'اللغة العربية', 'اللغة الإنجليزية', 'التربية الإسلامية', 'تاريخ الأردن'
  ];
  const defaultGrades = [
    'توجيهي سنة أولى', 'توجيهي سنة ثانية'
  ];

  useEffect(() => {
    fetchQuizzes();
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [filters]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.subject && filters.subject !== 'all') queryParams.append('subject', filters.subject);
      if (filters.grade && filters.grade !== 'all') queryParams.append('grade', filters.grade);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await apiService.apiCall(`/quizzes?${queryParams.toString()}`);
      setQuizzes(response.quizzes || []);
    } catch (error) {
      showError('حدث خطأ أثناء جلب الكويزات');
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [subjectsResponse, gradesResponse] = await Promise.all([
        apiService.apiCall('/quizzes/subjects'),
        apiService.apiCall('/quizzes/grades')
      ]);
      const mergeUnique = (base, extra) => Array.from(new Set([...(base || []), ...(extra || [])]));
      setSubjects(mergeUnique(defaultSubjects, Array.isArray(subjectsResponse) ? subjectsResponse : []));
      setGrades(mergeUnique(defaultGrades, Array.isArray(gradesResponse) ? gradesResponse : []));
    } catch (error) {
      console.error('Error fetching filters:', error);
      setSubjects(defaultSubjects);
      setGrades(defaultGrades);
    }
  };

  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz);
  };

  const handleQuizComplete = (result) => {
    setSelectedQuiz(null);
    // تحديث قائمة الكويزات بعد إكمال الكويز
    fetchQuizzes();
    
    // عرض رسالة نجاح أو فشل
    if (result.isPassed) {
      showSuccess(`مبروك! لقد نجحت في الكويز بنسبة ${result.percentage.toFixed(1)}%`);
    } else {
      showError(`للأسف لم تنجح في الكويز. النسبة المحققة: ${result.percentage.toFixed(1)}%`);
    }
  };

  const handleBackToQuizzes = () => {
    setSelectedQuiz(null);
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    if (filters.search && !quiz.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.subject && filters.subject !== 'all' && quiz.subject !== filters.subject) {
      return false;
    }
    if (filters.grade && filters.grade !== 'all' && quiz.grade !== filters.grade) {
      return false;
    }
    return true;
  });

  if (selectedQuiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <QuizPlayer 
          quizId={selectedQuiz.id} 
          onComplete={handleQuizComplete}
        />
      </div>
    );
  }

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getSubjectColor = (subject) => {
    switch (subject) {
      case 'اللغة العربية': return 'bg-blue-500';
      case 'اللغة الإنجليزية': return 'bg-green-500';
      case 'التربية الإسلامية': return 'bg-purple-500';
      case 'تاريخ الأردن': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'توجيهي سنة أولى': return 'bg-blue-600 text-white';
      case 'توجيهي سنة ثانية': return 'bg-green-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-royal-beige py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-royal-gold rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-royal-black" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-royal-black mb-4">الكويزات التعليمية</h1>
          <p className="text-lg text-royal-black/70 max-w-2xl mx-auto">
            اختبر معرفتك من خلال مجموعة متنوعة من الكويزات التعليمية المخصصة للتوجيهي
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
              <Input
                placeholder="ابحث في الكويزات..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="border-royal-gold/30 focus:border-royal-gold"
              />
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-royal-black mb-2">
                المادة
              </label>
              <Select value={filters.subject} onValueChange={(value) => setFilters({ ...filters, subject: value })}>
                <SelectTrigger className="border-royal-gold/30 focus:border-royal-gold">
                  <SelectValue placeholder="جميع المواد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المواد</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grade Filter */}
            <div>
              <label className="block text-sm font-medium text-royal-black mb-2">
                الصف
              </label>
              <Select value={filters.grade} onValueChange={(value) => setFilters({ ...filters, grade: value })}>
                <SelectTrigger className="border-royal-gold/30 focus:border-royal-gold">
                  <SelectValue placeholder="جميع الصفوف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الصفوف</SelectItem>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => setFilters({ subject: 'all', grade: 'all', search: '' })}
              className="border-royal-gold text-royal-gold hover:bg-royal-gold hover:text-royal-black"
            >
              مسح الفلاتر
            </Button>
          </div>

          {/* Active Filters Display */}
          {(filters.subject !== 'all' || filters.grade !== 'all' || filters.search) && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-royal-gold/20">
              <span className="text-sm text-royal-black/70">الفلاتر النشطة:</span>
              {filters.search && (
                <Badge className="bg-royal-gold/20 text-royal-black">
                  البحث: {filters.search}
                </Badge>
              )}
              {filters.subject !== 'all' && (
                <Badge className="bg-royal-gold/20 text-royal-black">
                  {filters.subject}
                </Badge>
              )}
              {filters.grade !== 'all' && (
                <Badge className={getGradeColor(filters.grade)}>
                  {filters.grade}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Quizzes Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-gold"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover-lift bg-white shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 ${getSubjectColor(quiz.subject)} rounded-lg flex items-center justify-center mb-2`}>
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getStatusColor(quiz.isActive)}>
                        {quiz.isActive ? "متاح" : "غير متاح"}
                      </Badge>
                      <Badge className={getGradeColor(quiz.grade)}>
                        {quiz.grade}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-royal-black text-right">{quiz.title}</CardTitle>
                  <CardDescription className="text-royal-black/60 text-right">
                    {quiz.subject} • {quiz.grade}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-royal-black/70 text-right">
                      {quiz.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-royal-gold">
                        {quiz.totalQuestions ?? quiz.questions?.length ?? 0} سؤال
                      </span>
                      <span className="text-sm text-royal-black/60">
                        {quiz.timeLimit} دقيقة
                      </span>
                    </div>

                    <div className="text-sm text-royal-black/60 space-y-1">
                      {typeof quiz.passingScore === 'number' && (
                        <div>نسبة النجاح: {quiz.passingScore}%</div>
                      )}
                      {quiz.createdAt && (
                        <div>تاريخ الإنشاء: {new Date(quiz.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                      )}
                    </div>
                    
                    {quiz.isActive ? (
                      <Button 
                        className="w-full bg-royal-gold hover:bg-royal-gold/90 text-royal-black font-medium"
                        onClick={() => handleStartQuiz(quiz)}
                      >
                        ابدأ الكويز
                      </Button>
                    ) : (
                      <Button 
                        disabled
                        className="w-full bg-gray-300 text-gray-500 cursor-not-allowed"
                      >
                        غير متاح حالياً
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredQuizzes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-royal-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-royal-gold" />
            </div>
            <h3 className="text-xl font-semibold text-royal-black mb-2">
              لا توجد كويزات متاحة
            </h3>
            <p className="text-royal-black/60">
              لم نجد كويزات تطابق الفلاتر المحددة. جرب تغيير الفلاتر أو اختيار "جميع المواد".
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizzesPage; 