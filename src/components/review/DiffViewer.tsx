import { useState } from 'react'
import { RichTextEditor } from '../RichTextEditor'

interface Props {
  original: string
  revised: string
}

function isHtml(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text)
}

export function DiffViewer({ original, revised }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const text = isHtml(revised)
      ? new DOMParser().parseFromString(revised, 'text/html').body.innerText
      : revised
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Original</h3>
        <div className="border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 min-h-40 max-h-96 overflow-y-auto">
          {isHtml(original) ? (
            <RichTextEditor value={original} readonly minHeight="160px" />
          ) : (
            <div className="p-4 whitespace-pre-wrap">{original}</div>
          )}
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
        <div className="border border-blue-200 rounded-lg bg-blue-50 text-sm text-gray-700 min-h-40 max-h-96 overflow-y-auto">
          {isHtml(revised) ? (
            <RichTextEditor value={revised} readonly minHeight="160px" />
          ) : (
            <div className="p-4 whitespace-pre-wrap">{revised}</div>
          )}
        </div>
      </div>
    </div>
  )
}
