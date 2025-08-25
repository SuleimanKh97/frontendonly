import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import apiService from '../lib/api';
import PageNav from '../components/PageNav';
import { showError } from '../lib/sweetAlert';

const MyAttemptsPage = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: 'all',
    grade: 'all',
    search: ''
  });

  useEffect(() => {
    fetchAttempts();
  }, [filters]);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.subject && filters.subject !== 'all') params.append('subject', filters.subject);
      if (filters.grade && filters.grade !== 'all') params.append('grade', filters.grade);
      if (filters.search) params.append('search', filters.search);
      
      const response = await apiService.apiCall(`/quizzes/my-attempts?${params}`);
      setAttempts(response || []);
    } catch (error) {
      showError('حدث خطأ أثناء جلب المحاولات');
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  };

  const getScorePercentage = (score, totalPoints) => {
    const total = Number(totalPoints) || 0;
    if (!total) return 0;
    return (Number(score) / total) * 100;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadge = (percentage) => {
    if (percentage >= 90) return { text: 'ممتاز', color: 'bg-green-100 text-green-800' };
    if (percentage >= 80) return { text: 'جيد جداً', color: 'bg-blue-100 text-blue-800' };
    if (percentage >= 70) return { text: 'جيد', color: 'bg-yellow-100 text-yellow-800' };
    if (percentage >= 60) return { text: 'مقبول', color: 'bg-orange-100 text-orange-800' };
    return { text: 'ضعيف', color: 'bg-red-100 text-red-800' };
  };

  const formatDuration = (minutes) => {
    const totalMins = Math.max(0, Math.round(Number(minutes) || 0));
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return hours > 0 ? `${hours} ساعة ${mins} دقيقة` : `${mins} دقيقة`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleViewResults = (attempt) => {
    navigate(`/quiz-results?results=${encodeURIComponent(JSON.stringify(attempt))}`);
  };

  const subjects = ['الرياضيات', 'العلوم', 'اللغة العربية', 'اللغة الإنجليزية', 'الدراسات الاجتماعية', 'التربية الإسلامية'];
  const grades = ['الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس', 'الصف السادس'];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageNav />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-amber-900 mb-2">محاولاتي</h1>
        <p className="text-amber-800">عرض جميع محاولاتي للكويزات</p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="البحث في الكويزات..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <Select value={filters.subject} onValueChange={(value) => setFilters({ ...filters, subject: value })}>
          <SelectTrigger className="border-amber-200">
            <SelectValue placeholder="اختر المادة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المواد</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.grade} onValueChange={(value) => setFilters({ ...filters, grade: value })}>
          <SelectTrigger className="border-amber-200">
            <SelectValue placeholder="اختر الصف" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الصفوف</SelectItem>
            {grades.map((grade) => (
              <SelectItem key={grade} value={grade}>{grade}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          onClick={() => setFilters({ search: '', subject: 'all', grade: 'all' })}
          className="border-amber-300 text-amber-900 hover:bg-amber-100"
        >
          مسح الفلاتر
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attempts.map((attempt) => {
            // Normalize backend fields
            const totalPoints = attempt.totalPoints ?? attempt.totalScore ?? attempt.total ?? 0;
            const scorePercentage = getScorePercentage(attempt.score, totalPoints);
            const scoreBadge = getScoreBadge(scorePercentage);
            const correctAnswers = attempt.correctAnswers ?? (Array.isArray(attempt.answers) ? attempt.answers.filter(a => a.isCorrect).length : undefined);
            const timeSpentMinutes = attempt.timeSpentMinutes ?? (attempt.timeSpent ? Math.round(attempt.timeSpent / 60) : 0);
            
            return (
              <Card key={attempt.id} className="hover:shadow-lg transition-shadow border-amber-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-amber-900">{attempt.quizTitle}</CardTitle>
                    <Badge className={scoreBadge.color}>
                      {scoreBadge.text}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {attempt.subject && <Badge variant="outline" className="border-amber-300 text-amber-900">{attempt.subject}</Badge>}
                      {attempt.grade && <Badge variant="outline" className="border-amber-300 text-amber-900">{attempt.grade}</Badge>}
                    </div>

                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(scorePercentage)}`}>
                        {attempt.score}
                      </div>
                      <div className="text-amber-800">من {totalPoints}</div>
                      <div className="text-lg font-semibold text-amber-900 mt-1">
                        {Math.round(scorePercentage)}%
                      </div>
                      <Progress value={scorePercentage} className="mt-2" />
                    </div>

                    <div className="text-sm text-amber-800 space-y-1">
                      {typeof correctAnswers === 'number' && (
                        <div>الإجابات الصحيحة: {correctAnswers}</div>
                      )}
                      <div>الوقت المستغرق: {formatDuration(timeSpentMinutes)}</div>
                      <div>تاريخ الإكمال: {formatDate(attempt.completedAt)}</div>
                    </div>

                    <Button 
                      className="w-full bg-amber-500 text-black hover:bg-amber-400" 
                      onClick={() => handleViewResults(attempt)}
                    >
                      عرض التفاصيل
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && attempts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">لا توجد محاولات</p>
          <Button onClick={() => navigate('/quizzes')} className="mt-4">
            ابدأ كويز جديد
          </Button>
        </div>
      )}

      {/* Statistics */}
      {attempts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">إحصائيات عامة</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="text-center py-6">
                <div className="text-3xl font-bold text-blue-600">{attempts.length}</div>
                <div className="text-gray-600">إجمالي المحاولات</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-6">
                <div className="text-3xl font-bold text-green-600">
                  {Math.round(attempts.reduce((sum, attempt) => sum + getScorePercentage(attempt.score, attempt.totalPoints), 0) / attempts.length)}%
                </div>
                <div className="text-gray-600">متوسط النسبة المئوية</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-6">
                <div className="text-3xl font-bold text-purple-600">
                  {attempts.filter(attempt => getScorePercentage(attempt.score, attempt.totalPoints) >= 80).length}
                </div>
                <div className="text-gray-600">محاولات ممتازة</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-6">
                <div className="text-3xl font-bold text-orange-600">
                  {Math.round(attempts.reduce((sum, attempt) => sum + attempt.timeSpentMinutes, 0) / attempts.length)} د
                </div>
                <div className="text-gray-600">متوسط الوقت المستغرق</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAttemptsPage; 