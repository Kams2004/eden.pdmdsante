import { useState } from 'react';
import ConfirmModal from '../components/UI/ConfirmModal';

export const useConfirmDelete = () => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const confirmDelete = (title: string, message: string, onConfirm: () => void) => {
    setPendingDelete({ title, message, onConfirm });
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (pendingDelete) {
      pendingDelete.onConfirm();
      setShowConfirmModal(false);
      setPendingDelete(null);
    }
  };

  const ConfirmModalComponent = showConfirmModal && pendingDelete ? (
    <ConfirmModal
      isOpen={showConfirmModal}
      onClose={() => setShowConfirmModal(false)}
      onConfirm={handleConfirm}
      title={pendingDelete.title}
      message={pendingDelete.message}
    />
  ) : null;

  return {
    confirmDelete,
    ConfirmModalComponent
  };
};