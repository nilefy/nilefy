import { commandManager } from '@/actions/CommandManager';
import { useEffect } from 'react';

export const useConfirmBeforeUnload = () => {
  const confirmBeforeUnload = (e: BeforeUnloadEvent) => {
    if (commandManager.socket?.isLoading) {
      e.preventDefault();
      // Included for legacy support, e.g. Chrome/Edge < 119
      e.returnValue = true;
    }
  };
  useEffect(() => {
    window.addEventListener('beforeunload', confirmBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', confirmBeforeUnload);
    };
  });
};
