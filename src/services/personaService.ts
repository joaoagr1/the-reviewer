import { invoke } from '@tauri-apps/api/core'
import type { Persona, Review } from '../domain/persona'

export async function savePersona(persona: Persona): Promise<void> {
  await invoke('save_persona', { persona })
}

export async function getPersona(id: string): Promise<Persona> {
  return await invoke('get_persona', { id })
}

export async function listPersonas(): Promise<Persona[]> {
  return await invoke('list_personas')
}

export async function deletePersona(id: string): Promise<void> {
  await invoke('delete_persona', { id })
}

export async function saveReview(review: Review): Promise<void> {
  await invoke('save_review', { review })
}

export async function listReviews(personaId: string): Promise<Review[]> {
  return await invoke('list_reviews', { personaId })
}

export async function deleteReview(id: string): Promise<void> {
  await invoke('delete_review', { id })
}
