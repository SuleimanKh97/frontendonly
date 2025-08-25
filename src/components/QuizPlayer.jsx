import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import apiService from '../lib/api';
import { showSuccess, showError, showConfirm } from '../lib/sweetAlert';

const QuizPlayer = ({ quizId, onComplete }) => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isStarted, timeLeft]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await apiService.apiCall(`/quizzes/${quizId}`);
      setQuiz(response);
      setTimeLeft(response.timeLimit * 60); // Convert minutes to seconds
    } catch (error) {
      showError('حدث خطأ أثناء جلب الكويز');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    try {
      const response = await apiService.apiCall(`/quizzes/${quizId}/start`, {
        method: 'POST'
      });
      setAttemptId(response.id);
      setIsStarted(true);
      showSuccess('تم بدء الكويز بنجاح!');
    } catch (error) {
      showError('حدث خطأ أثناء بدء الكويز');
    }
  };

  const handleTimeUp = async () => {
    clearInterval(intervalRef.current);
    await submitQuiz();
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = () => {
    setShowConfirmSubmit(true);
  };

  const submitQuiz = async () => {
    try {
      const timeSpent = (quiz.timeLimit * 60) - timeLeft; // Calculate time spent in seconds
      const submitData = {
        attemptId: attemptId,
        answers: Object.entries(answers).map(([questionIdStr, answerValue]) => {
          const questionId = parseInt(questionIdStr);
          const question = quiz.questions?.find((q) => q.id === questionId);
          const type = question?.type;
          return {
            questionId,
            selectedOptionId: type === 'MultipleChoice' ? (typeof answerValue === 'number' ? answerValue : null) : null,
            textAnswer: type === 'FillInTheBlank' ? (typeof answerValue === 'string' ? answerValue : null) : null,
            booleanAnswer: type === 'TrueFalse' ? (typeof answerValue === 'boolean' ? answerValue : null) : null,
          };
        }),
        timeSpent: timeSpent
      };

      const response = await apiService.apiCall('/quizzes/submit', {
        method: 'POST',
        body: JSON.stringify(submitData)
      });

      setIsSubmitted(true);
      setShowConfirmSubmit(false);
      setQuizResult(response);
      showSuccess('تم إرسال الكويز بنجاح!');
      
      if (onComplete) {
        onComplete(response);
      }
    } catch (error) {
      showError('حدث خطأ أثناء إرسال الكويز');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!quiz || !quiz.questions) return 0;
    return ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
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

  if (!isStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">{quiz.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">{quiz.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">{quiz.questions?.length || 0}</div>
                  <div className="text-sm text-gray-600">عدد الأسئلة</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">{quiz.timeLimit}</div>
                  <div className="text-sm text-gray-600">دقيقة</div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>• تأكد من أن لديك اتصال إنترنت مستقر</p>
                <p>• لا يمكنك العودة للأسئلة السابقة</p>
                <p>• سيتم إرسال الكويز تلقائياً عند انتهاء الوقت</p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={startQuiz} size="lg" className="px-8">
                بدء الكويز
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted && quizResult) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {quizResult.isPassed ? '🎉 مبروك! لقد نجحت في الكويز' : '📚 نتيجة الكويز'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quiz Info */}
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">{quizResult.quizTitle}</h3>
              <p className="text-gray-600">تم الإكمال في {new Date(quizResult.completedAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}</p>
            </div>

            {/* Score Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-3xl font-bold ${quizResult.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {quizResult.score}/{quizResult.totalScore}
                </div>
                <div className="text-sm text-gray-600">الدرجة المحققة</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-3xl font-bold ${quizResult.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {quizResult.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">النسبة المئوية</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-3xl font-bold ${quizResult.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {quizResult.isPassed ? '✅ نجح' : '❌ رسب'}
                </div>
                <div className="text-sm text-gray-600">النتيجة</div>
              </div>
            </div>

            {/* Time Spent */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">
                الوقت المستغرق: {Math.floor(quizResult.timeSpent / 60)}:{(quizResult.timeSpent % 60).toString().padStart(2, '0')}
              </div>
            </div>

            {/* Detailed Results */}
            <div>
              <h4 className="text-lg font-semibold mb-4">تفاصيل الإجابات:</h4>
              <div className="space-y-4">
                {quizResult.answers.map((answer, index) => (
                  <div key={answer.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium">السؤال {index + 1}: {answer.questionText}</h5>
                      <Badge variant={answer.isCorrect ? "default" : "destructive"}>
                        {answer.isCorrect ? 'صحيح' : 'خطأ'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                                             <div className="text-sm text-gray-600">
                         <strong>إجابتك:</strong> {answer.selectedOptionText || answer.textAnswer || answer.booleanAnswer?.toString() || 'لم تجب'}
                       </div>
                      
                      {answer.options && answer.options.length > 0 && (
                        <div className="text-sm">
                          <strong>الخيارات:</strong>
                          <div className="mt-1 space-y-1">
                            {answer.options.map((option) => (
                              <div key={option.id} className={`flex items-center gap-2 ${
                                option.isCorrect ? 'text-green-600 font-semibold' : 
                                answer.selectedOptionId === option.id && !answer.isCorrect ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                <span>{option.optionText}</span>
                                {option.isCorrect && <span>✅</span>}
                                {answer.selectedOptionId === option.id && !answer.isCorrect && <span>❌</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                                             <div className="text-sm text-gray-600">
                         <strong>النقاط المحققة:</strong> {answer.pointsEarned} نقطة
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button onClick={() => window.location.reload()}>
                العودة للكويزات
              </Button>
              <Button variant="outline" onClick={() => {
                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                  <html dir="rtl">
                    <head>
                      <title>نتيجة الكويز - ${quizResult.quizTitle}</title>
                      <style>
                        body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .score-summary { display: flex; justify-content: space-around; margin: 20px 0; }
                        .score-item { text-align: center; padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
                        .question { margin: 20px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
                        .correct { color: green; }
                        .incorrect { color: red; }
                        .option { margin: 5px 0; }
                        @media print { body { margin: 0; } }
                      </style>
                    </head>
                    <body>
                      <div class="header">
                        <h1>نتيجة الكويز</h1>
                        <h2>${quizResult.quizTitle}</h2>
                        <p>تم الإكمال في ${new Date(quizResult.completedAt).toLocaleString('en-US')}</p>
                      </div>
                      
                      <div class="score-summary">
                        <div class="score-item">
                          <h3>الدرجة</h3>
                          <p>${quizResult.score}/${quizResult.totalScore}</p>
                        </div>
                        <div class="score-item">
                          <h3>النسبة المئوية</h3>
                          <p>${quizResult.percentage.toFixed(1)}%</p>
                        </div>
                        <div class="score-item">
                          <h3>النتيجة</h3>
                          <p>${quizResult.isPassed ? 'نجح' : 'رسب'}</p>
                        </div>
                      </div>
                      
                      <h3>تفاصيل الإجابات:</h3>
                      ${quizResult.answers.map((answer, index) => `
                        <div class="question">
                          <h4>السؤال ${index + 1}: ${answer.questionText}</h4>
                          <p><strong>إجابتك:</strong> ${answer.selectedOptionText || answer.textAnswer || answer.booleanAnswer?.toString() || 'لم تجب'}</p>
                          <p class="${answer.isCorrect ? 'correct' : 'incorrect'}">
                            <strong>النتيجة:</strong> ${answer.isCorrect ? 'صحيح' : 'خطأ'}
                          </p>
                          <p><strong>النقاط المحققة:</strong> ${answer.pointsEarned} نقطة</p>
                        </div>
                      `).join('')}
                    </body>
                  </html>
                `);
                printWindow.document.close();
                printWindow.print();
              }}>
                طباعة النتيجة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted && !quizResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-green-600">تم إرسال الكويز بنجاح!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">سيتم مراجعة إجاباتك وإعلامك بالنتيجة قريباً</p>
            <Button onClick={() => window.location.reload()}>
              العودة للصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions?.[currentQuestionIndex];
  const totalQuestions = quiz.questions?.length || 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with Timer and Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <Badge variant="outline">السؤال {currentQuestionIndex + 1} من {totalQuestions}</Badge>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${timeLeft <= 300 ? 'text-red-600' : 'text-amber-600'}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-600">الوقت المتبقي</div>
          </div>
        </div>
        
        <Progress value={getProgressPercentage()} className="h-2" />
      </div>

      {/* Question */}
      {currentQuestion && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">
                السؤال {currentQuestionIndex + 1}: {currentQuestion.questionText}
              </CardTitle>
              <Badge variant="outline">{currentQuestion.points} نقطة</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQuestion.type === 'MultipleChoice' && (
                <>
                  {currentQuestion.options?.map((option, index) => (
                    <div
                      key={option.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        answers[currentQuestion.id] === option.id
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleAnswerChange(currentQuestion.id, option.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          answers[currentQuestion.id] === option.id
                            ? 'border-amber-500 bg-amber-500'
                            : 'border-gray-300'
                        }`}>
                          {answers[currentQuestion.id] === option.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                        <span>{option.optionText}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {currentQuestion.type === 'TrueFalse' && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={`p-4 border rounded-lg ${answers[currentQuestion.id] === true ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => handleAnswerChange(currentQuestion.id, true)}
                  >
                    صح
                  </button>
                  <button
                    type="button"
                    className={`p-4 border rounded-lg ${answers[currentQuestion.id] === false ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => handleAnswerChange(currentQuestion.id, false)}
                  >
                    خطأ
                  </button>
                </div>
              )}

              {currentQuestion.type === 'FillInTheBlank' && (
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg"
                  placeholder="اكتب إجابتك هنا..."
                  value={typeof answers[currentQuestion.id] === 'string' ? answers[currentQuestion.id] : ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
        >
          السؤال السابق
        </Button>

        <div className="flex gap-2">
          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            >
              السؤال التالي
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              إرسال الكويز
            </Button>
          )}
        </div>
      </div>

      {/* Question Navigation */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3">تنقل سريع:</h3>
        <div className="flex flex-wrap gap-2">
          {quiz.questions?.map((question, index) => (
            <Button
              key={question.id}
              variant={index === currentQuestionIndex ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentQuestionIndex(index)}
              className={answers[question.id] ? 'bg-green-100 border-green-500' : ''}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>

      {/* Confirm Submit Dialog */}
      <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد إرسال الكويز</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من إرسال الكويز؟ لا يمكنك العودة وتعديل الإجابات بعد الإرسال.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>
              إلغاء
            </Button>
            <Button onClick={submitQuiz} className="bg-green-600 hover:bg-green-700">
              إرسال الكويز
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizPlayer; 