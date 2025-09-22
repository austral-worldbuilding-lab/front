import { jsPDF } from "jspdf"
import { AiMandalaReport } from "@/hooks/useReport"

export function generateReportPDF(report: AiMandalaReport, fileName = "reporte.pdf") {
    const doc = new jsPDF()
    const margin = 15
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2

    let cursorY = margin

    const addSection = (title: string, content: string | string[]) => {
        doc.setFont("helvetica", "bold")
        doc.text(title, margin, cursorY)
        cursorY += 8

        doc.setFont("helvetica", "normal")
        if (Array.isArray(content)) {
            content.forEach((item) => {
                const lines = doc.splitTextToSize(`- ${item}`, pageWidth)
                lines.forEach((line: string) => {
                    if (cursorY > 280) {
                        doc.addPage()
                        cursorY = margin
                    }
                    doc.text(line, margin + 5, cursorY)
                    cursorY += 6
                })
            })
        } else {
            const lines = doc.splitTextToSize(content, pageWidth)
            lines.forEach((line: string) => {
                if (cursorY > 280) {
                    doc.addPage()
                    cursorY = margin
                }
                doc.text(line, margin, cursorY)
                cursorY += 6
            })
        }
        cursorY += 10
    }

    addSection("Resumen", report.summary)
    addSection("Coincidencias", report.coincidences)
    addSection("Tensiones", report.tensions)
    addSection("Insights", report.insights)

    doc.save(fileName)
}
