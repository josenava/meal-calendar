const API_BASE = '/api';

/**
 * Fetch meals for a date range
 */
export async function getMeals(startDate, endDate) {
    const response = await fetch(
        `${API_BASE}/meals?start_date=${startDate}&end_date=${endDate}`
    );
    if (!response.ok) {
        throw new Error('Failed to fetch meals');
    }
    return response.json();
}

/**
 * Create a new meal
 */
export async function createMeal(meal) {
    const response = await fetch(`${API_BASE}/meals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meal)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create meal');
    }
    return response.json();
}

/**
 * Update an existing meal
 */
export async function updateMeal(id, meal) {
    const response = await fetch(`${API_BASE}/meals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meal)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update meal');
    }
    return response.json();
}

/**
 * Delete a meal
 */
export async function deleteMeal(id) {
    const response = await fetch(`${API_BASE}/meals/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        throw new Error('Failed to delete meal');
    }
}

/**
 * Copy a meal to another date/type
 */
export async function copyMeal(id, targetDate, targetMealType) {
    const response = await fetch(`${API_BASE}/meals/${id}/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            target_date: targetDate,
            target_meal_type: targetMealType
        })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to copy meal');
    }
    return response.json();
}
