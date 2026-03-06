import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReviewHistory } from '../../../components/review/ReviewHistory'
import type { Persona, Review } from '../../../domain/persona'

const personas: Persona[] = [
  {
    id: 'persona-1',
    name: 'Rafael',
    description: 'Direto',
    model: 'llama3.2',
    rules: [],
    examples: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

function makeReview(overrides: Partial<Review> = {}): Review {
  return {
    id: crypto.randomUUID(),
    personaId: 'persona-1',
    title: 'Documento de teste',
    inputDocument: 'documento original de teste',
    outputDocument: 'documento revisado de teste',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

const defaultProps = {
  personas,
  onSelect: vi.fn(),
  onDelete: vi.fn(),
}

describe('ReviewHistory', () => {
  it('shows empty state when no reviews', () => {
    render(<ReviewHistory reviews={[]} {...defaultProps} />)
    expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument()
  })

  it('renders review title', () => {
    const review = makeReview({ title: 'Meu documento importante' })
    render(<ReviewHistory reviews={[review]} {...defaultProps} />)
    expect(screen.getByText('Meu documento importante')).toBeInTheDocument()
  })

  it('shows persona name', () => {
    const review = makeReview()
    render(<ReviewHistory reviews={[review]} {...defaultProps} />)
    expect(screen.getByText('Rafael')).toBeInTheDocument()
  })

  it('shows formatted date', () => {
    const review = makeReview({ createdAt: '2026-03-04T10:30:00.000Z' })
    render(<ReviewHistory reviews={[review]} {...defaultProps} />)
    expect(screen.getByText(/2026/)).toBeInTheDocument()
  })

  it('calls onSelect when review is clicked', () => {
    const review = makeReview()
    const onSelect = vi.fn()
    render(<ReviewHistory reviews={[review]} {...defaultProps} onSelect={onSelect} />)
    fireEvent.click(screen.getByText(review.title))
    expect(onSelect).toHaveBeenCalledWith(review)
  })

  it('filters reviews by search query', () => {
    const reviews = [
      makeReview({ title: 'Relatório financeiro' }),
      makeReview({ title: 'Ata de reunião' }),
    ]
    render(<ReviewHistory reviews={reviews} {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'financeiro' } })
    expect(screen.getByText('Relatório financeiro')).toBeInTheDocument()
    expect(screen.queryByText('Ata de reunião')).not.toBeInTheDocument()
  })

  it('renders multiple reviews', () => {
    const reviews = [makeReview(), makeReview(), makeReview()]
    render(<ReviewHistory reviews={reviews} {...defaultProps} />)
    expect(screen.getAllByText('Documento de teste')).toHaveLength(3)
  })
})
