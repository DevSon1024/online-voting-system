import { useState, useEffect } from 'react';

export default function Toast({ message, type = 'success', onDone, duration = 4000 }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setIsExiting(false);
      
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, duration - 300); // Start exit animation 300ms before removal
      
      const removeTimer = setTimeout(() => {
        setIsVisible(false);
        if (onDone) {
          onDone();
        }
      }, duration);
      
      return () => {
        clearTimeout(exitTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [message, onDone, duration]);

  if (!message || !isVisible) return null;

  const typeStyles = {
    success: {
      gradient: 'from-emerald-500 to-teal-500',
      icon: (
        <svg className="notification-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    error: {
      gradient: 'from-red-500 to-rose-500',
      icon: (
        <svg className="notification-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    warning: {
      gradient: 'from-amber-500 to-orange-500',
      icon: (
        <svg className="notification-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    },
    info: {
      gradient: 'from-blue-500 to-indigo-500',
      icon: (
        <svg className="notification-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const currentType = typeStyles[type] || typeStyles.info;
  const animationClass = isExiting ? 'notification-exit' : 'notification-enter';

  return (
    <div className="notification-container">
      <div className={`notification ${animationClass}`}>
        <div className="notification-content">
          <div className={`p-2 rounded-full bg-gradient-to-r ${currentType.gradient} text-white`}>
            {currentType.icon}
          </div>
          <span className="font-medium text-gray-800">{message}</span>
        </div>
      </div>
    </div>
  );
}