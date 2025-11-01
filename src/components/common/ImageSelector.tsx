import { useState, useMemo, useRef, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface ImageSelectorProps {
  onChange: (file: File | null) => void;
}

export const ImageSelector = ({ onChange }: ImageSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSelect = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (!selected) return;
    if (!selected.type.startsWith("image/")) return;

    setFile(selected);
    onChange(selected);
    setOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClear = () => {
    setFile(null);
    onChange(null);
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <label className="text-sm font-medium text-[var(--color-black)]">
        Imagen
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Card
            className="p-2 rounded-2xl cursor-pointer flex items-center justify-center w-20 h-20 transition-all border overflow-hidden hover:bg-gray-100"
            onClick={() => setOpen(true)}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="object-cover w-full h-full rounded-xl"
              />
            ) : (
              <Upload className="h-8 w-8 text-gray-500" />
            )}
          </Card>
        </PopoverTrigger>

        <PopoverContent side="right" className="w-[260px] p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex flex-col gap-3">
            <Button variant="outline" onClick={handleSelect} className="w-full">
              Elegir imagen
            </Button>

            {previewUrl && (
              <div className="flex flex-col gap-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full rounded-xl border object-cover"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClear}
                  className="justify-start gap-2"
                >
                  <X className="h-4 w-4" />
                  Quitar imagen
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
