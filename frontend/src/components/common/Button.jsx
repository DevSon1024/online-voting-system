export default function Button({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false }) {
  const baseClasses = 'w-full flex justify-center items-center gap-2 py-3 px-6 border border-transparent rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'text-white gradient-primary hover:shadow-lg hover:scale-105 focus:ring-indigo-500 shadow-soft',
    secondary: 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-medium focus:ring-gray-500 shadow-soft',
    danger: 'text-white gradient-secondary hover:shadow-lg hover:scale-105 focus:ring-red-500 shadow-soft',
    success: 'text-white gradient-success hover:shadow-lg hover:scale-105 focus:ring-green-500 shadow-soft',
    ghost: 'text-indigo-600 bg-transparent border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 focus:ring-indigo-500',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}