import { useState } from 'react'
import type { Persona, Review } from '../../domain/persona'
import { ConfirmModal } from '../ConfirmModal'
import { toast } from '../Toast'

interface Props {
  reviews: Review[]
  personas: Persona[]
  onSelect: (review: Review) => void
  onDelete: (id: string) => void
  onRestore?: (review: Review) => void
  dark?: boolean
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ReviewHistory({ reviews, personas, onSelect, onDelete, onRestore, dark }: Props) {
  const [query, setQuery] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const filtered = query.trim()
    ? reviews.filter((r) =>
        r.title.toLowerCase().includes(query.toLowerCase())
      )
    : reviews

  function personaName(personaId: string): string {
    return personas.find((p) => p.id === personaId)?.name ?? '—'
  }

  if (reviews.length === 0) {
    return (
      <p className={`text-sm text-center py-6 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>No reviews yet.</p>
    )
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search reviews..."
        className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${dark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500' : 'border-gray-300'}`}
      />

      {filtered.length === 0 && (
        <p className={`text-sm text-center py-4 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>No reviews found for "{query}".</p>
      )}

      <ul className="space-y-2">
        {filtered.map((review) => (
          <li
            key={review.id}
            className={`border rounded-lg p-3 transition-colors flex items-start gap-2 ${dark ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}
          >
            <button
              type="button"
              onClick={() => onSelect(review)}
              className="flex-1 text-left min-w-0"
            >
              <p className={`text-sm font-medium truncate ${dark ? 'text-gray-200' : 'text-gray-800'}`}>{review.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-blue-500">{personaName(review.personaId)}</span>
                <span className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{formatDate(review.createdAt)}</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setPendingDeleteId(review.id)}
              aria-label="Delete review"
              className={`transition-colors shrink-0 mt-0.5 ${dark ? 'text-gray-600 hover:text-red-400' : 'text-gray-300 hover:text-red-500'}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {pendingDeleteId && (
        <ConfirmModal
          title="Delete review"
          message="Are you sure? This review will be permanently deleted."
          confirmLabel="Delete"
          onConfirm={() => {
            const deleted = reviews.find((r) => r.id === pendingDeleteId)
            onDelete(pendingDeleteId)
            setPendingDeleteId(null)
            if (deleted && onRestore) {
              toast(`"${deleted.title}" deleted`, { label: 'Undo', onClick: () => onRestore(deleted) })
            }
          }}
          onCancel={() => setPendingDeleteId(null)}
          dark={dark}
        />
      )}
    </div>
  )
}
