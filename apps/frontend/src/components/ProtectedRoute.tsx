import { useAuthStore } from '@/hooks/useAuthStore';
import { Navigate, useLocation } from 'react-router-dom';

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
  // const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuth = useAuthStore((state) => state.isAuth);
  const location = useLocation();
  if (isLoading) {
    return <></>;
  }
  // not authed and tries to access a protected route (redirect to signin)
  if (!isAuth) {
    return <Navigate to={redirectPath} replace />;
  }
  // if the user is authenticated and tries to access a signin or signup etc..
  if (isAuth && restrictedAuthedRoutes.includes(location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
