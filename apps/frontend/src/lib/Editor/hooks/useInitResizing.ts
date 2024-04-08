import { commandManager } from '@/Actions/CommandManager';
import ResizeAction from '@/Actions/Editor/Resize';
import { useEffect } from 'react';

export const useInitResizing = () => {
  useEffect(() => {
    const resizeHandler = (e: MouseEvent) => {
      if (ResizeAction.resizingKey === null) return;
      e.stopPropagation();
      commandManager.executeCommand(
        ResizeAction.move({
          x: e.clientX,
          y: e.clientY,
        }),
      );
    };
    const resizeEndHandler = (e: MouseEvent) => {
      e.stopPropagation();
      commandManager.executeCommand(
        ResizeAction.end({
          x: e.clientX,
          y: e.clientY,
        }),
      );
    };

    window.addEventListener('pointermove', resizeHandler);
    window.addEventListener('pointerup', resizeEndHandler);
    return () => {
      window.removeEventListener('pointermove', resizeHandler);
      window.removeEventListener('pointerup', resizeEndHandler);
    };
  }, []);
};
