import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import { App, Editor } from '@/pages/Editor/Editor';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { SignUp } from '@/pages/auth/up';
import { SignIn } from '@/pages/auth/in';
import ErrorPage from './pages/error';
import { Dashboard } from './pages/mainLayout';
import { loader as workspacesLoader } from './pages/workspaceLoader';
import { ThemeProvider } from './components/theme-provider';
import { UsersManagement } from './pages/workspace/users';
import { RoleManagement, RolesManagement } from '@/pages/workspace/role';
import { WorkspaceSettingsLayout } from '@/pages/workspace/workspace';
import { ProfileSettings } from '@/pages/profile/settings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import log from 'loglevel';

// import DatabaseTable from './pages/built-in-db/db';
// import SelectDb from './pages/built-in-db/selectDb';
import { Toaster } from '@/components/ui/toaster';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { NonAuthRoute } from '@/components/non-auth-routes';
import {
  GlobalDataSourcesView,
  DataSourceView,
  DataSourcesTemplate,
} from '@/pages/dataSources/dataSources';
import { AppPreview, PagePreview } from '@/pages/Editor/preview';
import { appLoader, pageLoader } from '@/pages/Editor/appLoader';
import { ApplicationsLayout, appsLoader } from '@/pages/apps/apps';
import { ForgotPassword } from './pages/auth/forgot_password';
import { NeedHelpSigningIn } from './pages/auth/need_help_in';
import {
  ResetPassword,
  resetPasswordLoader,
} from './pages/auth/reset_password';
import { globalDataSourcesLoader } from './pages/dataSources/loader';
import { InviteView } from './pages/invite';
import { InvitationLoader } from './pages/invite/loader';

if (process.env.NODE_ENV !== 'production') {
  log.enableAll();
} else {
  log.disableAll(false);
}

export const queryClient = new QueryClient({
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
export const router = createBrowserRouter([
  {
    path: 'invitation',
    element: <InviteView />,
    loader: InvitationLoader,
    errorElement: <ErrorPage />,
  },
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

          {},
          {
            path: 'datasources',
            element: <DataSourcesTemplate />,
            children: [
              {
                index: true,
                element: <GlobalDataSourcesView />,
                loader: globalDataSourcesLoader(queryClient),
              },
              {
                path: ':datasourceId',
                element: <DataSourceView />,
              },
            ],
          },
          {
            path: 'workspace-settings',
            element: <WorkspaceSettingsLayout />,
            children: [
              { path: '', element: <UsersManagement /> },
              {
                path: 'roles',
                element: <RolesManagement />,
                children: [
                  {
                    path: ':roleId',
                    element: <RoleManagement />,
                  },
                ],
              },
            ],
          },
          { path: 'profile-settings', element: <ProfileSettings /> },
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
    path: '/forgot-password',
    element: (
      <NonAuthRoute>
        <ForgotPassword />
      </NonAuthRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: 'auth/reset-password/:email/:token',
    loader: resetPasswordLoader,
    element: (
      <NonAuthRoute>
        <ResetPassword />
      </NonAuthRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/need_help_in',
    element: (
      <NonAuthRoute>
        <NeedHelpSigningIn />
      </NonAuthRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/:workspaceId/apps/edit/:appId',
    element: <App />,

    errorElement: <ErrorPage />,
    loader: appLoader(queryClient),
    children: [
      { path: ':pageId', element: <Editor />, loader: pageLoader(queryClient) },
    ],
  },
  {
    path: '/:workspaceId/apps/:appId',
    element: <AppPreview />,
    errorElement: <ErrorPage />,
    loader: appLoader(queryClient, 'production'),
    children: [
      {
        path: ':pageId',
        loader: pageLoader(queryClient),
        element: <PagePreview />,
      },
    ],
  },
]);

const container = document.getElementById('root') as HTMLDivElement;
const root = createRoot(container);

root.render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <Toaster />
      <RouterProvider router={router} />
    </ThemeProvider>
    <ReactQueryDevtools buttonPosition="bottom-right" />
  </QueryClientProvider>,
);
