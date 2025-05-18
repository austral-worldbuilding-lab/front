import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import MandalaContainer from "./components/mandala/MandalaContainer";
//import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginPage from "@/pages/LoginPage.tsx";
import RegisterPage from "@/pages/RegisterPage.tsx";
import ProtectedRoute from "@/components/auth/ProtectedRoute.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to /signup */}
        <Route path="/" element={<Navigate to="/mandala" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          path="/mandala"
          element={
            <ProtectedRoute>
                <MandalaContainer /> //TODO: Disable protected route for now until we have login page working
            </ProtectedRoute>
          }
        />

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
