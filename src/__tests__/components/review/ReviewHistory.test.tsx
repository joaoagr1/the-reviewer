import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReviewHistory } from '../../../components/review/ReviewHistory'
import type { Review } from '../../../domain/persona'

function makeReview(overrides: Partial<Review> = {}): Review {
  return {
    id: crypto.randomUUID(),
    personaId: 'persona-1',
    inputDocument: 'documento original de teste',
    outputDocument: 'documento revisado de teste',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('ReviewHistory', () => {
  it('shows empty state when no reviews', () => {
    render(<ReviewHistory reviews={[]} onSelect={vi.fn()} />)
    expect(screen.getByText(/nenhuma revisão/i)).toBeInTheDocument()
  })

  it('renders review list with truncated original', () => {
    const review = makeReview({ inputDocument: 'Este é o documento original completo' })
    render(<ReviewHistory reviews={[review]} onSelect={vi.fn()} />)
    expect(screen.getByText(/este é o documento/i)).toBeInTheDocument()
  })

  it('shows formatted date', () => {
    const review = makeReview({ createdAt: '2026-03-04T10:30:00.000Z' })
    render(<ReviewHistory reviews={[review]} onSelect={vi.fn()} />)
    expect(screen.getByText(/2026/)).toBeInTheDocument()
  })

  it('calls onSelect when review is clicked', () => {
    const review = makeReview()
    const onSelect = vi.fn()
    render(<ReviewHistory reviews={[review]} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledWith(review)
  })

  it('renders multiple reviews', () => {
    const reviews = [makeReview(), makeReview(), makeReview()]
    render(<ReviewHistory reviews={reviews} onSelect={vi.fn()} />)
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })
})
