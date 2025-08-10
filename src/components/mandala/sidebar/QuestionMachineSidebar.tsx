import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ToggleBadge from "@/components/ui/toggle-badge";
import { Sparkles } from "lucide-react";
import Message from "./Message";

interface QuestionMachineSidebarProps {
  sections?: string[];
  scales?: string[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const QuestionMachineSidebar: React.FC<QuestionMachineSidebarProps> = ({
  sections = ["Seccion 1", "Seccion 2", "Seccion 2"],
  scales = ["Escala 1", "Escala 2", "Escala 2"],
  open = false,
  onOpenChange,
}) => {
  const [activeTab, setActiveTab] = useState("questions");
  const [activeSections, setActiveSections] = useState<Record<string, boolean>>(
    {}
  );
  const [activeScales, setActiveScales] = useState<Record<string, boolean>>({});

  const handleSectionToggle = (section: string) => {
    setActiveSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleScaleToggle = (scale: string) => {
    setActiveScales((prev) => ({
      ...prev,
      [scale]: !prev[scale],
    }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[500px] px-4 py-[20px]">
        <div className="h-full flex flex-col">
          <Tabs
            defaultValue="questions"
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full"
          >
            <TabsList className="mt-6">
              <TabsTrigger value="questions">Máquina de preguntas</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
            </TabsList>
            <TabsContent
              value="questions"
              className="flex flex-col flex-1 justify-between"
            >
              <div className="flex flex-col h-[70%]">
                <div className="relative w-full border rounded-lg mb-4 p-4 overflow-y-auto h-full">
                  <Message
                    message="Como es la economía en tu hogar?"
                    isUser={false}
                  />
                  <Message message="Que suelen comprar?" isUser={false} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex-1 flex flex-col gap-1">
                  <h3 className="mb-2 font-bold text-sm">Secciones</h3>
                  <div className="flex gap-2 max-w-full overflow-x-auto custom-scrollbar pb-3">
                    {sections.map((section, index) => (
                      <ToggleBadge
                        key={index}
                        label={section}
                        isActive={activeSections[section] || false}
                        onToggle={() => handleSectionToggle(section)}
                      />
                    ))}
                  </div>

                  <h3 className="mb-2 font-bold text-sm">Escalas</h3>
                  <div className="flex gap-2 max-w-full overflow-x-auto custom-scrollbar pb-3">
                    {scales.map((scale, index) => (
                      <ToggleBadge
                        key={index}
                        label={scale}
                        isActive={activeScales[scale] || false}
                        onToggle={() => handleScaleToggle(scale)}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-auto">
                  <Button
                    className="w-full"
                    size="lg"
                    variant="filled"
                    color="primary"
                    icon={<Sparkles size={16} />}
                  >
                    Generar Preguntas
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="chat" className="flex-1 p-4">
              <div className="h-full flex flex-col">
                <div className="flex-1 border rounded-lg p-4 mb-4">
                  <p className="text-gray-500">El chat aparecerá aquí...</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribe un mensaje..."
                    className="flex-1 border p-2 rounded-md"
                  />
                  <Button>Enviar</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default QuestionMachineSidebar;
