import { useState, useEffect } from "react";
import useProvocations from "@/hooks/useProvocations";
import { Button } from "../ui/button";
import { ExternalLink, History, Lightbulb, Sparkles } from "lucide-react";
import TimelineTree from "./TimelineTree";
import useTimeline from "@/hooks/useTimeline";
import { useNavigate } from "react-router-dom";
import { ProvocationDialog } from "./ProvocationDialog";
import { ProvocationItem } from "./ProvocationItem";
import useProject from "@/hooks/useProject";
import { useProjectBreadcrumb } from "@/hooks/useProjectBreadcrumb";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";

export type ProvocationsSectionProps = {
  organizationId: string;
  projectId: string;
};

export const ProvocationsSection = ({
  organizationId,
  projectId,
}: ProvocationsSectionProps) => {
  const {
    provocations,
    createManual,
    generateAI,
    deleteProvocation,
    loading: loadingAI,
    deletingId,
    error,
  } = useProvocations(projectId);
  const { data, loading, reload: reloadTimeline } = useTimeline(projectId);
  const navigate = useNavigate();
  const { project } = useProject(projectId);
  const { push } = useProjectBreadcrumb();
  
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  useEffect(() => {
    if (error) {
      setShowErrorDialog(true);
    }
  }, [error]);

  const handleClick = () => {
    push({
      title: project!.name,
      url: `/app/organization/${organizationId}/projects/${project!.id}`,
    });
  };

  const handleGenerateAI = async () => {
    await generateAI();
  };

  const handleDeleteProvocation = async (provocationId: string) => {
    await deleteProvocation(provocationId);
    reloadTimeline();
  };

  return (
    <div className="w-full flex flex-col gap-4 p-5 border border-gray-200 rounded-xl bg-white max-h-[500px] overflow-hidden">
      <div className="flex flex-row gap-2 justify-between shrink-0">
        <div className="flex flex-row gap-3 items-center">
          <History />
          <span className="font-semibold text-xl text-foreground">
            Provocaciones
          </span>
        </div>

        <ProvocationDialog onSave={createManual} />
      </div>
      <div className="flex-1 w-full flex flex-row gap-4 overflow-hidden">
        <div className="flex flex-col flex-1 border border-gray-200 rounded-xl p-4 gap-4 overflow-hidden">
          <div className="w-full flex flex-row justify-between items-center shrink-0">
            <div className="flex flex-row gap-2">
              <Lightbulb />
              <span className="font-semibold text-l text-foreground">
                Ideas
              </span>
            </div>
            <Button
              onClick={handleGenerateAI}
              loading={loadingAI}
              color="primary"
              variant="outline"
              icon={<Sparkles size={16} />}
            >
              Generar
            </Button>
          </div>
          <div className="flex flex-1 border border-gray-200 rounded-xl overflow-hidden">
            <div className="w-full h-full overflow-y-auto custom-scrollbar">
              {provocations.length === 0 && (
                <p className="p-4 text-gray-600 text-center w-full h-full flex items-center justify-center">
                  No hay provocaciones creadas aún
                </p>
              )}
              {provocations.map((provocation, index) => (
                <ProvocationItem 
                  key={provocation.id || index} 
                  provocation={provocation} 
                  index={index} 
                  projectId={projectId}
                  onDelete={handleDeleteProvocation}
                  deleting={deletingId === provocation.id}
                />
              ))}
            </div>
          </div>
        </div>
        {loading && (
          <div className="flex flex-1 items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        {data && (
          <div className="relative flex flex-col border border-gray-200 rounded-xl flex-1">
            <Button
              className="rounded-xl absolute right-0"
              color={"white"}
              icon={<ExternalLink />}
              onClick={() =>
                navigate(
                  `/app/organization/${organizationId}/projects/${projectId}/timeline`
                )
              }
            />
            <TimelineTree
              className="rounded-xl"
              data={data}
              onProjectClick={handleClick}
            ></TimelineTree>
          </div>
        )}
      </div>
      
      <ConfirmationDialog
        isOpen={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        title="No se puede generar provocación"
        description={error || "Ha ocurrido un error al intentar generar provocaciones. Por favor, verifica los requisitos del proyecto."}
        confirmText="Entendido"
        onConfirm={() => setShowErrorDialog(false)}
      />
    </div>
  );
};
