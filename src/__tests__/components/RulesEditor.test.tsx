import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RulesEditor } from '../../components/personas/RulesEditor'
import { createRule } from '../../domain/persona'

describe('RulesEditor', () => {
  it('renders empty state with no rules', () => {
    render(<RulesEditor rules={[]} onChange={vi.fn()} />)
    expect(screen.getByPlaceholderText(/voz passiva/i)).toBeInTheDocument()
  })

  it('renders existing rules', () => {
    const rules = [createRule('Seja direto', 'manual'), createRule('Use bullet points', 'generated')]
    render(<RulesEditor rules={rules} onChange={vi.fn()} />)
    expect(screen.getByText('Seja direto')).toBeInTheDocument()
    expect(screen.getByText('Use bullet points')).toBeInTheDocument()
  })

  it('shows Manual badge for manual rules', () => {
    const rules = [createRule('Regra manual', 'manual')]
    render(<RulesEditor rules={rules} onChange={vi.fn()} />)
    expect(screen.getByText('Manual')).toBeInTheDocument()
  })

  it('shows IA badge for generated rules', () => {
    const rules = [createRule('Regra gerada', 'generated')]
    render(<RulesEditor rules={rules} onChange={vi.fn()} />)
    expect(screen.getByText('IA')).toBeInTheDocument()
  })

  it('calls onChange with new rule when Adicionar is clicked', () => {
    const onChange = vi.fn()
    render(<RulesEditor rules={[]} onChange={onChange} />)
    fireEvent.change(screen.getByPlaceholderText(/voz passiva/i), {
      target: { value: 'Nova regra' },
    })
    fireEvent.click(screen.getByText('Adicionar'))
    expect(onChange).toHaveBeenCalledOnce()
    const [newRules] = onChange.mock.calls[0]
    expect(newRules[0].text).toBe('Nova regra')
    expect(newRules[0].source).toBe('manual')
  })

  it('calls onChange with rule removed when ✕ is clicked', () => {
    const rule = createRule('Remover esta', 'manual')
    const onChange = vi.fn()
    render(<RulesEditor rules={[rule]} onChange={onChange} />)
    fireEvent.click(screen.getByLabelText(`Remover regra ${rule.text}`))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('does not add empty rule', () => {
    const onChange = vi.fn()
    render(<RulesEditor rules={[]} onChange={onChange} />)
    fireEvent.click(screen.getByText('Adicionar'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('adds rule on Enter key', () => {
    const onChange = vi.fn()
    render(<RulesEditor rules={[]} onChange={onChange} />)
    const input = screen.getByPlaceholderText(/voz passiva/i)
    fireEvent.change(input, { target: { value: 'Regra via Enter' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledOnce()
  })
})
