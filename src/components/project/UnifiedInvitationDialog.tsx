"use client";

import { useCallback, useEffect, useState } from "react";
import { Share2, Link as LinkIcon, Globe2, Check, Loader2, Copy } from "lucide-react";
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
import { Input } from "../ui/input";

import {
  Role,
  ROLES,
  createInviteLink as createProjectInviteLink,
} from "@/services/invitationService";
import { createOrganizationInviteLink } from "@/services/organizationInvitationService";

interface UnifiedInvitationDialogProps {
  projectId: string;
  organizationId: string;
  className?: string;
  projectName?: string;
  defaultRole?: Role;
  isOrganization?: boolean;
}

export default function UnifiedInvitationDialog({
  projectId,
  organizationId,
  className,
  projectName = "Proyecto",
  defaultRole = "member",
  isOrganization = false,
}: UnifiedInvitationDialogProps) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>(defaultRole);
  const [copied, setCopied] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string>("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const displayName = isOrganization ? "Organización" : projectName;

  const generateInviteLink = useCallback(async () => {
    setLinkLoading(true);
    setError(null);
    try {
      let result: { inviteUrl: string };

      if (isOrganization) {
        result = await createOrganizationInviteLink(organizationId, role);
      } else {
        result = await createProjectInviteLink(projectId, role, organizationId);
      }

      setInviteUrl(result.inviteUrl);
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      if (error?.response?.status === 403) {
        setError(
          isOrganization
            ? "No tenés permisos para generar links de invitación. Solo los propietarios de la organización pueden crear invitaciones."
            : "No tenés permisos para generar links de invitación. Solo los propietarios del proyecto pueden crear invitaciones."
        );
      } else {
        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Error al generar el link"
        );
      }
    } finally {
      setLinkLoading(false);
    }
  }, [isOrganization, organizationId, projectId, role]);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      setError(null);
      setInviteUrl("");
      setEmail("");
      setEmailSent(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (isOrganization) {
      if (organizationId) void generateInviteLink();
    } else {
      if (projectId && organizationId) void generateInviteLink();
    }
  }, [open, role, projectId, organizationId, isOrganization, generateInviteLink]);

  const copyLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Error al copiar el link");
    }
  };

  const sendEmailInvitation = async () => {
    if (!email.trim()) {
      setError("Ingresá un email válido");
      return;
    }

    setEmailLoading(true);
    setError(null);

    try {
      if (isOrganization) {
        await createOrganizationInviteLink(
          organizationId,
          role,
          undefined,
          email,
          true
        );
      } else {
        await createProjectInviteLink(
          projectId,
          role,
          organizationId,
          undefined,
          email,
          true
        );
      }

      setEmailSent(true);
      setEmail("");
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      if (error?.response?.status === 403) {
        setError(
          isOrganization
            ? "No tenés permisos para enviar invitaciones. Solo los propietarios de la organización pueden invitar usuarios."
            : "No tenés permisos para enviar invitaciones. Solo los propietarios del proyecto pueden invitar usuarios."
        );
      } else if (error?.response?.status === 409) {
        setError("Ya existe una invitación pendiente para este usuario o ya es miembro del proyecto.");
      } else {
        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Error al enviar la invitación"
        );
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const done = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="md"
          aria-label="Compartir"
          className={className}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Compartir
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Compartir "{displayName}"
          </DialogTitle>
          <DialogDescription>
            Agregá personas al {displayName.toLowerCase()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Agregar personas"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                  if (emailSent) setEmailSent(false);
                }}
                className="pr-24"
              />
            </div>
          </div>

          {email && (
            <div className="flex items-center gap-2 pl-2">
              <Select
                value={role}
                onValueChange={(v) => setRole(v as Role)}
                disabled={emailLoading}
              >
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r} className="text-xs">
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={sendEmailInvitation}
                disabled={emailLoading || !email.trim()}
                size="sm"
                className="h-8 text-xs"
              >
                {emailLoading ? (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  "Enviar"
                )}
              </Button>
            </div>
          )}

          {emailSent && (
            <div className="flex items-center gap-2 text-sm text-green-600 pl-2">
              <Check className="w-4 h-4" />
              Invitación enviada por email
            </div>
          )}
        </div>

        {/* General access */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Globe2 className="w-4 h-4" />
            Acceso general
          </Label>

          <div className="rounded-lg border p-3">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <LinkIcon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-medium">
                    Cualquiera con el link
                  </div>
                  <Select
                    value={role}
                    onValueChange={(v) => setRole(v as Role)}
                    disabled={linkLoading}
                  >
                    <SelectTrigger className="w-24 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r} className="text-xs">
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-xs text-muted-foreground">
                  Cualquiera en internet con el link puede {role === "viewer" ? "ver" : role === "member" ? "editar" : "administrar"}
                </div>

                <Button
                  onClick={copyLink}
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                  disabled={linkLoading || !inviteUrl}
                >
                  {linkLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generando...
                    </span>
                  ) : copied ? (
                    <span className="inline-flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Copiado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Copy className="w-4 h-4" />
                      Copiar link
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button onClick={done} className="w-full">
            Listo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
