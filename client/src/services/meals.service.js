import axios from 'axios'

const API_URL = 'http://localhost:3000/meals'

const getMealsByDate = async (startDate, endDate) => {
  return await axios.get(API_URL, { params: { start_date: startDate, end_date: endDate } })
}

export default {
  getMealsByDate
}
