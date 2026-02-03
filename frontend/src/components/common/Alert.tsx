import React from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface AlertProps {
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
}

export function Alert({ type, title, message, onClose }: AlertProps) {
  const config = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      textColor: 'text-green-800',
      Icon: CheckCircle,
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-800',
      Icon: XCircle,
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800',
      Icon: Info,
    },
  };

  const { bgColor, borderColor, iconColor, textColor, Icon } = config[type];

  return (
    <div className={cn('border rounded-lg p-4', bgColor, borderColor)}>
      <div className="flex">
        <Icon className={cn('w-5 h-5', iconColor)} />
        <div className="ml-3 flex-1">
          {title && <h3 className={cn('text-sm font-medium', textColor)}>{title}</h3>}
          <p className={cn('text-sm', title ? 'mt-2' : '', textColor)}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={cn('ml-3 text-sm font-medium hover:underline', textColor)}
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

