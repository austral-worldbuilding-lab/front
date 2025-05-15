import { Navigate, useLocation } from 'react-router-dom';
import {useAuthContext} from "@/context/AuthContext.tsx";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();

  const { isAuth } = useAuthContext();

  if (!isAuth()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 