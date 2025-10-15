import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import Routes from "./routes.tsx";
import { TooltipProvider } from "./components/ui/tooltip";
import { AuthProvider } from "./context/AuthContext";
import { PermissionsProvider } from "./context/PermissionsContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PostItAnimationProvider } from "./context/PostItAnimationContext.tsx";
import { PostHogProvider } from "posthog-js/react";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchInterval: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {import.meta.env.VITE_PUBLIC_ENVIRONMENT === "production" ? (
      <PostHogProvider
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
        options={{
          api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
          defaults: "2025-05-24",
          capture_exceptions: true,
          debug: import.meta.env.MODE === "development",
        }}
      >
        <PostItAnimationProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <PermissionsProvider>
                <TooltipProvider>
                  <Routes />
                </TooltipProvider>
              </PermissionsProvider>
            </AuthProvider>
            {/* {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />} */}
          </QueryClientProvider>
        </PostItAnimationProvider>
      </PostHogProvider>
    ) : (
      <PostItAnimationProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PermissionsProvider>
              <TooltipProvider>
                <Routes />
              </TooltipProvider>
            </PermissionsProvider>
          </AuthProvider>
          {/* {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />} */}
        </QueryClientProvider>
      </PostItAnimationProvider>
    )}
  </StrictMode>
);
