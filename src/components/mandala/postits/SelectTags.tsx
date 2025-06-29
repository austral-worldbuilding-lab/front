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
import { Check, ChevronsUpDown, PlusCircle, X } from "lucide-react";
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

  const removeTag = (tag: Tag, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((t) => t.value !== tag.value));
  };


  return (
    <>
      <Popover modal open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
              <div
                  onClick={() => setOpen(true)}
                  role="combobox"
                  tabIndex={0}
                  className="w-full cursor-pointer border rounded-md px-3 py-2 min-h-[42px] flex flex-wrap gap-2 items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                  {value.length > 0 ? (
                      value.map((t) => (
                          <span
                              key={t.value}
                              className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-sm"
                          >
                  <span
                      className="w-2 h-2 rounded-full"
                      style={{backgroundColor: t.color}}
                  />
                              {t.name}
                              <button
                                  onClick={(e) => removeTag(t, e)}
                                  className="ml-1 text-gray-500 hover:text-red-500"
                              >
                    <X size={12}/>
                  </button>
                </span>
                      ))
                  ) : (
                      <span className="text-gray-500">Seleccionar tags</span>
                  )}
                  <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50"/>
              </div>

          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
              <Command>
                  <CommandInput placeholder="Buscar tags..."/>
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
                        style={{backgroundColor: tag.color}}
                    />
                      {tag.name}
                  </span>
                                  {isSelected && (
                                      <Check className="ml-auto h-4 w-4 text-green-500"/>
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
        existingTags={tags
            .filter((t) => typeof t.value === "string")
            .map((t) => ({ value: t.value! }))}
      />
    </>
  );
};

export default SelectTags;
