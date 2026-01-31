import MealSlot from './MealSlot'

const WEEKDAYS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner']

function isToday(date) {
    const today = new Date()
    return date.toDateString() === today.toDateString()
}

function formatDate(date) {
    // Use local date components to avoid timezone issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export default function DayColumn({ date, getMealFor, onSlotClick }) {
    const dayOfWeek = date.getDay()
    const weekdayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert to Monday-first
    const today = isToday(date)
    const dateStr = formatDate(date)

    return (
        <div className="day-column">
            <div className={`day-column__header ${today ? 'day-column__header--today' : ''}`}>
                <div className="day-column__weekday">{WEEKDAYS[weekdayIndex]}</div>
                <div className="day-column__date">{date.getDate()}</div>
            </div>

            {MEAL_TYPES.map((mealType) => {
                const meal = getMealFor(date, mealType)
                return (
                    <MealSlot
                        key={mealType}
                        mealType={mealType}
                        meal={meal}
                        onClick={() => onSlotClick(dateStr, mealType, meal)}
                    />
                )
            })}
        </div>
    )
}
