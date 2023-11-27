import { forwardRef, ReactNode } from 'react';

const Container = forwardRef<
  HTMLDivElement,
  { children?: ReactNode; color: string }
>(({ children, color }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: color,
      }}
    >
      {children}
    </div>
  );
});
Container.displayName = 'Container';
export { Container };
