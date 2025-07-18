import React from 'react';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  onClose?: () => void;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, title, description, variant = 'default', onClose, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-white border-gray-200',
      destructive: 'bg-red-50 border-red-200',
      success: 'bg-green-50 border-green-200',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex w-full max-w-sm items-start space-x-3 rounded-lg border p-4 shadow-lg',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <div className="flex-1 space-y-1">
          {title && (
            <p className="text-sm font-medium text-gray-900">{title}</p>
          )}
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Toast.displayName = 'Toast'; 