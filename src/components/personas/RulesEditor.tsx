import { useState } from 'react'
import type { Rule } from '../../domain/persona'
import { createRule } from '../../domain/persona'

interface Props {
  rules: Rule[]
  onChange: (rules: Rule[]) => void
  dark?: boolean
}

export function RulesEditor({ rules, onChange, dark }: Props) {
  const [newText, setNewText] = useState('')

  function addRule() {
    const text = newText.trim()
    if (!text) return
    onChange([...rules, createRule(text, 'manual')])
    setNewText('')
  }

  function removeRule(id: string) {
    onChange(rules.filter((r) => r.id !== id))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addRule()
    }
  }

  const inputCls = `border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${dark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500' : 'border-gray-300 text-gray-900'}`

  return (
    <div className="space-y-3">
      <label className={`block text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Style Rules</label>

      <ul className="space-y-2">
        {rules.map((rule) => (
          <li key={rule.id} className="flex items-center gap-2">
            <span className={`flex-1 text-sm ${dark ? 'text-gray-200' : 'text-gray-800'}`}>{rule.text}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                rule.source === 'generated'
                  ? 'bg-purple-100 text-purple-700'
                  : dark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {rule.source === 'generated' ? 'AI' : 'Manual'}
            </span>
            <button
              type="button"
              onClick={() => removeRule(rule.id)}
              aria-label={`Remove rule: ${rule.text}`}
              className="text-red-400 hover:text-red-600 text-sm"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Never use passive voice"
          className={`flex-1 ${inputCls}`}
        />
        <button
          type="button"
          onClick={addRule}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>
    </div>
  )
}
