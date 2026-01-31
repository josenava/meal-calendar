/**
 * Tests for the Calendar component
 */
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithI18n } from '../test/test-utils'
import Calendar from './Calendar'

describe('Calendar', () => {
    // Create a full week of dates (Monday to Sunday)
    const createWeekDays = (startDate) => {
        const days = []
        const start = new Date(startDate)
        for (let i = 0; i < 7; i++) {
            const day = new Date(start)
            day.setDate(start.getDate() + i)
            days.push(day)
        }
        return days
    }

    const mockGetMealFor = vi.fn().mockReturnValue(null)
    const mockOnSlotClick = vi.fn()

    afterEach(() => {
        mockGetMealFor.mockClear()
        mockOnSlotClick.mockClear()
    })

    it('should render 7 day columns', () => {
        const weekDays = createWeekDays('2024-01-15') // Monday
        
        renderWithI18n(
            <Calendar 
                weekDays={weekDays}
                getMealFor={mockGetMealFor}
                onSlotClick={mockOnSlotClick}
            />
        )
        
        // Check that we have the calendar grid
        const grid = document.querySelector('.calendar__grid')
        expect(grid).toBeInTheDocument()
        
        // Check we have 7 day columns
        const dayColumns = document.querySelectorAll('.day-column')
        expect(dayColumns).toHaveLength(7)
    })

    it('should display correct day numbers', () => {
        const weekDays = createWeekDays('2024-01-15') // Monday Jan 15
        
        renderWithI18n(
            <Calendar 
                weekDays={weekDays}
                getMealFor={mockGetMealFor}
                onSlotClick={mockOnSlotClick}
            />
        )
        
        // Check day numbers are displayed
        expect(screen.getByText('15')).toBeInTheDocument()
        expect(screen.getByText('16')).toBeInTheDocument()
        expect(screen.getByText('17')).toBeInTheDocument()
        expect(screen.getByText('18')).toBeInTheDocument()
        expect(screen.getByText('19')).toBeInTheDocument()
        expect(screen.getByText('20')).toBeInTheDocument()
        expect(screen.getByText('21')).toBeInTheDocument()
    })

    it('should call getMealFor for each day and meal type', () => {
        const weekDays = createWeekDays('2024-01-15')
        
        renderWithI18n(
            <Calendar 
                weekDays={weekDays}
                getMealFor={mockGetMealFor}
                onSlotClick={mockOnSlotClick}
            />
        )
        
        // Should be called 7 days * 3 meal types = 21 times
        expect(mockGetMealFor).toHaveBeenCalledTimes(21)
    })

    it('should pass meals to day columns', () => {
        const weekDays = createWeekDays('2024-01-15')
        const mockMeal = { id: 1, name: 'Pancakes', date: '2024-01-15', meal_type: 'breakfast' }
        
        mockGetMealFor.mockImplementation((date, mealType) => {
            if (date.getDate() === 15 && mealType === 'breakfast') {
                return mockMeal
            }
            return null
        })
        
        renderWithI18n(
            <Calendar 
                weekDays={weekDays}
                getMealFor={mockGetMealFor}
                onSlotClick={mockOnSlotClick}
            />
        )
        
        // Check the meal is displayed
        expect(screen.getByText('Pancakes')).toBeInTheDocument()
    })

    it('should render 21 meal slots (3 per day)', () => {
        const weekDays = createWeekDays('2024-01-15')
        
        renderWithI18n(
            <Calendar 
                weekDays={weekDays}
                getMealFor={mockGetMealFor}
                onSlotClick={mockOnSlotClick}
            />
        )
        
        const mealSlots = document.querySelectorAll('.meal-slot')
        expect(mealSlots).toHaveLength(21)
    })
})
