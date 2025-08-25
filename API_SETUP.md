# إعداد API للرزنامة الطلابية

## نظرة عامة

تم تحديث نظام الرزنامة الطلابية لاستخدام API بدلاً من localStorage. هذا يوفر:
- تخزين مركزي للبيانات
- إمكانية الوصول من أجهزة متعددة
- أمان أفضل للبيانات
- إمكانية النسخ الاحتياطي

## نقاط النهاية المطلوبة (API Endpoints)

### 1. الحصول على جميع الجداول
```
GET /api/Schedules
```

**الاستجابة المتوقعة:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "جدول امتحانات الشهر الأول",
      "description": "جدول مواعيد امتحانات الشهر الأول لجميع المواد",
      "type": "امتحانات",
      "date": "2024-03-15",
      "status": "نشط",
      "downloadable": true,
      "fileUrl": "/schedules/exam-schedule-1.pdf"
    }
  ]
}
```

### 2. الحصول على جدول واحد
```
GET /api/Schedules/{id}
```

### 3. إنشاء جدول جديد
```
POST /api/Schedules
```

**البيانات المطلوبة:**
```json
{
  "title": "عنوان الجدول",
  "description": "وصف الجدول",
  "type": "امتحانات",
  "date": "2024-03-15",
  "status": "نشط",
  "downloadable": true,
  "fileUrl": "/schedules/file.pdf"
}
```

### 4. تحديث جدول
```
PUT /api/Schedules/{id}
```

### 5. حذف جدول
```
DELETE /api/Schedules/{id}
```

### 6. رفع ملف (اختياري)
```
POST /api/Schedules/upload
```

**Content-Type:** `multipart/form-data`

## أنواع الجداول (Schedule Types)
- `امتحانات` - جداول الامتحانات
- `رزنامة` - الرزنامة الدراسية
- `مشاريع` - مواعيد تسليم المشاريع
- `مراجعة` - برامج المراجعة

## حالات الجداول (Schedule Status)
- `نشط` - الجدول متاح للطلاب
- `قريباً` - الجدول سيصبح متاحاً قريباً

## إعداد الخادم

### 1. إنشاء جدول قاعدة البيانات
```sql
CREATE TABLE Schedules (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    Type NVARCHAR(50) NOT NULL,
    Date DATE NOT NULL,
    Status NVARCHAR(50) NOT NULL,
    Downloadable BIT DEFAULT 1,
    FileUrl NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
```

### 2. إنشاء Model في C#
```csharp
public class Schedule
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Type { get; set; }
    public DateTime Date { get; set; }
    public string Status { get; set; }
    public bool Downloadable { get; set; }
    public string FileUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

### 3. إنشاء Controller
```csharp
[ApiController]
[Route("api/[controller]")]
public class SchedulesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SchedulesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetSchedules()
    {
        var schedules = await _context.Schedules
            .OrderByDescending(s => s.Date)
            .ToListAsync();

        return Ok(new { success = true, data = schedules });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSchedule(int id)
    {
        var schedule = await _context.Schedules.FindAsync(id);
        if (schedule == null)
            return NotFound(new { success = false, message = "الجدول غير موجود" });

        return Ok(new { success = true, data = schedule });
    }

    [HttpPost]
    public async Task<IActionResult> CreateSchedule([FromBody] Schedule schedule)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "بيانات غير صحيحة" });

        schedule.CreatedAt = DateTime.UtcNow;
        schedule.UpdatedAt = DateTime.UtcNow;

        _context.Schedules.Add(schedule);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSchedule), new { id = schedule.Id }, 
            new { success = true, data = schedule });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSchedule(int id, [FromBody] Schedule schedule)
    {
        var existingSchedule = await _context.Schedules.FindAsync(id);
        if (existingSchedule == null)
            return NotFound(new { success = false, message = "الجدول غير موجود" });

        existingSchedule.Title = schedule.Title;
        existingSchedule.Description = schedule.Description;
        existingSchedule.Type = schedule.Type;
        existingSchedule.Date = schedule.Date;
        existingSchedule.Status = schedule.Status;
        existingSchedule.Downloadable = schedule.Downloadable;
        existingSchedule.FileUrl = schedule.FileUrl;
        existingSchedule.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = existingSchedule });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSchedule(int id)
    {
        var schedule = await _context.Schedules.FindAsync(id);
        if (schedule == null)
            return NotFound(new { success = false, message = "الجدول غير موجود" });

        _context.Schedules.Remove(schedule);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "تم حذف الجدول بنجاح" });
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { success = false, message = "لم يتم اختيار ملف" });

        // التحقق من نوع الملف
        var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        
        if (!allowedExtensions.Contains(fileExtension))
            return BadRequest(new { success = false, message = "نوع الملف غير مسموح به" });

        // حفظ الملف
        var fileName = Guid.NewGuid().ToString() + fileExtension;
        var filePath = Path.Combine("wwwroot", "schedules", fileName);
        
        Directory.CreateDirectory(Path.GetDirectoryName(filePath));
        
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var fileUrl = $"/schedules/{fileName}";

        return Ok(new { success = true, data = new { fileUrl, fileName } });
    }
}
```

## إعداد Frontend

### 1. تحديث عنوان API
في ملف `src/lib/api.js`، تأكد من أن `baseURL` يشير إلى الخادم الصحيح:

```javascript
const baseURL = 'http://localhost:5035/api'; // أو عنوان الخادم الخاص بك
```

### 2. اختبار الاتصال
يمكنك اختبار الاتصال بالخادم من خلال:
- فتح Developer Tools في المتصفح
- الذهاب إلى Network tab
- محاولة تحميل صفحة الرزنامة
- مراجعة الطلبات والاستجابات

## ملاحظات مهمة

1. **CORS**: تأكد من إعداد CORS في الخادم للسماح بالطلبات من Frontend
2. **التحقق من الصحة**: تأكد من التحقق من صحة البيانات في الخادم
3. **الأمان**: قم بإضافة مصادقة وتفويض للوصول إلى API
4. **النسخ الاحتياطي**: قم بإعداد نسخ احتياطي لقاعدة البيانات
5. **التوثيق**: قم بتوثيق API باستخدام Swagger أو أدوات مماثلة

## استكشاف الأخطاء

### مشاكل شائعة:
1. **خطأ CORS**: تأكد من إعداد CORS في الخادم
2. **خطأ 404**: تأكد من صحة عنوان API
3. **خطأ 500**: راجع سجلات الخادم للتفاصيل
4. **بيانات فارغة**: تأكد من إرسال البيانات بالشكل الصحيح

### للاختبار:
1. استخدم Postman أو أدوات مماثلة لاختبار API
2. راجع سجلات الخادم للتأكد من استلام الطلبات
3. تحقق من قاعدة البيانات للتأكد من حفظ البيانات
