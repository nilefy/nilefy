import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function LoadingButton({
  isLoading,
  children,
  buttonProps,
}: {
  isLoading: boolean;
  children: React.ReactNode;
  buttonProps: ButtonProps;
}) {
  return (
    <Button {...buttonProps} disabled={isLoading}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}
