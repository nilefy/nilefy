import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import { App } from '@/pages/Editor/Editor';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { SignUp } from '@/pages/auth/up';
import { SignIn } from '@/pages/auth/in';
import ErrorPage from './pages/error';
import { Dashboard, loader as workspacesLoader } from './pages/mainLayout';
import { ThemeProvider } from './components/theme-provider';
import { UsersManagement } from './pages/workspace/users';
import { GroupManagement, GroupsManagement } from '@/pages/workspace/group';
import { WorkspaceSettingsLayout } from '@/pages/workspace/workspace';
import { ProfileSettings } from '@/pages/profile/settings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// import DatabaseTable from './pages/built-in-db/db';
// import SelectDb from './pages/built-in-db/selectDb';
import { Toaster } from '@/components/ui/toaster';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { NonAuthRoute } from '@/components/non-auth-routes';
import {
  GlobalDataSourcesView,
  DataSourceView,
} from '@/pages/dataSources/dataSources';
import { AppPreview, PagePreview } from '@/pages/Editor/preview';
import { appLoader } from '@/pages/Editor/appLoader';
import { ApplicationsLayout, appsLoader } from '@/pages/apps/apps';
import { startWorker } from '../mocks/browser';
import { EmailConfirmation } from './pages/auth/email_confirmation';

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
    element: (
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    id: 'root',
    loader: workspacesLoader(queryClient),
    children: [
      {
        path: '/:workspaceId',
        element: <Dashboard />,
        errorElement: <ErrorPage />,
        children: [
          {
            path: '',
            element: <ApplicationsLayout />,
            loader: appsLoader(queryClient),
          },
          // {
          //   path: 'database',
          //   element: <DatabaseTable />,
          //   errorElement: <ErrorPage />,
          //   children: [
          //     {
          //       path: ':tableId',
          //       element: <SelectDb />,
          //     },
          //   ],
          // },
          {
            path: 'datasources/:datasourceId',
            element: <DataSourceView />,
          },
          {
            path: 'datasources',
            element: <GlobalDataSourcesView />,
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
  {
    path: '/:workspaceId/apps/edit/:appId',
    element: <App />,
    errorElement: <ErrorPage />,
    loader: appLoader(queryClient),
    children: [{ path: ':pageId' }],
  },
  {
    path: '/:workspaceId/apps/:appId',
    element: <AppPreview />,
    errorElement: <ErrorPage />,
    loader: appLoader(queryClient),
    children: [{ path: ':pageId', element: <PagePreview /> }],
  },
  {
    path: '/confirm/:email/:token',
    element: (
      // <NonAuthRoute>
      <EmailConfirmation />
      // </NonAuthRoute>
    ),
    errorElement: <ErrorPage />,
  },
]);

const container = document.getElementById('root') as HTMLDivElement;
const root = createRoot(container);

async function enableMocking() {
  if (process.env.NODE_ENV == 'development') {
    return startWorker();
  }
}

// enableMocking().then(() => {
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
// });
