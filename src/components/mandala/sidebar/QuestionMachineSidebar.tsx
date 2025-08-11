import {useEffect, useState} from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ToggleBadge from "@/components/ui/toggle-badge";
import { Sparkles } from "lucide-react";
import Message from "./Message";
import {MessageDTO} from "@/types/mandala";
import {getMessages} from "@/services/chatService.ts";
import {generateQuestionsService} from "@/services/questionMachineService.ts";

interface QuestionMachineSidebarProps {
  mandalaId: string;
  sections?: string[];
  scales?: string[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface QuestionMachineSidebarProps {
  mandalaId: string;
  sections?: string[];
  scales?: string[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const QuestionMachineSidebar: React.FC<QuestionMachineSidebarProps> = ({
  mandalaId,
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
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  useEffect(() => {
    getMessages()
        .then(setMessages)
        .catch((e) => console.error("Error cargando chat:", e));
  }, []);

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

  const handleGenerateQuestions = async () => {
    const selectedDimensions = Object.keys(activeSections).filter((k) => activeSections[k]);
    const selectedScales     = Object.keys(activeScales).filter((k) => activeScales[k]);

    const dims = selectedDimensions.length ? selectedDimensions : sections;
    const scs  = selectedScales.length ? selectedScales : scales;

    setLoadingQuestions(true);
    setQuestionsError(null);
    try {
      const res = await generateQuestionsService(mandalaId, { dimensions: dims, scales: scs });
      // filtrar mensajes vac[ios
      const list = res
          .map((q) => (q.question ?? "").trim())
          .filter(Boolean);
      setQuestions(list);
    } catch (e: any) {
      setQuestionsError(e?.message ?? "Error generando preguntas");
    } finally {
      setLoadingQuestions(false);
    }
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
              className="flex flex-col flex-1 min-h-0 overflow-hidden"             >
              <div className="flex-1 min-h-0">
                <div className="h-full border rounded-lg mb-4 p-4 overflow-y-auto">
                  {loadingQuestions && <p>Generando…</p>}
                  {questionsError && <p className="text-red-600">{questionsError}</p>}

                  {!loadingQuestions && !questionsError && questions.length === 0 && (
                      <p>No hay preguntas para mostrar.</p>
                  )}

                  {!loadingQuestions && !questionsError && questions.length > 0 && (
                      questions.map((q, index) => (
                          <Message key={index} message={q} isUser={true} />
                      ))
                  )}
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
                    icon={<Sparkles size={16}/>}
                    onClick={handleGenerateQuestions}
                  >
                    Generar Preguntas
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="chat" className="flex-1 p-4">
              <div className="h-full flex flex-col">
                <div className="flex-1 border rounded-lg p-4 mb-4">
                  {messages.length === 0 ? (
                      <p className="text-gray-500">No hay mensajes para mostrar…</p>
                  ) : (
                      <div className="flex flex-col gap-2">
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex ${m.isUser ? "justify-end" : "justify-start"}`}
                            >
                              <Message
                                  isUser={m.isUser}
                                  message={m.content}
                              />
                            </div>
                        ))}
                      </div>
                  )}                </div>
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
