export type OllamaStatus = 'unknown' | 'online' | 'offline'

interface Props {
  status: OllamaStatus
  dark?: boolean
}

export function OllamaStatusBanner({ status, dark }: Props) {
  if (status === 'offline') {
    return (
      <div className={`border-b text-sm px-4 py-2 flex items-center gap-2 ${dark ? 'bg-amber-950 border-amber-800 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-800'}`}>
        <span>⚠</span>
        <span>
          Ollama is not running. Start it with{' '}
          <code className={`font-mono px-1 rounded ${dark ? 'bg-amber-900' : 'bg-amber-100'}`}>ollama serve</code>
        </span>
      </div>
    )
  }

  if (status === 'online') {
    return (
      <div className={`border-b text-xs px-4 py-1 flex items-center gap-2 ${dark ? 'bg-green-950 border-green-900 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
        <span>Ollama online</span>
      </div>
    )
  }

  return null
}
