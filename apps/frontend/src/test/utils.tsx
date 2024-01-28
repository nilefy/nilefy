import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RenderOptions, render } from '@testing-library/react';
import { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
const queryClient = new QueryClient();

const AllTheProviders = ({ children }: { children: ReactElement }) => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

const defaultRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'queries'>,
) => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};

export { defaultRender };
