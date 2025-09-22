import { useState, useEffect } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/config/firebase"

export type AiMandalaReport = {
    summary: string
    coincidences: string[]
    tensions: string[]
    insights: string[]
}

export function useReport(projectId: string, mandalaId: string) {
    const [report, setReport] = useState<AiMandalaReport | null>(null)
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
                    const data = snap.data()
                    setReport(data.report ?? null)
                } else {
                    setReport(null)
                }
                setLoading(false)
            },
            (err) => {
                setError(err)
                setLoading(false)
            }
        )

        return () => unsub()
    }, [projectId, mandalaId])

    return { report, loading, error }
}
