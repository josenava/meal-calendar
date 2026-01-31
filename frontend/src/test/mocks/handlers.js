/**
 * Mock handlers for MSW (Mock Service Worker)
 * Used to mock API responses in tests
 */
import { http, HttpResponse } from 'msw'

// Sample meal data for testing
export const mockMeals = [
    { id: 1, date: '2024-01-15', meal_type: 'breakfast', name: 'Pancakes', ingredients: ['flour', 'eggs', 'milk'] },
    { id: 2, date: '2024-01-15', meal_type: 'lunch', name: 'Chicken Salad', ingredients: ['chicken', 'lettuce', 'tomato'] },
    { id: 3, date: '2024-01-15', meal_type: 'dinner', name: 'Pasta Carbonara', ingredients: ['pasta', 'eggs', 'bacon'] },
    { id: 4, date: '2024-01-16', meal_type: 'breakfast', name: 'Oatmeal', ingredients: ['oats', 'milk', 'honey'] },
    { id: 5, date: '2024-01-16', meal_type: 'lunch', name: 'Sandwich', ingredients: ['bread', 'cheese', 'ham'] },
]

let meals = [...mockMeals]
let nextId = 6

// Reset meals to initial state
export function resetMeals() {
    meals = [...mockMeals]
    nextId = 6
}

export const handlers = [
    // GET /api/meals
    http.get('/api/meals', ({ request }) => {
        const url = new URL(request.url)
        const startDate = url.searchParams.get('start_date')
        const endDate = url.searchParams.get('end_date')

        if (!startDate || !endDate) {
            return HttpResponse.json(
                { detail: 'Missing required parameters' },
                { status: 422 }
            )
        }

        const filteredMeals = meals.filter(meal => {
            return meal.date >= startDate && meal.date <= endDate
        })

        return HttpResponse.json(filteredMeals)
    }),

    // POST /api/meals
    http.post('/api/meals', async ({ request }) => {
        const body = await request.json()
        
        // Validate required fields
        if (!body.name || !body.name.trim()) {
            return HttpResponse.json(
                { detail: 'Name cannot be empty' },
                { status: 422 }
            )
        }

        // Check for duplicate
        const existing = meals.find(
            m => m.date === body.date && m.meal_type === body.meal_type
        )
        if (existing) {
            return HttpResponse.json(
                { detail: `A meal already exists for ${body.date} - ${body.meal_type}` },
                { status: 409 }
            )
        }

        const newMeal = {
            id: nextId++,
            date: body.date,
            meal_type: body.meal_type,
            name: body.name.trim()
        }
        meals.push(newMeal)
        
        return HttpResponse.json(newMeal, { status: 201 })
    }),

    // PUT /api/meals/:id
    http.put('/api/meals/:id', async ({ params, request }) => {
        const id = parseInt(params.id)
        const body = await request.json()
        
        const mealIndex = meals.findIndex(m => m.id === id)
        if (mealIndex === -1) {
            return HttpResponse.json(
                { detail: 'Meal not found' },
                { status: 404 }
            )
        }

        if (!body.name || !body.name.trim()) {
            return HttpResponse.json(
                { detail: 'Name cannot be empty' },
                { status: 422 }
            )
        }

        meals[mealIndex] = {
            ...meals[mealIndex],
            name: body.name.trim()
        }

        return HttpResponse.json(meals[mealIndex])
    }),

    // DELETE /api/meals/:id
    http.delete('/api/meals/:id', ({ params }) => {
        const id = parseInt(params.id)
        
        const mealIndex = meals.findIndex(m => m.id === id)
        if (mealIndex === -1) {
            return HttpResponse.json(
                { detail: 'Meal not found' },
                { status: 404 }
            )
        }

        meals.splice(mealIndex, 1)
        return new HttpResponse(null, { status: 204 })
    }),

    // POST /api/meals/:id/copy
    http.post('/api/meals/:id/copy', async ({ params, request }) => {
        const id = parseInt(params.id)
        const body = await request.json()
        
        const sourceMeal = meals.find(m => m.id === id)
        if (!sourceMeal) {
            return HttpResponse.json(
                { detail: 'Source meal not found' },
                { status: 404 }
            )
        }

        // Check for duplicate
        const existing = meals.find(
            m => m.date === body.target_date && m.meal_type === body.target_meal_type
        )
        if (existing) {
            return HttpResponse.json(
                { detail: `A meal already exists for ${body.target_date} - ${body.target_meal_type}` },
                { status: 409 }
            )
        }

        const newMeal = {
            id: nextId++,
            date: body.target_date,
            meal_type: body.target_meal_type,
            name: sourceMeal.name
        }
        meals.push(newMeal)
        
        return HttpResponse.json(newMeal, { status: 201 })
    }),

    // Health check
    http.get('/api/health', () => {
        return HttpResponse.json({ status: 'healthy' })
    }),

    // GET /api/meals/search
    http.get('/api/meals/search', ({ request }) => {
        const url = new URL(request.url)
        const ingredient = url.searchParams.get('ingredient')

        if (!ingredient || !ingredient.trim()) {
            return HttpResponse.json(
                { detail: 'Missing required parameter: ingredient' },
                { status: 422 }
            )
        }

        const searchTerm = ingredient.toLowerCase().trim()
        const matchingMeals = meals
            .filter(meal => 
                meal.ingredients?.some(ing => ing.toLowerCase() === searchTerm)
            )
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 10)

        return HttpResponse.json(matchingMeals)
    }),
]
