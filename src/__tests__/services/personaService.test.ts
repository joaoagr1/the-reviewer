import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPersona, createRule, createExample } from '../../domain/persona'
import type { Persona, Review } from '../../domain/persona'

const mockInvoke = vi.hoisted(() => vi.fn())
vi.mock('@tauri-apps/api/core', () => ({ invoke: mockInvoke }))

import {
  savePersona,
  getPersona,
  listPersonas,
  deletePersona,
  saveReview,
  listReviews,
} from '../../services/personaService'

function makeReview(personaId: string): Review {
  return {
    id: 'r1',
    personaId,
    inputDocument: 'original',
    outputDocument: 'revised',
    createdAt: new Date().toISOString(),
  }
}

describe('personaService', () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  it('savePersona calls invoke with correct args', async () => {
    mockInvoke.mockResolvedValue(undefined)
    const persona = createPersona('Rafael', 'Direto', 'llama3.2')
    await savePersona(persona)
    expect(mockInvoke).toHaveBeenCalledWith('save_persona', { persona })
  })

  it('getPersona returns persona from invoke', async () => {
    const persona = createPersona('Rafael', 'Direto', 'llama3.2')
    mockInvoke.mockResolvedValue(persona)
    const result = await getPersona(persona.id)
    expect(mockInvoke).toHaveBeenCalledWith('get_persona', { id: persona.id })
    expect(result).toEqual(persona)
  })

  it('listPersonas returns list from invoke', async () => {
    const personas: Persona[] = [
      createPersona('Rafael', 'Direto', 'llama3.2'),
      createPersona('Ana', 'Formal', 'llama3.2'),
    ]
    mockInvoke.mockResolvedValue(personas)
    const result = await listPersonas()
    expect(mockInvoke).toHaveBeenCalledWith('list_personas')
    expect(result).toHaveLength(2)
  })

  it('deletePersona calls invoke with id', async () => {
    mockInvoke.mockResolvedValue(undefined)
    await deletePersona('some-id')
    expect(mockInvoke).toHaveBeenCalledWith('delete_persona', { id: 'some-id' })
  })

  it('saveReview calls invoke with review', async () => {
    mockInvoke.mockResolvedValue(undefined)
    const review = makeReview('persona-1')
    await saveReview(review)
    expect(mockInvoke).toHaveBeenCalledWith('save_review', { review })
  })

  it('listReviews returns filtered reviews from invoke', async () => {
    const reviews: Review[] = [makeReview('persona-1'), makeReview('persona-1')]
    mockInvoke.mockResolvedValue(reviews)
    const result = await listReviews('persona-1')
    expect(mockInvoke).toHaveBeenCalledWith('list_reviews', { personaId: 'persona-1' })
    expect(result).toHaveLength(2)
  })

  it('savePersona propagates error from invoke', async () => {
    mockInvoke.mockRejectedValue(new Error('Tauri error'))
    const persona = createPersona('Rafael', 'Direto', 'llama3.2')
    await expect(savePersona(persona)).rejects.toThrow('Tauri error')
  })

  it('saves persona with rules and examples', async () => {
    mockInvoke.mockResolvedValue(undefined)
    const persona = createPersona('Rafael', 'Direto', 'llama3.2')
    persona.rules = [createRule('Seja direto', 'manual')]
    persona.examples = [createExample('original', 'revisado')]
    await savePersona(persona)
    expect(mockInvoke).toHaveBeenCalledWith('save_persona', { persona })
  })
})
