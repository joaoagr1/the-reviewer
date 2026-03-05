import { DiffViewer } from './DiffViewer'

interface Props {
  original: string
  revised: string
  streaming: boolean
  onNewReview: () => void
  onCancel: () => void
}

export function ReviewResult({ original, revised, streaming, onNewReview, onCancel }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-gray-800">
          {streaming ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Revisando...
            </span>
          ) : (
            'Revisão concluída'
          )}
        </h2>
        {streaming ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-red-500 hover:text-red-700 border border-red-300 rounded px-3 py-1 hover:bg-red-50 transition-colors"
          >
            Cancelar
          </button>
        ) : (
          <button
            type="button"
            onClick={onNewReview}
            className="text-sm text-blue-600 hover:underline"
          >
            Nova Revisão
          </button>
        )}
      </div>

      <DiffViewer original={original} revised={revised} />
    </div>
  )
}
