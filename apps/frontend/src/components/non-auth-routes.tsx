import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuthStore';

type NonAuthRouteProps = {
  children: React.ReactNode;
  redirectPath?: string;
};
export const NonAuthRoute = ({
  children,
  redirectPath = '/',
}: NonAuthRouteProps) => {
  const { isAuthed } = useAuthStore();

  // if (isLoading.data) {
  //   return <></>;
  // }
  // if the user is authenticated and tries to access a signin or signup etc..
  if (isAuthed) {
    return <Navigate to={redirectPath} replace />;
  }
  return <>{children}</>;
};
