import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";

export interface Item {
  id: string;
  value: string;
  color: string;
}

interface TagInputProps {
  label: string;
  initialItems?: Item[];
  onChange: (items: Item[]) => void;
  predefinedColors?: Record<string, string>;
}

export default function TagInput({ 
  label, 
  initialItems = [], 
  onChange,
  predefinedColors = {} 
}: TagInputProps) {
  const [value, setValue] = useState("");
  const [items, setItems] = useState<Item[]>(initialItems);

  useEffect(() => {
    onChange(items);
  }, [items, onChange]);

  const handleAddItem = () => {
    if (!value.trim()) return;

    const normalizedValue = value.trim().toLowerCase();
    const isPredefined = Object.keys(predefinedColors).includes(normalizedValue);
    
    const newItem: Item = {
      id: uuidv4(),
      value: value.trim(),
      color: isPredefined ? predefinedColors[normalizedValue] : predefinedColors["new"] || "var(--color-secondary)",
    };

    setItems((prev) => [...prev, newItem]);
    setValue("");
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddItem();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      
      <div className="flex gap-2">
        <Input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Add ${label.toLowerCase()}`}
          className="flex-1 h-8"
        />
        <Button
          onClick={handleAddItem}
          disabled={!value.trim()}
          className="px-3 h-8"
        >
          +
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex items-center gap-1 px-2 py-1 rounded text-black"
            style={{ backgroundColor: item.color }}
          >
            <span>{item.value}</span>
            <button
              onClick={() => handleRemoveItem(item.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove item"
            >
              <X size={14} className="text-black/70 hover:text-black" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 