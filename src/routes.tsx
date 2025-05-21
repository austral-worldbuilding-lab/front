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
import ProjectPage from "./pages/app/project/ProjectPage";

// Layout component for all protected routes
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to /mandala */}
        {/* TODO: This is temporary, change this path when we have a home page */}
        <Route
          path="/"
          element={<Navigate to="/app/project/12345/mandala/12345" replace />}
        />
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

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
            element={<Navigate to="/app/project/12345/mandala/12345" replace />}
          />

          {/* Rutas independientes */}
          <Route path="project/:projectId" element={<ProjectPage />} />
          <Route
            path="project/:projectId/mandala/:mandalaId"
            element={<MandalaPage />}
          />
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
