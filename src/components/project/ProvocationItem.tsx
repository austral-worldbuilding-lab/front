import { Globe, Sparkles } from "lucide-react";
import { useState } from "react";
import ProvocationCard from "./ProvocationCard";
import CreatedWorldsModal from "./CreatedWorldsModal";
import { Provocation } from "@/types/mandala";

export type ProvocationItemProps = {
  provocation: Provocation;
  index: number;
  projectId: string;
  onDelete?: (provocationId: string) => Promise<void>;
  deleting?: boolean;
};

export const ProvocationItem = ({ provocation, index, projectId, onDelete, deleting }: ProvocationItemProps) => {
  const [open, setOpen] = useState(false);
  const [worldsOpen, setWorldsOpen] = useState(false);

    const hasWorlds = provocation.projectsOrigin?.length > 0;
    const isCached = !provocation.id;

    const handleDelete = async () => {
        if (onDelete && provocation.id) {
            await onDelete(provocation.id);
        }
    };

    const state = isCached
        ? {
            icon: <Sparkles className="text-gray-500 w-6 h-6" />,
            label: "Provocación sugerida",
            labelColor: "text-gray-600",
            labelBg: "bg-gray-100",
            textColor: "text-gray-700",
        }
        : hasWorlds
            ? {
                icon: <Globe className={`text-blue-900 w-6 h-6`} />,
                label: "Provocación explorada",
                labelColor: `text-blue-900`,
                labelBg: "bg-blue-50",
                textColor: "text-black",
            }
            : {
                icon: <Globe className="text-gray-400 w-6 h-6" />,
                label: "Provocación creada",
                labelColor: "text-gray-700",
                labelBg: "bg-gray-50",
                textColor: "text-black",
            };

  return (
    <>
      <ProvocationCard
                open={open}
                onClose={() => setOpen(false)}
                provocation={provocation}
                onOpenWorlds={() => {
                    setOpen(false);
                    setWorldsOpen(true);
                }}
                onNavigate={() => setOpen(false)}
                projectId={projectId}
                onDelete={onDelete ? handleDelete : undefined}
                deleting={deleting}
            />

            <CreatedWorldsModal
                provocation={provocation}
                open={worldsOpen}
                onClose={() => {
                    setWorldsOpen(false);
                    setOpen(false);
                }}
                onBack={() => {
                    setWorldsOpen(false);
                    setOpen(true);
                }}
                onNavigate={() => {
                    setWorldsOpen(false);
                    setOpen(false);
                }}
            />
            <div
                onClick={() => setOpen(true)}
                className={`flex flex-col cursor-pointer hover:bg-gray-50 transition p-3 ${
                    isCached ? "opacity-90" : ""
                }`}
            >
                {index !== 0 && <hr className="border-t border-gray-200 mb-2" />}
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 min-w-[28px] flex justify-center pt-1">
                        {state.icon}
                    </div>

                    <div className="flex flex-col flex-1">
            <span
                className={`font-semibold leading-snug break-words ${state.textColor}`}
            >
              {provocation.title}
            </span>

                        <span
                            className={`text-xs font-medium mt-1 px-2 py-0.5 rounded w-fit ${state.labelBg} ${state.labelColor}`}
                        >
              {state.label}
            </span>

                        {provocation.description && (
                            <p className="text-sm text-gray-600 mt-2 leading-snug">
                                {provocation.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
