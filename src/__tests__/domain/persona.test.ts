import { describe, it, expect } from 'vitest'
import { validatePersona, createPersona, createExample, createRule } from '../../domain/persona'

describe('createRule', () => {
  it('creates a manual rule with generated id', () => {
    const rule = createRule('Nunca use voz passiva', 'manual')
    expect(rule.text).toBe('Nunca use voz passiva')
    expect(rule.source).toBe('manual')
    expect(rule.id).toBeTruthy()
  })

  it('creates a generated rule', () => {
    const rule = createRule('Use bullet points', 'generated')
    expect(rule.source).toBe('generated')
  })

  it('trims whitespace from text', () => {
    const rule = createRule('  Use bullet points  ', 'manual')
    expect(rule.text).toBe('Use bullet points')
  })
})

describe('createExample', () => {
  it('creates an example with generated id', () => {
    const example = createExample('original text', 'revised text')
    expect(example.original).toBe('original text')
    expect(example.revised).toBe('revised text')
    expect(example.notes).toBe('')
    expect(example.id).toBeTruthy()
  })

  it('accepts optional notes', () => {
    const example = createExample('original', 'revised', 'some notes')
    expect(example.notes).toBe('some notes')
  })
})

describe('createPersona', () => {
  it('creates a persona with defaults', () => {
    const persona = createPersona('Chefe Rafael', 'Gosta de textos diretos', 'llama3.2')
    expect(persona.name).toBe('Chefe Rafael')
    expect(persona.description).toBe('Gosta de textos diretos')
    expect(persona.model).toBe('llama3.2')
    expect(persona.rules).toEqual([])
    expect(persona.examples).toEqual([])
    expect(persona.id).toBeTruthy()
    expect(persona.createdAt).toBeTruthy()
    expect(persona.updatedAt).toBeTruthy()
  })
})

describe('validatePersona', () => {
  it('returns no errors for valid persona', () => {
    const errors = validatePersona({ name: 'Rafael', description: 'Direto', model: 'llama3.2' })
    expect(errors).toEqual([])
  })

  it('requires name', () => {
    const errors = validatePersona({ name: '', description: 'Direto', model: 'llama3.2' })
    expect(errors).toContain('Nome é obrigatório')
  })

  it('requires description', () => {
    const errors = validatePersona({ name: 'Rafael', description: '', model: 'llama3.2' })
    expect(errors).toContain('Descrição é obrigatória')
  })

  it('requires model', () => {
    const errors = validatePersona({ name: 'Rafael', description: 'Direto', model: '' })
    expect(errors).toContain('Modelo é obrigatório')
  })

  it('rejects name longer than 100 chars', () => {
    const errors = validatePersona({ name: 'a'.repeat(101), description: 'Direto', model: 'llama3.2' })
    expect(errors).toContain('Nome deve ter no máximo 100 caracteres')
  })
})
