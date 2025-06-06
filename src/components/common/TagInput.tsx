import {useState, useEffect, useRef} from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import {HexColorPicker} from "react-colorful";

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
}

export default function TagInput({ 
  label, 
  initialItems = [], 
  onChange,
  colorPicker = true,
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
      if (
          pickerRef.current &&
          !pickerRef.current.contains(e.target as Node)
      ) {
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

    if (items.some(item => item.id === id)) {
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

  function isDarkColor(hex: string): boolean {
    hex = hex.replace("#", "");

    if (hex.length === 3) {
      hex = hex.split("").map(c => c + c).join("");
    }

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    return luminance < 128;
  }


  return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">{label}</label>

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
              placeholder={`Add ${label.toLowerCase()}`}
              className="flex-1 h-8"
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

        {error && (
            <span className="text-sm text-red-500">{error}</span>
        )}

        <div className="flex flex-wrap gap-2 mt-1">
          {items.map((item) => (
              <div
                  key={item.id}
                  className={`group flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs ${
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