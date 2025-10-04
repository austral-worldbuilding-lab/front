import useProvocations from "@/hooks/useProvocations";
import { Button } from "../ui/button";
import { ExternalLink, History, Lightbulb, Sparkles } from "lucide-react";
import TimelineTree from "./TimelineTree";
import useTimeline from "@/hooks/useTimeline";
import { useNavigate } from "react-router-dom";
import { ProvocationDialog } from "./ProvocationDialog";

export type ProvocationsSectionProps = {
  organizationId: string;
  projectId: string;
};

export const ProvocationsSection = ({
  organizationId,
  projectId,
}: ProvocationsSectionProps) => {
  const { provocations, createManual, generateAI } = useProvocations(projectId);
  const { data, loading } = useTimeline(projectId);
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col gap-4 p-4 align-middle border border-gray-200 rounded-xl bg-white overflow-hidden min-h-0">
      <div className="flex flex-row gap-2 justify-between shrink-0">
        <div className="flex flex-row gap-3 align-middle">
          <History />
          <span className="font-semibold text-xl text-foreground">
            Provocaciones
          </span>
        </div>

        <ProvocationDialog onSave={createManual} />
      </div>
      <div className="flex-1 w-full flex flex-row gap-4 overflow-hidden min-h-0">
        <div className="flex flex-col flex-1 border border-gray-200 rounded-xl p-4 gap-4 overflow-hidden min-h-0">
          <div className="w-full flex flex-row justify-between align-middle shrink-0">
            <div className="flex flex-row gap-2">
              <Lightbulb />
              <span className="font-semibold text-l text-foreground">
                Ideas
              </span>
            </div>
            <Button onClick={generateAI} color="secondary" icon={<Sparkles />}>
              Generar
            </Button>
          </div>
          <div className="flex-1 border border-gray-200 rounded-xl overflow-y-auto min-h-0">
            {provocations.map((provocation, index) => (
              <div className="flex flex-col">
                {index !== 0 && <hr className="border-t border-gray-200" />}
                <div className="flex flex-col p-3">
                  <span className="font-semibold text-foreground">
                    {provocation.title}
                  </span>
                  <span className="text-foreground">
                    {provocation.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {loading && (
          <div className="flex-1 justify-center align-middle">
            <span>Cargando Timeline</span>
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
            <TimelineTree data={data}></TimelineTree>
          </div>
        )}
      </div>
    </div>
  );
};
