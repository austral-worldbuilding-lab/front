import { CustomInput } from "@/components/ui/CustomInput.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useAuthContext } from "@/context/AuthContext.tsx";
import logo from "@/assets/logo.png";
import { RETURN_TO_KEY } from "@/components/auth/ProtectedRoute";

const RegisterPage = () => {
  const { register, error } = useAuthContext();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleRegister = async () => {
    // Validate password
    if (password.length < 8 || !/[A-Z]/.test(password)) {
      setPasswordError("Debe contener mínimo 8 caracteres y al menos una mayúscula");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    setPasswordError(undefined);
    const success = await register(email, password, fullName);
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
    <div className="flex h-screen bg-gradient-to-br from-primary-100 via-secondary-100 to-primary-300">
      <div className="w-full md:w-1/2 md:ml-auto flex items-center justify-center p-6">
        <div className="w-full h-[95vh] bg-white rounded-3xl shadow-2xl p-12 overflow-y-auto flex flex-col justify-center items-center">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Austral World Building Lab" className="w-40 h-40 object-contain" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-center mb-[78px]">Crear Cuenta</h1>

        {/* Form */}
        <div className="flex flex-col gap-6 w-full max-w-md">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre completo</label>
            <CustomInput
              placeholder="Nombre Apellido"
              color="foreground"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
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
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contraseña</label>
            <CustomInput
              placeholder="Contraseña"
              color="white"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(undefined);
              }}
              error={passwordError}
            />
            <p className="text-xs text-gray-500 mt-1">
              Debe contener mínimo 8 caracteres y al menos una mayúscula
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Repetir contraseña</label>
            <CustomInput
              placeholder="Contraseña"
              color="white"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError(undefined);
              }}
            />
          </div>

          <Button 
            onClick={handleRegister} 
            disabled={!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()}
            className="w-full py-3 rounded-lg font-medium"
          >
            Crear Cuenta
          </Button>

          {error &&
            !error.includes("auth/invalid-email") &&
            !error.includes("auth/email-already-in-use") &&
            !error.includes("auth/weak-password") && (
              <p className="text-red-500 text-sm text-center">
                {getMessageFromErrorCode(error)}
              </p>
            )}

          <p className="text-center text-sm mt-4">
            ¿Ya tenés cuenta?{" "}
            <Link 
              to={`/login${searchParams.toString() ? `?${searchParams.toString()}` : ""}`} 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Iniciar Sesión
            </Link>
          </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
