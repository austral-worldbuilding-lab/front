/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getSolutionImages,
  generateSolutionImages as generateSolutionImagesService,
} from "@/services/solutionService";
import { useEffect, useState } from "react";

export const useSolutionImages = (projectId: string, solutionId: string) => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [solutionImages, setSolutionImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

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
    try {
      const result = await generateSolutionImagesService(projectId, solutionId);
      setSolutionImages((prev) => [...prev, ...result.urls]);
    } catch (e: any) {
      setError(e);
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
