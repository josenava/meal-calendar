import { useState, useEffect, useCallback } from 'react'
import Calendar from './components/Calendar'
import MealModal from './components/MealModal'
import Toast from './components/Toast'
import { getMeals, createMeal, updateMeal, deleteMeal, copyMeal } from './api/meals'

// Helper functions for date manipulation
function getWeekStart(date) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday is first day
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
}

function getWeekEnd(date) {
    const start = getWeekStart(date)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return end
}

function formatDate(date) {
    // Use local date components to avoid timezone issues
    // toISOString() converts to UTC which can shift the date
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function formatDateRange(start, end) {
    const options = { month: 'short', day: 'numeric' }
    const startStr = start.toLocaleDateString('en-US', options)
    const endStr = end.toLocaleDateString('en-US', { ...options, year: 'numeric' })
    return `${startStr} - ${endStr}`
}

export default function App() {
    const [currentDate, setCurrentDate] = useState(() => new Date())
    const [meals, setMeals] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [modalData, setModalData] = useState(null)
    const [toast, setToast] = useState(null)

    const weekStart = getWeekStart(currentDate)
    const weekEnd = getWeekEnd(currentDate)

    // Fetch meals for current week
    const fetchMeals = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getMeals(formatDate(weekStart), formatDate(weekEnd))
            setMeals(data)
            setError(null)
        } catch (err) {
            setError(err.message)
            showToast('Error loading meals', 'error')
        } finally {
            setLoading(false)
        }
    }, [weekStart.getTime(), weekEnd.getTime()])

    useEffect(() => {
        fetchMeals()
    }, [fetchMeals])

    // Navigation
    const goToPreviousWeek = () => {
        const prev = new Date(currentDate)
        prev.setDate(prev.getDate() - 7)
        setCurrentDate(prev)
    }

    const goToNextWeek = () => {
        const next = new Date(currentDate)
        next.setDate(next.getDate() + 7)
        setCurrentDate(next)
    }

    // Toast helper
    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    // Open modal for adding/editing meal
    const openModal = (date, mealType, existingMeal = null) => {
        setModalData({
            date,
            mealType,
            meal: existingMeal
        })
    }

    const closeModal = () => {
        setModalData(null)
    }

    // Save meal (create or update)
    const handleSaveMeal = async (name) => {
        if (!modalData) return

        try {
            if (modalData.meal) {
                // Update existing
                await updateMeal(modalData.meal.id, { name })
                showToast('Meal updated!')
            } else {
                // Create new
                await createMeal({
                    date: modalData.date,
                    meal_type: modalData.mealType,
                    name
                })
                showToast('Meal added!')
            }
            closeModal()
            fetchMeals()
        } catch (err) {
            showToast(err.message, 'error')
        }
    }

    // Delete meal
    const handleDeleteMeal = async () => {
        if (!modalData?.meal) return

        try {
            await deleteMeal(modalData.meal.id)
            showToast('Meal deleted!')
            closeModal()
            fetchMeals()
        } catch (err) {
            showToast(err.message, 'error')
        }
    }

    // Copy meal
    const handleCopyMeal = async (targetDate, targetMealType) => {
        if (!modalData?.meal) return

        try {
            await copyMeal(modalData.meal.id, targetDate, targetMealType)
            showToast('Meal copied!')
            fetchMeals()
        } catch (err) {
            showToast(err.message, 'error')
        }
    }

    // Get week days array
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(weekStart)
        day.setDate(weekStart.getDate() + i)
        return day
    })

    // Get meal for specific date and type
    const getMealFor = (date, mealType) => {
        const dateStr = formatDate(date)
        return meals.find(m => m.date === dateStr && m.meal_type === mealType)
    }

    return (
        <>
            {/* Header */}
            <header className="header">
                <div className="header__logo">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
                    </svg>
                </div>
                <div>
                    <h1 className="header__title">Meal Planner</h1>
                    <p className="header__subtitle">Plan your weekly meals with ease</p>
                </div>
            </header>

            {/* Calendar Navigation */}
            <nav className="calendar-nav">
                <div className="calendar-nav__arrows">
                    <button className="calendar-nav__btn" onClick={goToPreviousWeek} aria-label="Previous week">
                        ‹
                    </button>
                    <button className="calendar-nav__btn" onClick={goToNextWeek} aria-label="Next week">
                        ›
                    </button>
                </div>
                <span className="calendar-nav__date">{formatDateRange(weekStart, weekEnd)}</span>
            </nav>

            {/* Calendar */}
            {loading ? (
                <div className="loading">
                    <div className="loading__spinner"></div>
                    Loading...
                </div>
            ) : (
                <Calendar
                    weekDays={weekDays}
                    getMealFor={getMealFor}
                    onSlotClick={openModal}
                />
            )}

            {/* Modal */}
            {modalData && (
                <MealModal
                    date={modalData.date}
                    mealType={modalData.mealType}
                    meal={modalData.meal}
                    onClose={closeModal}
                    onSave={handleSaveMeal}
                    onDelete={handleDeleteMeal}
                    onCopy={handleCopyMeal}
                />
            )}

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} />}
        </>
    )
}
