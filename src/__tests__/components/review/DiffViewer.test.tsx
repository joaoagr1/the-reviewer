import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DiffViewer } from '../../../components/review/DiffViewer'

describe('DiffViewer', () => {
  it('renders original and revised sections', () => {
    render(<DiffViewer original="texto original" revised="texto revisado" />)
    expect(screen.getByText('Original')).toBeInTheDocument()
    expect(screen.getByText('Revised')).toBeInTheDocument()
    expect(screen.getByText('texto original')).toBeInTheDocument()
    expect(screen.getByText('texto revisado')).toBeInTheDocument()
  })

  it('shows copy button for revised text', () => {
    render(<DiffViewer original="original" revised="revisado" />)
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
  })
})
