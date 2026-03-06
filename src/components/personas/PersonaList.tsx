import type { Persona } from '../../domain/persona'
import { createPersona } from '../../domain/persona'

interface Props {
  personas: Persona[]
  onEdit: (persona: Persona) => void
  onDelete: (id: string) => void
  onDuplicate: (persona: Persona) => void
  dark?: boolean
}

export function PersonaList({ personas, onEdit, onDelete, onDuplicate, dark }: Props) {
  if (personas.length === 0) {
    return (
      <p className={`text-sm text-center py-8 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
        No personas yet. Create one to get started.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {personas.map((persona) => (
        <li
          key={persona.id}
          className={`border rounded-lg p-4 flex items-start justify-between gap-4 ${dark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'}`}
        >
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium ${dark ? 'text-gray-100' : 'text-gray-900'}`}>{persona.name}</h3>
            <p className={`text-sm mt-0.5 truncate ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{persona.description}</p>
            <div className={`flex gap-3 mt-2 text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              <span>{persona.model}</span>
              <span>{persona.rules.length} rules</span>
              <span>{persona.examples.length} examples</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(persona)}
              className="text-sm text-blue-500 hover:underline"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDuplicate(persona)}
              className={`text-sm hover:underline ${dark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Duplicate
            </button>
            <button
              type="button"
              onClick={() => onDelete(persona.id)}
              className="text-sm text-red-500 hover:underline"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
