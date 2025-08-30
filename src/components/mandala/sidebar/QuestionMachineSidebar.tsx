import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneratorTab from "@/components/mandala/sidebar/GeneratorTab.tsx";
import ChatPanel from "@/components/mandala/sidebar/ChatPanel.tsx";
import { Tag } from "@/types/mandala";
import { PanelLeftClose } from "lucide-react";

export interface QuestionMachineSidebarProps {
  mandalaId: string;
  organizationId: string;
  projectId: string
  sections?: string[];
  scales?: string[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  tags: Tag[];
  onNewTag: (tag: Tag) => void;
  onCreatePostIt: (content: string, tags: Tag[], postItFatherId?: string) => void;
  dimensionsMandala: { name: string; color: string }[];
}

const DEFAULT_SECTIONS = ["ECOLOGÍA", "GOBIERNO", "ECONOMÍA", "INFRAESTRUCTURA"];
const DEFAULT_SCALES   = ["MI ESQUINA", "CIUDAD / BARRIO", "PROVINCIA"];

export default function QuestionMachineSidebar({
                                                   mandalaId,
                                                   organizationId,
                                                   projectId,
                                                   sections = DEFAULT_SECTIONS,
                                                   scales   = DEFAULT_SCALES,
                                                   open = true,
                                                   onOpenChange,
                                                   tags,
                                                   onNewTag,
                                                   onCreatePostIt,
                                                   dimensionsMandala
                                               }: QuestionMachineSidebarProps) {
  const [activeTopTab, setActiveTopTab] = useState<"generator" | "chat">("generator");

  // Función para cerrar manualmente
  const handleManualClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
      <Sheet open={open} modal={false}>
        <SheetContent 
          side="left" 
          className="w-[500px] px-4 py-[20px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
          closeIcon={
            <PanelLeftClose 
              className="size-6 cursor-pointer text-[#797979]" 
              onClick={handleManualClose}
            />
          }
        >
          <div className="h-full flex flex-col">
            <Tabs
                value={activeTopTab}
                onValueChange={(v) => setActiveTopTab(v as any)}
                className="flex-1 flex flex-col min-h-0"
            >
              <div className="px-4 pt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="generator">Generador</TabsTrigger>
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                  value="generator"
                  className="flex-1 min-h-0 flex flex-col"
              >
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
              </TabsContent>

              <TabsContent value="chat" className="flex-1 min-h-0 flex flex-col">
                <ChatPanel mandalaId={mandalaId} />
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
  );
}
