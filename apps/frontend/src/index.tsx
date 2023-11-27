import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from '@/pages/Editor/Editor';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { SignUp } from '@/pages/auth/up';
import { SignIn } from '@/pages/auth/in';
import ErrorPage from './pages/error';
import { Dashboard, loader as workspacesLoader } from './pages/mainLayout';
import { ThemeProvider } from './components/theme-provider';
import { UsersManagement } from './pages/workspace/users';
import { GroupManagement, GroupsManagement } from './pages/workspace/group';
import { WorkspaceSettingsLayout } from './pages/workspace/workspace';
import { ProfileSettings } from './pages/profile/settings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ApplicationsLayout } from './pages/apps/apps';
import DatabaseTable from './pages/built-in-db/db';
import SelectDb from './pages/built-in-db/selectDb';
import { Toaster } from '@/components/ui/toaster';
import { ProtectedRoute } from './components/ProtectedRoute';
import { NonAuthRoute } from './components/non-auth-routes';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      networkMode: process.env.NODE_ENV === 'development' ? 'always' : 'online',
    },
    mutations: {
      networkMode: process.env.NODE_ENV === 'development' ? 'always' : 'online',
    },
  },
});

// router config
const router = createBrowserRouter([
  {
    path: '',
    element: <Outlet />,
    errorElement: <ErrorPage />,
    id: 'root',
    loader: workspacesLoader(queryClient),
    children: [
      {
        path: '/:workspaceId',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
        children: [
          {
            path: '',
            element: <ApplicationsLayout />,
            children: [
              {
                path: 'editor',
                element: <App />,
              },
            ],
          },
          {
            path: 'database',
            element: <DatabaseTable />,
            errorElement: <ErrorPage />,
            children: [
              {
                path: ':tableId',
                element: <SelectDb />,
              },
            ],
          },
          { path: 'profile-settings', element: <ProfileSettings /> },
          {
            path: 'workspace-settings',
            element: <WorkspaceSettingsLayout />,
            children: [
              { path: '', element: <UsersManagement /> },
              {
                path: 'groups',
                element: <GroupsManagement />,
                children: [
                  {
                    path: ':groupId',
                    element: <GroupManagement />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/signup',
    element: (
      <NonAuthRoute>
        <SignUp />
      </NonAuthRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/signin',
    element: (
      <NonAuthRoute>
        <SignIn />
      </NonAuthRoute>
    ),
    errorElement: <ErrorPage />,
  },
  // TODO: remove this route after frontend auth is done (currently used for testing)
  {
    path: '/editor',
    element: <App />,
    errorElement: <ErrorPage />,
  },
]);

const container = document.getElementById('root') as HTMLDivElement;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Toaster />
        <RouterProvider router={router} />
      </ThemeProvider>
      <ReactQueryDevtools buttonPosition="bottom-right" />
    </QueryClientProvider>
  </React.StrictMode>,
);
