import { useState, useEffect } from 'react'
import type { Persona, Rule, Example } from '../../domain/persona'
import { createPersona, validatePersona } from '../../domain/persona'
import { analyzeStyle, listModels, OllamaError } from '../../services/ollamaService'
import { RulesEditor } from './RulesEditor'
import { ExampleEditor } from './ExampleEditor'
import { GeneratedRulesModal } from './GeneratedRulesModal'

interface Props {
  initial?: Persona
  onSave: (persona: Persona) => void
  onCancel: () => void
}

export function PersonaForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [model, setModel] = useState(initial?.model ?? 'qwen2.5:0.5b')
  const [rules, setRules] = useState<Rule[]>(initial?.rules ?? [])
  const [examples, setExamples] = useState<Example[]>(initial?.examples ?? [])
  const [errors, setErrors] = useState<string[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [generatedRules, setGeneratedRules] = useState<Rule[] | null>(null)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [availableModels, setAvailableModels] = useState<string[]>([])

  useEffect(() => {
    listModels().then(setAvailableModels)
  }, [])

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

  async function handleAnalyzeStyle() {
    setAnalyzeError(null)
    setAnalyzing(true)
    const tempPersona: Persona = {
      ...(initial ?? createPersona(name, description, model)),
      name,
      description,
      model,
      examples,
    }
    try {
      const generated = await analyzeStyle(tempPersona)
      setGeneratedRules(generated)
    } catch (e) {
      const msg = e instanceof OllamaError ? e.message : 'Erro ao analisar estilo.'
      setAnalyzeError(msg)
    } finally {
      setAnalyzing(false)
    }
  }

  function handleConfirmRules(confirmed: Rule[]) {
    setRules((prev) => [...prev, ...confirmed])
    setGeneratedRules(null)
  }

  return (
    <>
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
          {availableModels.length > 0 ? (
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              <option value="">Selecione um modelo...</option>
              {availableModels.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Ex: llama3.2 (Ollama offline ou sem modelos)"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          )}
        </div>

        <RulesEditor rules={rules} onChange={setRules} />

        <ExampleEditor examples={examples} onChange={setExamples} />

        {examples.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAnalyzeStyle}
              disabled={analyzing}
              className="text-sm text-purple-600 hover:underline disabled:opacity-50"
            >
              {analyzing ? 'Analisando...' : '✦ Analisar Estilo com IA'}
            </button>
            {analyzeError && (
              <span className="text-xs text-red-500">{analyzeError}</span>
            )}
          </div>
        )}

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

      {generatedRules && (
        <GeneratedRulesModal
          rules={generatedRules}
          onConfirm={handleConfirmRules}
          onClose={() => setGeneratedRules(null)}
        />
      )}
    </>
  )
}
