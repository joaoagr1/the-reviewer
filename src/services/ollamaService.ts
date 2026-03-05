import { Ollama } from 'ollama'
import type { Persona, Rule } from '../domain/persona'
import { createRule } from '../domain/persona'
import { buildSystemPrompt } from '../domain/prompt'

const MAX_DOCUMENT_SIZE = 50_000

export type OllamaClient = Pick<Ollama, 'chat' | 'list'>

export function createClient(host = 'http://localhost:11434'): OllamaClient {
  return new Ollama({ host })
}

let _client: OllamaClient = createClient()

export function getClient(): OllamaClient {
  return _client
}

export function setClient(c: OllamaClient): void {
  _client = c
}

export class OllamaError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OllamaError'
  }
}

export async function checkOllamaStatus(): Promise<boolean> {
  try {
    await getClient().list()
    return true
  } catch {
    return false
  }
}

export async function listModels(): Promise<string[]> {
  try {
    const response = await getClient().list()
    return response.models.map((m) => m.name)
  } catch {
    return []
  }
}

export async function* streamReview(
  persona: Persona,
  document: string
): AsyncGenerator<string> {
  if (!document.trim()) {
    throw new OllamaError('O documento não pode estar vazio.')
  }
  if (document.length > MAX_DOCUMENT_SIZE) {
    throw new OllamaError(
      `O documento excede o tamanho máximo de ${MAX_DOCUMENT_SIZE} caracteres.`
    )
  }

  try {
    const stream = await getClient().chat({
      model: persona.model,
      messages: [
        { role: 'system', content: buildSystemPrompt(persona) },
        { role: 'user', content: document },
      ],
      stream: true,
    })

    for await (const chunk of stream) {
      if (chunk.message.content) {
        yield chunk.message.content
      }
    }
  } catch (e) {
    if (e instanceof OllamaError) throw e
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('fetch') || msg.includes('connection') || msg.includes('ECONNREFUSED')) {
      throw new OllamaError('Ollama não está rodando. Inicie com `ollama serve`.')
    }
    if (msg.includes('model') && msg.includes('not found')) {
      throw new OllamaError(
        `Modelo "${persona.model}" não encontrado. Execute \`ollama pull ${persona.model}\`.`
      )
    }
    throw new OllamaError(`Erro ao processar revisão: ${msg}`)
  }
}

export async function analyzeStyle(persona: Persona): Promise<Rule[]> {
  if (persona.examples.length === 0) {
    throw new OllamaError('Adicione pelo menos um exemplo antes de analisar o estilo.')
  }

  const exampleBlocks = persona.examples
    .map(
      (ex, i) =>
        `Exemplo ${i + 1}:\nORIGINAL:\n${ex.original}\n\nREVISADO:\n${ex.revised}`
    )
    .join('\n\n')

  const prompt = `Analise os pares de documentos abaixo (original → revisado) e extraia as regras de estilo que o revisor aplicou.
Retorne APENAS uma lista de regras, uma por linha, começando com "- ".
Seja objetivo e específico.

${exampleBlocks}`

  try {
    const response = await getClient().chat({
      model: persona.model,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    })

    return parseRules(response.message.content)
  } catch (e) {
    if (e instanceof OllamaError) throw e
    const msg = e instanceof Error ? e.message : String(e)
    throw new OllamaError(`Erro ao analisar estilo: ${msg}`)
  }
}

function parseRules(text: string): Rule[] {
  return text
    .split('\n')
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter((line) => line.length > 0)
    .map((text) => createRule(text, 'generated'))
}
