import { CustomInput } from "@/components/ui/CustomInput.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthContext } from "@/context/AuthContext.tsx";
import logo from "@/assets/logo.png";

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
    "auth/invalid-email": "Invalid email",
    "auth/email-already-in-use": "Email already in use",
    "auth/weak-password": "Password must be at least 6 characters",
    "auth/missing-password": "Password is required",
  };

  const getMessageFromErrorCode = (
    errorCode: string | null
  ): string | undefined => {
    if (!errorCode) return undefined;
    const code = errorCode.match(/\(.*?\)/)?.[0].replace(/[()]/g, "");
    return firebaseErrorMap[code!] || "Unknown error";
  };

  return (
    <div className="flex flex-col bg-secondary-100 h-screen items-center justify-center">
      <div className="flex flex-row gap-8 w-5/10 p-10 bg-background rounded-[10px]">
        <div className="w-1/2 p-4 flex flex-col items-center justify-center text-3xl font-medium">
          <img src={logo} alt="logo" className="w-[200px] mb-10" />
        </div>
        <div className="w-1/2 p-4 flex flex-col gap-4">
          <h1 className="text-3xl font-medium">Register</h1>
          <CustomInput
            placeholder="Email"
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
            placeholder="Password"
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

          <Button onClick={handleRegister}>Create account</Button>

          {error &&
            !error.includes("auth/invalid-email") &&
            !error.includes("auth/email-already-in-use") &&
            !error.includes("auth/weak-password") && (
              <p className="text-red-500 text-sm">
                {getMessageFromErrorCode(error)}
              </p>
            )}

          <p>
            Already have an account?{" "}
            <Link to="/login" className="text-primary-500">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
