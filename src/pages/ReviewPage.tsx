import { useEffect, useState } from 'react'
import { usePersonaStore } from '../store/personaStore'
import { useReviewStore } from '../store/reviewStore'
import { streamReview, OllamaError } from '../services/ollamaService'
import { DocumentInput } from '../components/review/DocumentInput'
import { ReviewResult } from '../components/review/ReviewResult'
import type { Review } from '../domain/persona'

export function ReviewPage() {
  const { personas, fetchPersonas } = usePersonaStore()
  const { addReview } = useReviewStore()

  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null)
  const [document, setDocument] = useState('')
  const [output, setOutput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetchPersonas()
  }, [fetchPersonas])

  async function handleSubmit() {
    const persona = personas.find((p) => p.id === selectedPersonaId)
    if (!persona) return

    setOutput('')
    setError(null)
    setDone(false)
    setStreaming(true)

    let result = ''
    try {
      for await (const chunk of streamReview(persona, document)) {
        result += chunk
        setOutput((prev) => prev + chunk)
      }

      const review: Review = {
        id: crypto.randomUUID(),
        personaId: persona.id,
        inputDocument: document,
        outputDocument: result,
        createdAt: new Date().toISOString(),
      }
      await addReview(review)
      setDone(true)
    } catch (e) {
      const msg = e instanceof OllamaError ? e.message : 'Erro inesperado ao revisar.'
      setError(msg)
    } finally {
      setStreaming(false)
    }
  }

  function handleNewReview() {
    setDocument('')
    setOutput('')
    setError(null)
    setDone(false)
  }

  const showResult = streaming || done

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Revisar Documento</h1>

      {personas.length === 0 && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-3">
          Nenhuma persona criada. Crie uma persona antes de revisar.
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </p>
      )}

      {!showResult ? (
        <DocumentInput
          personas={personas}
          selectedPersonaId={selectedPersonaId}
          onPersonaChange={setSelectedPersonaId}
          document={document}
          onDocumentChange={setDocument}
          onSubmit={handleSubmit}
          loading={streaming}
        />
      ) : (
        <ReviewResult
          original={document}
          revised={output}
          streaming={streaming}
          onNewReview={handleNewReview}
        />
      )}
    </div>
  )
}
