import Swal from 'sweetalert2'

// Success alert
export const showSuccess = (message, title = 'نجح!') => {
  return Swal.fire({
    title: title,
    text: message,
    icon: 'success',
    confirmButtonText: 'حسناً',
    confirmButtonColor: '#10b981',
    timer: 3000,
    timerProgressBar: true,
    toast: true,
    position: 'top-end',
    showConfirmButton: false
  })
}

// Error alert
export const showError = (message, title = 'خطأ!') => {
  return Swal.fire({
    title: title,
    text: message,
    icon: 'error',
    confirmButtonText: 'حسناً',
    confirmButtonColor: '#ef4444'
  })
}

// Warning alert
export const showWarning = (message, title = 'تحذير!') => {
  return Swal.fire({
    title: title,
    text: message,
    icon: 'warning',
    confirmButtonText: 'حسناً',
    confirmButtonColor: '#f59e0b'
  })
}

// Info alert
export const showInfo = (message, title = 'معلومات') => {
  return Swal.fire({
    title: title,
    text: message,
    icon: 'info',
    confirmButtonText: 'حسناً',
    confirmButtonColor: '#3b82f6'
  })
}

// Confirmation dialog
export const showConfirm = (message, title = 'تأكيد') => {
  return Swal.fire({
    title: title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'نعم',
    cancelButtonText: 'لا',
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280'
  })
}

// Delete confirmation
export const showDeleteConfirm = (itemName = 'العنصر') => {
  return Swal.fire({
    title: 'هل أنت متأكد؟',
    text: `سيتم حذف ${itemName} نهائياً`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'نعم، احذف',
    cancelButtonText: 'إلغاء',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280'
  })
} 