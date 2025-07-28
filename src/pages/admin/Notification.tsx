import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => Math.max(0, prev - (100 / 60))); // 60 steps over 6 seconds
    }, 100);

    const timeout = setTimeout(() => {
      onClose();
    }, 6000);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="fixed bottom-4 right-4 w-80 z-50">
      <div className={`${bgColor} text-white rounded-lg shadow-lg overflow-hidden`}>
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <p className="text-sm font-medium">{message}</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="h-1 bg-black bg-opacity-20">
          <div
            className={`h-full ${type === 'success' ? 'bg-green-300' : 'bg-red-300'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Notification;