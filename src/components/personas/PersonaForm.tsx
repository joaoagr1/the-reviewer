import { useState } from 'react'
import type { Persona, Rule, Example } from '../../domain/persona'
import { createPersona, validatePersona } from '../../domain/persona'
import { RulesEditor } from './RulesEditor'
import { ExampleEditor } from './ExampleEditor'

interface Props {
  initial?: Persona
  onSave: (persona: Persona) => void
  onCancel: () => void
}

export function PersonaForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [model, setModel] = useState(initial?.model ?? 'llama3.2')
  const [rules, setRules] = useState<Rule[]>(initial?.rules ?? [])
  const [examples, setExamples] = useState<Example[]>(initial?.examples ?? [])
  const [errors, setErrors] = useState<string[]>([])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationErrors = validatePersona({ name, description, model })
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    const now = new Date().toISOString()
    const persona: Persona = initial
      ? { ...initial, name, description, model, rules, examples, updatedAt: now }
      : { ...createPersona(name, description, model), rules, examples }

    onSave(persona)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Chefe Rafael"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Ex: Gosta de textos objetivos, sem jargões, com bullet points"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Modelo Ollama *</label>
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="Ex: llama3.2"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <RulesEditor rules={rules} onChange={setRules} />

      <ExampleEditor examples={examples} onChange={setExamples} />

      {errors.length > 0 && (
        <ul className="text-red-600 text-sm space-y-1">
          {errors.map((err) => (
            <li key={err}>• {err}</li>
          ))}
        </ul>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          className="px-5 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          {initial ? 'Salvar Alterações' : 'Criar Persona'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 text-gray-600 text-sm rounded border border-gray-300 hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
