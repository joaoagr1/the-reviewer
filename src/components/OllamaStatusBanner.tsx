export type OllamaStatus = 'unknown' | 'online' | 'offline'

interface Props {
  status: OllamaStatus
}

export function OllamaStatusBanner({ status }: Props) {
  if (status !== 'offline') return null

  return (
    <div className="bg-amber-50 border border-amber-300 text-amber-800 text-sm px-4 py-2 flex items-center gap-2">
      <span>⚠</span>
      <span>
        Ollama não está rodando. Inicie com{' '}
        <code className="font-mono bg-amber-100 px-1 rounded">ollama serve</code> para usar o
        app.
      </span>
    </div>
  )
}
