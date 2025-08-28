import { CustomInput } from "@/components/ui/CustomInput.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useAuthContext } from "@/context/AuthContext.tsx";
import logo from "@/assets/logo.png";
import { RETURN_TO_KEY } from "@/components/auth/ProtectedRoute";

const LoginPage = () => {
  const { login, error } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  async function handleLogin() {
    const success = await login(email, password);
    if (success) {
      const inviteToken = searchParams.get("invite");
      if (inviteToken) {
        const params = new URLSearchParams(searchParams);
        params.delete("invite");
        const extra = params.toString();
        const suffix = extra ? `?${extra}` : "";
        navigate(`/invite/${inviteToken}${suffix}`, { replace: true });
        return;
      }

      const returnTo = sessionStorage.getItem(RETURN_TO_KEY);
      if (returnTo) {
        sessionStorage.removeItem(RETURN_TO_KEY);
        navigate(returnTo, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }

  const firebaseErrorMap: Record<string, string> = {
    "auth/invalid-email": "Correo electrónico inválido",
    "auth/invalid-credential": "Correo electrónico o contraseña incorrectos",
    "auth/wrong-password": "Contraseña incorrecta",
    "auth/missing-password": "La contraseña es obligatoria",
  };

  const getMessageFromErrorCode = (errorCode: string | null): string | null => {
    if (!errorCode) return null;
    const code = errorCode.match(/\(.*?\)/)?.[0].replace(/[()]/g, "");
    return firebaseErrorMap[code!] || "Error desconocido.";
  };

  return (
    <div className="flex flex-col bg-secondary-100 h-screen items-center justify-center">
      <div className="flex flex-col sm:flex-row gap-8 w-[90%] sm:w-[50%] p-10 bg-background rounded-[10px]">
        {/* Logo + title */}
        <div className="w-full sm:w-1/2 flex items-center justify-center sm:items-center sm:justify-center">
          <div className="flex flex-row sm:flex-col items-center gap-4">
            <img src={logo} alt="logo" className="w-[60px] sm:w-[120px]" />
            <h1 className="text-2xl font-semibold text-center sm:text-3xl">
              Iniciar sesión
            </h1>
          </div>
        </div>

        {/* Form */}
        <div className="w-full sm:w-1/2 p-4 flex flex-col gap-4">
          <CustomInput
            placeholder="Correo electrónico"
            color="foreground"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={
              error?.includes("auth/invalid-email")
                ? "Correo electrónico inválido"
                : undefined
            }
          />
          <CustomInput
            placeholder="Contraseña"
            color="white"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={
              error?.includes("auth/wrong-password")
                ? "Contraseña incorrecta"
                : undefined
            }
          />
          <Button onClick={handleLogin}>Iniciar sesión</Button>

          {error &&
            !error.includes("auth/invalid-email") &&
            !error.includes("auth/wrong-password") && (
              <p className="text-red-500 text-sm">
                {getMessageFromErrorCode(error)}
              </p>
            )}

          <p className="text-sm">
            ¿No tienes una cuenta?{" "}
            <Link to="/register" className="text-primary-500">
              Registrarse
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
