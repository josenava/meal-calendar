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

export default {
  getMealsByDate
}
