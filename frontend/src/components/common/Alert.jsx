export default function Alert({ message, type = 'error' }) {
    if (!message) return null;
    
    const baseClasses = 'flex items-start gap-3 px-4 py-3 rounded-xl relative mb-4 shadow-soft border-l-4';
    const typeClasses = {
        error: 'bg-red-50/80 backdrop-blur-sm border-red-400 text-red-800',
        success: 'bg-green-50/80 backdrop-blur-sm border-green-400 text-green-800',
        warning: 'bg-yellow-50/80 backdrop-blur-sm border-yellow-400 text-yellow-800',
        info: 'bg-blue-50/80 backdrop-blur-sm border-blue-400 text-blue-800',
    };
    
    const icons = {
        error: (
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        success: (
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        warning: (
            <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        info: (
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    };
    
    return (
        <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
            {icons[type]}
            <div className="flex-1">
                <span className="font-medium text-sm leading-relaxed">{message}</span>
            </div>
        </div>
    );
}