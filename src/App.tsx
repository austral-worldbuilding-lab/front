import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import MandalaContainer from "./components/mandala/MandalaContainer";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SignupPage from "@/pages/LoginPage.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to /signup */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<SignupPage />} />

        {/* Protected routes */}
        <Route
          path="/mandala"
          element={
            <ProtectedRoute>
              <MandalaContainer />
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
