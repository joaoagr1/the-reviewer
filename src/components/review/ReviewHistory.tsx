import type { Review } from '../../domain/persona'

interface Props {
  reviews: Review[]
  onSelect: (review: Review) => void
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

function truncate(text: string, max = 80): string {
  return text.length > max ? text.slice(0, max) + '...' : text
}

export function ReviewHistory({ reviews, onSelect }: Props) {
  if (reviews.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-6">Nenhuma revisão encontrada.</p>
    )
  }

  return (
    <ul className="space-y-2">
      {reviews.map((review) => (
        <li key={review.id}>
          <button
            type="button"
            onClick={() => onSelect(review)}
            className="w-full text-left border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
          >
            <p className="text-xs text-gray-400 mb-1">{formatDate(review.createdAt)}</p>
            <p className="text-sm text-gray-700 truncate">{truncate(review.inputDocument)}</p>
          </button>
        </li>
      ))}
    </ul>
  )
}
