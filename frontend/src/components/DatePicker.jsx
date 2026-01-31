import { useState, useEffect, useRef } from 'react'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay()
}

function formatDateFromParts(year, month, day) {
    const y = year
    const m = String(month + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${y}-${m}-${d}`
}

function parseDate(dateStr) {
    if (!dateStr) return null
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
}

export default function DatePicker({ selectedDate, onSelect, onClose }) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const selected = parseDate(selectedDate)
    const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth())
    const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear())

    const ref = useRef(null)

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [onClose])

    const goToPrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11)
            setViewYear(viewYear - 1)
        } else {
            setViewMonth(viewMonth - 1)
        }
    }

    const goToNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0)
            setViewYear(viewYear + 1)
        } else {
            setViewMonth(viewMonth + 1)
        }
    }

    const daysInMonth = getDaysInMonth(viewYear, viewMonth)
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

    // Previous month days
    const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1)
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1
    const prevDays = Array.from({ length: firstDay }, (_, i) => {
        const day = prevMonthDays - firstDay + i + 1
        return {
            day,
            isOtherMonth: true,
            date: new Date(prevYear, prevMonth, day),
            dateStr: formatDateFromParts(prevYear, prevMonth, day)
        }
    })

    // Current month days
    const currentDays = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1
        return {
            day,
            isOtherMonth: false,
            date: new Date(viewYear, viewMonth, day),
            dateStr: formatDateFromParts(viewYear, viewMonth, day)
        }
    })

    // Next month days
    const totalShown = prevDays.length + currentDays.length
    const nextDaysNeeded = totalShown <= 35 ? 35 - totalShown : 42 - totalShown
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1
    const nextDays = Array.from({ length: nextDaysNeeded }, (_, i) => {
        const day = i + 1
        return {
            day,
            isOtherMonth: true,
            date: new Date(nextYear, nextMonth, day),
            dateStr: formatDateFromParts(nextYear, nextMonth, day)
        }
    })

    const allDays = [...prevDays, ...currentDays, ...nextDays]

    const handleDayClick = (dayInfo) => {
        onSelect(dayInfo.dateStr)
    }

    const isToday = (date) => {
        return date.toDateString() === today.toDateString()
    }

    const isSelected = (date) => {
        return selected && date.toDateString() === selected.toDateString()
    }

    return (
        <div className="date-picker-dropdown" ref={ref}>
            <div className="date-picker__header">
                <div className="date-picker__nav">
                    <button
                        type="button"
                        className="date-picker__nav-btn"
                        onClick={goToPrevMonth}
                    >
                        ‹
                    </button>
                </div>
                <span className="date-picker__month">
                    {MONTHS[viewMonth]} {viewYear}
                </span>
                <div className="date-picker__nav">
                    <button
                        type="button"
                        className="date-picker__nav-btn"
                        onClick={goToNextMonth}
                    >
                        ›
                    </button>
                </div>
            </div>

            <div className="date-picker__weekdays">
                {WEEKDAYS.map((day) => (
                    <div key={day} className="date-picker__weekday">{day}</div>
                ))}
            </div>

            <div className="date-picker__days">
                {allDays.map((dayInfo, index) => {
                    const classes = ['date-picker__day']
                    if (dayInfo.isOtherMonth) classes.push('date-picker__day--other-month')
                    if (isToday(dayInfo.date)) classes.push('date-picker__day--today')
                    if (isSelected(dayInfo.date)) classes.push('date-picker__day--selected')

                    return (
                        <button
                            key={index}
                            type="button"
                            className={classes.join(' ')}
                            onClick={() => handleDayClick(dayInfo)}
                        >
                            {dayInfo.day}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
