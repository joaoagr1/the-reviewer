interface Props { dark: boolean }

export function AboutPage({ dark }: Props) {
  const text = dark ? 'text-gray-300' : 'text-gray-600'
  const heading = dark ? 'text-gray-100' : 'text-gray-900'
  const card = dark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
  const badge = dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">

      {/* Hero */}
      <div className="flex flex-col items-center text-center gap-4">
        <img
          src="/logo.png"
          alt="The Reviewer logo"
          className="w-24 h-24 rounded-2xl shadow-md"
        />
        <div>
          <h1 className={`text-2xl font-bold ${heading}`}>The Reviewer</h1>
          <p className={`text-sm mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>v0.1.0 — Local AI document reviewer</p>
        </div>
      </div>

      {/* What it is */}
      <div className={`border rounded-xl p-6 space-y-3 ${card}`}>
        <h2 className={`font-semibold ${heading}`}>What is it?</h2>
        <p className={`text-sm leading-relaxed ${text}`}>
          The Reviewer is a desktop app that uses local AI models (via Ollama) to review and rewrite
          documents according to a persona's style. You define <strong>who</strong> is reviewing —
          their rules, preferences, and examples — and the AI rewrites your text to match that voice.
        </p>
        <p className={`text-sm leading-relaxed ${text}`}>
          Everything runs locally. No data leaves your machine. No API keys. No subscriptions.
        </p>
      </div>

      {/* How it works */}
      <div className={`border rounded-xl p-6 space-y-4 ${card}`}>
        <h2 className={`font-semibold ${heading}`}>How it works</h2>
        <ol className={`text-sm space-y-3 ${text}`}>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span><strong>Create a persona</strong> — define a name, description, style rules, and optionally training examples (original → revised pairs).</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span><strong>Analyze style (optional)</strong> — let the AI extract rules automatically from your examples.</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
            <span><strong>Paste your document</strong> — write or paste the text you want reviewed in the Review tab.</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5">4</span>
            <span><strong>Review</strong> — the AI rewrites the document according to the persona's style. Compare original vs revised side by side or in unified diff view.</span>
          </li>
        </ol>
      </div>

      {/* Stack */}
      <div className={`border rounded-xl p-6 space-y-3 ${card}`}>
        <h2 className={`font-semibold ${heading}`}>Built with</h2>
        <div className="flex flex-wrap gap-2">
          {['Tauri v2', 'React', 'TypeScript', 'Tailwind CSS v4', 'Ollama', 'Tiptap', 'Zustand', 'Rust'].map((tech) => (
            <span key={tech} className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge}`}>{tech}</span>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className={`border rounded-xl p-6 space-y-2 ${card}`}>
        <h2 className={`font-semibold mb-3 ${heading}`}>Links</h2>
        <a
          href="https://github.com/joaoagr1/the-reviewer"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
        >
          <span>⌥</span> GitHub — joaoagr1/the-reviewer
        </a>
        <a
          href="https://ollama.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
        >
          <span>⌥</span> Ollama — ollama.com
        </a>
      </div>

    </div>
  )
}
