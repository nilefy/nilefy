import { useEffect, useRef } from 'react';
/**
 *
 * @returns the current mouse position as a react ref (does not trigger rerender)
 */
export const useMousePosition = () => {
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: PointerEvent) => {
      const { x, y } = e;
      mousePos.current = { x, y };
    };

    window.addEventListener('pointermove', handleMouseMove);
    return () => {
      window.removeEventListener('pointermove', handleMouseMove);
    };
  }, []);
  return mousePos.current || { x: 0, y: 0 };
};
