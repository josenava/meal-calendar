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
            expect(screen.getByText('Add Breakfast')).toBeInTheDocument()
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
            expect(screen.getByText('Add Breakfast')).toBeInTheDocument()

            rerender(<MealSlot mealType="lunch" meal={null} onClick={mockOnClick} />)
            expect(screen.getByText('Add Lunch')).toBeInTheDocument()

            rerender(<MealSlot mealType="dinner" meal={null} onClick={mockOnClick} />)
            expect(screen.getByText('Add Dinner')).toBeInTheDocument()
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
            expect(screen.getByText('Breakfast')).toBeInTheDocument()
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
