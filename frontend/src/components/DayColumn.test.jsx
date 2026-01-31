/**
 * Tests for the DayColumn component
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DayColumn from './DayColumn'

describe('DayColumn', () => {
    const mockGetMealFor = vi.fn().mockReturnValue(null)
    const mockOnSlotClick = vi.fn()

    beforeEach(() => {
        // Mock the current date to ensure consistent "today" testing
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2024-01-15T12:00:00'))
    })

    afterEach(() => {
        vi.useRealTimers()
        mockGetMealFor.mockClear()
        mockOnSlotClick.mockClear()
    })

    it('should render day header with weekday and date', () => {
        const date = new Date('2024-01-15') // Monday
        
        render(
            <DayColumn 
                date={date}
                getMealFor={mockGetMealFor}
                onSlotClick={mockOnSlotClick}
            />
        )
        
        expect(screen.getByText('LUN')).toBeInTheDocument()
        expect(screen.getByText('15')).toBeInTheDocument()
    })

    it('should display correct weekday labels', () => {
        const weekDates = [
            { date: new Date('2024-01-15'), label: 'LUN' },
            { date: new Date('2024-01-16'), label: 'MAR' },
            { date: new Date('2024-01-17'), label: 'MIÉ' },
            { date: new Date('2024-01-18'), label: 'JUE' },
            { date: new Date('2024-01-19'), label: 'VIE' },
            { date: new Date('2024-01-20'), label: 'SÁB' },
            { date: new Date('2024-01-21'), label: 'DOM' },
        ]

        weekDates.forEach(({ date, label }) => {
            const { unmount } = render(
                <DayColumn 
                    date={date}
                    getMealFor={mockGetMealFor}
                    onSlotClick={mockOnSlotClick}
                />
            )
            expect(screen.getByText(label)).toBeInTheDocument()
            unmount()
        })
    })

    it('should highlight today with special class', () => {
        const today = new Date('2024-01-15') // Same as mocked system time
        
        const { container } = render(
            <DayColumn 
                date={today}
                getMealFor={mockGetMealFor}
                onSlotClick={mockOnSlotClick}
            />
        )
        
        const header = container.querySelector('.day-column__header')
        expect(header).toHaveClass('day-column__header--today')
    })

    it('should not highlight non-today days', () => {
        const notToday = new Date('2024-01-16') // Different from mocked system time
        
        const { container } = render(
            <DayColumn 
                date={notToday}
                getMealFor={mockGetMealFor}
                onSlotClick={mockOnSlotClick}
            />
        )
        
        const header = container.querySelector('.day-column__header')
        expect(header).not.toHaveClass('day-column__header--today')
    })

    it('should render 3 meal slots (breakfast, lunch, dinner)', () => {
        const date = new Date('2024-01-15')
        
        render(
            <DayColumn 
                date={date}
                getMealFor={mockGetMealFor}
                onSlotClick={mockOnSlotClick}
            />
        )
        
        const mealSlots = document.querySelectorAll('.meal-slot')
        expect(mealSlots).toHaveLength(3)
    })

    it('should call getMealFor for each meal type', () => {
        const date = new Date('2024-01-15')
        
        render(
            <DayColumn 
                date={date}
                getMealFor={mockGetMealFor}
                onSlotClick={mockOnSlotClick}
            />
        )
        
        expect(mockGetMealFor).toHaveBeenCalledTimes(3)
        expect(mockGetMealFor).toHaveBeenCalledWith(date, 'breakfast')
        expect(mockGetMealFor).toHaveBeenCalledWith(date, 'lunch')
        expect(mockGetMealFor).toHaveBeenCalledWith(date, 'dinner')
    })

    it('should call onSlotClick with correct parameters when meal slot is clicked', () => {
        const date = new Date('2024-01-15')
        
        render(
            <DayColumn 
                date={date}
                getMealFor={mockGetMealFor}
                onSlotClick={mockOnSlotClick}
            />
        )
        
        // Click the breakfast slot (first one)
        const slots = screen.getAllByRole('button')
        fireEvent.click(slots[0])
        
        expect(mockOnSlotClick).toHaveBeenCalledWith('2024-01-15', 'breakfast', null)
    })

    it('should pass meal to onSlotClick when meal exists', () => {
        const date = new Date('2024-01-15')
        const mockMeal = { id: 1, name: 'Pancakes', date: '2024-01-15', meal_type: 'breakfast' }
        
        mockGetMealFor.mockImplementation((d, mealType) => {
            if (mealType === 'breakfast') return mockMeal
            return null
        })
        
        render(
            <DayColumn 
                date={date}
                getMealFor={mockGetMealFor}
                onSlotClick={mockOnSlotClick}
            />
        )
        
        // Click the breakfast slot
        const slots = screen.getAllByRole('button')
        fireEvent.click(slots[0])
        
        expect(mockOnSlotClick).toHaveBeenCalledWith('2024-01-15', 'breakfast', mockMeal)
    })

    it('should display meal when getMealFor returns a meal', () => {
        const date = new Date('2024-01-15')
        const mockMeal = { id: 1, name: 'Pancakes', date: '2024-01-15', meal_type: 'breakfast' }
        
        mockGetMealFor.mockImplementation((d, mealType) => {
            if (mealType === 'breakfast') return mockMeal
            return null
        })
        
        render(
            <DayColumn 
                date={date}
                getMealFor={mockGetMealFor}
                onSlotClick={mockOnSlotClick}
            />
        )
        
        expect(screen.getByText('Pancakes')).toBeInTheDocument()
    })
})
