export default function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md',
  className = '', 
  disabled = false,
  fullWidth = false 
}) {
  const baseClasses = 'inline-flex justify-center items-center gap-2 border border-transparent font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out';
  
  const sizeClasses = {
    xs: 'px-3 py-1.5 text-xs rounded-lg',
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-2.5 text-sm rounded-xl',
    lg: 'px-8 py-3 text-base rounded-xl',
    xl: 'px-10 py-4 text-lg rounded-2xl'
  };
  
  const variants = {
    primary: 'text-white gradient-primary hover:shadow-lg hover:scale-[1.02] focus:ring-indigo-500 shadow-soft hover-lift',
    secondary: 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-medium focus:ring-gray-500 shadow-soft hover-lift',
    danger: 'text-white gradient-secondary hover:shadow-lg hover:scale-[1.02] focus:ring-red-500 shadow-soft hover-lift',
    success: 'text-white gradient-success hover:shadow-lg hover:scale-[1.02] focus:ring-green-500 shadow-soft hover-lift',
    warning: 'text-gray-800 gradient-warning hover:shadow-lg hover:scale-[1.02] focus:ring-yellow-500 shadow-soft hover-lift',
    ghost: 'text-indigo-600 bg-transparent border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 focus:ring-indigo-500 hover-lift',
    outline: 'text-indigo-600 bg-transparent border-2 border-indigo-500 hover:bg-indigo-50 hover:border-indigo-600 focus:ring-indigo-500 hover-lift',
    glass: 'text-gray-700 glass-effect hover:glass-effect-strong focus:ring-indigo-500 hover-lift'
  };

  const widthClass = fullWidth ? 'w-full' : 'w-auto';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variants[variant]} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
}