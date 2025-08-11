import { useState } from "react";
import { Button } from "../ui/button";
import { Check, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";

export type Role = "admin" | "member";

const RoleLabel: Record<Role, string> = {
  admin: "Admin",
  member: "Miembro",
};

export default function ProjectUserRow({
  userId,
  name,
  email,
  initialRole,
  isAdmin,
  onConfirm,
}: {
  userId: string;
  name: string;
  email: string;
  initialRole: Role;
  isAdmin?: boolean;
  onConfirm?: (userId: string, newRole: Role) => Promise<void> | void;
}) {
  const [prevRole, setPrevRole] = useState<Role>(initialRole);
  const [draftRole, setDraftRole] = useState<Role>(initialRole);
  const [saving, setSaving] = useState(false);

  const dirty = draftRole !== prevRole;

  const handleCancel = () => setDraftRole(prevRole);

  const handleConfirm = async () => {
    try {
      setSaving(true);
      await onConfirm?.(userId, draftRole);
      setPrevRole(draftRole);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className="min-w-0 flex-1">
        <div className="font-medium truncate">{name}</div>
        <div className="text-sm text-muted-foreground truncate">{email}</div>
      </div>

      {isAdmin ? (
        <div className="flex items-center gap-2">
          {dirty && (
            <div className="flex items-center gap-1 mr-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={handleCancel}
                disabled={saving}
                aria-label="Cancelar cambio de rol"
                title="Cancelar cambio de rol"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-green-600 hover:text-green-700"
                onClick={handleConfirm}
                disabled={saving}
                aria-label="Confirmar cambio de rol"
                title="Confirmar cambio de rol"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Select
            value={draftRole}
            onValueChange={(val) => setDraftRole(val as Role)}
            disabled={saving}
          >
            <SelectTrigger className="h-8 w-[160px]">
              <SelectValue placeholder="Seleccionar rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">{RoleLabel.admin}</SelectItem>
              <SelectItem value="member">{RoleLabel.member}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <Badge variant="secondary" className="text-xs">
          {RoleLabel[prevRole]}
        </Badge>
      )}
    </div>
  );
}
