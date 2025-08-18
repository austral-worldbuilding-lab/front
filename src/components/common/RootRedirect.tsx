import {useAuth} from "@/hooks/useAuth.ts";
import Loader from "@/components/common/Loader.tsx";
import {Navigate} from "react-router-dom";

const RootRedirect: React.FC = () => {
    const { isAuth, isLoading } = useAuth();
    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
                <Loader size="large" text="Cargando..." />
            </div>
        );  }
    if (isAuth()) {
        return <Navigate to="/app/organization" replace />;
    } else {
        return <Navigate to="/login" replace />;
    }
};
export default RootRedirect;