"use client";

import React, { useEffect } from 'react';
// FontAwesome icons loaded globally

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const icons = {
        success: <i className="fa-solid fa-check text-xl text-green-600"></i>,
        error: <i className="fa-solid fa-xmark text-xl text-red-600"></i>,
        warning: <i className="fa-solid fa-circle-exclamation text-xl text-yellow-600"></i>,
        info: <i className="fa-solid fa-circle-info text-xl text-blue-600"></i>
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
                <i className="fa-solid fa-xmark text-base text-gray-500"></i>
            </button>
        </div>
    );
}
