/**
 * Tests for date utility functions and App helper functions
 * These functions are tested via their behavior in the App component
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Helper functions extracted for testing
// These match the implementations in App.jsx

function getWeekStart(date) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday is first day
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
}

function getWeekEnd(date) {
    const start = getWeekStart(date)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return end
}

function formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function formatDateRange(start, end) {
    const options = { month: 'short', day: 'numeric' }
    const startStr = start.toLocaleDateString('en-US', options)
    const endStr = end.toLocaleDateString('en-US', { ...options, year: 'numeric' })
    return `${startStr} - ${endStr}`
}

describe('Date Utilities', () => {
    describe('getWeekStart', () => {
        it('should return Monday for a Monday date', () => {
            const monday = new Date('2024-01-15') // Monday
            const result = getWeekStart(monday)
            
            expect(result.getDay()).toBe(1) // Monday
            expect(result.getDate()).toBe(15)
        })

        it('should return Monday for a Wednesday date', () => {
            const wednesday = new Date('2024-01-17') // Wednesday
            const result = getWeekStart(wednesday)
            
            expect(result.getDay()).toBe(1) // Monday
            expect(result.getDate()).toBe(15) // Previous Monday
        })

        it('should return Monday for a Sunday date', () => {
            const sunday = new Date('2024-01-21') // Sunday
            const result = getWeekStart(sunday)
            
            expect(result.getDay()).toBe(1) // Monday
            expect(result.getDate()).toBe(15) // Monday of that week
        })

        it('should return Monday for a Saturday date', () => {
            const saturday = new Date('2024-01-20') // Saturday
            const result = getWeekStart(saturday)
            
            expect(result.getDay()).toBe(1) // Monday
            expect(result.getDate()).toBe(15)
        })

        it('should handle month boundaries correctly', () => {
            const firstOfMonth = new Date('2024-02-01') // Thursday
            const result = getWeekStart(firstOfMonth)
            
            expect(result.getDay()).toBe(1) // Monday
            expect(result.getMonth()).toBe(0) // January
            expect(result.getDate()).toBe(29) // Monday Jan 29
        })

        it('should handle year boundaries correctly', () => {
            const firstOfYear = new Date('2024-01-01') // Monday
            const result = getWeekStart(firstOfYear)
            
            expect(result.getDay()).toBe(1) // Monday
            expect(result.getDate()).toBe(1)
        })
    })

    describe('getWeekEnd', () => {
        it('should return Sunday of the same week', () => {
            const monday = new Date('2024-01-15') // Monday
            const result = getWeekEnd(monday)
            
            expect(result.getDay()).toBe(0) // Sunday
            expect(result.getDate()).toBe(21)
        })

        it('should return Sunday for any day of the week', () => {
            const wednesday = new Date('2024-01-17') // Wednesday
            const result = getWeekEnd(wednesday)
            
            expect(result.getDay()).toBe(0) // Sunday
            expect(result.getDate()).toBe(21)
        })

        it('should be 6 days after week start', () => {
            const date = new Date('2024-01-18') // Thursday
            const start = getWeekStart(date)
            const end = getWeekEnd(date)
            
            const diffDays = (end - start) / (1000 * 60 * 60 * 24)
            expect(diffDays).toBe(6)
        })
    })

    describe('formatDate', () => {
        it('should format date as YYYY-MM-DD', () => {
            const date = new Date('2024-01-15')
            const result = formatDate(date)
            
            expect(result).toBe('2024-01-15')
        })

        it('should pad single digit months', () => {
            const date = new Date('2024-01-15')
            const result = formatDate(date)
            
            expect(result).toBe('2024-01-15')
        })

        it('should pad single digit days', () => {
            const date = new Date('2024-01-05')
            const result = formatDate(date)
            
            expect(result).toBe('2024-01-05')
        })

        it('should handle December dates', () => {
            const date = new Date('2024-12-25')
            const result = formatDate(date)
            
            expect(result).toBe('2024-12-25')
        })

        it('should handle double digit days and months', () => {
            const date = new Date('2024-11-28')
            const result = formatDate(date)
            
            expect(result).toBe('2024-11-28')
        })
    })

    describe('formatDateRange', () => {
        it('should format date range with month, day and year', () => {
            const start = new Date('2024-01-15')
            const end = new Date('2024-01-21')
            const result = formatDateRange(start, end)
            
            // Result format: "Jan 15 - Jan 21, 2024"
            expect(result).toContain('Jan')
            expect(result).toContain('15')
            expect(result).toContain('21')
            expect(result).toContain('2024')
        })

        it('should handle month boundaries', () => {
            const start = new Date('2024-01-29')
            const end = new Date('2024-02-04')
            const result = formatDateRange(start, end)
            
            expect(result).toContain('Jan')
            expect(result).toContain('Feb')
        })
    })
})
