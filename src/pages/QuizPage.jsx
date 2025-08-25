import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import apiService from '../lib/api';
import { showSuccess, showError, showConfirm } from '../lib/sweetAlert';
import PageNav from '../components/PageNav';

const QuizPage = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    startQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const startQuiz = async () => {
    try {
      setLoading(true);
      console.log('Starting quiz with ID:', quizId);
      
      // First, get the quiz details with questions
      const quizResponse = await apiService.apiCall(`/quizzes/${quizId}`);
      console.log('Quiz details response:', quizResponse);
      
      // Then start the quiz attempt
      const attemptResponse = await apiService.apiCall(`/quizzes/${quizId}/start`, {
        method: 'POST'
      });
      console.log('Quiz start response:', attemptResponse);
      
      // Combine quiz data with attempt data
      const quizData = {
        ...quizResponse,
        attemptId: attemptResponse.id,
        startTime: attemptResponse.startTime
      };
      
      console.log('Final quiz data:', quizData);
      console.log('Quiz questions:', quizData.questions);
      console.log('Questions count:', quizData.questions?.length);
      
      setQuiz(quizData);
      setTimeLeft(quizData.durationMinutes * 60);
      setAnswers({});
    } catch (error) {
      console.error('Error starting quiz:', error);
      showError(error.response?.data?.message || 'حدث خطأ أثناء بدء الكويز');
      navigate('/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;

    const confirmed = await showConfirm('هل أنت متأكد من إرسال الكويز؟');
    if (!confirmed) return;

    try {
      setSubmitting(true);
      const submitData = {
        attemptId: quiz.attemptId,
        answers: Object.entries(answers).map(([questionId, optionId]) => ({
          questionId: parseInt(questionId),
          selectedOptionId: parseInt(optionId)
        }))
      };

      const response = await apiService.apiCall('/quizzes/submit', {
        method: 'POST',
        body: JSON.stringify(submitData)
      });
      showSuccess('تم إرسال الكويز بنجاح!');
      
      // توجيه المستخدم لصفحة النتائج
      navigate(`/quiz-results?results=${encodeURIComponent(JSON.stringify(response))}`);
    } catch (error) {
      showError(error.response?.data?.message || 'حدث خطأ أثناء إرسال الكويز');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!quiz?.questions?.length) return 0;
    return ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">الكويز غير موجود</p>
      </div>
    );
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
            <p className="text-gray-600">{quiz.description}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <div className="text-yellow-800">
              <h3 className="text-lg font-semibold mb-2">⚠️ لا توجد أسئلة في هذا الكويز</h3>
              <p className="text-sm">هذا الكويز لا يحتوي على أي أسئلة حالياً. يرجى المحاولة مع كويز آخر.</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/quizzes')}
            className="bg-amber-600 hover:bg-amber-700"
          >
            العودة إلى قائمة الكويزات
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">خطأ في عرض السؤال</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <PageNav />
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <div className="text-right">
            <div className="text-lg font-semibold text-red-600">
              الوقت المتبقي: {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-500">
              السؤال {currentQuestionIndex + 1} من {quiz.questions.length}
            </div>
          </div>
        </div>

        <Progress value={getProgressPercentage()} className="mb-4" />
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>الأسئلة المجاب عنها: {getAnsweredCount()}</span>
          <span>الأسئلة المتبقية: {quiz.questions.length - getAnsweredCount()}</span>
        </div>
      </div>

      {/* Question */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">
            السؤال {currentQuestionIndex + 1}: {currentQuestion.text}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion.id]?.toString() || ''}
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
          >
            {currentQuestion.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2 space-x-reverse mb-3">
                <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                <Label htmlFor={`option-${option.id}`} className="text-base cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
        >
          السؤال السابق
        </Button>

        <div className="flex space-x-2 space-x-reverse">
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            >
              السؤال التالي
            </Button>
          ) : (
            <Button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? 'جاري الإرسال...' : 'إرسال الكويز'}
            </Button>
          )}
        </div>
      </div>

      {/* Question Navigation */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">تنقل سريع بين الأسئلة</h3>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {quiz.questions.map((question, index) => (
            <Button
              key={question.id}
              variant={answers[question.id] ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentQuestionIndex(index)}
              className={currentQuestionIndex === index ? "ring-2 ring-amber-500" : ""}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizPage; 