import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PersonaList } from '../../components/personas/PersonaList'
import { createPersona, createRule, createExample } from '../../domain/persona'

describe('PersonaList', () => {
  it('shows empty state when no personas', () => {
    render(<PersonaList personas={[]} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText(/no personas yet/i)).toBeInTheDocument()
  })

  it('renders persona name and description', () => {
    const personas = [createPersona('Rafael', 'Gosta de textos diretos', 'llama3.2')]
    render(<PersonaList personas={personas} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Rafael')).toBeInTheDocument()
    expect(screen.getByText('Gosta de textos diretos')).toBeInTheDocument()
  })

  it('shows rules and examples count', () => {
    const persona = createPersona('Ana', 'Formal', 'llama3.2')
    persona.rules = [createRule('Regra 1', 'manual'), createRule('Regra 2', 'manual')]
    persona.examples = [createExample('orig', 'rev')]
    render(<PersonaList personas={[persona]} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('2 rules')).toBeInTheDocument()
    expect(screen.getByText('1 examples')).toBeInTheDocument()
  })

  it('calls onEdit when Edit is clicked', () => {
    const persona = createPersona('Rafael', 'Direto', 'llama3.2')
    const onEdit = vi.fn()
    render(<PersonaList personas={[persona]} onEdit={onEdit} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith(persona)
  })

  it('calls onDelete when Delete is clicked', () => {
    const persona = createPersona('Rafael', 'Direto', 'llama3.2')
    const onDelete = vi.fn()
    render(<PersonaList personas={[persona]} onEdit={vi.fn()} onDelete={onDelete} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledWith(persona.id)
  })
})
