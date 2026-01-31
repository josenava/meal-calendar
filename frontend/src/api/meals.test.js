/**
 * Tests for the meals API functions
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { server } from '../test/mocks/server'
import { resetMeals } from '../test/mocks/handlers'
import { getMeals, createMeal, updateMeal, deleteMeal, copyMeal } from './meals'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => {
    server.resetHandlers()
    resetMeals()
})

describe('getMeals', () => {
    it('should fetch meals within a date range', async () => {
        const meals = await getMeals('2024-01-15', '2024-01-16')
        
        expect(meals).toBeInstanceOf(Array)
        expect(meals.length).toBe(5)
        expect(meals[0]).toHaveProperty('id')
        expect(meals[0]).toHaveProperty('name')
        expect(meals[0]).toHaveProperty('date')
        expect(meals[0]).toHaveProperty('meal_type')
    })

    it('should return empty array for date range with no meals', async () => {
        const meals = await getMeals('2024-02-01', '2024-02-07')
        
        expect(meals).toEqual([])
    })

    it('should filter meals correctly by date range', async () => {
        const meals = await getMeals('2024-01-15', '2024-01-15')
        
        expect(meals.length).toBe(3)
        meals.forEach(meal => {
            expect(meal.date).toBe('2024-01-15')
        })
    })
})

describe('createMeal', () => {
    it('should create a new meal', async () => {
        const newMeal = {
            date: '2024-01-17',
            meal_type: 'breakfast',
            name: 'French Toast'
        }
        
        const result = await createMeal(newMeal)
        
        expect(result.id).toBeDefined()
        expect(result.name).toBe('French Toast')
        expect(result.date).toBe('2024-01-17')
        expect(result.meal_type).toBe('breakfast')
    })

    it('should throw error for duplicate meal', async () => {
        const duplicateMeal = {
            date: '2024-01-15',
            meal_type: 'breakfast',
            name: 'Another Breakfast'
        }
        
        await expect(createMeal(duplicateMeal)).rejects.toThrow('already exists')
    })

    it('should throw error for empty name', async () => {
        const invalidMeal = {
            date: '2024-01-17',
            meal_type: 'breakfast',
            name: ''
        }
        
        await expect(createMeal(invalidMeal)).rejects.toThrow()
    })

    it('should trim whitespace from meal name', async () => {
        const meal = {
            date: '2024-01-17',
            meal_type: 'breakfast',
            name: '  Eggs Benedict  '
        }
        
        const result = await createMeal(meal)
        
        expect(result.name).toBe('Eggs Benedict')
    })
})

describe('updateMeal', () => {
    it('should update an existing meal', async () => {
        const result = await updateMeal(1, { name: 'Updated Pancakes' })
        
        expect(result.id).toBe(1)
        expect(result.name).toBe('Updated Pancakes')
    })

    it('should throw error for non-existent meal', async () => {
        await expect(updateMeal(99999, { name: 'Test' })).rejects.toThrow('Meal not found')
    })

    it('should throw error for empty name', async () => {
        await expect(updateMeal(1, { name: '' })).rejects.toThrow()
    })

    it('should trim whitespace from updated name', async () => {
        const result = await updateMeal(1, { name: '  Waffles  ' })
        
        expect(result.name).toBe('Waffles')
    })
})

describe('deleteMeal', () => {
    it('should delete an existing meal', async () => {
        // Should not throw
        await expect(deleteMeal(1)).resolves.toBeUndefined()
        
        // Verify meal is deleted by fetching meals
        const meals = await getMeals('2024-01-15', '2024-01-15')
        expect(meals.find(m => m.id === 1)).toBeUndefined()
    })

    it('should throw error for non-existent meal', async () => {
        await expect(deleteMeal(99999)).rejects.toThrow('Failed to delete meal')
    })
})

describe('copyMeal', () => {
    it('should copy a meal to a new date', async () => {
        const result = await copyMeal(1, '2024-01-20', 'dinner')
        
        expect(result.id).not.toBe(1)
        expect(result.name).toBe('Pancakes') // Same as source
        expect(result.date).toBe('2024-01-20')
        expect(result.meal_type).toBe('dinner')
    })

    it('should throw error for non-existent source meal', async () => {
        await expect(copyMeal(99999, '2024-01-20', 'dinner')).rejects.toThrow('Source meal not found')
    })

    it('should throw error when copying to existing date/type', async () => {
        // Try to copy to a slot that already exists
        await expect(copyMeal(1, '2024-01-15', 'lunch')).rejects.toThrow('already exists')
    })
})
