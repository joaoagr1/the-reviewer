import { useState } from 'react'
import type { Example } from '../../domain/persona'
import { createExample } from '../../domain/persona'
import { RichTextEditor } from '../RichTextEditor'

interface Props {
  examples: Example[]
  onChange: (examples: Example[]) => void
}

export function ExampleEditor({ examples, onChange }: Props) {
  const [original, setOriginal] = useState('')
  const [revised, setRevised] = useState('')
  const [notes, setNotes] = useState('')
  const [open, setOpen] = useState(false)

  function addExample() {
    if (!original.trim() || !revised.trim()) return
    onChange([...examples, createExample(original.trim(), revised.trim(), notes.trim())])
    setOriginal('')
    setRevised('')
    setNotes('')
    setOpen(false)
  }

  function removeExample(id: string) {
    onChange(examples.filter((e) => e.id !== id))
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Exemplos de Treinamento ({examples.length})
      </label>

      <ul className="space-y-2">
        {examples.map((ex, i) => (
          <li key={ex.id} className="border border-gray-200 rounded p-3 text-sm space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-600">Exemplo {i + 1}</span>
              <button
                type="button"
                onClick={() => removeExample(ex.id)}
                aria-label={`Remover exemplo ${i + 1}`}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                Remover
              </button>
            </div>
            <p className="text-gray-500 truncate">
              <span className="font-medium">Original:</span> {ex.original}
            </p>
            <p className="text-gray-500 truncate">
              <span className="font-medium">Revisado:</span> {ex.revised}
            </p>
          </li>
        ))}
      </ul>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm text-blue-600 hover:underline"
        >
          + Adicionar Exemplo
        </button>
      ) : (
        <div className="border border-gray-200 rounded p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Documento Original
            </label>
            <RichTextEditor
              value={original}
              onChange={(html) => setOriginal(html)}
              placeholder="Cole o documento original aqui..."
              minHeight="120px"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Documento Revisado
            </label>
            <RichTextEditor
              value={revised}
              onChange={(html) => setRevised(html)}
              placeholder="Cole como o revisor reescreveria..."
              minHeight="120px"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Notas (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Ele encurtou os parágrafos e usou bullet points"
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addExample}
              disabled={!original.trim() || !revised.trim()}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Salvar Exemplo
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-1.5 text-gray-600 text-sm rounded border border-gray-300 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
