import { useEffect, useRef, useState } from 'react'
import type { Persona } from '../domain/persona'
import { usePersonaStore } from '../store/personaStore'
import { PersonaList } from '../components/personas/PersonaList'
import { PersonaForm } from '../components/personas/PersonaForm'
import { ConfirmModal } from '../components/ConfirmModal'

type View = 'list' | 'create' | 'edit'

export function PersonasPage({ dark }: { dark: boolean }) {
  const { personas, loading, error, fetchPersonas, addOrUpdatePersona, removePersona } =
    usePersonaStore()

  const [view, setView] = useState<View>('list')
  const [editing, setEditing] = useState<Persona | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const importRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    const json = JSON.stringify(personas, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'personas.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const imported: Persona[] = Array.isArray(parsed) ? parsed : [parsed]
      for (const persona of imported) {
        await addOrUpdatePersona(persona)
      }
      await fetchPersonas()
    } catch (err) {
      setImportError(`Import failed: ${err instanceof Error ? err.message : String(err)}`)
    }
    if (importRef.current) importRef.current.value = ''
  }

  useEffect(() => {
    fetchPersonas()
  }, [fetchPersonas])

  async function handleSave(persona: Persona) {
    await addOrUpdatePersona(persona)
    setView('list')
    setEditing(null)
  }

  function handleEdit(persona: Persona) {
    setEditing(persona)
    setView('edit')
  }

  function handleCancel() {
    setView('list')
    setEditing(null)
  }

  async function handleConfirmDelete() {
    if (!pendingDeleteId) return
    await removePersona(pendingDeleteId)
    setPendingDeleteId(null)
  }

  const d = dark

  if (loading) {
    return <p className={`text-sm text-center py-12 ${d ? 'text-gray-400' : 'text-gray-500'}`}>Loading...</p>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {view === 'list' && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className={`text-xl font-semibold ${d ? 'text-gray-100' : 'text-gray-900'}`}>Personas</h1>
            <div className="flex items-center gap-2">
              {personas.length > 0 && (
                <button
                  type="button"
                  onClick={handleExport}
                  className={`px-3 py-2 text-sm rounded border ${d ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                  Export
                </button>
              )}
              <label className={`px-3 py-2 text-sm rounded border cursor-pointer ${d ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                Import
                <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="sr-only" />
              </label>
              <button
                onClick={() => setView('create')}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                + New Persona
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4">Failed to load personas: {error}</p>
          )}

          {importError && (
            <p className={`text-sm mb-4 border rounded p-2 ${d ? 'text-red-400 border-red-800 bg-red-950/30' : 'text-red-600 border-red-200 bg-red-50'}`}>
              {importError}
            </p>
          )}

          {personas.length > 2 && (
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search personas..."
              className={`w-full mb-4 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${d ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500' : 'border-gray-300'}`}
            />
          )}

          <PersonaList
            personas={search.trim() ? personas.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())) : personas}
            onEdit={handleEdit}
            onDelete={setPendingDeleteId}
            dark={d}
          />
        </>
      )}

      {view === 'create' && (
        <>
          <h1 className={`text-xl font-semibold mb-6 ${d ? 'text-gray-100' : 'text-gray-900'}`}>New Persona</h1>
          <PersonaForm onSave={handleSave} onCancel={handleCancel} dark={d} />
        </>
      )}

      {view === 'edit' && editing && (
        <>
          <h1 className={`text-xl font-semibold mb-6 ${d ? 'text-gray-100' : 'text-gray-900'}`}>Edit Persona</h1>
          <PersonaForm initial={editing} onSave={handleSave} onCancel={handleCancel} dark={d} />
        </>
      )}

      {pendingDeleteId && (
        <ConfirmModal
          title="Delete persona"
          message="Are you sure? This action cannot be undone and all persona data will be lost."
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDeleteId(null)}
          dark={d}
        />
      )}
    </div>
  )
}
