import { Sheet, SheetContent } from "@/components/ui/sheet";
import GeneratorTab from "@/components/mandala/sidebar/GeneratorTab.tsx";
import { Tag } from "@/types/mandala";

export interface QuestionMachineSidebarProps {
  mandalaId: string;
  organizationId: string;
  projectId: string;
  sections?: string[];
  scales?: string[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  tags: Tag[];
  onNewTag: (tag: Tag) => void;
  onCreatePostIt: (
    content: string,
    tags: Tag[],
    postItFatherId?: string
  ) => void;
  dimensionsMandala: { name: string; color: string }[];
}

const DEFAULT_SECTIONS = [
  "ECOLOGÍA",
  "GOBIERNO",
  "ECONOMÍA",
  "INFRAESTRUCTURA",
];
const DEFAULT_SCALES = ["MI ESQUINA", "CIUDAD / BARRIO", "PROVINCIA"];

export default function QuestionMachineSidebar({
  mandalaId,
  organizationId,
  projectId,
  sections = DEFAULT_SECTIONS,
  scales = DEFAULT_SCALES,
  open = true,
  onOpenChange,
  tags,
  onNewTag,
  onCreatePostIt,
  dimensionsMandala,
}: QuestionMachineSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[500px] px-4 py-[40px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="h-full flex flex-col">
          <GeneratorTab
            mandalaId={mandalaId}
            organizationId={organizationId}
            projectId={projectId}
            sections={sections}
            scales={scales}
            tags={tags}
            onCreatePostIt={onCreatePostIt}
            onNewTag={onNewTag}
            dimensionsMandala={dimensionsMandala}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

