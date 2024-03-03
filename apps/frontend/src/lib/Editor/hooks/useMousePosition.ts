import { useEffect, useRef } from 'react';
import { editorStore } from '../Models';
/**
 *
 * @returns the current mouse position as a react ref (does not trigger rerender)
 */
export const useMousePosition = () => {
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { x, y } = e;
      mousePos.current = { x, y };
      editorStore.currentPage.setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  return mousePos;
};
