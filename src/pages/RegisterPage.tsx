import { CustomInput } from "@/components/ui/CustomInput.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthContext } from "@/context/AuthContext.tsx";

const RegisterPage = () => {
  const { register, error } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    const success = await register(email, password);
    if (success) {
      navigate("/");
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
      <div className="flex flex-row gap-8 w-5/10 p-10 bg-background">
        <div className="w-1/2 p-4 flex flex-col items-center justify-center text-3xl font-medium">
          <h1>Registrarse</h1>
        </div>
        <div className="w-1/2 p-4 flex flex-col gap-4">
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

          <p>
            ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
