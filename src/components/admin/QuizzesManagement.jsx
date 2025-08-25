import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import QuizQuestionsManagement from './QuizQuestionsManagement';
import apiService from '../../lib/api';
import { showSuccess, showError, showConfirm } from '../../lib/sweetAlert';

const QuizzesManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const defaultSubjects = [
    'الرياضيات', 'العلوم', 'اللغة العربية', 'اللغة الإنجليزية', 
    'الدراسات الاجتماعية', 'التربية الإسلامية', 'الحاسوب', 'الفنون'
  ];
  const defaultGrades = [
    'الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس', 'الصف السادس',
    'الصف السابع', 'الصف الثامن', 'الصف التاسع', 'الصف العاشر', 'الصف الحادي عشر', 'الصف الثاني عشر'
  ];
  const [isComprehensiveDialogOpen, setIsComprehensiveDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [manageTab, setManageTab] = useState('details');
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formData, setFormData] = useState({
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
    isPublic: true
  });

  useEffect(() => {
    fetchQuizzes();
    fetchFilters();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await apiService.apiCall('/quizzes');
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
      const [subjectsRes, gradesRes] = await Promise.all([
        apiService.apiCall('/quizzes/subjects'),
        apiService.apiCall('/quizzes/grades')
      ]);
      const mergeUnique = (base, extra) => Array.from(new Set([...(base || []), ...(extra || [])]));
      const subjectsFinal = mergeUnique(defaultSubjects, Array.isArray(subjectsRes) ? subjectsRes : []);
      const gradesFinal = mergeUnique(defaultGrades, Array.isArray(gradesRes) ? gradesRes : []);
      setSubjects(subjectsFinal);
      setGrades(gradesFinal);
    } catch (error) {
      // Fallback to defaults
      setSubjects(defaultSubjects);
      setGrades(defaultGrades);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuiz) {
        await apiService.apiCall(`/quizzes/${editingQuiz.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        showSuccess('تم تحديث الكويز بنجاح');
      } else {
        await apiService.apiCall('/quizzes', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        showSuccess('تم إنشاء الكويز بنجاح');
      }
      setIsManageDialogOpen(false);
      resetForm();
      fetchQuizzes();
    } catch (error) {
      showError(error.response?.data?.message || 'حدث خطأ أثناء حفظ الكويز');
    }
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title || '',
      titleArabic: quiz.titleArabic || '',
      description: quiz.description || '',
      descriptionArabic: quiz.descriptionArabic || '',
      subject: quiz.subject || '',
      grade: quiz.grade || '',
      chapter: quiz.chapter || '',
      timeLimit: typeof quiz.timeLimit === 'number' ? quiz.timeLimit : 30,
      passingScore: typeof quiz.passingScore === 'number' ? quiz.passingScore : 60,
      isActive: !!quiz.isActive,
      isPublic: !!quiz.isPublic
    });
    setManageTab('details');
    setIsManageDialogOpen(true);
  };

  const handleManageQuestions = (quiz) => {
    setEditingQuiz(quiz);
    setManageTab('questions');
    setIsManageDialogOpen(true);
  };

  const handleDelete = async (quizId) => {
    const confirmed = await showConfirm('هل أنت متأكد من حذف هذا الكويز؟');
    if (confirmed) {
      try {
        await apiService.apiCall(`/quizzes/${quizId}`, {
          method: 'DELETE'
        });
        showSuccess('تم حذف الكويز بنجاح');
        fetchQuizzes();
      } catch (error) {
        showError('حدث خطأ أثناء حذف الكويز');
      }
    }
  };

  const handleToggleStatus = async (quizId) => {
    try {
      await apiService.apiCall(`/quizzes/${quizId}/toggle`, {
        method: 'PATCH'
      });
      showSuccess('تم تغيير حالة الكويز بنجاح');
      fetchQuizzes();
    } catch (error) {
      showError('حدث خطأ أثناء تغيير حالة الكويز');
    }
  };

  const resetForm = () => {
    setFormData({
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
      isPublic: true
    });
    setEditingQuiz(null);
  };

  // subjects & grades are now dynamic from API with sensible fallbacks

  const quizzesContent = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة الكويزات</h2>
        <div className="flex gap-2">
          <Button onClick={() => { resetForm(); setIsComprehensiveDialogOpen(true); }}>
            إنشاء كويز
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <CardTitle className="text-lg">{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{quiz.subject}</Badge>
                    <Badge variant="outline">{quiz.grade}</Badge>
                  </div>

                  <div className="text-sm text-gray-500 space-y-1">
                    <div>عدد الأسئلة: {quiz.totalQuestions ?? quiz.questions?.length ?? 0}</div>
                    <div>المدة: {quiz.timeLimit ?? quiz.durationMinutes} دقيقة</div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleEdit(quiz)}>
                      إدارة
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(quiz.id)}
                    >
                      حذف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

             {!loading && quizzes.length === 0 && (
         <div className="text-center py-12">
           <p className="text-gray-500 text-lg">لا توجد كويزات</p>
         </div>
       )}
     </div>
   );

   return (
     <>
       {quizzesContent}

       {/* Comprehensive Quiz Creation Dialog */}
       <Dialog open={isComprehensiveDialogOpen} onOpenChange={setIsComprehensiveDialogOpen}>
         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle>إنشاء كويز شامل</DialogTitle>
             <DialogDescription>
               قم بإنشاء كويز كامل مع أسئلته وخياراته في خطوة واحدة
             </DialogDescription>
           </DialogHeader>
           
           <QuizQuestionsManagement 
             quizId={null} 
             quizTitle=""
             isComprehensiveMode={true}
             onClose={() => setIsComprehensiveDialogOpen(false)}
           />
         </DialogContent>
       </Dialog>

       {/* Unified Manage Dialog (details + questions) */}
       <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle>إدارة الكويز</DialogTitle>
             <DialogDescription>تبويب موحد لتعديل بيانات الكويز وإدارة الأسئلة</DialogDescription>
           </DialogHeader>
           <Tabs value={manageTab} onValueChange={setManageTab} className="space-y-4">
             <TabsList>
               <TabsTrigger value="details">البيانات</TabsTrigger>
               <TabsTrigger value="questions">الأسئلة</TabsTrigger>
             </TabsList>
             <TabsContent value="details">
               <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium mb-2">عنوان الكويز</label>
                     <Input
                       value={formData.title}
                       onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                       required
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-2">العنوان بالعربية</label>
                     <Input
                       value={formData.titleArabic}
                       onChange={(e) => setFormData({ ...formData, titleArabic: e.target.value })}
                     />
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium mb-2">الوصف</label>
                     <Textarea
                       value={formData.description}
                       onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                       rows={2}
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-2">الوصف بالعربية</label>
                     <Textarea
                       value={formData.descriptionArabic}
                       onChange={(e) => setFormData({ ...formData, descriptionArabic: e.target.value })}
                       rows={2}
                     />
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                     <label className="block text-sm font-medium mb-2">المادة</label>
                     <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
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
                     <label className="block text-sm font-medium mb-2">الصف</label>
                     <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
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
                       value={formData.chapter}
                       onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                     />
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                     <label className="block text-sm font-medium mb-2">الوقت المحدد (دقائق)</label>
                     <Input
                       type="number"
                       value={formData.timeLimit}
                       onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 1 })}
                       min="1"
                       required
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-2">نسبة النجاح (%)</label>
                     <Input
                       type="number"
                       value={formData.passingScore}
                       onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) || 0 })}
                       min="0"
                       max="100"
                       required
                     />
                   </div>
                   <div className="flex items-center gap-6 mt-6">
                     <label className="flex items-center gap-2">
                       <input
                         type="checkbox"
                         checked={formData.isActive}
                         onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                       />
                       <span className="text-sm">متاح للطلاب</span>
                     </label>
                     <label className="flex items-center gap-2">
                       <input
                         type="checkbox"
                         checked={formData.isPublic}
                         onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                       />
                       <span className="text-sm">عام</span>
                     </label>
                   </div>
                 </div>

                 <div className="flex justify-end gap-2">
                   <Button type="button" variant="outline" onClick={() => setIsManageDialogOpen(false)}>إغلاق</Button>
                   <Button type="submit">حفظ</Button>
                 </div>
               </form>
             </TabsContent>
             <TabsContent value="questions">
               {editingQuiz ? (
                 <QuizQuestionsManagement 
                   quizId={editingQuiz.id} 
                   quizTitle={editingQuiz.title}
                 />
               ) : (
                 <div className="text-center text-gray-500 py-8">اختر كويز لإدارة أسئلته</div>
               )}
             </TabsContent>
           </Tabs>
         </DialogContent>
       </Dialog>
     </>
   );
 };

export default QuizzesManagement; 