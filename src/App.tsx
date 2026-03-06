import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { PersonasPage } from './pages/PersonasPage'
import { ReviewPage } from './pages/ReviewPage'
import { OllamaStatusBanner } from './components/OllamaStatusBanner'
import { checkOllamaStatus } from './services/ollamaService'
import type { OllamaStatus } from './components/OllamaStatusBanner'
import './App.css'

function Nav({ dark, onToggleDark }: { dark: boolean; onToggleDark: () => void }) {
  const base = 'px-4 py-2 text-sm font-medium rounded transition-colors'
  const active = dark
    ? `${base} bg-blue-900 text-blue-300`
    : `${base} bg-blue-100 text-blue-700`
  const inactive = dark
    ? `${base} text-gray-300 hover:bg-gray-700`
    : `${base} text-gray-600 hover:bg-gray-100`

  return (
    <nav className={`border-b px-6 py-3 flex items-center justify-between ${dark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
      <div className="flex gap-2">
        <NavLink to="/" end className={({ isActive }) => (isActive ? active : inactive)}>
          Personas
        </NavLink>
        <NavLink to="/review" className={({ isActive }) => (isActive ? active : inactive)}>
          Review
        </NavLink>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>v0.1.0</span>
        <button
          type="button"
          onClick={onToggleDark}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`text-lg px-2 py-1 rounded transition-colors ${dark ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-500'}`}
        >
          {dark ? '☀' : '☾'}
        </button>
      </div>
    </nav>
  )
}

export default function App() {
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>('unknown')
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    function check() {
      checkOllamaStatus().then((online) => {
        setOllamaStatus(online ? 'online' : 'offline')
      })
    }
    check()
    const interval = setInterval(check, 30_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <BrowserRouter>
      <div className={`min-h-screen ${dark ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        <Nav dark={dark} onToggleDark={() => setDark((d) => !d)} />
        <OllamaStatusBanner status={ollamaStatus} dark={dark} />
        <main>
          <Routes>
            <Route path="/" element={<PersonasPage dark={dark} />} />
            <Route path="/review" element={<ReviewPage dark={dark} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
