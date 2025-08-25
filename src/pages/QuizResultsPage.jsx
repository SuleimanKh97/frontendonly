import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { CheckCircle, XCircle } from 'lucide-react';
import apiService from '../lib/api';
import { showError } from '../lib/sweetAlert';
import PageNav from '../components/PageNav';

const QuizResultsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  // قراءة النتائج من URL
  useEffect(() => {
    const resultsParam = searchParams.get('results');
    if (resultsParam) {
      try {
        const parsedResults = JSON.parse(decodeURIComponent(resultsParam));
        setResults(parsedResults);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing results from URL:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!results) {
      // إذا لم تكن النتائج متوفرة، يمكن جلبها من API
      fetchResults();
    }
  }, [results]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      // يمكن إضافة API call لجلب النتائج هنا
    } catch (error) {
      showError('حدث خطأ أثناء جلب النتائج');
    } finally {
      setLoading(false);
    }
  };

  const getDerived = () => {
    if (!results) return {
      totalPoints: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      percentage: 0,
      timeSpentMinutes: 0,
      completedAtFormatted: ''
    };

    const totalPoints = results.totalPoints ?? results.totalScore ?? results.total ?? 0;
    const totalQuestions = results.totalQuestions ?? (Array.isArray(results.answers) ? results.answers.length : (Array.isArray(results.questionResults) ? results.questionResults.length : 0));
    const correctAnswers = results.correctAnswers ?? (Array.isArray(results.answers) ? results.answers.filter(a => a.isCorrect === true).length : (Array.isArray(results.questionResults) ? results.questionResults.filter(q => q.isCorrect === true).length : 0));
    const percentage = typeof results.percentage === 'number' && results.percentage > 0
      ? results.percentage
      : (totalPoints ? (Number(results.score || 0) / totalPoints) * 100 : 0);
    const timeSpentMinutes = results.timeSpentMinutes ?? (results.timeSpent ? Math.round(results.timeSpent / 60) : 0);
    const completedAtFormatted = results.completedAt
      ? new Date(results.completedAt).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : '';

    return { totalPoints, totalQuestions, correctAnswers, percentage, timeSpentMinutes, completedAtFormatted };
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadge = (percentage) => {
    if (percentage >= 90) return { text: 'ممتاز', variant: 'default', color: 'bg-green-100 text-green-800' };
    if (percentage >= 80) return { text: 'جيد جداً', variant: 'default', color: 'bg-blue-100 text-blue-800' };
    if (percentage >= 70) return { text: 'جيد', variant: 'default', color: 'bg-yellow-100 text-yellow-800' };
    if (percentage >= 60) return { text: 'مقبول', variant: 'default', color: 'bg-orange-100 text-orange-800' };
    return { text: 'ضعيف', variant: 'destructive', color: 'bg-red-100 text-red-800' };
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours} ساعة ${mins} دقيقة` : `${mins} دقيقة`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">لا توجد نتائج متاحة</p>
        <Button onClick={() => navigate('/quizzes')} className="mt-4">
          العودة للكويزات
        </Button>
      </div>
    );
  }

  const { totalPoints, totalQuestions, correctAnswers, percentage, timeSpentMinutes, completedAtFormatted } = getDerived();
  const scoreBadge = getScoreBadge(percentage);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <PageNav />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-amber-900 mb-2">نتائج الكويز</h1>
        <p className="text-amber-800">تم إكمال الكويز بنجاح</p>
      </div>

      {/* Score Summary */}
      <Card className="mb-6 border-amber-200">
        <CardHeader>
          <CardTitle className="text-xl text-amber-900">{results.quizTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(percentage)}`}>
                {results.score ?? 0}
              </div>
              <div className="text-amber-800">من {totalPoints}</div>
              <Badge className={`mt-2 ${scoreBadge.color}`}>
                {scoreBadge.text}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-900">
                {Math.round(percentage)}%
              </div>
              <div className="text-amber-800">النسبة المئوية</div>
              <Progress value={percentage} className="mt-2" />
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-amber-900">
                {typeof correctAnswers === 'number' ? correctAnswers : 0}
              </div>
              <div className="text-amber-800">إجابات صحيحة</div>
              <div className="text-sm text-amber-700">
                من {totalQuestions} سؤال
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-lg text-amber-900">تفاصيل الكويز</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.subject && (
              <div className="flex justify-between">
                <span className="text-amber-800">المادة:</span>
                <span className="font-medium">{results.subject}</span>
              </div>
            )}
            {results.grade && (
              <div className="flex justify-between">
                <span className="text-amber-800">الصف:</span>
                <span className="font-medium">{results.grade}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-amber-800">تاريخ الإكمال:</span>
              <span className="font-medium">{completedAtFormatted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-800">الوقت المستغرق:</span>
              <span className="font-medium">{formatDuration(timeSpentMinutes)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-lg text-amber-900">الإحصائيات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-amber-800">الأسئلة الصحيحة:</span>
              <span className="font-medium text-green-600">{typeof correctAnswers === 'number' ? correctAnswers : 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-800">الأسئلة الخاطئة:</span>
              <span className="font-medium text-red-600">{Math.max(0, totalQuestions - (typeof correctAnswers === 'number' ? correctAnswers : 0))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-800">الأسئلة غير المجاب عنها:</span>
              <span className="font-medium text-amber-800">{(Array.isArray(results.answers) ? Math.max(0, totalQuestions - results.answers.length) : (results.unansweredQuestions ?? 0))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-800">معدل الدقة:</span>
              <span className="font-medium">{totalQuestions > 0 ? Math.round(((typeof correctAnswers === 'number' ? correctAnswers : 0) / totalQuestions) * 100) : 0}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Review */}
      {results.questionResults && results.questionResults.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-lg text-amber-900">مراجعة الأسئلة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.questionResults.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4 border-amber-100">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-amber-900">السؤال {index + 1}: {question.text}</h4>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {question.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <div
                        key={option.id}
                        className={`p-2 rounded ${
                          option.id === question.correctOptionId
                            ? 'bg-green-50 border border-green-200'
                            : option.id === question.selectedOptionId && !question.isCorrect
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-amber-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className="text-sm">
                            {option.id === question.correctOptionId && '✓ '}
                            {option.id === question.selectedOptionId && !question.isCorrect && '✗ '}
                            {option.text}
                          </span>
                          {option.id === question.correctOptionId && (
                            <Badge variant="outline" className="text-green-700 border-green-300">
                              الإجابة الصحيحة
                            </Badge>
                          )}
                          {option.id === question.selectedOptionId && !question.isCorrect && (
                            <Badge variant="outline" className="text-red-700 border-red-300">
                              إجابتك
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-center space-x-4 space-x-reverse mt-8">
        <Button onClick={() => navigate('/quizzes')} variant="outline" className="border-amber-300 text-amber-900 hover:bg-amber-100">
          العودة للكويزات
        </Button>
        <Button onClick={() => navigate('/my-attempts')} className="bg-amber-500 text-black hover:bg-amber-400">
          عرض جميع محاولاتي
        </Button>
      </div>
    </div>
  );
};

export default QuizResultsPage; 