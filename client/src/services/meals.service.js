import axios from 'axios'

import AuthService from '../services/auth.service'

const API_URL = 'http://localhost:8000/meals'

const getMealsByDate = async (startDate, endDate) => {
  const startDateParam = startDate.toISOString().split('T')[0]
  const endDateParam = endDate.toISOString().split('T')[0]
  const params = new URLSearchParams([['start_date', startDateParam], ['end_date', endDateParam]])

  try {
    const meals = await axios.get(API_URL, { headers: AuthService.authHeader(), params })
    return meals.data
  } catch (error) {
    console.log(error)
    return []
  }
}

const getMealsByDateMock = async (startDate, endDate) => {
  const startDateParam = startDate.toISOString().split('T')[0]
  // const endDateParam = endDate.toISOString().split('T')[0]
  // const params = new URLSearchParams([['start_date', startDateParam], ['end_date', endDateParam]])

  const breakfastMeals = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDateParam)
    date.setDate(date.getDate() + i)
    breakfastMeals.push(Object.create({ date: date.toISOString().split('T')[0], type: 1, title: `Breakfast ${i}`, id: `id-${i}` }))
  }
  const lunchMeals = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDateParam)
    date.setDate(date.getDate() + i)
    lunchMeals.push(Object.create({ date: date.toISOString().split('T')[0], type: 2, title: `Lunch ${i}`, id: `id-${i}` }))
  }
  const dinnerMeals = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDateParam)
    date.setDate(date.getDate() + i)
    lunchMeals.push(Object.create({ date: date.toISOString().split('T')[0], type: 3, title: `Dinner ${i}`, id: `id-${i}` }))
  }

  return [...breakfastMeals, ...lunchMeals, ...dinnerMeals]
}

const createMeal = async (meal) => {
  try {
    const params = {date: meal.date, type: meal.type, title: meal.title}
    const response = await axios.post(API_URL, params, { headers: AuthService.authHeader() })
    return response.data
  } catch (error) {
    console.log(error)
    return {}
  }
}

export default {
  getMealsByDate,
  getMealsByDateMock,
  createMeal
}
