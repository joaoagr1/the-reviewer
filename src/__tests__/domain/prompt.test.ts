import { describe, it, expect } from 'vitest'
import { buildSystemPrompt } from '../../domain/prompt'
import { createPersona, createExample, createRule } from '../../domain/persona'

describe('buildSystemPrompt', () => {
  it('includes persona description', () => {
    const persona = createPersona('Rafael', 'Prefere textos diretos e sem jargões', 'llama3.2')
    const prompt = buildSystemPrompt(persona)
    expect(prompt).toContain('Rafael')
    expect(prompt).toContain('Prefere textos diretos e sem jargões')
  })

  it('includes final revision instruction', () => {
    const persona = createPersona('Rafael', 'Direto', 'llama3.2')
    const prompt = buildSystemPrompt(persona)
    expect(prompt).toContain('Revise o documento')
    expect(prompt).toContain('Retorne APENAS o documento revisado')
  })

  it('includes rules section when persona has rules', () => {
    const persona = createPersona('Rafael', 'Direto', 'llama3.2')
    persona.rules = [
      createRule('Nunca use voz passiva', 'manual'),
      createRule('Use bullet points', 'generated'),
    ]
    const prompt = buildSystemPrompt(persona)
    expect(prompt).toContain('REGRAS DE ESTILO')
    expect(prompt).toContain('Nunca use voz passiva')
    expect(prompt).toContain('Use bullet points')
  })

  it('omits rules section when persona has no rules', () => {
    const persona = createPersona('Rafael', 'Direto', 'llama3.2')
    const prompt = buildSystemPrompt(persona)
    expect(prompt).not.toContain('REGRAS DE ESTILO')
  })

  it('includes examples section when persona has examples', () => {
    const persona = createPersona('Rafael', 'Direto', 'llama3.2')
    persona.examples = [createExample('texto original', 'texto revisado')]
    const prompt = buildSystemPrompt(persona)
    expect(prompt).toContain('EXEMPLOS')
    expect(prompt).toContain('ORIGINAL')
    expect(prompt).toContain('texto original')
    expect(prompt).toContain('REVISADO')
    expect(prompt).toContain('texto revisado')
  })

  it('omits examples section when persona has no examples', () => {
    const persona = createPersona('Rafael', 'Direto', 'llama3.2')
    const prompt = buildSystemPrompt(persona)
    expect(prompt).not.toContain('EXEMPLOS')
  })

  it('includes both rules and examples when both exist', () => {
    const persona = createPersona('Rafael', 'Direto', 'llama3.2')
    persona.rules = [createRule('Seja direto', 'manual')]
    persona.examples = [createExample('original', 'revisado')]
    const prompt = buildSystemPrompt(persona)
    expect(prompt).toContain('REGRAS DE ESTILO')
    expect(prompt).toContain('EXEMPLOS')
  })

  it('numbers multiple examples correctly', () => {
    const persona = createPersona('Rafael', 'Direto', 'llama3.2')
    persona.examples = [
      createExample('original 1', 'revisado 1'),
      createExample('original 2', 'revisado 2'),
    ]
    const prompt = buildSystemPrompt(persona)
    expect(prompt).toContain('Exemplo 1')
    expect(prompt).toContain('Exemplo 2')
  })
})
