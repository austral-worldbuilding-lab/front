import { useOverlapReport, useNormalMandalaReport } from "./useReport";
import { generateOverlapReportPDF, generateNormalMandalaReportPDF } from "@/components/download/GeneradorDePDF";

export const useDownloadSummary = (projectId: string, mandalaId: string, mandalaName: string) => {
  const { report: overlapReport, loading: overlapLoading, error: overlapError } = useOverlapReport(projectId, mandalaId);
  const { report: normalReport, loading: normalLoading, error: normalError } = useNormalMandalaReport(projectId, mandalaId);

  const downloadSummary = (isOverlapMandala: boolean = false) => {
    if (isOverlapMandala && overlapReport) {
      const fileName = `${mandalaName}-reporte-comparado.pdf`;
      generateOverlapReportPDF(overlapReport, fileName);
    } else if (!isOverlapMandala && normalReport) {
      const fileName = `${mandalaName}-reporte.pdf`;
      generateNormalMandalaReportPDF(normalReport, fileName);
    } else {
      console.warn("No hay reporte disponible para descargar");
    }
  };

  // Determinar qué reporte usar según el tipo
  const report = overlapReport || normalReport;
  const loading = overlapLoading || normalLoading;
  const error = overlapError || normalError;

  return {
    downloadSummary,
    loading,
    error,
    hasReport: !!report
  };
};
