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

      const orgInviteToken = searchParams.get("orgInvite");
      if (orgInviteToken) {
        const params = new URLSearchParams(searchParams);
        params.delete("orgInvite");
        const extra = params.toString();
        const suffix = extra ? `?${extra}` : "";
        navigate(`/organization-invite/${orgInviteToken}${suffix}`, { replace: true });
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
    <div className="flex h-screen bg-gradient-to-br from-primary-100 via-secondary-100 to-primary-300">
      <div className="w-full md:w-1/2 md:ml-auto flex items-center justify-center p-6">
        <div className="w-full h-[95vh] bg-white rounded-3xl shadow-2xl p-12 flex flex-col justify-center items-center">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Austral World Building Lab" className="w-40 h-40 object-contain" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-center mb-[78px]">Iniciar Sesión</h1>

        {/* Form */}
        <div className="flex flex-col gap-6 w-full max-w-md">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
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
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contraseña</label>
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
          </div>

          <div className="flex justify-end">
            <Link 
              to="/forgot-password" 
              className="text-sm underline hover:text-primary-600"
            >
              Olvidé mi contraseña
            </Link>
          </div>

          <Button 
            onClick={handleLogin}
            className="w-full py-3 rounded-lg font-medium"
          >
            Iniciar Sesión
          </Button>

          {error &&
            !error.includes("auth/invalid-email") &&
            !error.includes("auth/wrong-password") && (
              <p className="text-red-500 text-sm text-center">
                {getMessageFromErrorCode(error)}
              </p>
            )}

          <p className="text-center text-sm mt-4">
            ¿No tenés cuenta?{" "}
            <Link 
              to={`/register${searchParams.toString() ? `?${searchParams.toString()}` : ""}`} 
              className="text-primary hover:text-primary-hover font-medium"
            >
              Crear Cuenta
            </Link>
          </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
