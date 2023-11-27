import { useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuthStore';

type NonAuthRouteProps = {
  children: React.ReactNode;
  redirectPath?: string;
};
export const NonAuthRoute = ({
  children,
  redirectPath = '/',
}: NonAuthRouteProps) => {
  const location = useLocation();
  const { isLoading, isAuthed } = useAuthStore();

  console.log(isAuthed, isLoading, location.pathname);
  if (isLoading.data) {
    return <></>;
  }
  // not authed and tries to access a protected route (redirect to signin)
  // if the user is authenticated and tries to access a signin or signup etc..
  if (isAuthed) {
    return <Navigate to={redirectPath} replace />;
  }
  return <>{children}</>;
};
