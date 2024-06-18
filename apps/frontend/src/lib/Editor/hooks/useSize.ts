import useResizeObserver from '@react-hook/resize-observer';
import { RefObject, useLayoutEffect, useState } from 'react';

export const useSize = (
  target: RefObject<HTMLElement> | HTMLElement | null,
) => {
  const [size, setSize] = useState<DOMRect>();

  useLayoutEffect(() => {
    if (!target) return;
    if (target instanceof HTMLElement) {
      setSize(target.getBoundingClientRect());
      return;
    }
    if (!target.current) return;
    setSize(target.current.getBoundingClientRect());
  }, [target]);

  useResizeObserver(target, (entry) => setSize(entry.contentRect));
  return size;
};
