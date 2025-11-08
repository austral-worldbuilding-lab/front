import { useEffect, useState, useCallback } from "react";
import { getTimelineForProject } from "@/services/projectService";
import { buildTimelineTree } from "@/utils/timelineUtils";
import {TimelineNode} from "@/components/project/TimelineTree.tsx";

export default function useTimeline(projectId?: string) {
    const [data, setData] = useState<TimelineNode | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const reload = useCallback(() => {
        if (!projectId) return;

        setLoading(true);
        getTimelineForProject(projectId)
            .then((response) => {
                setData(buildTimelineTree(response.nodes, response.edges, projectId));
            })
            .catch((err) => {
                console.error(err);
                setError(err);
            })
            .finally(() => setLoading(false));
    }, [projectId]);

    useEffect(() => {
        reload();
    }, [reload]);

    return { data, loading, error, reload };
}
