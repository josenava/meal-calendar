import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import DaysRow from '../../components/MealCalendar/DaysRow'
import MealsRow from '../../components/MealCalendar/MealsRow'
import '../../components/MealCalendar/mealcalendar.css'
import AuthService from '../../services/auth.service'
import MealsService from '../../services/meals.service'

const getWeekDateRange = (today) => {
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - startDate.getDay())

  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

  return [startDate, endDate]
}

const MealCalendar = ({ history }) => {
  if (!AuthService.isAuthenticated()) {
    history.push('/')
  }
  const handleDateChange = (currentDate, position) => {
    const date = new Date(currentDate)
    if (position === 'previous') {
      setDateRange(getWeekDateRange(date.setDate(date.getDate() - 7)))
      setToday(new Date(currentDate.setDate(currentDate.getDate() - 7)))
    } else {
      setDateRange(getWeekDateRange(date.setDate(date.getDate() + 7)))
      setToday(new Date(currentDate.setDate(currentDate.getDate() + 7)))
    }
  }

  const [today, setToday] = useState(new Date())
  const [meals, setMeals] = useState([])
  const [dateRange, setDateRange] = useState(getWeekDateRange(today))

  const getMeals = async (dateRange) => {
    const data = await MealsService.getMealsByDate(dateRange[0], dateRange[1])
    setMeals(data)
  }

  useEffect(() => { getMeals(dateRange) }, [dateRange])

  return (
    <section id="meal-calendar">
      <h2>Here is your meal calendar for the week</h2>
      <p>Week of: { dateRange[0].toDateString() } - { dateRange[1].toDateString()}</p>
      <div>
        <button type="button" className="btn btn-secondary" onClick={() => handleDateChange(today, 'previous')}>Previous</button>
        <button type="button" className="btn btn-secondary" onClick={() => handleDateChange(today, 'next')}>Next</button>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <DaysRow dayOfTheWeek={ today.getDay() } />
          </thead>
          <tbody>
            <MealsRow meals={ meals } type={1} startDate={dateRange[0]} />
            <MealsRow meals={ meals } type={2} startDate={dateRange[0]} />
            <MealsRow meals={ meals } type={3} startDate={dateRange[0]} />
          </tbody>
        </table>
      </div>
    </section>
  )
}

MealCalendar.propTypes = {
  history: PropTypes.object.isRequired,
  today: PropTypes.instanceOf(Date),
  dateRange: PropTypes.arrayOf(Date)
}

export default MealCalendar
