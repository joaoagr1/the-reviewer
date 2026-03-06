import { useState } from 'react'
import type { Persona, Review } from '../../domain/persona'
import { ConfirmModal } from '../ConfirmModal'

interface Props {
  reviews: Review[]
  personas: Persona[]
  onSelect: (review: Review) => void
  onDelete: (id: string) => void
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

export function ReviewHistory({ reviews, personas, onSelect, onDelete }: Props) {
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
      <p className="text-gray-400 text-sm text-center py-6">Nenhuma revisão encontrada.</p>
    )
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar revisões..."
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {filtered.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-4">Nenhuma revisão encontrada para "{query}".</p>
      )}

      <ul className="space-y-2">
        {filtered.map((review) => (
          <li
            key={review.id}
            className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors flex items-start gap-2"
          >
            <button
              type="button"
              onClick={() => onSelect(review)}
              className="flex-1 text-left min-w-0"
            >
              <p className="text-sm font-medium text-gray-800 truncate">{review.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-blue-600">{personaName(review.personaId)}</span>
                <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setPendingDeleteId(review.id)}
              aria-label="Excluir revisão"
              className="text-gray-300 hover:text-red-500 transition-colors shrink-0 mt-0.5"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {pendingDeleteId && (
        <ConfirmModal
          title="Excluir revisão"
          message="Tem certeza? Esta revisão será removida permanentemente."
          confirmLabel="Excluir"
          onConfirm={() => { onDelete(pendingDeleteId); setPendingDeleteId(null) }}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </div>
  )
}
