import { useEffect, useState } from 'react'
import type { Persona } from '../domain/persona'
import { usePersonaStore } from '../store/personaStore'
import { PersonaList } from '../components/personas/PersonaList'
import { PersonaForm } from '../components/personas/PersonaForm'

type View = 'list' | 'create' | 'edit'

export function PersonasPage() {
  const { personas, loading, error, fetchPersonas, addOrUpdatePersona, removePersona } =
    usePersonaStore()

  const [view, setView] = useState<View>('list')
  const [editing, setEditing] = useState<Persona | null>(null)

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

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta persona?')) return
    await removePersona(id)
  }

  if (loading) {
    return <p className="text-gray-500 text-sm text-center py-12">Carregando...</p>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {view === 'list' && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-900">Personas</h1>
            <button
              onClick={() => setView('create')}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              + Nova Persona
            </button>
          </div>

          {error && (
            <p className="text-red-600 text-sm mb-4">Erro ao carregar personas: {error}</p>
          )}

          <PersonaList personas={personas} onEdit={handleEdit} onDelete={handleDelete} />
        </>
      )}

      {view === 'create' && (
        <>
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Nova Persona</h1>
          <PersonaForm onSave={handleSave} onCancel={handleCancel} />
        </>
      )}

      {view === 'edit' && editing && (
        <>
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Editar Persona</h1>
          <PersonaForm initial={editing} onSave={handleSave} onCancel={handleCancel} />
        </>
      )}
    </div>
  )
}
