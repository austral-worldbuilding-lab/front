import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneratorTab from "@/components/mandala/sidebar/GeneratorTab.tsx";
import ChatPanel from "@/components/mandala/sidebar/ChatPanel.tsx";
import { Tag } from "@/types/mandala";

export interface QuestionMachineSidebarProps {
  mandalaId: string;
  sections?: string[];
  scales?: string[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  tags: Tag[];
  onNewTag: (tag: Tag) => void;
  onCreatePostIt: (content: string, tags: Tag[], postItFatherId?: string) => void;
}

const DEFAULT_SECTIONS = ["ECOLOGÍA", "GOBIERNO", "ECONOMÍA", "INFRAESTRUCTURA"];
const DEFAULT_SCALES   = ["MI ESQUINA", "CIUDAD / BARRIO", "PROVINCIA"];

export default function QuestionMachineSidebar({
                                                   mandalaId,
                                                   sections = DEFAULT_SECTIONS,
                                                   scales   = DEFAULT_SCALES,
                                                   open = true,
                                                   onOpenChange,
                                                   tags,
                                                   onNewTag,
                                                   onCreatePostIt,
                                               }: QuestionMachineSidebarProps) {
  const [activeTopTab, setActiveTopTab] = useState<"generator" | "chat">("generator");

  return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-[500px] px-4 py-[20px]">
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
                    sections={sections}
                    scales={scales}
                    tags={tags}
                    onCreatePostIt={onCreatePostIt}
                    onNewTag={onNewTag}
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
