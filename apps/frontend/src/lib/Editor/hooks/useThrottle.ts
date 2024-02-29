import { ThrottleSettings, throttle } from 'lodash';
import { useCallback, useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useThrottle = <T extends (...args: any) => any>(
  fn: T,
  delay: number,
  options: ThrottleSettings = {
    trailing: true,
  },
) => {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    throttle(
      (...args: Parameters<T>) => fnRef.current(...args),
      delay,
      options,
    ),
    [delay],
  );
};
