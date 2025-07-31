export default function Alert({ message, type = 'error' }) {
    if (!message) return null;
    const baseClasses = 'border px-4 py-3 rounded-md relative mb-4';
    const typeClasses = {
        error: 'bg-red-100 border-red-400 text-red-700',
        success: 'bg-green-100 border-green-400 text-green-700',
    };
    return (
        <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
            <span className="block sm:inline">{message}</span>
        </div>
    );
}