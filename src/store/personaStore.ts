import { create } from 'zustand'
import type { Persona } from '../domain/persona'
import {
  listPersonas,
  savePersona,
  deletePersona,
} from '../services/personaService'

interface PersonaStore {
  personas: Persona[]
  loading: boolean
  error: string | null
  fetchPersonas: () => Promise<void>
  addOrUpdatePersona: (persona: Persona) => Promise<void>
  removePersona: (id: string) => Promise<void>
}

export const usePersonaStore = create<PersonaStore>((set) => ({
  personas: [],
  loading: false,
  error: null,

  fetchPersonas: async () => {
    set({ loading: true, error: null })
    try {
      const personas = await listPersonas()
      set({ personas, loading: false })
    } catch (e) {
      set({ error: String(e), loading: false })
    }
  },

  addOrUpdatePersona: async (persona: Persona) => {
    await savePersona(persona)
    set((state) => {
      const exists = state.personas.find((p) => p.id === persona.id)
      const personas = exists
        ? state.personas.map((p) => (p.id === persona.id ? persona : p))
        : [...state.personas, persona]
      return { personas }
    })
  },

  removePersona: async (id: string) => {
    await deletePersona(id)
    set((state) => ({ personas: state.personas.filter((p) => p.id !== id) }))
  },
}))
