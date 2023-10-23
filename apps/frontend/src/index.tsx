import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from '@/components/Editor/Editor';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { SignUp } from '@/pages/auth/up';
import { SignIn } from '@/pages/auth/in';
import ErrorPage from './pages/error';
import { Dashboard } from './pages/mainLayout';
import { ThemeProvider } from './components/theme-provider';
import { UsersManagement } from './pages/workspace/users';
import { GroupManagement, GroupsManagement } from './pages/workspace/group';
import {
  WorkspaceSettingsLayout,
  loader as workspacesLoader,
} from './pages/workspace/workspace';
import { ProfileSettings } from './pages/profile/settings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

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
    path: '/:workspaceId',
    element: <Dashboard />,
    errorElement: <ErrorPage />,
    id: 'root',
    loader: workspacesLoader(queryClient),
    children: [
      { path: '', element: <App /> },
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
]);

const container = document.getElementById('root') as HTMLDivElement;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
      <ReactQueryDevtools buttonPosition="bottom-right" />
    </QueryClientProvider>
  </React.StrictMode>,
);
