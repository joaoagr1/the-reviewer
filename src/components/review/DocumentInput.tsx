import type { Persona } from '../../domain/persona'

interface Props {
  personas: Persona[]
  selectedPersonaId: string | null
  onPersonaChange: (id: string) => void
  document: string
  onDocumentChange: (value: string) => void
  onSubmit: () => void
  loading: boolean
}

export function DocumentInput({
  personas,
  selectedPersonaId,
  onPersonaChange,
  document,
  onDocumentChange,
  onSubmit,
  loading,
}: Props) {
  const canSubmit = !!selectedPersonaId && document.trim().length > 0 && !loading

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (canSubmit) onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Persona</label>
        <select
          value={selectedPersonaId ?? ''}
          onChange={(e) => onPersonaChange(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Selecione uma persona...</option>
          {personas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
        <textarea
          value={document}
          onChange={(e) => onDocumentChange(e.target.value)}
          rows={10}
          placeholder="Cole ou digite o documento que deseja revisar..."
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{document.length} / 50.000</p>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Revisando...' : 'Revisar'}
      </button>
    </form>
  )
}
