import { jsPDF } from "jspdf"
import { AiOverlapMandalaReport } from "@/hooks/useReport"

export type PDFSection = {
    title: string;
    content: string | string[];
}

export function generatePDF(sections: PDFSection[], fileName = "documento.pdf") {
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

    sections.forEach(section => {
        addSection(section.title, section.content)
    })

    doc.save(fileName)
}

// Para reportes de mandalas comparadas (OVERLAP) - reporte complejo
export function generateOverlapReportPDF(report: AiOverlapMandalaReport, fileName = "reporte-comparado.pdf") {
    const sections: PDFSection[] = [
        {
            title: "Resumen",
            content: report.summary
        },
        {
            title: "Coincidencias",
            content: report.coincidences
        },
        {
            title: "Tensiones",
            content: report.tensions
        },
        {
            title: "Insights",
            content: report.insights
        }
    ]

    generatePDF(sections, fileName)
}

// Para reportes de mandalas normales - reporte simple (string)
export function generateNormalMandalaReportPDF(report: string, fileName = "reporte-mandala.pdf") {
    const sections: PDFSection[] = [
        {
            title: "Resumen de la Mandala",
            content: report
        }
    ]

    generatePDF(sections, fileName)
}

