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

/**
 * Search meals by ingredient
 */
export async function searchMealsByIngredient(ingredient) {
    const response = await fetch(
        `${API_BASE}/meals/search?ingredient=${encodeURIComponent(ingredient)}`
    );
    if (!response.ok) {
        throw new Error('Failed to search meals');
    }
    return response.json();
}

/**
 * Swap two meals (exchange their dates and meal types)
 */
export async function swapMeals(mealId1, mealId2) {
    const response = await fetch(`${API_BASE}/meals/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            meal_id_1: mealId1,
            meal_id_2: mealId2
        })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to swap meals');
    }
    return response.json();
}

/**
 * Move a meal to a different date/meal type
 */
export async function moveMeal(mealId, targetDate, targetMealType) {
    const response = await fetch(`${API_BASE}/meals/${mealId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            target_date: targetDate,
            target_meal_type: targetMealType
        })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to move meal');
    }
    return response.json();
}
