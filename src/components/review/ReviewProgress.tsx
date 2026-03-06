interface Props {
  dark?: boolean
}

export function ReviewProgress({ dark }: Props) {
  return (
    <div className="space-y-3 py-4">
      <div className="flex items-center gap-3">
        <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
        <span className={`text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
          Reviewing...
        </span>
      </div>
      <div className={`w-full h-1.5 rounded-full overflow-hidden ${dark ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div className="h-full bg-blue-500 rounded-full animate-progress" />
      </div>
      <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
        The AI is rewriting your document. This may take a few seconds.
      </p>
    </div>
  )
}
