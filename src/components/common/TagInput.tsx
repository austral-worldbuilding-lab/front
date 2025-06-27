import { useState, useEffect, useRef } from "react";
import { HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { HexColorPicker } from "react-colorful";
import { isDarkColor } from "@/utils/colorUtils.ts";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export interface Item {
  id: string;
  value: string;
  color: string;
}

interface TagInputProps {
  label: string;
  initialItems?: Item[];
  onChange: (items: Item[]) => void;
  colorPicker?: boolean;
  tooltip?: string;
}

export default function TagInput({
  label,
  initialItems = [],
  onChange,
  colorPicker = true,
  tooltip,
}: TagInputProps) {
  const [value, setValue] = useState("");
  const [items, setItems] = useState<Item[]>(initialItems);
  const [color, setColor] = useState("#aabbcc");
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    onChange(items);
  }, [items, onChange]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  const handleAddItem = () => {
    if (!value.trim()) return;

    const id = value.trim().toLowerCase().replace(/ /g, "-");

    if (items.some((item) => item.id === id)) {
      setError(`El tag "${value.trim()}" ya existe`);
      return;
    }
    const newItem: Item = {
      id,
      value: value.trim(),
      color: colorPicker ? color : "#aabbcc",
    };

    setItems((prev) => [...prev, newItem]);
    setValue("");
    setError(null);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !showPicker) {
      e.preventDefault();
      handleAddItem();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">{label}</label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-gray-500 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={`Añadir ${label.toLowerCase()}`}
          className="flex-1 h-8 truncate overflow-hidden text-ellipsis whitespace-nowrap"
        />

        <div className="relative">
          {colorPicker && (
            <>
              <div
                className="w-8 h-8 rounded border cursor-pointer"
                style={{ backgroundColor: color }}
                onClick={() => setShowPicker((prev) => !prev)}
              />
              {showPicker && (
                <div ref={pickerRef} className="absolute z-10 mt-2">
                  <HexColorPicker color={color} onChange={setColor} />
                </div>
              )}
            </>
          )}
        </div>

        <Button
          onClick={handleAddItem}
          disabled={!value.trim()}
          className="px-3 h-8"
        >
          +
        </Button>
      </div>

      {error && <span className="text-sm text-red-500">{error}</span>}

      <div className="flex flex-wrap items-start justify-start gap-2 mt-1 overflow-y-auto min-h-13 max-h-26 border border-grey-500 rounded-md p-2">
        {items.length === 0 && (
          <span className="text-sm text-gray-500">No se añadieron tags</span>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className={`group flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs h-6 select-none m-0 w-fit ${
              isDarkColor(item.color) ? "text-white" : "text-black"
            }`}
            style={{ backgroundColor: item.color }}
          >
            <span>{item.value}</span>
            <button
              onClick={() => handleRemoveItem(item.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove item"
            >
              <X
                size={14}
                className={`${
                  isDarkColor(item.color)
                    ? "text-white/70 hover:text-white"
                    : "text-black/70 hover:text-black"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
