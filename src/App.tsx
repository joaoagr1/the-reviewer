import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { PersonasPage } from './pages/PersonasPage'
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
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <main>
          <Routes>
            <Route path="/" element={<PersonasPage />} />
            <Route
              path="/review"
              element={
                <div className="max-w-2xl mx-auto px-4 py-8 text-gray-400 text-sm">
                  Revisão — disponível no M6
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
