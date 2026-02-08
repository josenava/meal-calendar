import { useState } from 'react'
import MealSlot from './MealSlot'
import { useTranslation } from '../i18n/LanguageContext'

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

export default function DayColumn({ date, getMealFor, onSlotClick, onSwap }) {
    const { t } = useTranslation()
    const weekdaysShort = t('weekdaysShort')

    const dayOfWeek = date.getDay()
    const weekdayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert to Monday-first
    const today = isToday(date)
    const dateStr = formatDate(date)

    const [dragOverSlot, setDragOverSlot] = useState(null)
    const [isDragging, setIsDragging] = useState(false)

    const handleDragStart = () => {
        setIsDragging(true)
    }

    const handleDragEnd = () => {
        setIsDragging(false)
        setDragOverSlot(null)
    }

    const handleDragEnter = (mealType) => {
        setDragOverSlot(mealType)
    }

    const handleDragLeave = () => {
        setDragOverSlot(null)
    }

    const handleDrop = (sourceMealId, targetMealId, targetDate, targetMealType) => {
        setDragOverSlot(null)
        setIsDragging(false)
        onSwap?.(sourceMealId, targetMealId, targetDate, targetMealType)
    }

    return (
        <div
            className="day-column"
            onDragLeave={handleDragLeave}
        >
            <div className={`day-column__header ${today ? 'day-column__header--today' : ''}`}>
                <div className="day-column__weekday">{weekdaysShort[weekdayIndex]}</div>
                <div className="day-column__date">{date.getDate()}</div>
            </div>

            {MEAL_TYPES.map((mealType) => {
                const meal = getMealFor(date, mealType)
                return (
                    <div
                        key={mealType}
                        onDragEnter={() => handleDragEnter(mealType)}
                    >
                        <MealSlot
                            mealType={mealType}
                            meal={meal}
                            date={dateStr}
                            onClick={() => onSlotClick(dateStr, mealType, meal)}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDrop={handleDrop}
                            isDragOver={dragOverSlot === mealType}
                        />
                    </div>
                )
            })}
        </div>
    )
}
