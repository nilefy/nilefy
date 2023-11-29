import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuthStore';

type ProtectedRouteProps = {
  children: React.ReactNode;
  redirectPath?: string;
};
//TODO: extend for roles
export const ProtectedRoute = ({
  children,
  redirectPath = '/signin',
}: ProtectedRouteProps) => {
  const { isAuthed } = useAuthStore();
  if (!isAuthed) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
