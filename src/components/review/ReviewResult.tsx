import { useState, useRef } from 'react'
import { DiffViewer } from './DiffViewer'
import { ReviewProgress } from './ReviewProgress'

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

interface Props {
  original: string
  revised: string
  streaming: boolean
  onNewReview: () => void
  onCancel: () => void
  dark?: boolean
}

function extractText(value: string): string {
  if (/<[a-z][\s\S]*>/i.test(value)) {
    return new DOMParser().parseFromString(value, 'text/html').body.innerText
  }
  return value
}

function htmlToMarkdown(html: string): string {
  const text = new DOMParser().parseFromString(html, 'text/html').body

  function nodeToMd(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ''
    if (node.nodeType !== Node.ELEMENT_NODE) return ''
    const el = node as Element
    const tag = el.tagName.toLowerCase()
    const inner = Array.from(el.childNodes).map(nodeToMd).join('')

    switch (tag) {
      case 'h1': return `# ${inner}\n\n`
      case 'h2': return `## ${inner}\n\n`
      case 'h3': return `### ${inner}\n\n`
      case 'strong': case 'b': return `**${inner}**`
      case 'em': case 'i': return `*${inner}*`
      case 'u': return `__${inner}__`
      case 's': return `~~${inner}~~`
      case 'code': return `\`${inner}\``
      case 'pre': return `\`\`\`\n${el.textContent}\n\`\`\`\n\n`
      case 'blockquote': return `> ${inner}\n\n`
      case 'ul': return Array.from(el.children).map((li) => `- ${li.textContent}\n`).join('') + '\n'
      case 'ol': return Array.from(el.children).map((li, i) => `${i + 1}. ${li.textContent}\n`).join('') + '\n'
      case 'li': return inner
      case 'p': return `${inner}\n\n`
      case 'br': return '\n'
      default: return inner
    }
  }

  return Array.from(text.childNodes).map(nodeToMd).join('').trim()
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function ReviewResult({ original, revised, streaming, onNewReview, onCancel, dark }: Props) {
  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  function handleExport(format: 'txt' | 'md') {
    const isHtml = /<[a-z][\s\S]*>/i.test(revised)
    const content = format === 'md' && isHtml
      ? htmlToMarkdown(revised)
      : extractText(revised)
    const mime = format === 'md' ? 'text/markdown' : 'text/plain'
    downloadFile(content, `review.${format}`, mime)
    setExportOpen(false)
  }

  const originalWords = wordCount(extractText(original))
  const revisedWords = wordCount(extractText(revised))
  const diff = originalWords - revisedWords
  const pct = originalWords > 0 ? Math.round((diff / originalWords) * 100) : 0

  return (
    <div className="space-y-4">
      {streaming && <ReviewProgress dark={dark} />}

      {!streaming && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className={`text-base font-medium ${dark ? 'text-gray-200' : 'text-gray-800'}`}>Review complete</h2>
            {diff !== 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${diff > 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {diff > 0 ? `-${diff} words (${pct}% shorter)` : `+${Math.abs(diff)} words`}
              </span>
            )}
          </div>

        <div className="flex items-center gap-3">
          {!streaming && (
            <div className="relative" ref={exportRef}>
              <button
                type="button"
                onClick={() => setExportOpen((v) => !v)}
                className={`text-sm border rounded px-3 py-1 transition-colors ${dark ? 'text-gray-300 border-gray-600 hover:bg-gray-700' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
              >
                Export ↓
              </button>
              {exportOpen && (
                <div className={`absolute right-0 mt-1 w-36 border rounded-lg shadow-lg z-10 overflow-hidden ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <button
                    type="button"
                    onClick={() => handleExport('txt')}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${dark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    Plain text (.txt)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport('md')}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${dark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    Markdown (.md)
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onNewReview}
            className="text-sm text-blue-600 hover:underline"
          >
            New Review
          </button>
        </div>
      </div>
      )}

      {streaming && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-red-500 hover:text-red-700 border border-red-300 rounded px-3 py-1 hover:bg-red-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {!streaming && <DiffViewer original={original} revised={revised} dark={dark} />}
    </div>
  )
}
