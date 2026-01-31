import { useState, useEffect } from 'react'
import DatePicker from './DatePicker'
import { useTranslation } from '../i18n/LanguageContext'
import { searchMealsByIngredient } from '../api/meals'

const MEAL_EMOJIS = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙'
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner']
const MAX_INGREDIENTS = 10

export default function MealModal({ date, mealType, meal, onClose, onSave, onDelete, onCopy }) {
    const { t } = useTranslation()
    const mealLabels = t('meals')
    
    const [name, setName] = useState(meal?.name || '')
    const [ingredients, setIngredients] = useState(meal?.ingredients || [])
    const [ingredientInput, setIngredientInput] = useState('')
    const [copyDate, setCopyDate] = useState('')
    const [copyMealType, setCopyMealType] = useState('breakfast')
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showTypeSelect, setShowTypeSelect] = useState(false)
    const [saving, setSaving] = useState(false)
    const [copying, setCopying] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [isSearchExpanded, setIsSearchExpanded] = useState(false)

    const isEditing = !!meal
    const canSave = name.trim().length > 0
    const canCopy = isEditing && copyDate
    const canAddIngredient = ingredients.length < MAX_INGREDIENTS && ingredientInput.trim().length > 0

    // Debounced search effect
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([])
            return
        }

        const timer = setTimeout(async () => {
            setIsSearching(true)
            try {
                const results = await searchMealsByIngredient(searchTerm.trim())
                setSearchResults(results)
            } catch (error) {
                console.error('Search failed:', error)
                setSearchResults([])
            } finally {
                setIsSearching(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchTerm])

    const handleSelectSearchResult = (result) => {
        setName(result.name)
        setIngredients(result.ingredients || [])
        setSearchTerm('')
        setSearchResults([])
    }

    function formatDisplayDate(dateStr) {
        const [year, month, day] = dateStr.split('-').map(Number)
        const dateObj = new Date(year, month - 1, day)
        return dateObj.toLocaleDateString(t('dateLocale'), {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        })
    }

    const handleAddIngredient = () => {
        const trimmed = ingredientInput.trim()
        if (trimmed && ingredients.length < MAX_INGREDIENTS) {
            if (!ingredients.includes(trimmed)) {
                setIngredients([...ingredients, trimmed])
            }
            setIngredientInput('')
        }
    }

    const handleRemoveIngredient = (index) => {
        setIngredients(ingredients.filter((_, i) => i !== index))
    }

    const handleIngredientKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && canAddIngredient) {
            e.preventDefault()
            handleAddIngredient()
        }
    }

    const handleSave = async () => {
        if (!canSave) return
        setSaving(true)
        await onSave(name.trim(), ingredients)
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
                <div className="modal__header">
                    <div className="modal__icon">🍴</div>
                    <div className="modal__title-group">
                        <h2 className="modal__title">
                            {isEditing ? t('editMeal', { mealType: mealLabels[mealType] }) : t('addMealTitle', { mealType: mealLabels[mealType] })}
                        </h2>
                        <p className="modal__subtitle">
                            {MEAL_EMOJIS[mealType]} {formatDisplayDate(date)}
                        </p>
                    </div>
                    <button className="modal__close" onClick={onClose} aria-label={t('close')}>
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="modal__body">
                    {/* Meal Name */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="meal-name">{t('mealName')}</label>
                        <input
                            id="meal-name"
                            type="text"
                            className="form-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('mealNamePlaceholder')}
                            autoFocus
                        />
                    </div>

                    {/* Ingredients */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="ingredient-input">
                            {t('ingredients')}
                        </label>
                        <div className="ingredients-input">
                            <div className="ingredients-input__field">
                                <input
                                    id="ingredient-input"
                                    type="text"
                                    className="form-input"
                                    value={ingredientInput}
                                    onChange={(e) => setIngredientInput(e.target.value)}
                                    onKeyDown={handleIngredientKeyDown}
                                    placeholder={t('addIngredientPlaceholder')}
                                    disabled={ingredients.length >= MAX_INGREDIENTS}
                                />
                                <button
                                    type="button"
                                    className="btn btn--outline"
                                    onClick={handleAddIngredient}
                                    disabled={!canAddIngredient}
                                >
                                    {t('add')}
                                </button>
                            </div>
                            {ingredients.length > 0 && (
                                <div className="chips">
                                    {ingredients.map((ingredient, index) => (
                                        <span key={index} className="chip">
                                            {ingredient}
                                            <button
                                                type="button"
                                                className="chip__remove"
                                                onClick={() => handleRemoveIngredient(index)}
                                                aria-label={t('removeIngredient', { ingredient })}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="ingredients-input__limit">
                                {ingredients.length}/{MAX_INGREDIENTS}
                            </div>
                        </div>
                    </div>

                    {/* Search Section (Collapsible) */}
                    <div className={`search-section ${isSearchExpanded ? 'search-section--expanded' : ''}`}>
                        <button
                            type="button"
                            className="search-section__header"
                            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                        >
                            <span className="search-section__title">
                                <span>🔍</span> {t('searchByIngredient')}
                            </span>
                            <span className="search-section__toggle">{isSearchExpanded ? '▲' : '▼'}</span>
                        </button>
                        {isSearchExpanded && (
                            <div className="search-section__content">
                                <input
                                    type="text"
                                    className="form-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t('searchPlaceholder')}
                                />
                                {isSearching && (
                                    <div className="search-results">
                                        <div className="search-results__empty">{t('searching')}</div>
                                    </div>
                                )}
                                {!isSearching && searchTerm.trim() && searchResults.length === 0 && (
                                    <div className="search-results">
                                        <div className="search-results__empty">{t('noResults')}</div>
                                    </div>
                                )}
                                {!isSearching && searchResults.length > 0 && (
                                    <div className="search-results">
                                        {searchResults.map((result) => (
                                            <div
                                                key={result.id}
                                                className="search-result-item"
                                                onClick={() => handleSelectSearchResult(result)}
                                            >
                                                <span className="search-result-item__name">{result.name}</span>
                                                <span className="search-result-item__meta">
                                                    {MEAL_EMOJIS[result.meal_type]} {formatDisplayDate(result.date)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Copy Section (only for existing meals) */}
                    {isEditing && (
                        <div className="copy-section">
                            <div className="copy-section__title">
                                <span>📋</span> {t('copyToAnotherDay')}
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
                                        <span>{copyDate ? formatDisplayDate(copyDate) : t('selectDate')}</span>
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
                                                {MEAL_EMOJIS[copyMealType]} {mealLabels[copyMealType]}
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
                                                        {MEAL_EMOJIS[type]} {mealLabels[type]}
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
                                    {t('cancel')}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn--secondary"
                                    onClick={handleCopy}
                                    disabled={!canCopy || copying}
                                >
                                    📋 {copying ? t('copying') : t('copy')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="modal__footer">
                    {isEditing && (
                        <button type="button" className="btn btn--danger" onClick={onDelete}>
                            {t('delete')}
                        </button>
                    )}
                    <button type="button" className="btn btn--outline" onClick={onClose}>
                        {t('cancel')}
                    </button>
                    <button
                        type="button"
                        className="btn btn--primary"
                        onClick={handleSave}
                        disabled={!canSave || saving}
                    >
                        {saving ? t('saving') : t('save')}
                    </button>
                </div>
            </div>
        </div>
    )
}
