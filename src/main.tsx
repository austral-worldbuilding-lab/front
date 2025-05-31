import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import Routes from "./routes.tsx";
import { TooltipProvider } from "./components/ui/tooltip";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <TooltipProvider>
        <Routes />
      </TooltipProvider>
    </AuthProvider>
  </StrictMode>
);
