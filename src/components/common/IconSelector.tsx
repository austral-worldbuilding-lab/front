/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import * as Icons from "lucide-react";
import { ICON_OPTIONS } from "@/constants/icon-options";

interface IconSelectorProps {
  value?: string | null;
  onChange: (iconName: string) => void;
  disabled?: boolean;
  defaultIcon?: string;
  label?: string;
}

export const IconSelector = ({
  value,
  onChange,
  disabled = false,
  defaultIcon = "Folder",
  label = "Ícono",
}: IconSelectorProps) => {
  const SelectedIcon = (Icons as any)[value || defaultIcon];
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-start gap-2 py-4">
      <label className="text-sm font-medium text-[var(--color-black)] flex items-center gap-1">
        {label}
      </label>

      <div className="w-full flex justify-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Card
              className={`p-6 rounded-2xl cursor-pointer flex items-center justify-center w-20 h-20 transition-all border ${
                disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
              }`}
            >
              <SelectedIcon className="h-8 w-8 text-gray-700" />
            </Card>
          </PopoverTrigger>

          <PopoverContent className="w-[300px] p-3">
            <div className="grid grid-cols-5 gap-2">
              {ICON_OPTIONS.map((iconName) => {
                const IconComp = (Icons as any)[iconName];
                const isSelected = (value || defaultIcon) === iconName;
                return (
                  <Card
                    key={iconName}
                    className={`cursor-pointer p-3 flex justify-center items-center transition-all border rounded-xl ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      onChange(iconName);
                      setOpen(false);
                    }}
                  >
                    <IconComp className="h-6 w-6" />
                  </Card>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
