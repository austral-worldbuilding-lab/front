"use client";

import { useEffect, useState } from "react";
import { Share2, Link as LinkIcon, Globe2, Check, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Role, ROLES, createInviteLink } from "@/services/invitationService";

interface ShareLinkDialogProps {
  projectId: string;
  organizationId: string;
  projectName?: string;
  defaultRole?: Role;
}

export default function ShareLinkDialog({
  projectId,
  organizationId,
  projectName = "Proyecto",
  defaultRole = "member",
}: ShareLinkDialogProps) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>(defaultRole);
  const [copied, setCopied] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (open && projectId && organizationId) {
      generateInviteLink();
    }
  }, [open, role, projectId, organizationId]);

  const generateInviteLink = async () => {
    setLoading(true);
    setError(null);
    try {
      const { inviteUrl } = await createInviteLink(projectId, role, organizationId);
      setInviteUrl(inviteUrl);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError("No tienes permisos para generar links de invitación. Solo los propietarios del proyecto pueden crear invitaciones.");
      } else {
        setError(err?.response?.data?.message || err?.message || "Error al generar el link");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!inviteUrl) return;
    
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
    } catch {
      setError("Error al copiar el link");
    }
  };

  const done = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="md" aria-label="Compartir">
          <Share2 className="w-4 h-4 mr-2" />
          Compartir link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Compartí {projectName}</DialogTitle>
          <DialogDescription>
            Generá y compartí un enlace. Cualquiera con el link tendrá el rol
            que elijas abajo.
          </DialogDescription>
        </DialogHeader>

        {/* People with access (mock minimal) */}
        <div className="space-y-3">
          <Label className="text-xs uppercase text-muted-foreground tracking-wide">
            Personas con acceso
          </Label>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 grid place-items-center text-sm font-semibold">
                Y
              </div>
              <div className="leading-tight">
                <div className="font-medium">You</div>
                <div className="text-xs text-muted-foreground">Owner</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Acceso completo</div>
          </div>
        </div>

        {/* General access */}
        <div className="space-y-3">
          <Label className="text-xs uppercase text-muted-foreground tracking-wide">
            Acceso general
          </Label>

          <div className="rounded-lg border p-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Globe2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-medium">
                    Cualquiera con el link
                  </div>
                  <span className="text-xs rounded-full bg-muted px-2 py-0.5">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </span>
                </div>

                {error && (
                  <div className="mt-2 text-sm text-red-600">{error}</div>
                )}

                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Select
                    value={role}
                    onValueChange={(v) => setRole(v as Role)}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={copyLink}
                    variant="outline"
                    className="shrink-0"
                    disabled={loading || !inviteUrl}
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Generando...
                      </span>
                    ) : copied ? (
                      <span className="inline-flex items-center gap-2">
                        <Check className="w-4 h-4" /> Copiado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" /> Copiar link
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={done}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
