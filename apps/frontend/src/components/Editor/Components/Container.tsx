import { forwardRef, ReactNode } from 'react';

const Container = forwardRef<
  HTMLDivElement,
  { children: ReactNode; className: string }
>(({ children, className }, ref) => {
  return (
    <div
      ref={ref}
      className={className}
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      {children}
    </div>
  );
});
Container.displayName = 'Container';
export { Container };
