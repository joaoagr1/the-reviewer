import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OllamaStatusBanner } from '../../components/OllamaStatusBanner'

describe('OllamaStatusBanner', () => {
  it('shows nothing when status is unknown', () => {
    const { container } = render(<OllamaStatusBanner status="unknown" />)
    expect(container.firstChild).toBeNull()
  })

  it('shows online indicator when online', () => {
    render(<OllamaStatusBanner status="online" />)
    expect(screen.getByText(/ollama online/i)).toBeInTheDocument()
  })

  it('shows warning banner when offline', () => {
    render(<OllamaStatusBanner status="offline" />)
    expect(screen.getByText(/ollama is not running/i)).toBeInTheDocument()
    expect(screen.getByText(/ollama serve/i)).toBeInTheDocument()
  })
})
