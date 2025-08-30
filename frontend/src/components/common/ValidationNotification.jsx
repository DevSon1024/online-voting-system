// frontend/src/components/common/ValidationNotification.jsx
import Button from './Button';

export default function ValidationNotification({ count, message, buttonText, onClick, variant = 'info' }) {
  if (count === 0) {
    return null;
  }

  const variantClasses = {
    info: 'bg-blue-100 border-blue-400 text-blue-800',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  };

  const buttonVariants = {
    info: 'primary',
    warning: 'warning',
  }

  return (
    <div className={`p-4 mb-4 border-l-4 rounded-lg shadow-md flex items-center justify-between ${variantClasses[variant]}`}>
      <div className="flex items-center">
        <div className="font-bold bg-white/50 rounded-full h-8 w-8 flex items-center justify-center mr-3">{count}</div>
        <p className="font-semibold">{message}</p>
      </div>
      <Button onClick={onClick} variant={buttonVariants[variant]} size="sm">
        {buttonText}
      </Button>
    </div>
  );
}