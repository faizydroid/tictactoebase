import { useEffect } from 'react'

export default function Toast({ message, type = 'error', isVisible, onClose, duration = 5000 }) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const styles = {
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-700',
    error: 'bg-gradient-to-r from-red-500 to-pink-600 border-red-700',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 border-yellow-700',
    info: 'bg-gradient-to-r from-blue-500 to-cyan-600 border-blue-700'
  }

  const icons = {
    success: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slideInRight">
      <div className={`${styles[type]} text-white rounded-xl border-2 shadow-bold-xl max-w-md`}>
        <div className="flex items-start gap-3 p-4">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {icons[type]}
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-relaxed break-words">
              {message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        {duration > 0 && (
          <div className="h-1 bg-white/20 overflow-hidden">
            <div 
              className="h-full bg-white/60 animate-shrink"
              style={{ animationDuration: `${duration}ms` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  )
}
