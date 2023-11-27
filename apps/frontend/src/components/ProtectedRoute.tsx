import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuthStore';

type ProtectedRouteProps = {
  children: React.ReactNode;
  redirectPath?: string;
};
//TODO: extend for roles
//   if user is authed, he can't visit  these (maybe edited later)
const restrictedAuthedRoutes = [
  '/signin',
  '/signup',
  '/forgot-password',
  '/reset-password',
];
export const ProtectedRoute = ({
  children,
  redirectPath = '/signin',
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { isLoading, isAuthed } = useAuthStore();

  console.log(isAuthed, isLoading, location.pathname);
  if (isLoading.data) {
    return <></>;
  }
  // not authed and tries to access a protected route (redirect to signin)
  // if the user is authenticated and tries to access a signin or signup etc..
  if (!isAuthed) {
    console.log('not Authed ');
    return <Navigate to={redirectPath} replace />;
  }
  // if the user is authenticated and tries to access a signin or signup etc..
  // if (isAuthed && restrictedAuthedRoutes.includes(location.pathname)) {
  //   return <Navigate to="/" replace />;
  // }
  return <>{children}</>;
};
