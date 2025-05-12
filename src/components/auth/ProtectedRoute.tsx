import { Navigate, useLocation } from 'react-router-dom';
import {useAuth} from "@/hooks/useAuth.ts";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();

  const { isAuth } = useAuth();

  if (!isAuth()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 