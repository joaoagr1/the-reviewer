import { useState } from 'react'
import type { Rule } from '../../domain/persona'

interface Props {
  rules: Rule[]
  onConfirm: (selected: Rule[]) => void
  onClose: () => void
}

export function GeneratedRulesModal({ rules, onConfirm, onClose }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(rules.map((r) => r.id)))
  const [edited, setEdited] = useState<Record<string, string>>(
    Object.fromEntries(rules.map((r) => [r.id, r.text]))
  )

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function handleConfirm() {
    const confirmed = rules
      .filter((r) => selected.has(r.id))
      .map((r) => ({ ...r, text: edited[r.id] ?? r.text }))
    onConfirm(confirmed)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Regras Geradas pela IA</h2>
        <p className="text-sm text-gray-500">
          Selecione, edite ou remova as regras antes de salvar.
        </p>

        <ul className="space-y-2 max-h-80 overflow-y-auto">
          {rules.map((rule) => (
            <li key={rule.id} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selected.has(rule.id)}
                onChange={() => toggle(rule.id)}
                aria-label={`Selecionar regra: ${rule.text}`}
                className="shrink-0"
              />
              <input
                type="text"
                value={edited[rule.id] ?? rule.text}
                onChange={(e) =>
                  setEdited((prev) => ({ ...prev, [rule.id]: e.target.value }))
                }
                disabled={!selected.has(rule.id)}
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-40 disabled:bg-gray-50"
              />
            </li>
          ))}
        </ul>

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-gray-400">
            {selected.size} de {rules.length} selecionadas
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selected.size === 0}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Adicionar {selected.size} {selected.size === 1 ? 'Regra' : 'Regras'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
