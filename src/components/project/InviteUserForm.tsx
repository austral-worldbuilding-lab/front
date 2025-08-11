/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import useInviteUser from "@/hooks/useInviteUser";

type Props = {
  projectId: string;
  onSuccess?: () => void;
  onError?: (status?: number, message?: string) => void; // 👈 nuevo
};

export default function InviteUserForm({
  projectId,
  onSuccess,
  onError,
}: Props) {
  const { invite, loading, error, success, reset } = useInviteUser(projectId);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (success) {
      setEmail("");
      onSuccess?.();
    }
  }, [success, onSuccess]);

  return (
    <form
      className="w-full max-w-md space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await invite(email);
        } catch (err: any) {
          const status = err?.response?.status;
          const message = err?.response?.data?.message || err?.message;
          onError?.(
            status,
            Array.isArray(message) ? message.join(", ") : message
          );
        }
      }}
    >
      <div className="space-y-1">
        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) reset();
          }}
          className="w-full rounded-md border px-3 py-2"
          placeholder="persona@empresa.com"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar invitación"}
        </Button>
      </div>
    </form>
  );
}
