import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ComponentProps } from 'react';

type LoadingButtonPropsI = {
  isLoading: boolean;
  children: React.ReactNode;
} & ComponentProps<typeof Button>;

export function LoadingButton({
  isLoading,
  children,
  ...rest
}: LoadingButtonPropsI) {
  return (
    <Button {...rest} disabled={isLoading}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}
