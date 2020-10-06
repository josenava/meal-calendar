import React from 'react'
import PropTypes from 'prop-types'
import DaysRow from '../../components/MealCalendar/DaysRow'
import '../../components/MealCalendar/mealcalendar.css'
import AuthService from '../../services/auth.service'

const MealCalendar = ({ history }) => {
  if (!AuthService.isAuthenticated()) {
    history.push('/')
  }
  const today = new Date()
  const breakfastRow = ''
  const lunchRow = ''
  const dinnerRow = ''
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
            <tr>A{breakfastRow}</tr>
            <tr>B{lunchRow}</tr>
            <tr>C{dinnerRow}</tr>
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
