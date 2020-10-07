import React from 'react'
import PropTypes from 'prop-types'
import Meal from '../../components/MealCalendar/Meal'

const MealsRow = ({ meals, type, startDate }) => {
  const filterMealsByType = (meals, type) => {
    return Array(7).fill().map((_, i) => {
      let meal = meals.find(element => {
        return element.type === type && new Date(element.date).getDay() === i
      })
      if (meal === undefined) {
        const mealDate = new Date(startDate)
        meal = Object.create({ type: type, date: mealDate.setDate(mealDate.getDate() + i) })
      }
      return meal
    })
  }

  const buildMealRowByType = (meals, type) => {
    return filterMealsByType(meals, type).map((meal, idx) => {
      return <td key={idx}><Meal title={meal.title} type={meal.type} id={meal.id} date={meal.date} /></td>
    })
  }

  return (
    <tr>{ buildMealRowByType(meals, type) }</tr>
  )
}

MealsRow.propTypes = {
  meals: PropTypes.array,
  type: PropTypes.number,
  startDate: PropTypes.instanceOf(Date)
}

export default MealsRow
