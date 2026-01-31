/**
 * Tests for the MealModal component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MealModal from './MealModal'

describe('MealModal', () => {
    const defaultProps = {
        date: '2024-01-15',
        mealType: 'breakfast',
        meal: null,
        onClose: vi.fn(),
        onSave: vi.fn(),
        onDelete: vi.fn(),
        onCopy: vi.fn()
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('ingredients input', () => {
        it('should render ingredients input field', () => {
            render(<MealModal {...defaultProps} />)
            
            expect(screen.getByLabelText('Ingredientes')).toBeInTheDocument()
            expect(screen.getByPlaceholderText('Añadir ingrediente...')).toBeInTheDocument()
        })

        it('should add ingredient when clicking Add button', async () => {
            const user = userEvent.setup()
            render(<MealModal {...defaultProps} />)
            
            const input = screen.getByPlaceholderText('Añadir ingrediente...')
            await user.type(input, 'flour')
            await user.click(screen.getByRole('button', { name: 'Añadir' }))
            
            expect(screen.getByText('flour')).toBeInTheDocument()
            expect(input).toHaveValue('')
        })

        it('should add ingredient when pressing Enter', async () => {
            const user = userEvent.setup()
            render(<MealModal {...defaultProps} />)
            
            const input = screen.getByPlaceholderText('Añadir ingrediente...')
            await user.type(input, 'eggs{Enter}')
            
            expect(screen.getByText('eggs')).toBeInTheDocument()
        })

        it('should add ingredient when pressing comma', async () => {
            const user = userEvent.setup()
            render(<MealModal {...defaultProps} />)
            
            const input = screen.getByPlaceholderText('Añadir ingrediente...')
            await user.type(input, 'milk,')
            
            expect(screen.getByText('milk')).toBeInTheDocument()
        })

        it('should remove ingredient when clicking remove button', async () => {
            const user = userEvent.setup()
            render(<MealModal {...defaultProps} />)
            
            const input = screen.getByPlaceholderText('Añadir ingrediente...')
            await user.type(input, 'flour{Enter}')
            
            expect(screen.getByText('flour')).toBeInTheDocument()
            
            await user.click(screen.getByRole('button', { name: 'Eliminar flour' }))
            
            expect(screen.queryByText('flour')).not.toBeInTheDocument()
        })

        it('should not add duplicate ingredients', async () => {
            const user = userEvent.setup()
            render(<MealModal {...defaultProps} />)
            
            const input = screen.getByPlaceholderText('Añadir ingrediente...')
            await user.type(input, 'flour{Enter}')
            await user.type(input, 'flour{Enter}')
            
            const flourChips = screen.getAllByText('flour')
            expect(flourChips).toHaveLength(1)
        })

        it('should show ingredient count', async () => {
            const user = userEvent.setup()
            render(<MealModal {...defaultProps} />)
            
            expect(screen.getByText('0/10')).toBeInTheDocument()
            
            const input = screen.getByPlaceholderText('Añadir ingrediente...')
            await user.type(input, 'flour{Enter}')
            
            expect(screen.getByText('1/10')).toBeInTheDocument()
        })

        it('should disable input when max ingredients reached', async () => {
            const user = userEvent.setup()
            render(<MealModal {...defaultProps} />)
            
            const input = screen.getByPlaceholderText('Añadir ingrediente...')
            
            // Add 10 ingredients
            for (let i = 1; i <= 10; i++) {
                await user.type(input, `ingredient${i}{Enter}`)
            }
            
            expect(input).toBeDisabled()
            expect(screen.getByText('10/10')).toBeInTheDocument()
        })

        it('should load existing ingredients when editing', () => {
            const mealWithIngredients = {
                id: 1,
                name: 'Pancakes',
                date: '2024-01-15',
                meal_type: 'breakfast',
                ingredients: ['flour', 'eggs', 'milk']
            }
            
            render(<MealModal {...defaultProps} meal={mealWithIngredients} />)
            
            expect(screen.getByText('flour')).toBeInTheDocument()
            expect(screen.getByText('eggs')).toBeInTheDocument()
            expect(screen.getByText('milk')).toBeInTheDocument()
            expect(screen.getByText('3/10')).toBeInTheDocument()
        })

        it('should pass ingredients to onSave', async () => {
            const user = userEvent.setup()
            const onSave = vi.fn()
            render(<MealModal {...defaultProps} onSave={onSave} />)
            
            // Add meal name
            const nameInput = screen.getByLabelText('Nombre de la comida')
            await user.type(nameInput, 'Pancakes')
            
            // Add ingredients
            const ingredientInput = screen.getByPlaceholderText('Añadir ingrediente...')
            await user.type(ingredientInput, 'flour{Enter}')
            await user.type(ingredientInput, 'eggs{Enter}')
            
            // Save
            await user.click(screen.getByRole('button', { name: 'Guardar' }))
            
            expect(onSave).toHaveBeenCalledWith('Pancakes', ['flour', 'eggs'])
        })
    })

    describe('create mode', () => {
        it('should render create mode correctly', () => {
            render(<MealModal {...defaultProps} />)
            
            expect(screen.getByText('Añadir Desayuno')).toBeInTheDocument()
            expect(screen.getByText('Guardar')).toBeInTheDocument()
        })

        it('should disable save button when name is empty', () => {
            render(<MealModal {...defaultProps} />)
            
            expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled()
        })

        it('should enable save button when name is provided', async () => {
            const user = userEvent.setup()
            render(<MealModal {...defaultProps} />)
            
            await user.type(screen.getByLabelText('Nombre de la comida'), 'Pancakes')
            
            expect(screen.getByRole('button', { name: 'Guardar' })).not.toBeDisabled()
        })
    })

    describe('edit mode', () => {
        const existingMeal = {
            id: 1,
            name: 'Pancakes',
            date: '2024-01-15',
            meal_type: 'breakfast',
            ingredients: []
        }

        it('should render edit mode correctly', () => {
            render(<MealModal {...defaultProps} meal={existingMeal} />)
            
            expect(screen.getByText('Editar Desayuno')).toBeInTheDocument()
            expect(screen.getByDisplayValue('Pancakes')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument()
        })

        it('should show copy section in edit mode', () => {
            render(<MealModal {...defaultProps} meal={existingMeal} />)
            
            expect(screen.getByText(/Copiar a otro día/)).toBeInTheDocument()
        })
    })
})
