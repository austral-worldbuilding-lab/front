import { Provocation } from "@/types/mandala";
import ProvocationCard from "./ProvocationCard";
import { useState } from "react";
import CreatedWorldsModal from "./CreatedWorldsModal";

export type ProvocationItemProps = {
  provocation: Provocation;
  index: number;
};

export const ProvocationItem = ({
  provocation,
  index,
}: ProvocationItemProps) => {
  const [open, setOpen] = useState(false);
  const [worldsOpen, setWorldsOpen] = useState(false);

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
        onNavigate={() => {
          setOpen(false);
        }}
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
        className="flex flex-col hover:bg-gray-50 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        {index !== 0 && <hr className="border-t border-gray-200" />}
        <div className="flex flex-col p-3">
          <span className="font-semibold text-foreground">
            {provocation.title}
          </span>
          <span className="text-foreground">{provocation.description}</span>
        </div>
      </div>
    </>
  );
};
