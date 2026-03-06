import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'

interface Props {
  value: string
  onChange?: (html: string, text: string) => void
  placeholder?: string
  readonly?: boolean
  minHeight?: string
  dark?: boolean
}

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, active, disabled, title, children, dark }: ToolbarButtonProps & { dark?: boolean }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      disabled={disabled}
      title={title}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : dark
            ? 'text-gray-300 hover:bg-gray-600 hover:text-gray-100'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )
}

function Divider({ dark }: { dark?: boolean }) {
  return <div className={`w-px h-5 mx-1 ${dark ? 'bg-gray-600' : 'bg-gray-200'}`} />
}

export function RichTextEditor({ value, onChange, placeholder, readonly = false, minHeight = '160px', dark }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder ?? 'Digite aqui...' }),
    ],
    content: value,
    editable: !readonly,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML(), editor.getText())
    },
  })

  if (!editor) return null

  return (
    <div className={`border rounded-lg overflow-hidden ${readonly ? (dark ? 'border-blue-900 bg-blue-950/30' : 'border-blue-200 bg-blue-50') : dark ? 'border-gray-600 bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500' : 'border-gray-300 bg-white focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400'}`}>
      {!readonly && (
        <div className={`flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b ${dark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
          {/* Headings */}
          <ToolbarButton dark={dark} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">H1</ToolbarButton>
          <ToolbarButton dark={dark} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">H2</ToolbarButton>
          <ToolbarButton dark={dark} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</ToolbarButton>

          <Divider dark={dark} />

          {/* Inline formatting */}
          <ToolbarButton dark={dark} onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)"><strong>B</strong></ToolbarButton>
          <ToolbarButton dark={dark} onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)"><em>I</em></ToolbarButton>
          <ToolbarButton dark={dark} onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)"><span className="underline">U</span></ToolbarButton>
          <ToolbarButton dark={dark} onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><span className="line-through">S</span></ToolbarButton>
          <ToolbarButton dark={dark} onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">{'<>'}</ToolbarButton>

          <Divider dark={dark} />

          {/* Lists */}
          <ToolbarButton dark={dark} onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">≡</ToolbarButton>
          <ToolbarButton dark={dark} onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">1≡</ToolbarButton>
          <ToolbarButton dark={dark} onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">❝</ToolbarButton>
          <ToolbarButton dark={dark} onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">{'{ }'}</ToolbarButton>

          <Divider dark={dark} />

          {/* Alignment */}
          <ToolbarButton dark={dark} onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">◧</ToolbarButton>
          <ToolbarButton dark={dark} onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center">◫</ToolbarButton>
          <ToolbarButton dark={dark} onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">◨</ToolbarButton>

          <Divider dark={dark} />

          {/* History */}
          <ToolbarButton dark={dark} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">↩</ToolbarButton>
          <ToolbarButton dark={dark} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">↪</ToolbarButton>
        </div>
      )}

      <EditorContent
        editor={editor}
        className={`rich-editor${dark ? ' rich-editor-dark' : ''}`}
        style={{ minHeight }}
      />
    </div>
  )
}
