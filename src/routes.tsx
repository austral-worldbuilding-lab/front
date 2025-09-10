import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import NotFound from "./pages/NotFound";
import LoginPage from "@/pages/LoginPage.tsx";
import RegisterPage from "@/pages/RegisterPage.tsx";
import ProtectedRoute from "@/components/auth/ProtectedRoute.tsx";
import MandalaPage from "./pages/app/project/mandala/MandalaPage";
import MandalaListPage from "./pages/app/project/mandala/MandalaListPage";
import ProjectPage from "./pages/app/project/ProjectPage";
import ProjectListPage from "./pages/app/project/ProjectListPage";
import DimensionPage from "@/pages/app/project/mandala/DimensionPage.tsx";
import MyInvitationsPage from "@/pages/MyInvitationsPage";
import InviteTokenPage from "@/pages/InviteTokenPage";
import RootRedirect from "@/components/common/RootRedirect.tsx";
import OrganizationListPage from "@/pages/app/project/OrganizationListPage.tsx";
import OrganizationInviteTokenPage from "./pages/OrganizationInviteTokenPage";

// Layout component for all protected routes
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/invite/:token" element={<InviteTokenPage />} />
        <Route
          path="/organization-invite/:token"
          element={<OrganizationInviteTokenPage />}
        />

        <Route
          path="/my-invitations"  
          element={
            <ProtectedLayout>
              <MyInvitationsPage />
            </ProtectedLayout>
          }
        />

        {/* Protected routes - all under /app path */}
        <Route
          path="/app"
          element={
            <ProtectedLayout>
              <Outlet />
            </ProtectedLayout>
          }
        >
          {/* Redirect /app to mandala */}
          <Route
            index
            element={<Navigate to={`/app/organization/`} replace />}
          />

          {/* Rutas independientes */}
          <Route path="organization/" element={<OrganizationListPage />} />
          <Route
            path="organization/:organizationId/projects"
            element={<ProjectListPage />}
          />
          <Route
            path="organization/:organizationId/projects/:projectId"
            element={<ProjectPage />}
          />

          <Route
            path="organization/:organizationId/projects/:projectId/mandalas"
            element={<MandalaListPage />}
          />
          <Route
            path="organization/:organizationId/projects/:projectId/mandala/:mandalaId"
            element={<MandalaPage />}
          />
          <Route
            path="organization/:organizationId/projects/:projectId/mandala/:mandalaId/dimension/:dimensionName"
            element={<DimensionPage />}
          />
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
