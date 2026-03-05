import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  streamReview,
  analyzeStyle,
  checkOllamaStatus,
  OllamaError,
  setClient,
} from '../../services/ollamaService'
import { createPersona, createExample } from '../../domain/persona'
import { buildSystemPrompt } from '../../domain/prompt'
import type { OllamaClient } from '../../services/ollamaService'

function makeAsyncIterator(chunks: string[]) {
  const messages = chunks.map((content) => ({ message: { content }, done: false }))
  return (async function* () {
    for (const msg of messages) yield msg
  })()
}

function makeMockClient(overrides: Partial<OllamaClient> = {}): OllamaClient {
  return {
    chat: vi.fn(),
    list: vi.fn(),
    ...overrides,
  }
}

describe('checkOllamaStatus', () => {
  it('returns true when ollama is running', async () => {
    const mock = makeMockClient({ list: vi.fn().mockResolvedValue({ models: [] }) })
    setClient(mock)
    expect(await checkOllamaStatus()).toBe(true)
  })

  it('returns false when ollama is offline', async () => {
    const mock = makeMockClient({ list: vi.fn().mockRejectedValue(new Error('fetch failed')) })
    setClient(mock)
    expect(await checkOllamaStatus()).toBe(false)
  })
})

describe('streamReview', () => {
  beforeEach(() => {
    setClient(makeMockClient())
  })

  it('yields chunks from ollama stream', async () => {
    const mock = makeMockClient({
      chat: vi.fn().mockResolvedValue(makeAsyncIterator(['Hello', ' world'])),
    })
    setClient(mock)
    const persona = createPersona('Rafael', 'Direto', 'llama3.2')
    const chunks: string[] = []
    for await (const chunk of streamReview(persona, 'meu documento')) {
      chunks.push(chunk)
    }
    expect(chunks).toEqual(['Hello', ' world'])
  })

  it('calls chat with correct model and prompt', async () => {
    const chatMock = vi.fn().mockResolvedValue(makeAsyncIterator(['ok']))
    setClient(makeMockClient({ chat: chatMock }))
    const persona = createPersona('Rafael', 'Direto', 'llama3.2')
    const document = 'documento teste'

    for await (const _chunk of streamReview(persona, document)) {
      // drain
    }

    expect(chatMock).toHaveBeenCalledWith({
      model: 'llama3.2',
      messages: [
        { role: 'system', content: buildSystemPrompt(persona) },
        { role: 'user', content: document },
      ],
      stream: true,
    })
  })

  it('throws OllamaError when document is empty', async () => {
    const persona = createPersona('Rafael', 'Direto', 'llama3.2')
    await expect(async () => {
      for await (const _chunk of streamReview(persona, '   ')) {
        // drain
      }
    }).rejects.toThrow(OllamaError)
  })

  it('throws OllamaError when document exceeds max size', async () => {
    const persona = createPersona('Rafael', 'Direto', 'llama3.2')
    const bigDoc = 'a'.repeat(50001)
    await expect(async () => {
      for await (const _chunk of streamReview(persona, bigDoc)) {
        // drain
      }
    }).rejects.toThrow(OllamaError)
  })

  it('throws OllamaError when ollama fails', async () => {
    setClient(makeMockClient({ chat: vi.fn().mockRejectedValue(new Error('model not found')) }))
    const persona = createPersona('Rafael', 'Direto', 'llama3.2')
    await expect(async () => {
      for await (const _chunk of streamReview(persona, 'documento')) {
        // drain
      }
    }).rejects.toThrow(OllamaError)
  })
})

describe('analyzeStyle', () => {
  it('returns parsed rules from ollama response', async () => {
    setClient(
      makeMockClient({
        chat: vi.fn().mockResolvedValue({
          message: { content: '- Seja direto\n- Use bullet points\n- Evite jargões' },
        }),
      })
    )
    const persona = createPersona('Rafael', 'Direto', 'llama3.2')
    persona.examples = [createExample('original', 'revisado')]

    const rules = await analyzeStyle(persona)
    expect(rules).toHaveLength(3)
    expect(rules[0].text).toBe('Seja direto')
    expect(rules[0].source).toBe('generated')
  })

  it('throws OllamaError when no examples provided', async () => {
    setClient(makeMockClient())
    const persona = createPersona('Rafael', 'Direto', 'llama3.2')
    await expect(analyzeStyle(persona)).rejects.toThrow(OllamaError)
  })

  it('throws OllamaError when ollama fails', async () => {
    setClient(
      makeMockClient({ chat: vi.fn().mockRejectedValue(new Error('connection refused')) })
    )
    const persona = createPersona('Rafael', 'Direto', 'llama3.2')
    persona.examples = [createExample('original', 'revisado')]
    await expect(analyzeStyle(persona)).rejects.toThrow(OllamaError)
  })

  it('filters out empty lines from response', async () => {
    setClient(
      makeMockClient({
        chat: vi.fn().mockResolvedValue({
          message: { content: '- Regra 1\n\n- Regra 2\n\n' },
        }),
      })
    )
    const persona = createPersona('Rafael', 'Direto', 'llama3.2')
    persona.examples = [createExample('original', 'revisado')]
    const rules = await analyzeStyle(persona)
    expect(rules).toHaveLength(2)
  })
})
