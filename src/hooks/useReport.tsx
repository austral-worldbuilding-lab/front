import { useState, useEffect } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/config/firebase"

export type AiOverlapMandalaReport = {
    summary: string
    coincidences: string[]
    tensions: string[]
    insights: string[]
}

// Hook base reutilizable para leer datos de Firestore
function useFirestoreDocument<T>(projectId: string, mandalaId: string, fieldName: string) {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!projectId || !mandalaId) return
        setLoading(true)

        const ref = doc(db, projectId, mandalaId)
        const unsub = onSnapshot(
            ref,
            (snap) => {
                if (snap.exists()) {
                    const docData = snap.data()
                    setData(docData[fieldName] ?? null)
                } else {
                    setData(null)
                }
                setLoading(false)
            },
            (err) => {
                setError(err)
                setLoading(false)
            }
        )

        return () => unsub()
    }, [projectId, mandalaId, fieldName])

    return { data, loading, error }
}

// Hook específico para reportes de mandalas comparadas (OVERLAP_SUMMARY)
export function useOverlapReport(projectId: string, mandalaId: string) {
    const { data: summaryReport, loading, error } = useFirestoreDocument<AiOverlapMandalaReport>(
        projectId,
        mandalaId,
        'summaryReport'
    )

    return { report: summaryReport, loading, error }
}

// Hook específico para reportes de mandalas normales (CHARACTER, etc.)
export function useNormalMandalaReport(projectId: string, mandalaId: string) {
    const { data: summaryReport, loading, error } = useFirestoreDocument<string>(
        projectId,
        mandalaId,
        'summaryReport'
    )

    return { report: summaryReport, loading, error }
}
