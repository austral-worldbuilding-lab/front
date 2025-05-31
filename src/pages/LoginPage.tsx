import { CustomInput } from "@/components/ui/CustomInput.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthContext } from "@/context/AuthContext.tsx";

const LoginPage = () => {
  const { login, error } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    const success = await login(email, password);
    if (success) {
      navigate("/");
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
    <div
      className={
        "flex flex-col bg-secondary-100 h-screen items-center justify-center"
      }
    >
      <div className={"flex flex-row gap-8 w-5/10 p-10 bg-background"}>
        <div
          className={
            "w-1/2 p-4 flex col items-center justify-center text-3xl font-medium"
          }
        >
          <h1>Iniciar sesión</h1>
        </div>
        <div className={"w-1/2 p-4 flex flex-col gap-4"}>
          <CustomInput
            placeholder={"Correo electrónico"}
            color={"foreground"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={
              error?.includes("auth/invalid-email")
                ? "Correo electrónico inválido"
                : undefined
            }
          />
          <CustomInput
            placeholder={"Contraseña"}
            color={"white"}
            type={"password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={
              error?.includes("auth/wrong-password")
                ? "Contraseña incorrecta"
                : undefined
            }
          />
          <Button onClick={async () => handleLogin()}>Iniciar sesión</Button>
          {error &&
            !error.includes("auth/invalid-email") &&
            !error.includes("auth/wrong-password") && (
              <p className="text-red-500 text-sm">
                {getMessageFromErrorCode(error)}
              </p>
            )}
          <p>
            ¿No tenés una cuenta? <Link to={"/register"}>Registrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
