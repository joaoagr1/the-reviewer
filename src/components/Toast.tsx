import { useEffect, useState } from 'react'

interface ToastItem {
  id: string
  message: string
  action?: { label: string; onClick: () => void }
}

let _show: ((msg: string, action?: ToastItem['action']) => void) | null = null

export function toast(message: string, action?: ToastItem['action']) {
  _show?.(message, action)
}

export function ToastProvider({ dark }: { dark: boolean }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    _show = (message, action) => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, message, action }])
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
    }
    return () => { _show = null }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg shadow-lg text-sm ${dark ? 'bg-gray-700 text-gray-100' : 'bg-gray-900 text-white'}`}
        >
          <span>{t.message}</span>
          {t.action && (
            <button
              type="button"
              onClick={() => { t.action!.onClick(); setToasts((prev) => prev.filter((x) => x.id !== t.id)) }}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
