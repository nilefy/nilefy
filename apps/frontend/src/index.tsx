import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from '@/components/App';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { SignUp } from '@/pages/auth/up';
import { SignIn } from '@/pages/auth/in';
import ErrorPage from './pages/error';
import { Dashboard } from './pages/mainLayout';
import { ThemeProvider } from './components/theme-provider';
import { UsersManagement } from './pages/workspace/users';
import { GroupManagement, GroupsManagement } from './pages/workspace/group';
import { WorkspaceSettingsLayout } from './pages/workspace/workspace';

// router config
const router = createBrowserRouter([
  {
    path: '/:workspaceId',
    element: <Dashboard />,
    errorElement: <ErrorPage />,
    children: [
      { path: '', element: <App /> },
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
  <ThemeProvider>
    <RouterProvider router={router} />
  </ThemeProvider>,
);
