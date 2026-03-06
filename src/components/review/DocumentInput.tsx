import { useEffect, useState } from 'react'
import type { Persona } from '../../domain/persona'
import { RichTextEditor } from '../RichTextEditor'

interface Props {
  personas: Persona[]
  selectedPersonaId: string | null
  onPersonaChange: (id: string) => void
  document: string
  onDocumentChange: (value: string) => void
  onSubmit: () => void
  loading: boolean
  dark?: boolean
}

export function DocumentInput({
  personas,
  selectedPersonaId,
  onPersonaChange,
  document,
  onDocumentChange,
  onSubmit,
  loading,
  dark,
}: Props) {
  const [charCount, setCharCount] = useState(0)
  const canSubmit = !!selectedPersonaId && document.trim().length > 0 && !loading

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (canSubmit) onSubmit()
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && canSubmit) {
        e.preventDefault()
        onSubmit()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [canSubmit, onSubmit])

  const selectCls = `w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${dark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 bg-white'}`
  const labelCls = `block text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>Persona</label>
        <select
          value={selectedPersonaId ?? ''}
          onChange={(e) => onPersonaChange(e.target.value)}
          className={selectCls}
        >
          <option value="">Select a persona...</option>
          {personas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls}>Document</label>
        <RichTextEditor
          value={document}
          onChange={(html, text) => {
            onDocumentChange(html)
            setCharCount(text.length)
          }}
          placeholder="Paste or type the document you want to review..."
          minHeight="240px"
          dark={dark}
        />
        <p className={`text-xs mt-1 text-right ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{charCount} / 50,000</p>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? 'Reviewing...' : 'Review'}
        {!loading && <span className="text-xs opacity-60">Ctrl+Enter</span>}
      </button>
    </form>
  )
}
