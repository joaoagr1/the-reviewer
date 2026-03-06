import { useState } from 'react'
import { diff_match_patch, DIFF_INSERT, DIFF_DELETE, DIFF_EQUAL } from 'diff-match-patch'

interface Props {
  original: string
  revised: string
}

function extractText(value: string): string {
  if (/<[a-z][\s\S]*>/i.test(value)) {
    return new DOMParser().parseFromString(value, 'text/html').body.innerText
  }
  return value
}

function buildDiffHtml(original: string, revised: string): string {
  const dmp = new diff_match_patch()
  const diffs = dmp.diff_main(original, revised)
  dmp.diff_cleanupSemantic(diffs)

  return diffs
    .map(([op, text]) => {
      const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>')
      if (op === DIFF_INSERT) return `<mark class="diff-insert">${escaped}</mark>`
      if (op === DIFF_DELETE) return `<mark class="diff-delete">${escaped}</mark>`
      return `<span>${escaped}</span>`
    })
    .join('')
}

export function DiffViewer({ original, revised }: Props) {
  const [mode, setMode] = useState<'split' | 'unified'>('split')
  const [copied, setCopied] = useState(false)

  const originalText = extractText(original)
  const revisedText = extractText(revised)
  const diffHtml = buildDiffHtml(originalText, revisedText)

  async function handleCopy() {
    await navigator.clipboard.writeText(revisedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setMode('split')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${mode === 'split' ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Split
          </button>
          <button
            type="button"
            onClick={() => setMode('unified')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${mode === 'unified' ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Unified
          </button>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="text-xs text-blue-600 hover:underline"
        >
          {copied ? 'Copiado!' : 'Copiar revisado'}
        </button>
      </div>

      {/* Split mode */}
      {mode === 'split' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Original</h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-sm text-gray-700 whitespace-pre-wrap min-h-40 max-h-96 overflow-y-auto leading-relaxed">
              {originalText}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Revisado</h3>
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 text-sm text-gray-700 whitespace-pre-wrap min-h-40 max-h-96 overflow-y-auto leading-relaxed">
              {revisedText}
            </div>
          </div>
        </div>
      )}

      {/* Unified diff mode */}
      {mode === 'unified' && (
        <div>
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Diferenças</h3>
          <div
            className="border border-gray-200 rounded-lg p-4 bg-white text-sm text-gray-700 min-h-40 max-h-96 overflow-y-auto leading-relaxed"
            dangerouslySetInnerHTML={{ __html: diffHtml }}
          />
        </div>
      )}
    </div>
  )
}
