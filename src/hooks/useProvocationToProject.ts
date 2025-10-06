import { useNavigate, useParams } from "react-router-dom";
import { provocationsService } from "@/services/provocationService";
import { createProjectFromProvocationId } from "@/services/projectService";
import useProvocations from "@/hooks/useProvocations";
import { Provocation } from "@/types/mandala";

export default function useProvocationToProject() {
    const { projectId, organizationId } = useParams<{
        organizationId: string;
        projectId: string;
    }>();
    const navigate = useNavigate();
    const { linkProvocationToProject } = useProvocations(projectId!);

    const provocationToProject = async (provocation: Provocation, onClose?: () => void) => {
        if (!provocation) return;

        try {


            let provId = provocation.id;
            if (provocation.isCached) {
                const saved = await provocationsService.createManualProvocation(projectId!, {
                    projectsOrigin: provocation.projectsOrigin ?? [],
                    title: provocation.title,
                    question: provocation.question,
                    description: provocation.description
                });
                provId = saved.id;
            }

            const newProject = await createProjectFromProvocationId({
                fromProvocationId: provId,
                organizationId: organizationId!,
            });

            linkProvocationToProject(provId, newProject.id);

            onClose?.();
            navigate(`/app/organization/${organizationId}/projects/${newProject.id}`);
        } catch (err) {
            console.error(err);
            alert("No se pudo crear el mundo a partir de esta provocación.");
        }
    };

    return { provocationToProject };
}
