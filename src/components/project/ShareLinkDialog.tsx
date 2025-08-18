"use client";

import { useEffect, useMemo, useState } from "react";
import { Share2, Link as LinkIcon, Globe2, Check } from "lucide-react";
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
import { Role, ROLES } from "@/services/invitationService";

interface ShareLinkDialogProps {
  projectName?: string;
  defaultRole?: Role;
}

export default function ShareLinkDialog({
  projectName = "Proyecto",
  defaultRole = "member",
}: ShareLinkDialogProps) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>(defaultRole);
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(
    () => (typeof window !== "undefined" ? window.location.href : ""),
    []
  );

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      // Handle error
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

                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Select
                    value={role}
                    onValueChange={(v) => setRole(v as Role)}
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
                  >
                    {copied ? (
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
