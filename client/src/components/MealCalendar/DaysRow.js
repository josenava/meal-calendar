import React from 'react'
import PropTypes from 'prop-types'

const DaysRow = (props) => {
  const weekDays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ]
  return (
    <tr>
      { weekDays.map((day, idx) => {
        if (idx === props.dayOfTheWeek) {
          return <th key={ idx } className="bg-primary">{ day }</th>
        }
        return <th key={ idx }>{ day }</th>
      }
      )
      }
    </tr>
  )
}

DaysRow.propTypes = {
  dayOfTheWeek: PropTypes.number
}

export default DaysRow
