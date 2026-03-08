import { useState } from 'react'
import type { Example } from '../../domain/persona'
import { createExample } from '../../domain/persona'
import { RichTextEditor } from '../RichTextEditor'

interface Props {
  examples: Example[]
  onChange: (examples: Example[]) => void
  dark?: boolean
}

export function ExampleEditor({ examples, onChange, dark }: Props) {
  const [original, setOriginal] = useState('')
  const [revised, setRevised] = useState('')
  const [notes, setNotes] = useState('')
  const [open, setOpen] = useState(false)

  function addExample() {
    if (!original.trim() || !revised.trim()) return
    onChange([...examples, createExample(original.trim(), revised.trim(), notes.trim())])
    setOriginal('')
    setRevised('')
    setNotes('')
    setOpen(false)
  }

  function removeExample(id: string) {
    onChange(examples.filter((e) => e.id !== id))
  }

  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const toggleExpand = (id: string) =>
    setExpanded((prev) => { const n = new Set(prev); if (n.has(id)) { n.delete(id) } else { n.add(id) }; return n })

  const borderCls = dark ? 'border-gray-700' : 'border-gray-200'
  const inputCls = `w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${dark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500' : 'border-gray-300'}`
  const labelCls = `text-xs font-medium ${dark ? 'text-gray-400' : 'text-gray-600'}`

  return (
    <div className="space-y-3">
      <label className={`block text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
        Training Examples ({examples.length})
      </label>

      <ul className="space-y-2">
        {examples.map((ex, i) => (
          <li key={ex.id} className={`border rounded p-3 text-sm space-y-1 ${dark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => toggleExpand(ex.id)}
                className={`font-medium text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}
              >
                {expanded.has(ex.id) ? '▾' : '▸'} Example {i + 1}
              </button>
              <button
                type="button"
                onClick={() => removeExample(ex.id)}
                aria-label={`Remove example ${i + 1}`}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                Remove
              </button>
            </div>
            {expanded.has(ex.id) ? (
              <div className="space-y-2 pt-1">
                <div>
                  <p className={`text-xs font-medium mb-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Original</p>
                  <div className={`text-xs rounded p-2 ${dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'}`}
                    dangerouslySetInnerHTML={{ __html: ex.original }} />
                </div>
                <div>
                  <p className={`text-xs font-medium mb-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Revised</p>
                  <div className={`text-xs rounded p-2 ${dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'}`}
                    dangerouslySetInnerHTML={{ __html: ex.revised }} />
                </div>
                {ex.notes && <p className={`text-xs italic ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{ex.notes}</p>}
              </div>
            ) : (
              <p className={`truncate text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                {new DOMParser().parseFromString(ex.original, 'text/html').body.innerText.slice(0, 80)}
              </p>
            )}
          </li>
        ))}
      </ul>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm text-blue-500 hover:underline"
        >
          + Add Example
        </button>
      ) : (
        <div className={`border rounded p-4 space-y-3 ${borderCls}`}>
          <div>
            <label className={`block mb-1 ${labelCls}`}>Original Document</label>
            <RichTextEditor
              value={original}
              onChange={(html) => setOriginal(html)}
              placeholder="Paste the original document here..."
              minHeight="120px"
              dark={dark}
            />
          </div>
          <div>
            <label className={`block mb-1 ${labelCls}`}>Revised Document</label>
            <RichTextEditor
              value={revised}
              onChange={(html) => setRevised(html)}
              placeholder="Paste how the reviewer would rewrite it..."
              minHeight="120px"
              dark={dark}
            />
          </div>
          <div>
            <label className={`block mb-1 ${labelCls}`}>Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Shortened paragraphs and used bullet points"
              className={inputCls}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addExample}
              disabled={!original.trim() || !revised.trim()}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Save Example
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={`px-4 py-1.5 text-sm rounded border ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
