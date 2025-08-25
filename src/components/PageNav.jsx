import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'

export default function PageNav({ showBack = true, className = '' }) {
  const navigate = useNavigate()
  
  const go = (path) => {
    if (!path) return
    navigate(path)
  }

  return (
    <div className={`mb-6 flex flex-wrap gap-2 ${className}`}>
      <Button 
        variant="outline" 
        onClick={() => go('/')}
        className="bg-white/30 border-royal-black/30 text-royal-black hover:bg-white/50"
      > 
        الرئيسية
      </Button>
      <Button 
        variant="outline" 
        onClick={() => go('/quizzes')}
        className="bg-white/30 border-royal-black/30 text-royal-black hover:bg-white/50"
      >
        الكويزات
      </Button>
      <Button 
        variant="outline" 
        onClick={() => go('/my-attempts')}
        className="bg-white/30 border-royal-black/30 text-royal-black hover:bg-white/50"
      >
        محاولاتي
      </Button>
      <Button 
        variant="outline" 
        onClick={() => go('/contact')}
        className="bg-white/30 border-royal-black/30 text-royal-black hover:bg-white/50"
      >
        اتصل بنا
      </Button>
      {showBack && (
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          className="bg-white/30 border-royal-black/30 text-royal-black hover:bg-white/50"
        >
          رجوع
        </Button>
      )}
    </div>
  )
}


