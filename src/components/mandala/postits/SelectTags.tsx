import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { useState } from "react";
import NewTagModal from "./NewTagModal";
import { Tag } from "@/types/mandala";

interface SelectTagsProps {
  tags: Tag[];
  value: Tag[];
  onChange: (tags: Tag[]) => void;
  onNewTag: (tag: Tag) => void;
}

const SelectTags = ({ tags, value, onChange, onNewTag }: SelectTagsProps) => {
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleTag = (tag: Tag) => {
    const isSelected = value.some((t) => t.value === tag.value);
    if (isSelected) {
      onChange(value.filter((t) => t.value !== tag.value));
    } else {
      onChange([...value, tag]);
    }
  };

  return (
    <>
      <Popover modal open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            color="ghost"
            role="combobox"
            className="justify-between w-full"
          >
            <span className="flex items-center gap-2">
              {value.length > 0 ? value.map((t) => (
                 <span
                     key={t.value}
                     className="flex items-center gap-1 mr-2"
                 >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: t.color }}
                />
                  {t.name}
                </span>
                  ))
                  : "Seleccionar tags"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar tags..." />
            <CommandList>
              <CommandEmpty>No se encontraron tags.</CommandEmpty>
              {tags.map((tag) => {
                  const isSelected = value.some((t) => t.value === tag.value);
                  return (
                <CommandItem
                          key={tag.value}
                          value={tag.value}
                          onSelect={() => toggleTag(tag)}
                      >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </span>
                  {isSelected && (
                    <Check className="ml-auto h-4 w-4 text-green-500" />
                  )}
                </CommandItem>
              );
          })}
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  setIsModalOpen(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo tag
              </CommandItem>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <NewTagModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCreate={(newTag) => {
          const tagWithName: Tag = {
              name: newTag.label,
              value: newTag.value,
              color: newTag.color,
              };
              onNewTag(tagWithName);
              onChange([...value, tagWithName]);
        }}
      />
    </>
  );
};

export default SelectTags;
