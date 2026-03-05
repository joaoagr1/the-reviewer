import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { PersonasPage } from './pages/PersonasPage'
import { ReviewPage } from './pages/ReviewPage'
import { OllamaStatusBanner } from './components/OllamaStatusBanner'
import { checkOllamaStatus } from './services/ollamaService'
import type { OllamaStatus } from './components/OllamaStatusBanner'
import './App.css'

function Nav() {
  const base = 'px-4 py-2 text-sm font-medium rounded'
  const active = `${base} bg-blue-100 text-blue-700`
  const inactive = `${base} text-gray-600 hover:bg-gray-100`

  return (
    <nav className="border-b border-gray-200 bg-white px-6 py-3 flex gap-2">
      <NavLink to="/" end className={({ isActive }) => (isActive ? active : inactive)}>
        Personas
      </NavLink>
      <NavLink to="/review" className={({ isActive }) => (isActive ? active : inactive)}>
        Revisar
      </NavLink>
    </nav>
  )
}

export default function App() {
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>('unknown')

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
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <OllamaStatusBanner status={ollamaStatus} />
        <main>
          <Routes>
            <Route path="/" element={<PersonasPage />} />
            <Route path="/review" element={<ReviewPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
