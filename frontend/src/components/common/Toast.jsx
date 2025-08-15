import { useState, useEffect } from 'react';

export default function Toast({ message, type = 'success', onDone }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDone) {
          onDone();
        }
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [message, onDone]);

  if (!message) return null;

  const baseClasses = 'fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 px-6 py-4 rounded-xl shadow-large text-white transition-all duration-500 transform';
  
  const typeClasses = {
    success: 'bg-gradient-to-r from-green-500 to-emerald-500',
    error: 'bg-gradient-to-r from-red-500 to-rose-500',
  };

  const icons = {
    success: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${visible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
      {icons[type]}
      <span className="font-semibold">{message}</span>
    </div>
  );
}