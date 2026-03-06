export type RuleSource = 'manual' | 'generated'

export interface Rule {
  id: string
  text: string
  source: RuleSource
}

export interface Example {
  id: string
  original: string
  revised: string
  notes: string
}

export interface Persona {
  id: string
  name: string
  description: string
  model: string
  rules: Rule[]
  examples: Example[]
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  personaId: string
  title: string
  inputDocument: string
  outputDocument: string
  createdAt: string
}

export interface PersonaInput {
  name: string
  description: string
  model: string
}

function uuid(): string {
  return crypto.randomUUID()
}

export function createRule(text: string, source: RuleSource): Rule {
  return { id: uuid(), text: text.trim(), source }
}

export function createExample(original: string, revised: string, notes = ''): Example {
  return { id: uuid(), original, revised, notes }
}

export function createPersona(name: string, description: string, model: string): Persona {
  const now = new Date().toISOString()
  return {
    id: uuid(),
    name,
    description,
    model,
    rules: [],
    examples: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function validatePersona(input: PersonaInput): string[] {
  const errors: string[] = []

  if (!input.name.trim()) {
    errors.push('Nome é obrigatório')
  } else if (input.name.length > 100) {
    errors.push('Nome deve ter no máximo 100 caracteres')
  }

  if (!input.description.trim()) {
    errors.push('Descrição é obrigatória')
  }

  if (!input.model.trim()) {
    errors.push('Modelo é obrigatório')
  }

  return errors
}
