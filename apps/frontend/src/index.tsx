import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from '@/components/App';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { SignUp } from '@/pages/auth/up';
import { SignIn } from '@/pages/auth/in';
import ErrorPage from './pages/error';
import { Dashboard } from './pages/dashboard/dashboard';
import { ThemeProvider } from './components/theme-provider';

// router config
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/signup',
    element: <SignUp />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/signin',
    element: <SignIn />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
    errorElement: <ErrorPage />,
  },
]);

const container = document.getElementById('root') as HTMLDivElement;
const root = createRoot(container);

root.render(
  <ThemeProvider>
    <RouterProvider router={router} />
  </ThemeProvider>,
);
