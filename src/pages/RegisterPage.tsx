import { CustomInput } from "@/components/ui/CustomInput.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthContext } from "@/context/AuthContext.tsx";
import logo from "@/assets/logo.png";
import { RETURN_TO_KEY } from "@/components/auth/ProtectedRoute";

const RegisterPage = () => {
  const { register, error } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    const success = await register(email, password);
    if (success) {
      const returnTo = sessionStorage.getItem(RETURN_TO_KEY);
      if (returnTo) {
        sessionStorage.removeItem(RETURN_TO_KEY);
        navigate(returnTo, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  };

  const firebaseErrorMap: Record<string, string> = {
    "auth/invalid-email": "Correo electrónico inválido",
    "auth/email-already-in-use": "El correo ya está en uso",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres",
    "auth/missing-password": "La contraseña es obligatoria",
  };

  const getMessageFromErrorCode = (
    errorCode: string | null
  ): string | undefined => {
    if (!errorCode) return undefined;
    const code = errorCode.match(/\(.*?\)/)?.[0].replace(/[()]/g, "");
    return firebaseErrorMap[code!] || "Error desconocido";
  };

  return (
    <div className="flex flex-col bg-secondary-100 h-screen items-center justify-center">
      <div className="flex flex-col sm:flex-row gap-8 w-[90%] sm:w-[50%] p-10 bg-background rounded-[10px]">
        {/* Logo + texto */}
        <div className="w-full sm:w-1/2 flex items-center justify-center sm:items-center sm:justify-center">
          <div className="flex flex-row sm:flex-col items-center gap-4">
            <img src={logo} alt="logo" className="w-[60px] sm:w-[120px]" />
            <h1 className="text-2xl font-semibold text-center sm:text-3xl">
              Registrarse
            </h1>
          </div>
        </div>

        {/* Formulario */}
        <div className="w-full sm:w-1/2 p-4 flex flex-col gap-4">
          <CustomInput
            placeholder="Correo electrónico"
            color="foreground"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={
              error?.includes("auth/invalid-email") ||
              error?.includes("auth/email-already-in-use")
                ? getMessageFromErrorCode(error)
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
              error?.includes("auth/weak-password")
                ? getMessageFromErrorCode(error)
                : undefined
            }
          />

          <Button onClick={handleRegister}>Crear cuenta</Button>

          {error &&
            !error.includes("auth/invalid-email") &&
            !error.includes("auth/email-already-in-use") &&
            !error.includes("auth/weak-password") && (
              <p className="text-red-500 text-sm">
                {getMessageFromErrorCode(error)}
              </p>
            )}

          <p className="text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-primary-500">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
