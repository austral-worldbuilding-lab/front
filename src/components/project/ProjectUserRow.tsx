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
import { Role, ROLES } from "@/services/invitationService";
import { getAvailableRoles } from "@/utils/roleUtils";

export default function ProjectUserRow({
  userId,
  name,
  email,
  initialRole,
  isAdmin,
  isCurrentUser = false,
  onConfirm,
}: {
  userId: string;
  name: string;
  email: string;
  initialRole: Role;
  isAdmin?: boolean;
  isCurrentUser?: boolean;
  onConfirm?: (userId: string, newRole: Role) => Promise<void> | void;
}) {
  const [prevRole, setPrevRole] = useState<Role>(initialRole);
  const [draftRole, setDraftRole] = useState<Role>(initialRole);
  const [saving, setSaving] = useState(false);

  const dirty = draftRole !== prevRole;
  const availableRoles = getAvailableRoles(initialRole, isCurrentUser);

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
            <SelectContent className="z-[200] !bg-white dark:!bg-neutral-900 [&>*]:!bg-white dark:[&>*]:!bg-neutral-900">
              {availableRoles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </SelectItem>
              ))}
              {ROLES.filter(r => !availableRoles.includes(r)).map((r) => (
                <SelectItem 
                  key={r} 
                  value={r} 
                  disabled 
                  className="opacity-50 cursor-not-allowed"
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)} (No disponible)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <Badge variant="secondary" className="text-xs">
          {prevRole.charAt(0).toUpperCase() + prevRole.slice(1)}
        </Badge>
      )}
    </div>
  );
}
