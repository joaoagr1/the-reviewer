import { useState } from 'react'

interface Props {
  original: string
  revised: string
}

export function DiffViewer({ original, revised }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(revised)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Original</h3>
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-sm text-gray-700 whitespace-pre-wrap min-h-40 max-h-96 overflow-y-auto">
          {original}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">Revisado</h3>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copiar texto revisado"
            className="text-xs text-blue-600 hover:underline"
          >
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 text-sm text-gray-700 whitespace-pre-wrap min-h-40 max-h-96 overflow-y-auto">
          {revised}
        </div>
      </div>
    </div>
  )
}
