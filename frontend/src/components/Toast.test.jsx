/**
 * Tests for the Toast component
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Toast from './Toast'

describe('Toast', () => {
    it('should render with message', () => {
        render(<Toast message="Test message" />)
        
        expect(screen.getByText('Test message')).toBeInTheDocument()
    })

    it('should have success class by default', () => {
        const { container } = render(<Toast message="Success!" />)
        
        expect(container.firstChild).toHaveClass('toast')
        expect(container.firstChild).toHaveClass('toast--success')
    })

    it('should have error class when type is error', () => {
        const { container } = render(<Toast message="Error!" type="error" />)
        
        expect(container.firstChild).toHaveClass('toast')
        expect(container.firstChild).toHaveClass('toast--error')
    })

    it('should render custom type class', () => {
        const { container } = render(<Toast message="Warning!" type="warning" />)
        
        expect(container.firstChild).toHaveClass('toast--warning')
    })
})
