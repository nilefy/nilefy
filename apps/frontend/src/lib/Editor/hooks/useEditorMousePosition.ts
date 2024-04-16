import { useEffect, useRef } from 'react';
import { getMousePositionRelativeToEditor } from '../utils';

export const useEditorMousePosition = () => {
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { x, y } = e;
      mousePos.current = getMousePositionRelativeToEditor({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  return mousePos;
};
