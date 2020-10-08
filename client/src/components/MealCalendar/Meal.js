import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import MealsService from '../../services/meals.service'

const Meal = (props) => {
  const handleSubmit = () => {
    const meal = Object.create({ date: props.date, title: title, type: props.type })
    if (props.id === undefined) {
      const createdMeal = MealsService.createMeal(meal)
      setId(createdMeal.id)
    } else {
      meal.id = props.id
      // MealsService.updateMeal(meal)
    }
    setEditMode(false)
  }
  const [editMode, setEditMode] = useState(false)
  const [title, setTitle] = useState(props.title)
  const [id, setId] = useState(props.id)

  useEffect(() => {
    setTitle(props.title)
    setId(props.id)
  }, [props])

  let letter = ''
  switch (props.type) {
    case 1:
      letter = 'B'
      break
    case 2:
      letter = 'L'
      break
    case 3:
      letter = 'D'
      break
    default:
      letter = ''
      break
  }

  let mealTitle
  if (editMode) {
    mealTitle = <div>
      <input type='text' name='meal' onChange={e => setTitle(e.target.value)} autoFocus={true} value={title}/>
      <button type='button' className='btn btn-link' onClick={handleSubmit}>submit</button>
    </div>
  } else {
    mealTitle = <p className='meal-title'>{title}</p>
  }

  return (
    <div onClick={() => setEditMode(!editMode)}>
      <span className='meal-type'><b>{letter}</b></span>
      {mealTitle}
    </div>
  )
}

Meal.propTypes = {
  title: PropTypes.string,
  type: PropTypes.number,
  date: PropTypes.string,
  id: PropTypes.string,
  editMode: PropTypes.bool
}

export default Meal
