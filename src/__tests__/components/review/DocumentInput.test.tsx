import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DocumentInput } from '../../../components/review/DocumentInput'
import { createPersona } from '../../../domain/persona'

describe('DocumentInput', () => {
  it('renders persona selector and document textarea', () => {
    render(
      <DocumentInput
        personas={[]}
        selectedPersonaId={null}
        onPersonaChange={vi.fn()}
        document=""
        onDocumentChange={vi.fn()}
        onSubmit={vi.fn()}
        loading={false}
      />
    )
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders persona options', () => {
    const personas = [
      createPersona('Rafael', 'Direto', 'llama3.2'),
      createPersona('Ana', 'Formal', 'llama3.2'),
    ]
    render(
      <DocumentInput
        personas={personas}
        selectedPersonaId={null}
        onPersonaChange={vi.fn()}
        document=""
        onDocumentChange={vi.fn()}
        onSubmit={vi.fn()}
        loading={false}
      />
    )
    expect(screen.getByText('Rafael')).toBeInTheDocument()
    expect(screen.getByText('Ana')).toBeInTheDocument()
  })

  it('calls onPersonaChange when selecting a persona', () => {
    const personas = [createPersona('Rafael', 'Direto', 'llama3.2')]
    const onPersonaChange = vi.fn()
    render(
      <DocumentInput
        personas={personas}
        selectedPersonaId={null}
        onPersonaChange={onPersonaChange}
        document=""
        onDocumentChange={vi.fn()}
        onSubmit={vi.fn()}
        loading={false}
      />
    )
    fireEvent.change(screen.getByRole('combobox'), { target: { value: personas[0].id } })
    expect(onPersonaChange).toHaveBeenCalledWith(personas[0].id)
  })

  it('disables submit when no persona selected', () => {
    render(
      <DocumentInput
        personas={[]}
        selectedPersonaId={null}
        onPersonaChange={vi.fn()}
        document="algum texto"
        onDocumentChange={vi.fn()}
        onSubmit={vi.fn()}
        loading={false}
      />
    )
    expect(screen.getByRole('button', { name: /review/i })).toBeDisabled()
  })

  it('disables submit when document is empty', () => {
    const personas = [createPersona('Rafael', 'Direto', 'llama3.2')]
    render(
      <DocumentInput
        personas={personas}
        selectedPersonaId={personas[0].id}
        onPersonaChange={vi.fn()}
        document=""
        onDocumentChange={vi.fn()}
        onSubmit={vi.fn()}
        loading={false}
      />
    )
    expect(screen.getByRole('button', { name: /review/i })).toBeDisabled()
  })

  it('shows loading state', () => {
    const personas = [createPersona('Rafael', 'Direto', 'llama3.2')]
    render(
      <DocumentInput
        personas={personas}
        selectedPersonaId={personas[0].id}
        onPersonaChange={vi.fn()}
        document="texto"
        onDocumentChange={vi.fn()}
        onSubmit={vi.fn()}
        loading={true}
      />
    )
    expect(screen.getByRole('button', { name: /reviewing/i })).toBeDisabled()
  })
})
