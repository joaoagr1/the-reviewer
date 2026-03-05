export type OllamaStatus = 'unknown' | 'online' | 'offline'

interface Props {
  status: OllamaStatus
}

export function OllamaStatusBanner({ status }: Props) {
  if (status === 'offline') {
    return (
      <div className="bg-amber-50 border-b border-amber-300 text-amber-800 text-sm px-4 py-2 flex items-center gap-2">
        <span>⚠</span>
        <span>
          Ollama não está rodando. Inicie com{' '}
          <code className="font-mono bg-amber-100 px-1 rounded">ollama serve</code> para usar o app.
        </span>
      </div>
    )
  }

  if (status === 'online') {
    return (
      <div className="bg-green-50 border-b border-green-200 text-green-700 text-xs px-4 py-1 flex items-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
        <span>Ollama online</span>
      </div>
    )
  }

  return null
}
