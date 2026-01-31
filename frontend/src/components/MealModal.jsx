import { useState } from 'react'
import DatePicker from './DatePicker'

const MEAL_LABELS = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner'
}

const MEAL_EMOJIS = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙'
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner']

function formatDisplayDate(dateStr) {
    // Parse date string manually to avoid timezone issues
    // dateStr is in format "YYYY-MM-DD"
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month is 0-indexed
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    })
}

export default function MealModal({ date, mealType, meal, onClose, onSave, onDelete, onCopy }) {
    const [name, setName] = useState(meal?.name || '')
    const [copyDate, setCopyDate] = useState('')
    const [copyMealType, setCopyMealType] = useState('breakfast')
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showTypeSelect, setShowTypeSelect] = useState(false)
    const [saving, setSaving] = useState(false)
    const [copying, setCopying] = useState(false)

    const isEditing = !!meal
    const canSave = name.trim().length > 0
    const canCopy = isEditing && copyDate

    const handleSave = async () => {
        if (!canSave) return
        setSaving(true)
        await onSave(name.trim())
        setSaving(false)
    }

    const handleCopy = async () => {
        if (!canCopy) return
        setCopying(true)
        await onCopy(copyDate, copyMealType)
        setCopying(false)
        setCopyDate('')
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && canSave) {
            handleSave()
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal__header">
                    <div className="modal__icon">🍴</div>
                    <div className="modal__title-group">
                        <h2 className="modal__title">
                            {isEditing ? 'Edit' : 'Add'} {MEAL_LABELS[mealType]}
                        </h2>
                        <p className="modal__subtitle">
                            {MEAL_EMOJIS[mealType]} {formatDisplayDate(date)}
                        </p>
                    </div>
                    <button className="modal__close" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="modal__body">
                    {/* Meal Name */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="meal-name">Meal Name</label>
                        <input
                            id="meal-name"
                            type="text"
                            className="form-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter meal name..."
                            autoFocus
                        />
                    </div>

                    {/* Copy Section (only for existing meals) */}
                    {isEditing && (
                        <div className="copy-section">
                            <div className="copy-section__title">
                                <span>📋</span> Copy to another day
                            </div>

                            <div className="copy-section__fields">
                                {/* Date Picker */}
                                <div className="copy-section__date-picker" style={{ position: 'relative' }}>
                                    <button
                                        type="button"
                                        className="date-picker-trigger"
                                        onClick={() => setShowDatePicker(!showDatePicker)}
                                    >
                                        <span>📅</span>
                                        <span>{copyDate ? formatDisplayDate(copyDate) : 'Pick a date'}</span>
                                    </button>
                                    {showDatePicker && (
                                        <DatePicker
                                            selectedDate={copyDate}
                                            onSelect={(d) => {
                                                setCopyDate(d)
                                                setShowDatePicker(false)
                                            }}
                                            onClose={() => setShowDatePicker(false)}
                                        />
                                    )}
                                </div>

                                {/* Meal Type Select */}
                                <div className="copy-section__type-select">
                                    <div className="select" style={{ position: 'relative' }}>
                                        <button
                                            type="button"
                                            className="select__trigger"
                                            onClick={() => setShowTypeSelect(!showTypeSelect)}
                                        >
                                            <span className="select__value">
                                                {MEAL_EMOJIS[copyMealType]} {MEAL_LABELS[copyMealType]}
                                            </span>
                                            <span>▾</span>
                                        </button>
                                        {showTypeSelect && (
                                            <div className="select__dropdown">
                                                {MEAL_TYPES.map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        className={`select__option ${type === copyMealType ? 'select__option--selected' : ''}`}
                                                        onClick={() => {
                                                            setCopyMealType(type)
                                                            setShowTypeSelect(false)
                                                        }}
                                                    >
                                                        {MEAL_EMOJIS[type]} {MEAL_LABELS[type]}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="copy-section__actions">
                                <button
                                    type="button"
                                    className="btn btn--outline"
                                    onClick={() => setCopyDate('')}
                                    disabled={!copyDate}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn--secondary"
                                    onClick={handleCopy}
                                    disabled={!canCopy || copying}
                                >
                                    📋 {copying ? 'Copying...' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="modal__footer">
                    {isEditing && (
                        <button type="button" className="btn btn--danger" onClick={onDelete}>
                            Delete
                        </button>
                    )}
                    <button type="button" className="btn btn--outline" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn btn--primary"
                        onClick={handleSave}
                        disabled={!canSave || saving}
                    >
                        {saving ? 'Saving...' : 'Save Meal'}
                    </button>
                </div>
            </div>
        </div>
    )
}
