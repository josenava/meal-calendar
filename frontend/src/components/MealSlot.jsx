import { useTranslation } from '../i18n/LanguageContext'

export default function MealSlot({
    mealType,
    meal,
    date,
    onClick,
    onDragStart,
    onDragEnd,
    onDrop,
    isDragOver
}) {
    const { t } = useTranslation()
    const mealLabels = t('meals')
    const mealLabel = mealLabels[mealType]

    const isEmpty = !meal
    const ingredients = meal?.ingredients || []
    const hasMeal = !!meal

    const handleDragStart = (e) => {
        if (!hasMeal) return
        e.dataTransfer.setData('application/json', JSON.stringify({
            mealId: meal.id,
            sourceDate: date,
            sourceMealType: mealType
        }))
        e.dataTransfer.effectAllowed = 'move'
        onDragStart?.()
    }

    const handleDragEnd = () => {
        onDragEnd?.()
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const data = e.dataTransfer.getData('application/json')
        if (data) {
            const { mealId: sourceMealId, sourceDate, sourceMealType } = JSON.parse(data)
            // Only trigger swap if dropping on a different slot
            if (sourceDate !== date || sourceMealType !== mealType) {
                onDrop?.(sourceMealId, meal?.id, date, mealType)
            }
        }
    }

    const slotClasses = [
        'meal-slot',
        isEmpty ? 'meal-slot--empty' : '',
        isDragOver ? 'meal-slot--drag-over' : ''
    ].filter(Boolean).join(' ')

    return (
        <div
            className={slotClasses}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
            draggable={hasMeal}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {isEmpty ? (
                <>
                    <span className="meal-slot__add-icon">+</span>
                    <span className="meal-slot__add-text">{t('addMeal', { mealType: mealLabel })}</span>
                </>
            ) : (
                <>
                    <div className="meal-slot__type">{mealLabel}</div>
                    <div className="meal-slot__name">{meal.name}</div>
                    {ingredients.length > 0 && (
                        <div className="chips">
                            {ingredients.map((ingredient, index) => (
                                <span key={index} className="chip chip--small">
                                    {ingredient}
                                </span>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
