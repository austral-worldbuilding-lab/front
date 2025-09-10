import { Navigate, useLocation } from 'react-router-dom';
import {useAuthContext} from "@/context/AuthContext.tsx";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const RETURN_TO_KEY = "returnToUrl";

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuth, isLoading } = useAuthContext();

  if (isLoading) {
    return null;
  }

  if (!isAuth()) {
    const fullUrl = location.pathname + location.search + location.hash;
    sessionStorage.setItem(RETURN_TO_KEY, fullUrl);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 