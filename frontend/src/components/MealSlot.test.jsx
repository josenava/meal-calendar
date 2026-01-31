/**
 * Tests for the MealSlot component
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MealSlot from './MealSlot'

describe('MealSlot', () => {
    const mockOnClick = vi.fn()

    afterEach(() => {
        mockOnClick.mockClear()
    })

    describe('empty slot', () => {
        it('should render empty state correctly', () => {
            render(
                <MealSlot 
                    mealType="breakfast" 
                    meal={null} 
                    onClick={mockOnClick} 
                />
            )
            
            expect(screen.getByText('+')).toBeInTheDocument()
            expect(screen.getByText('Añadir Desayuno')).toBeInTheDocument()
        })

        it('should have empty class when no meal', () => {
            const { container } = render(
                <MealSlot 
                    mealType="breakfast" 
                    meal={null} 
                    onClick={mockOnClick} 
                />
            )
            
            expect(container.firstChild).toHaveClass('meal-slot--empty')
        })

        it('should show correct label for each meal type', () => {
            const { rerender } = render(
                <MealSlot mealType="breakfast" meal={null} onClick={mockOnClick} />
            )
            expect(screen.getByText('Añadir Desayuno')).toBeInTheDocument()

            rerender(<MealSlot mealType="lunch" meal={null} onClick={mockOnClick} />)
            expect(screen.getByText('Añadir Almuerzo')).toBeInTheDocument()

            rerender(<MealSlot mealType="dinner" meal={null} onClick={mockOnClick} />)
            expect(screen.getByText('Añadir Cena')).toBeInTheDocument()
        })
    })

    describe('filled slot', () => {
        const mockMeal = {
            id: 1,
            name: 'Pancakes',
            date: '2024-01-15',
            meal_type: 'breakfast'
        }

        it('should render meal name', () => {
            render(
                <MealSlot 
                    mealType="breakfast" 
                    meal={mockMeal} 
                    onClick={mockOnClick} 
                />
            )
            
            expect(screen.getByText('Pancakes')).toBeInTheDocument()
            expect(screen.getByText('Desayuno')).toBeInTheDocument()
        })

        it('should not have empty class when meal exists', () => {
            const { container } = render(
                <MealSlot 
                    mealType="breakfast" 
                    meal={mockMeal} 
                    onClick={mockOnClick} 
                />
            )
            
            expect(container.firstChild).not.toHaveClass('meal-slot--empty')
        })

        it('should render ingredients as chips', () => {
            const mealWithIngredients = {
                ...mockMeal,
                ingredients: ['flour', 'eggs', 'milk']
            }
            render(
                <MealSlot 
                    mealType="breakfast" 
                    meal={mealWithIngredients} 
                    onClick={mockOnClick} 
                />
            )
            
            expect(screen.getByText('flour')).toBeInTheDocument()
            expect(screen.getByText('eggs')).toBeInTheDocument()
            expect(screen.getByText('milk')).toBeInTheDocument()
        })

        it('should not render chips container when no ingredients', () => {
            const { container } = render(
                <MealSlot 
                    mealType="breakfast" 
                    meal={mockMeal} 
                    onClick={mockOnClick} 
                />
            )
            
            expect(container.querySelector('.chips')).not.toBeInTheDocument()
        })

        it('should handle empty ingredients array', () => {
            const mealWithEmptyIngredients = {
                ...mockMeal,
                ingredients: []
            }
            const { container } = render(
                <MealSlot 
                    mealType="breakfast" 
                    meal={mealWithEmptyIngredients} 
                    onClick={mockOnClick} 
                />
            )
            
            expect(container.querySelector('.chips')).not.toBeInTheDocument()
        })
    })

    describe('interactions', () => {
        it('should call onClick when clicked', () => {
            render(
                <MealSlot 
                    mealType="breakfast" 
                    meal={null} 
                    onClick={mockOnClick} 
                />
            )
            
            fireEvent.click(screen.getByRole('button'))
            
            expect(mockOnClick).toHaveBeenCalledTimes(1)
        })

        it('should call onClick when Enter key is pressed', () => {
            render(
                <MealSlot 
                    mealType="breakfast" 
                    meal={null} 
                    onClick={mockOnClick} 
                />
            )
            
            fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
            
            expect(mockOnClick).toHaveBeenCalledTimes(1)
        })

        it('should not call onClick for other keys', () => {
            render(
                <MealSlot 
                    mealType="breakfast" 
                    meal={null} 
                    onClick={mockOnClick} 
                />
            )
            
            fireEvent.keyDown(screen.getByRole('button'), { key: 'Space' })
            
            expect(mockOnClick).not.toHaveBeenCalled()
        })

        it('should be focusable', () => {
            render(
                <MealSlot 
                    mealType="breakfast" 
                    meal={null} 
                    onClick={mockOnClick} 
                />
            )
            
            const slot = screen.getByRole('button')
            expect(slot).toHaveAttribute('tabIndex', '0')
        })
    })
})
