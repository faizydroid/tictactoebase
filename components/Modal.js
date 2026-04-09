export default function Modal({ isOpen, onClose, title, message, type = 'info', actionButton = null }) {
  if (!isOpen) return null

  const styles = {
    success: {
      gradient: 'from-green-400 to-emerald-500',
      border: 'border-green-700',
      icon: (
        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    error: {
      gradient: 'from-red-400 to-pink-500',
      border: 'border-red-700',
      icon: (
        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    warning: {
      gradient: 'from-yellow-400 to-orange-500',
      border: 'border-yellow-700',
      icon: (
        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    info: {
      gradient: 'from-blue-400 to-cyan-500',
      border: 'border-blue-700',
      icon: (
        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  }

  const currentStyle = styles[type] || styles.info

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] animate-fadeIn"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="pointer-events-auto max-w-md w-full bg-white rounded-2xl border-4 border-black shadow-bold-xl animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Icon */}
          <div className={`bg-gradient-to-r ${currentStyle.gradient} p-6 rounded-t-xl border-b-4 ${currentStyle.border}`}>
            <div className="flex justify-center mb-3">
              {currentStyle.icon}
            </div>
            {title && (
              <h2 className="text-2xl font-black text-white text-center">{title}</h2>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-center text-gray-800 font-medium mb-6 leading-relaxed">
              {message}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {actionButton ? (
                <>
                  <button
                    onClick={onClose}
                    className="flex-1 btn-secondary py-2.5"
                  >
                    Close
                  </button>
                  {actionButton}
                </>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full btn-primary py-2.5"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
