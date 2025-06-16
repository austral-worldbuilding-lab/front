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

export interface Tag {
  label: string;
  value: string;
  color: string;
}

interface SelectTagsProps {
  tags: Tag[];
  value: string;
  onChange: (tag: Tag) => void;
  onNewTag: (tag: Tag) => void;
}

const SelectTags = ({ tags, value, onChange, onNewTag }: SelectTagsProps) => {
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
              {tags.map((tag) => (
                <CommandItem
                  key={tag.value}
                  value={tag.value}
                  onSelect={() => {
                    onChange(tag);
                    setOpen(false);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.label}
                  </span>
                  {value === tag.value && (
                    <Check className="ml-auto h-4 w-4 text-green-500" />
                  )}
                </CommandItem>
              ))}
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
