import { useState, useEffect, useRef } from 'react'
import type { Persona, Rule, Example } from '../../domain/persona'
import { createPersona, validatePersona } from '../../domain/persona'
import { analyzeStyle, listModels, OllamaError, checkOllamaStatus } from '../../services/ollamaService'
import { RulesEditor } from './RulesEditor'
import { ExampleEditor } from './ExampleEditor'
import { GeneratedRulesModal } from './GeneratedRulesModal'

interface Props {
  initial?: Persona
  onSave: (persona: Persona) => void
  onCancel: () => void
  dark?: boolean
}

export function PersonaForm({ initial, onSave, onCancel, dark }: Props) {
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
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'ok' | 'fail' | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    listModels().then(setAvailableModels)
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        formRef.current?.requestSubmit()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  async function handleTestConnection() {
    setTestingConnection(true)
    setConnectionStatus(null)
    const ok = await checkOllamaStatus()
    setConnectionStatus(ok ? 'ok' : 'fail')
    setTestingConnection(false)
  }

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
      const msg = e instanceof OllamaError ? e.message : 'Failed to analyze style.'
      setAnalyzeError(msg)
    } finally {
      setAnalyzing(false)
    }
  }

  function handleConfirmRules(confirmed: Rule[]) {
    setRules((prev) => [...prev, ...confirmed])
    setGeneratedRules(null)
  }

  const inputCls = `w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${dark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500' : 'border-gray-300'}`
  const labelCls = `block text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'} mb-1`

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className={labelCls}>Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Formal Editor"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="e.g. Prefers concise, formal language with bullet points"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Ollama Model *</label>
          {availableModels.length > 0 ? (
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={`${inputCls} ${dark ? '' : 'bg-white'}`}
            >
              <option value="">Select a model...</option>
              {availableModels.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. llama3.2 (Ollama offline or no models found)"
              className={inputCls}
            />
          )}
          {availableModels.length > 0 && model && !availableModels.includes(model) && (
            <p className="text-xs text-amber-500 mt-1">
              Warning: "{model}" is not in the list of available Ollama models.
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConnection || !model}
              className={`text-xs hover:underline disabled:opacity-40 ${dark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {testingConnection ? 'Testing...' : 'Test connection'}
            </button>
            {connectionStatus === 'ok' && <span className="text-xs text-green-500">Ollama online</span>}
            {connectionStatus === 'fail' && <span className="text-xs text-red-500">Ollama offline</span>}
          </div>
        </div>

        <RulesEditor rules={rules} onChange={setRules} dark={dark} />

        <ExampleEditor examples={examples} onChange={setExamples} dark={dark} />

        {examples.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAnalyzeStyle}
              disabled={analyzing}
              className="text-sm text-purple-600 hover:underline disabled:opacity-50"
            >
              {analyzing ? 'Analyzing...' : '✦ Analyze Style with AI'}
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
            className="px-5 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-2"
          >
            {initial ? 'Save Changes' : 'Create Persona'}
            <span className="text-xs opacity-60">Ctrl+S</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={`px-5 py-2 text-sm rounded border ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            Cancel
          </button>
        </div>
      </form>

      {generatedRules && (
        <GeneratedRulesModal
          rules={generatedRules}
          onConfirm={handleConfirmRules}
          onClose={() => setGeneratedRules(null)}
          dark={dark}
        />
      )}
    </>
  )
}
