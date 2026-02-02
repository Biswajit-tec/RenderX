import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

/**
 * Toast notification component
 */
function Toast({ id, type, title, message, onDismiss }) {
    const styles = {
        success: {
            bg: 'bg-[#10B981]/10',
            border: 'border-[#10B981]/20',
            icon: CheckCircle,
            iconColor: 'text-[#10B981]',
        },
        error: {
            bg: 'bg-[#EF4444]/10',
            border: 'border-[#EF4444]/20',
            icon: AlertCircle,
            iconColor: 'text-[#EF4444]',
        },
        info: {
            bg: 'bg-[#6366F1]/10',
            border: 'border-[#6366F1]/20',
            icon: Info,
            iconColor: 'text-[#6366F1]',
        },
    };

    const style = styles[type] || styles.info;
    const Icon = style.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`flex items-start gap-3 p-4 rounded-xl ${style.bg} border ${style.border} backdrop-blur-xl shadow-xl max-w-sm`}
        >
            <Icon className={`w-5 h-5 ${style.iconColor} flex-shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
                <p className="font-medium text-[#E5E7EB]">{title}</p>
                {message && <p className="text-sm text-[#9CA3AF] mt-0.5">{message}</p>}
            </div>
            <button
                onClick={() => onDismiss(id)}
                className="text-[#6B7280] hover:text-[#E5E7EB] transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}

/**
 * Toast Provider
 */
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((toast) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { ...toast, id }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
        return id;
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                <AnimatePresence mode="sync">
                    {toasts.map((t) => (
                        <Toast key={t.id} {...t} onDismiss={dismissToast} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

/**
 * Hook to use toasts
 */
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
