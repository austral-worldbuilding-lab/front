import { Provocation } from "@/types/mandala";

export type ProvocationItemProps = {
  provocation: Provocation;
  index: number;
};

export const ProvocationItem = ({
  provocation,
  index,
}: ProvocationItemProps) => {
  return (
    <div className="flex flex-col">
      {index !== 0 && <hr className="border-t border-gray-200" />}
      <div className="flex flex-col p-3">
        <span className="font-semibold text-foreground">
          {provocation.title}
        </span>
        <span className="text-foreground">{provocation.description}</span>
      </div>
    </div>
  );
};
