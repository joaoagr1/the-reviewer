import { useEffect, useRef, useState } from 'react'
import { marked } from 'marked'
import { usePersonaStore } from '../store/personaStore'
import { useReviewStore } from '../store/reviewStore'
import { streamReview, OllamaError } from '../services/ollamaService'
import { DocumentInput } from '../components/review/DocumentInput'
import { ReviewResult } from '../components/review/ReviewResult'
import { ReviewHistory } from '../components/review/ReviewHistory'
import type { Review } from '../domain/persona'

type View = 'input' | 'result' | 'history'

export function ReviewPage({ dark }: { dark: boolean }) {
  const { personas, fetchPersonas } = usePersonaStore()
  const { reviews, fetchReviews, addReview, removeReview } = useReviewStore()

  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(() =>
    localStorage.getItem('review_selectedPersonaId') ?? null
  )
  const [document, setDocument] = useState(() =>
    localStorage.getItem('review_document') ?? ''
  )
  const [output, setOutput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('input')
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    fetchPersonas()
  }, [fetchPersonas])

  useEffect(() => {
    if (selectedPersonaId) localStorage.setItem('review_selectedPersonaId', selectedPersonaId)
    else localStorage.removeItem('review_selectedPersonaId')
  }, [selectedPersonaId])

  useEffect(() => {
    localStorage.setItem('review_document', document)
  }, [document])

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

      const html = await marked.parse(result)
      setOutput(html)

      const titleText = new DOMParser().parseFromString(document, 'text/html').body.innerText
      const review: Review = {
        id: crypto.randomUUID(),
        personaId: persona.id,
        title: titleText.slice(0, 60).trim() || 'Untitled',
        inputDocument: document,
        outputDocument: html,
        createdAt: new Date().toISOString(),
      }
      await addReview(review)
    } catch (e) {
      const msg = e instanceof OllamaError ? e.message : 'Unexpected error during review.'
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

  async function handleSelectHistoryReview(review: Review) {
    setDocument(review.inputDocument)
    const isHtml = /<[a-z][\s\S]*>/i.test(review.outputDocument)
    const output = isHtml
      ? review.outputDocument
      : await marked.parse(review.outputDocument)
    setOutput(output)
    setView('result')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-xl font-semibold ${dark ? 'text-gray-100' : 'text-gray-900'}`}>Review Document</h1>
        {selectedPersonaId && view !== 'history' && (
          <button
            type="button"
            onClick={() => setView('history')}
            className={`text-sm hover:underline ${dark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
            History ({reviews.length})
          </button>
        )}
        {view === 'history' && (
          <button
            type="button"
            onClick={() => setView('input')}
            className="text-sm text-blue-500 hover:underline"
          >
            ← Back
          </button>
        )}
      </div>

      {personas.length === 0 && (
        <p className={`text-sm border rounded p-3 ${dark ? 'text-amber-400 bg-amber-950/30 border-amber-800' : 'text-amber-600 bg-amber-50 border-amber-200'}`}>
          No personas yet. Create a persona before reviewing.
        </p>
      )}

      {error && (
        <p className={`text-sm border rounded p-3 ${dark ? 'text-red-400 bg-red-950/30 border-red-800' : 'text-red-600 bg-red-50 border-red-200'}`}>
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
          dark={dark}
        />
      )}

      {view === 'result' && (
        <ReviewResult
          original={document}
          revised={output}
          streaming={streaming}
          onNewReview={handleNewReview}
          onCancel={handleCancel}
          dark={dark}
        />
      )}

      {view === 'history' && (
        <ReviewHistory
          reviews={reviews}
          personas={personas}
          onSelect={handleSelectHistoryReview}
          onDelete={removeReview}
          onRestore={addReview}
          dark={dark}
        />
      )}
    </div>
  )
}
