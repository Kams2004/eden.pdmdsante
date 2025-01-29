import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-white" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-white" />;
      case 'info':
        return <Info className="w-5 h-5 text-white" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 flex items-center ${getBgColor()} text-white px-4 py-3 rounded-lg shadow-lg z-50`}>
      <div className="mr-3">{getIcon()}</div>
      <p className="mr-4">{message}</p>
      <div className="w-1 h-1 bg-white rounded-full relative">
        <div
          className="absolute bottom-0 left-0 w-full bg-white opacity-25"
          style={{
            height: '4px',
            animation: `progress ${duration}ms linear`
          }}
        />
      </div>
    </div>
  );
};

export default Toast;