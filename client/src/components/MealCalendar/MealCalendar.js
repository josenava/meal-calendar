import React from 'react'
import PropTypes from 'prop-types'
import AuthService from '../../services/auth.service'

const MealCalendar = ({ history }) => {
  if (!AuthService.isAuthenticated()) {
    history.push('/')
  }
  return (
    <p>Here be a calendar with dragons and meals</p>
  )
}

MealCalendar.propTypes = {
  history: PropTypes.object.isRequired
}

export default MealCalendar
