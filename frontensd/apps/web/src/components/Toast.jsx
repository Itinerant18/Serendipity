import React, { useEffect } from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const icons = {
        success: <Check className="w-5 h-5 text-green-600" />,
        error: <X className="w-5 h-5 text-red-600" />,
        warning: <AlertCircle className="w-5 h-5 text-yellow-600" />,
        info: <Info className="w-5 h-5 text-blue-600" />
    };

    const styles = {
        success: 'toast toast-success',
        error: 'toast toast-error',
        warning: 'toast toast-warning',
        info: 'toast toast-info'
    };

    return (
        <div className={styles[type]}>
            <div className="flex-shrink-0">
                {icons[type]}
            </div>
            <div className="flex-1">
                <p className="font-inter text-sm font-medium text-gray-900">{message}</p>
            </div>
            <button
                onClick={onClose}
                className="flex-shrink-0 hover:bg-gray-100 rounded p-1 transition-colors"
            >
                <X className="w-4 h-4 text-gray-500" />
            </button>
        </div>
    );
}
