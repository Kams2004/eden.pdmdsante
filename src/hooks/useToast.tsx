import { useState } from 'react';
import Toast from '../components/UI/Toast';

export const useToast = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setToastType('success');
    setShowToast(true);
  };

  const showErrorToast = (message: string) => {
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
  };

  const showInfoToast = (message: string) => {
    setToastMessage(message);
    setToastType('info');
    setShowToast(true);
  };

  const ToastComponent = showToast ? (
    <Toast
      message={toastMessage}
      type={toastType}
      onClose={() => setShowToast(false)}
      duration={3000}
    />
  ) : null;

  return {
    showSuccessToast,
    showErrorToast,
    showInfoToast,
    ToastComponent
  };
};