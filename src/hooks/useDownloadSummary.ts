import { useReport } from "./useReport";
import { generateReportPDF } from "@/components/download/GeneradorDePDF";

export const useDownloadSummary = (projectId: string, mandalaId: string, mandalaName: string) => {
  const { report, loading, error } = useReport(projectId, mandalaId);

  const downloadSummary = () => {
    if (!report) {
      console.warn("No hay reporte disponible para descargar");
      return;
    }

    const fileName = `${mandalaName}-reporte.pdf`;
    generateReportPDF(report, fileName);
  };

  return {
    downloadSummary,
    loading,
    error,
    hasReport: !!report
  };
};
