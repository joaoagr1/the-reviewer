import { useEffect, useRef, useState } from 'react'
import { usePersonaStore } from '../store/personaStore'
import { useReviewStore } from '../store/reviewStore'
import { streamReview, OllamaError } from '../services/ollamaService'
import { DocumentInput } from '../components/review/DocumentInput'
import { ReviewResult } from '../components/review/ReviewResult'
import { ReviewHistory } from '../components/review/ReviewHistory'
import type { Review } from '../domain/persona'

type View = 'input' | 'result' | 'history'

export function ReviewPage() {
  const { personas, fetchPersonas } = usePersonaStore()
  const { reviews, fetchReviews, addReview, removeReview } = useReviewStore()

  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null)
  const [document, setDocument] = useState('')
  const [output, setOutput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('input')
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    fetchPersonas()
  }, [fetchPersonas])

  async function handlePersonaChange(id: string) {
    setSelectedPersonaId(id)
    await fetchReviews(id)
  }

  async function handleSubmit() {
    const persona = personas.find((p) => p.id === selectedPersonaId)
    if (!persona) return

    setOutput('')
    setError(null)
    setStreaming(true)
    setView('result')

    const plainText = new DOMParser().parseFromString(document, 'text/html').body.innerText

    const controller = new AbortController()
    abortControllerRef.current = controller

    let result = ''
    try {
      for await (const chunk of streamReview(persona, plainText, controller.signal)) {
        result += chunk
        setOutput((prev) => prev + chunk)
      }

      const titleText = new DOMParser().parseFromString(document, 'text/html').body.innerText
      const review: Review = {
        id: crypto.randomUUID(),
        personaId: persona.id,
        title: titleText.slice(0, 60).trim() || 'Sem título',
        inputDocument: document,
        outputDocument: result,
        createdAt: new Date().toISOString(),
      }
      await addReview(review)
    } catch (e) {
      const msg = e instanceof OllamaError ? e.message : 'Erro inesperado ao revisar.'
      setError(msg)
      setView('input')
    } finally {
      setStreaming(false)
      abortControllerRef.current = null
    }
  }

  function handleCancel() {
    abortControllerRef.current?.abort()
    setStreaming(false)
    setView('input')
  }

  function handleNewReview() {
    setDocument('')
    setOutput('')
    setError(null)
    setView('input')
  }

  function handleSelectHistoryReview(review: Review) {
    setDocument(review.inputDocument)
    setOutput(review.outputDocument)
    setView('result')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Revisar Documento</h1>
        {selectedPersonaId && view !== 'history' && (
          <button
            type="button"
            onClick={() => setView('history')}
            className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
          >
            Ver Histórico ({reviews.length})
          </button>
        )}
        {view === 'history' && (
          <button
            type="button"
            onClick={() => setView('input')}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Voltar
          </button>
        )}
      </div>

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

      {view === 'input' && (
        <DocumentInput
          personas={personas}
          selectedPersonaId={selectedPersonaId}
          onPersonaChange={handlePersonaChange}
          document={document}
          onDocumentChange={setDocument}
          onSubmit={handleSubmit}
          loading={streaming}
        />
      )}

      {view === 'result' && (
        <ReviewResult
          original={document}
          revised={output}
          streaming={streaming}
          onNewReview={handleNewReview}
          onCancel={handleCancel}
        />
      )}

      {view === 'history' && (
        <ReviewHistory
          reviews={reviews}
          personas={personas}
          onSelect={handleSelectHistoryReview}
          onDelete={removeReview}
        />
      )}
    </div>
  )
}
