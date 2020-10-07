import React from 'react'
import PropTypes from 'prop-types'

const Meal = (props) => {
  let className = ''
  let letter = ''
  switch (props.type) {
    case 1:
      className = 'breakfast'
      letter = 'B'
      break
    case 2:
      className = 'lunch'
      letter = 'L'
      break
    case 3:
      className = 'dinner'
      letter = 'D'
      break
    default:
      className = ''
      letter = ''
      break
  }
  return (
    <>
      <span className={className}>{letter}</span>
      <span>{props.title}</span>
    </>
  )
}

Meal.propTypes = {
  title: PropTypes.string,
  type: PropTypes.number,
  date: PropTypes.instanceOf(Date),
  id: PropTypes.string
}

export default Meal
