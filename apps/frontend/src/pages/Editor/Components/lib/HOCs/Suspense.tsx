import { NilefyLoader } from '@/components/loader';
import { Suspense } from 'react';

export const WithSuspense = <P extends { id: string }>(
  WrappedComponent: React.FC<P>,
) => {
  const SuspenseContainer: React.FC<P> = (props) => {
    return (
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center border">
            <NilefyLoader />
          </div>
        }
      >
        <WrappedComponent {...props} />
      </Suspense>
    );
  };
  return SuspenseContainer;
};
