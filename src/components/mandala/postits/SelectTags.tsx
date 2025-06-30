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
import { Trash2, Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { useState } from "react";
import NewTagModal from "./NewTagModal";
import { Tag } from "@/types/mandala";

interface SelectTagsProps {
  tags: Tag[];
  value: string;
  onChange: (tag: Tag) => void;
  onNewTag: (tag: Tag) => void;
  onDeleteTag: (tagId: string) => void;
}

const SelectTags = ({ tags, value, onChange, onNewTag, onDeleteTag }: SelectTagsProps) => {
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredTagValue, setHoveredTagValue] = useState<string | null>(null);


  const selectedTag = tags.find((t) => t.value === value);

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
              {selectedTag && (
                  <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: selectedTag.color }}
                  />
              )}
              {selectedTag ? selectedTag.label : "Select tag"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar tags..." />
            <CommandList>
              <CommandEmpty>No tag found.</CommandEmpty>
              {tags.map((tag) => {
                const isSelected = value === tag.value;
                const isHovered = hoveredTagValue === tag.value;

                return (
                    <CommandItem
                        key={tag.value}
                        value={tag.value}
                        onSelect={() => {
                          onChange(tag);
                          setOpen(false);
                        }}
                        onMouseEnter={() => setHoveredTagValue(tag.value  ?? null)}
                        onMouseLeave={() => setHoveredTagValue(null)}
                        className="relative flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                      <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tag.color }}
                      />
                        <span>{tag.label}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected && !isHovered && (
                            <Check className="h-4 w-4 text-green-500" />
                        )}

                        {isHovered && onDeleteTag && (
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteTag(tag.id!);
                                  setHoveredTagValue(null);
                                }}
                                className="text-red-600 hover:text-red-800 focus:outline-none"
                                aria-label={`Eliminar tag ${tag.label}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                      </div>
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
            onNewTag(newTag);
            onChange(newTag);
          }}
      />
    </>
  );
};

export default SelectTags;
