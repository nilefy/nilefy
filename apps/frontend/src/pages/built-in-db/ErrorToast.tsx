// ErrorToast.js
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const ErrorToast = ({ message }: { message?: string }) => {
  const { toast } = useToast();
  useEffect(() => {
    if (message) {
      // Display your toast here
      toast({
        variant: 'destructive',
        title: 'Something went wrong.',
        description: `${message} `,
      });
    }
  }, [message, toast]);

  return null;
};

export default ErrorToast;
