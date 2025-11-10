/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAnalytics } from "@/services/analytics";
import {
  getSolutionImages,
  generateSolutionImages as generateSolutionImagesService,
} from "@/services/solutionService";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { useAuth } from "./useAuth";

export const useSolutionImages = (projectId: string, solutionId: string) => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [solutionImages, setSolutionImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { trackAiRequest, trackAiResponse, createTimer } = useAnalytics();
  const { backendUser } = useAuth();

  useEffect(() => {
    try {
      getSolutionImages(projectId, solutionId).then((data) => {
        setSolutionImages(data.urls);
      });
    } catch (e: any) {
      setError(e);
    } finally {
      setInitialLoading(false);
    }
  }, [projectId, solutionId]);

  const generateSolutionImage = async () => {
    setLoading(true);
    const requestId = uuid();
    const timer = createTimer();
    trackAiRequest({
      request_id: requestId,
      user_id: backendUser?.firebaseUid ?? "",
      project_id: projectId,
      request_type: "generate_solution_images",
    });
    try {
      const result = await generateSolutionImagesService(projectId, solutionId);
      setSolutionImages((prev) => [...prev, ...result.urls]);
      trackAiResponse({
        request_id: requestId,
        user_id: backendUser?.firebaseUid ?? "",
        project_id: projectId,
        response_type: "solution_images",
        success: true,
        latency_ms: timer(),
      });
    } catch (e: any) {
      setError(e);
      trackAiResponse({
        request_id: requestId,
        user_id: backendUser?.firebaseUid ?? "",
        project_id: projectId,
        response_type: "solution_images",
        success: false,
        latency_ms: timer(),
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    initialLoading,
    loading,
    error,
    solutionImages,
    generateSolutionImage,
  };
};
