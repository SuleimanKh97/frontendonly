import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { X, Plus, Trash2, Edit } from 'lucide-react';
import apiService from '../../lib/api';
import { showSuccess, showError, showConfirm } from '../../lib/sweetAlert';

const QuizQuestionsManagement = ({ quizId, quizTitle, isComprehensiveMode = false, onClose }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isComprehensiveDialogOpen, setIsComprehensiveDialogOpen] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  
  // Comprehensive form data
  const [comprehensiveFormData, setComprehensiveFormData] = useState({
    // Quiz data
    title: '',
    titleArabic: '',
    description: '',
    descriptionArabic: '',
    subject: '',
    grade: '',
    chapter: '',
    timeLimit: 30,
    passingScore: 60,
    isActive: true,
    isPublic: true,
    // Questions array
    questions: []
  });

  // Current question being edited
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    questionTextArabic: '',
    explanation: '',
    explanationArabic: '',
    points: 1,
    orderIndex: 0,
    type: 'MultipleChoice',
    options: []
  });

  // Current option being edited
  const [currentOption, setCurrentOption] = useState({
    optionText: '',
    optionTextArabic: '',
    isCorrect: false,
    orderIndex: 0
  });

  // New question (for existing quiz)
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    explanation: '',
    points: 1,
    orderIndex: 0,
    type: 'MultipleChoice',
    trueFalseCorrect: true,
    options: []
  });

  const [newOption, setNewOption] = useState({
    optionText: '',
    isCorrect: false,
    orderIndex: 0
  });

  const questionTypes = [
    { value: 'MultipleChoice', label: 'اختيار من متعدد' },
    { value: 'TrueFalse', label: 'صح أو خطأ' },
    { value: 'FillInTheBlank', label: 'إكمال الفراغ' }
  ];

  const subjects = [
    'الرياضيات', 'العلوم', 'اللغة العربية', 'اللغة الإنجليزية', 
    'الدراسات الاجتماعية', 'التربية الإسلامية', 'الحاسوب', 'الفنون'
  ];

  const grades = [
    'الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 
    'الصف الخامس', 'الصف السادس', 'الصف السابع', 'الصف الثامن', 
    'الصف التاسع', 'الصف العاشر', 'الصف الحادي عشر', 'الصف الثاني عشر'
  ];

  useEffect(() => {
    if (quizId) {
      fetchQuestions();
    } else {
      setLoading(false);
    }
  }, [quizId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await apiService.apiCall(`/quizzes/${quizId}`);
      setQuestions(response.questions || []);
    } catch (error) {
      showError('حدث خطأ أثناء جلب الأسئلة');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const resetComprehensiveForm = () => {
    setComprehensiveFormData({
      title: '',
      titleArabic: '',
      description: '',
      descriptionArabic: '',
      subject: '',
      grade: '',
      chapter: '',
      timeLimit: 30,
      passingScore: 60,
      isActive: true,
      isPublic: true,
      questions: []
    });
    setCurrentQuestion({
      questionText: '',
      questionTextArabic: '',
      explanation: '',
      explanationArabic: '',
      points: 1,
      orderIndex: 0,
      type: 'MultipleChoice',
      options: []
    });
    setCurrentOption({
      optionText: '',
      optionTextArabic: '',
      isCorrect: false,
      orderIndex: 0
    });
  };

  const addQuestionToForm = () => {
    if (!currentQuestion.questionText.trim()) {
      showError('يرجى إدخال نص السؤال');
      return;
    }

    const newQuestion = {
      ...currentQuestion,
      id: Date.now(), // Temporary ID for UI
      orderIndex: comprehensiveFormData.questions.length
    };

    setComprehensiveFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    // Reset current question
    setCurrentQuestion({
      questionText: '',
      questionTextArabic: '',
      explanation: '',
      explanationArabic: '',
      points: 1,
      orderIndex: 0,
      type: 'MultipleChoice',
      options: []
    });
  };

  const addOptionToQuestion = (questionIndex) => {
    if (!currentOption.optionText.trim()) {
      showError('يرجى إدخال نص الخيار');
      return;
    }

    const newOption = {
      ...currentOption,
      id: Date.now(), // Temporary ID for UI
      orderIndex: comprehensiveFormData.questions[questionIndex].options.length
    };

    setComprehensiveFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) => 
        index === questionIndex 
          ? { ...q, options: [...q.options, newOption] }
          : q
      )
    }));

    // Reset current option
    setCurrentOption({
      optionText: '',
      optionTextArabic: '',
      isCorrect: false,
      orderIndex: 0
    });
  };

  const removeQuestion = (questionIndex) => {
    setComprehensiveFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, index) => index !== questionIndex)
    }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    setComprehensiveFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) => 
        index === questionIndex 
          ? { ...q, options: q.options.filter((_, optIndex) => optIndex !== optionIndex) }
          : q
      )
    }));
  };

  // Helpers for adding a question to an existing quiz
  const resetNewQuestion = () => {
    setNewQuestion({
      questionText: '',
      explanation: '',
      points: 1,
      orderIndex: questions.length,
      type: 'MultipleChoice',
      trueFalseCorrect: true,
      options: []
    });
    setNewOption({ optionText: '', isCorrect: false, orderIndex: 0 });
  };

  const addNewOption = () => {
    if (!newOption.optionText.trim()) {
      showError('يرجى إدخال نص الخيار');
      return;
    }
    setNewQuestion(prev => ({
      ...prev,
      options: [
        ...prev.options,
        { ...newOption, orderIndex: prev.options.length }
      ]
    }));
    setNewOption({ optionText: '', isCorrect: false, orderIndex: 0 });
  };

  const removeNewOption = (optIndex) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== optIndex)
    }));
  };

  const submitNewQuestion = async (e) => {
    e.preventDefault();
    if (!quizId) return;
    if (!newQuestion.questionText.trim()) {
      showError('يرجى إدخال نص السؤال');
      return;
    }

    let optionsToSend = [];
    if (newQuestion.type === 'MultipleChoice') {
      if (newQuestion.options.length < 2) {
        showError('الاختيار من متعدد يحتاج خيارين على الأقل');
        return;
      }
      const hasCorrect = newQuestion.options.some(o => o.isCorrect === true);
      if (!hasCorrect) {
        showError('يرجى تحديد خيار صحيح واحد على الأقل');
        return;
      }
      optionsToSend = newQuestion.options.map((o, idx) => ({
        optionText: o.optionText,
        isCorrect: o.isCorrect === true,
        orderIndex: idx
      }));
    } else if (newQuestion.type === 'TrueFalse') {
      optionsToSend = [
        { optionText: 'صح', isCorrect: newQuestion.trueFalseCorrect === true, orderIndex: 0 },
        { optionText: 'خطأ', isCorrect: !(newQuestion.trueFalseCorrect === true), orderIndex: 1 }
      ];
    }

    const payload = {
      questionText: newQuestion.questionText,
      explanation: newQuestion.explanation || null,
      points: newQuestion.points || 1,
      orderIndex: newQuestion.orderIndex || questions.length,
      type: newQuestion.type,
      options: optionsToSend
    };

    try {
      await apiService.apiCall(`/quizzes/${quizId}/questions`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showSuccess('تمت إضافة السؤال بنجاح');
      setIsAddQuestionOpen(false);
      resetNewQuestion();
      fetchQuestions();
    } catch (error) {
      showError(error.response?.data?.message || 'حدث خطأ أثناء إضافة السؤال');
    }
  };

  const handleComprehensiveSubmit = async (e) => {
    e.preventDefault();
    
    if (!comprehensiveFormData.title.trim()) {
      showError('يرجى إدخال عنوان الكويز');
      return;
    }

    if (!comprehensiveFormData.subject) {
      showError('يرجى اختيار المادة');
      return;
    }

    if (!comprehensiveFormData.grade) {
      showError('يرجى اختيار الصف');
      return;
    }

    if (comprehensiveFormData.questions.length === 0) {
      showError('يرجى إضافة سؤال واحد على الأقل');
      return;
    }

    try {
      // Create quiz first
      const quizData = {
        title: comprehensiveFormData.title,
        titleArabic: comprehensiveFormData.titleArabic,
        description: comprehensiveFormData.description,
        descriptionArabic: comprehensiveFormData.descriptionArabic,
        subject: comprehensiveFormData.subject,
        grade: comprehensiveFormData.grade,
        chapter: comprehensiveFormData.chapter,
        timeLimit: comprehensiveFormData.timeLimit,
        passingScore: comprehensiveFormData.passingScore,
        isActive: comprehensiveFormData.isActive,
        isPublic: comprehensiveFormData.isPublic,
        questions: comprehensiveFormData.questions
      };

      const response = await apiService.apiCall('/quizzes', {
        method: 'POST',
        body: JSON.stringify(quizData)
      });

      showSuccess('تم إنشاء الكويز بنجاح');
      setIsComprehensiveDialogOpen(false);
      resetComprehensiveForm();
      
      // Close the dialog if in comprehensive mode
      if (isComprehensiveMode && onClose) {
        onClose();
      }
      
      // Refresh the questions list if we're editing an existing quiz
      if (quizId) {
        fetchQuestions();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'حدث خطأ أثناء إنشاء الكويز');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {isComprehensiveMode ? 'إنشاء كويز شامل' : 'إدارة أسئلة الكويز'}
          </h2>
          {quizTitle && !isComprehensiveMode && <p className="text-gray-600">{quizTitle}</p>}
          {isComprehensiveMode && <p className="text-gray-600">قم بإنشاء كويز كامل مع أسئلته وخياراته</p>}
        </div>
                  {!isComprehensiveMode && (
            <Dialog open={isComprehensiveDialogOpen} onOpenChange={setIsComprehensiveDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetComprehensiveForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  إنشاء كويز شامل
                </Button>
              </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إنشاء كويز شامل</DialogTitle>
              <DialogDescription>
                قم بإنشاء كويز كامل مع أسئلته وخياراته في خطوة واحدة
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleComprehensiveSubmit} className="space-y-6">
              {/* Quiz Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">معلومات الكويز</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">عنوان الكويز *</label>
                    <Input
                      value={comprehensiveFormData.title}
                      onChange={(e) => setComprehensiveFormData({...comprehensiveFormData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">العنوان بالعربية</label>
                    <Input
                      value={comprehensiveFormData.titleArabic}
                      onChange={(e) => setComprehensiveFormData({...comprehensiveFormData, titleArabic: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">الوصف</label>
                    <Textarea
                      value={comprehensiveFormData.description}
                      onChange={(e) => setComprehensiveFormData({...comprehensiveFormData, description: e.target.value})}
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">الوصف بالعربية</label>
                    <Textarea
                      value={comprehensiveFormData.descriptionArabic}
                      onChange={(e) => setComprehensiveFormData({...comprehensiveFormData, descriptionArabic: e.target.value})}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">المادة *</label>
                    <Select value={comprehensiveFormData.subject} onValueChange={(value) => setComprehensiveFormData({...comprehensiveFormData, subject: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المادة" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">الصف *</label>
                    <Select value={comprehensiveFormData.grade} onValueChange={(value) => setComprehensiveFormData({...comprehensiveFormData, grade: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الصف" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades.map((grade) => (
                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">الفصل</label>
                    <Input
                      value={comprehensiveFormData.chapter}
                      onChange={(e) => setComprehensiveFormData({...comprehensiveFormData, chapter: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">الوقت المحدد (دقائق)</label>
                    <Input
                      type="number"
                      value={comprehensiveFormData.timeLimit}
                      onChange={(e) => setComprehensiveFormData({...comprehensiveFormData, timeLimit: parseInt(e.target.value) || 30})}
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">الدرجة المطلوبة للنجاح (%)</label>
                    <Input
                      type="number"
                      value={comprehensiveFormData.passingScore}
                      onChange={(e) => setComprehensiveFormData({...comprehensiveFormData, passingScore: parseInt(e.target.value) || 60})}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={comprehensiveFormData.isActive}
                        onChange={(e) => setComprehensiveFormData({...comprehensiveFormData, isActive: e.target.checked})}
                        className="rounded"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium">نشط</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={comprehensiveFormData.isPublic}
                        onChange={(e) => setComprehensiveFormData({...comprehensiveFormData, isPublic: e.target.checked})}
                        className="rounded"
                      />
                      <label htmlFor="isPublic" className="text-sm font-medium">عام</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">الأسئلة</h3>
                
                {/* Add Question Form */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-3">إضافة سؤال جديد</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">نص السؤال *</label>
                      <Textarea
                        value={currentQuestion.questionText}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, questionText: e.target.value})}
                        rows={2}
                        placeholder="أدخل نص السؤال هنا..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">نوع السؤال</label>
                        <Select value={currentQuestion.type} onValueChange={(value) => setCurrentQuestion({...currentQuestion, type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {questionTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">النقاط</label>
                        <Input
                          type="number"
                          value={currentQuestion.points}
                          onChange={(e) => setCurrentQuestion({...currentQuestion, points: parseInt(e.target.value) || 1})}
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">شرح الإجابة</label>
                        <Input
                          value={currentQuestion.explanation}
                          onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                          placeholder="شرح الإجابة الصحيحة (اختياري)"
                        />
                      </div>
                    </div>

                    <Button 
                      type="button" 
                      onClick={addQuestionToForm}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      إضافة السؤال
                    </Button>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-3">
                  {comprehensiveFormData.questions.map((question, questionIndex) => (
                    <Card key={question.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">السؤال {questionIndex + 1}</Badge>
                              <Badge variant="outline">{question.points} نقطة</Badge>
                              <Badge variant="outline">
                                {question.type === 'MultipleChoice' ? 'اختيار من متعدد' : 
                                 question.type === 'TrueFalse' ? 'صح أو خطأ' : 'إكمال الفراغ'}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg">{question.questionText}</CardTitle>
                            {question.explanation && (
                              <p className="text-sm text-gray-600 mt-2">شرح: {question.explanation}</p>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => removeQuestion(questionIndex)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <h5 className="font-medium">الخيارات:</h5>
                          
                          {/* Add Option Form */}
                          <div className="border rounded p-3 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-sm font-medium mb-1">نص الخيار</label>
                                <Input
                                  value={currentOption.optionText}
                                  onChange={(e) => setCurrentOption({...currentOption, optionText: e.target.value})}
                                  placeholder="أدخل نص الخيار..."
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">ترتيب الخيار</label>
                                <Input
                                  type="number"
                                  value={currentOption.orderIndex}
                                  onChange={(e) => setCurrentOption({...currentOption, orderIndex: parseInt(e.target.value) || 0})}
                                  min="0"
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`isCorrect-${questionIndex}`}
                                  checked={currentOption.isCorrect}
                                  onChange={(e) => setCurrentOption({...currentOption, isCorrect: e.target.checked})}
                                  className="rounded"
                                />
                                <label htmlFor={`isCorrect-${questionIndex}`} className="text-sm font-medium">إجابة صحيحة</label>
                              </div>
                            </div>
                            <Button 
                              type="button" 
                              size="sm"
                              onClick={() => addOptionToQuestion(questionIndex)}
                              className="mt-2"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              إضافة الخيار
                            </Button>
                          </div>

                          {/* Options List */}
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <div key={option.id} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                                  <span className={option.isCorrect ? 'font-bold text-green-600' : ''}>
                                    {option.optionText}
                                  </span>
                                  {option.isCorrect && <Badge variant="default" className="text-xs">إجابة صحيحة</Badge>}
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => removeOption(questionIndex, optionIndex)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsComprehensiveDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  إنشاء الكويز
                </Button>
              </div>
            </form>
          </DialogContent>
            </Dialog>
          )}
      </div>

      {/* Comprehensive form when embedded in external dialog */}
      {isComprehensiveMode && (
        <form onSubmit={handleComprehensiveSubmit} className="space-y-6">
          {/* Quiz Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">معلومات الكويز</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">عنوان الكويز *</label>
                <Input
                  value={comprehensiveFormData.title}
                  onChange={(e) => setComprehensiveFormData({...comprehensiveFormData, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">العنوان بالعربية</label>
                <Input
                  value={comprehensiveFormData.titleArabic}
                  onChange={(e) => setComprehensiveFormData({...comprehensiveFormData, titleArabic: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">الوصف</label>
                <Textarea
                  value={comprehensiveFormData.description}
                  onChange={(e) => setComprehensiveFormData({...comprehensiveFormData, description: e.target.value})}
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الوصف بالعربية</label>
                <Textarea
                  value={comprehensiveFormData.descriptionArabic}
                  onChange={(e) => setComprehensiveFormData({...comprehensiveFormData, descriptionArabic: e.target.value})}
                  rows={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">المادة *</label>
                <Select value={comprehensiveFormData.subject} onValueChange={(value) => setComprehensiveFormData({...comprehensiveFormData, subject: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المادة" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الصف *</label>
                <Select value={comprehensiveFormData.grade} onValueChange={(value) => setComprehensiveFormData({...comprehensiveFormData, grade: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصف" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الفصل</label>
                <Input
                  value={comprehensiveFormData.chapter}
                  onChange={(e) => setComprehensiveFormData({...comprehensiveFormData, chapter: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">الوقت المحدد (دقائق)</label>
                <Input
                  type="number"
                  value={comprehensiveFormData.timeLimit}
                  onChange={(e) => setComprehensiveFormData({...comprehensiveFormData, timeLimit: parseInt(e.target.value) || 30})}
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الدرجة المطلوبة للنجاح (%)</label>
                <Input
                  type="number"
                  value={comprehensiveFormData.passingScore}
                  onChange={(e) => setComprehensiveFormData({...comprehensiveFormData, passingScore: parseInt(e.target.value) || 60})}
                  min="0"
                  max="100"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive-inline"
                    checked={comprehensiveFormData.isActive}
                    onChange={(e) => setComprehensiveFormData({...comprehensiveFormData, isActive: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="isActive-inline" className="text-sm font-medium">نشط</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic-inline"
                    checked={comprehensiveFormData.isPublic}
                    onChange={(e) => setComprehensiveFormData({...comprehensiveFormData, isPublic: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="isPublic-inline" className="text-sm font-medium">عام</label>
                </div>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">الأسئلة</h3>
            
            {/* Add Question Form */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-3">إضافة سؤال جديد</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">نص السؤال *</label>
                  <Textarea
                    value={currentQuestion.questionText}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, questionText: e.target.value})}
                    rows={2}
                    placeholder="أدخل نص السؤال هنا..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">نوع السؤال</label>
                    <Select value={currentQuestion.type} onValueChange={(value) => setCurrentQuestion({...currentQuestion, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">النقاط</label>
                    <Input
                      type="number"
                      value={currentQuestion.points}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, points: parseInt(e.target.value) || 1})}
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">شرح الإجابة</label>
                    <Input
                      value={currentQuestion.explanation}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                      placeholder="شرح الإجابة الصحيحة (اختياري)"
                    />
                  </div>
                </div>

                <Button 
                  type="button" 
                  onClick={addQuestionToForm}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة السؤال
                </Button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {comprehensiveFormData.questions.map((question, questionIndex) => (
                <Card key={question.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">السؤال {questionIndex + 1}</Badge>
                          <Badge variant="outline">{question.points} نقطة</Badge>
                          <Badge variant="outline">
                            {question.type === 'MultipleChoice' ? 'اختيار من متعدد' : 
                             question.type === 'TrueFalse' ? 'صح أو خطأ' : 'إكمال الفراغ'}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{question.questionText}</CardTitle>
                        {question.explanation && (
                          <p className="text-sm text-gray-600 mt-2">شرح: {question.explanation}</p>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => removeQuestion(questionIndex)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h5 className="font-medium">الخيارات:</h5>
                      
                      {/* Add Option Form */}
                      <div className="border rounded p-3 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">نص الخيار</label>
                            <Input
                              value={currentOption.optionText}
                              onChange={(e) => setCurrentOption({...currentOption, optionText: e.target.value})}
                              placeholder="أدخل نص الخيار..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">ترتيب الخيار</label>
                            <Input
                              type="number"
                              value={currentOption.orderIndex}
                              onChange={(e) => setCurrentOption({...currentOption, orderIndex: parseInt(e.target.value) || 0})}
                              min="0"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`isCorrect-inline-embedded-${questionIndex}`}
                              checked={currentOption.isCorrect}
                              onChange={(e) => setCurrentOption({...currentOption, isCorrect: e.target.checked})}
                              className="rounded"
                            />
                            <label htmlFor={`isCorrect-inline-embedded-${questionIndex}`} className="text-sm font-medium">إجابة صحيحة</label>
                          </div>
                        </div>
                        <Button 
                          type="button" 
                          size="sm"
                          onClick={() => addOptionToQuestion(questionIndex)}
                          className="mt-2"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          إضافة الخيار
                        </Button>
                      </div>

                      {/* Options List */}
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={option.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                              <span className={option.isCorrect ? 'font-bold text-green-600' : ''}>
                                {option.optionText}
                              </span>
                              {option.isCorrect && <Badge variant="default" className="text-xs">إجابة صحيحة</Badge>}
                            </div>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => removeOption(questionIndex, optionIndex)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => (onClose ? onClose() : null)}>
              إلغاء
            </Button>
            <Button type="submit">إنشاء الكويز</Button>
          </div>
        </form>
      )}

      {/* Existing Questions Display - Only show if not in comprehensive mode */}
      {!isComprehensiveMode && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">أسئلة الكويز</h3>
            <Button onClick={() => { resetNewQuestion(); setIsAddQuestionOpen(true); }}>
              إضافة سؤال
            </Button>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">السؤال {index + 1}</Badge>
                      <Badge variant="outline">{question.points} نقطة</Badge>
                      <Badge variant="outline">
                        {question.type === 'MultipleChoice' ? 'اختيار من متعدد' : 
                         question.type === 'TrueFalse' ? 'صح أو خطأ' : 'إكمال الفراغ'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{question.questionText}</CardTitle>
                    {question.explanation && (
                      <p className="text-sm text-gray-600 mt-2">شرح: {question.explanation}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-medium">الخيارات:</h4>
                  {question.options && question.options.length > 0 ? (
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={option.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                            <span className={option.isCorrect ? 'font-bold text-green-600' : ''}>
                              {option.optionText}
                            </span>
                            {option.isCorrect && <Badge variant="default" className="text-xs">إجابة صحيحة</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">لا توجد خيارات لهذا السؤال</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && questions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">لا توجد أسئلة لهذا الكويز</p>
        </div>
      )}
        </>
      )}

      {/* Add Question Dialog */}
      {!isComprehensiveMode && (
        <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة سؤال جديد</DialogTitle>
              <DialogDescription>أدخل تفاصيل السؤال و(إن لزم) خيارات الإجابة</DialogDescription>
            </DialogHeader>
            <form onSubmit={submitNewQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">نص السؤال *</label>
                <Textarea
                  value={newQuestion.questionText}
                  onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">نوع السؤال</label>
                  <Select value={newQuestion.type} onValueChange={(value) => setNewQuestion({ ...newQuestion, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {questionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">النقاط</label>
                  <Input
                    type="number"
                    value={newQuestion.points}
                    onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">شرح الإجابة</label>
                  <Input
                    value={newQuestion.explanation}
                    onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                    placeholder="اختياري"
                  />
                </div>
              </div>

              {newQuestion.type === 'MultipleChoice' && (
                <div className="space-y-2">
                  <h4 className="font-medium">الخيارات</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      value={newOption.optionText}
                      onChange={(e) => setNewOption({ ...newOption, optionText: e.target.value })}
                      placeholder="نص الخيار"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newOption.isCorrect}
                        onChange={(e) => setNewOption({ ...newOption, isCorrect: e.target.checked })}
                      />
                      <span className="text-sm">إجابة صحيحة</span>
                    </div>
                    <Button type="button" onClick={addNewOption}>إضافة خيار</Button>
                  </div>
                  <div className="space-y-2">
                    {newQuestion.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{String.fromCharCode(65 + idx)}.</span>
                          <span className={opt.isCorrect ? 'font-bold text-green-600' : ''}>{opt.optionText}</span>
                        </div>
                        <Button type="button" size="sm" variant="destructive" onClick={() => removeNewOption(idx)}>حذف</Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {newQuestion.type === 'TrueFalse' && (
                <div className="space-y-2">
                  <h4 className="font-medium">اختر الإجابة الصحيحة</h4>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="tf" checked={newQuestion.trueFalseCorrect === true} onChange={() => setNewQuestion({ ...newQuestion, trueFalseCorrect: true })} />
                      <span>صح</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="tf" checked={newQuestion.trueFalseCorrect === false} onChange={() => setNewQuestion({ ...newQuestion, trueFalseCorrect: false })} />
                      <span>خطأ</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddQuestionOpen(false)}>إلغاء</Button>
                <Button type="submit">حفظ السؤال</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default QuizQuestionsManagement; 