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
  const today = new Date()
  const [meals, setMeals] = useState([])
  // TODO use selector to change date
  const [dateRange, setDateRange] = useState(getWeekDateRange(today))

  const getMeals = async (dateRange) => {
    const data = await MealsService.getMealsByDate(dateRange[0], dateRange[1])
    setMeals(data)
  }

  useEffect(() => { getMeals(dateRange) }, [])

  return (
    <section id="meal-calendar">
      <h2>Here is your meal calendar for the week</h2>
      <p>Today is: { today.toDateString() }</p>
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
  history: PropTypes.object.isRequired
}

export default MealCalendar
