import type { Persona } from './persona'

export function buildSystemPrompt(persona: Persona): string {
  const parts: string[] = []

  parts.push(`Você é ${persona.name}. ${persona.description}`)

  if (persona.rules.length > 0) {
    const ruleLines = persona.rules.map((r) => `- ${r.text}`).join('\n')
    parts.push(`REGRAS DE ESTILO:\n${ruleLines}`)
  }

  if (persona.examples.length > 0) {
    const exampleBlocks = persona.examples
      .map(
        (ex, i) =>
          `Exemplo ${i + 1}:\nORIGINAL:\n${ex.original}\n\nREVISADO:\n${ex.revised}`
      )
      .join('\n\n')
    parts.push(`EXEMPLOS:\n\n${exampleBlocks}`)
  }

  parts.push(
    `Revise o documento a seguir seguindo as regras e o estilo acima.
Preserve e replique a formatação do original: use **negrito** para ênfase, *itálico* para termos, listas com "- " ou "1. ", títulos com "#", "> " para citações.
Retorne APENAS o documento revisado, sem comentários, explicações ou prefácios.`
  )

  return parts.join('\n\n')
}
