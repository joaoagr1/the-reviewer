import type { Persona } from '../../domain/persona'

interface Props {
  personas: Persona[]
  onEdit: (persona: Persona) => void
  onDelete: (id: string) => void
}

export function PersonaList({ personas, onEdit, onDelete }: Props) {
  if (personas.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-8">
        Nenhuma persona criada ainda.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {personas.map((persona) => (
        <li
          key={persona.id}
          className="border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-4"
        >
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900">{persona.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5 truncate">{persona.description}</p>
            <div className="flex gap-3 mt-2 text-xs text-gray-400">
              <span>{persona.model}</span>
              <span>{persona.rules.length} regras</span>
              <span>{persona.examples.length} exemplos</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(persona)}
              className="text-sm text-blue-600 hover:underline"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => onDelete(persona.id)}
              className="text-sm text-red-500 hover:underline"
            >
              Excluir
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
