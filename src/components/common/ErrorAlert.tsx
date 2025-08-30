import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  className?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, className = "" }) => {
  return (
    <div className={`flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 ${className}`}>
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  );
};

export default ErrorAlert;
