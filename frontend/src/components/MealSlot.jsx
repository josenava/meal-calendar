import { useTranslation } from '../i18n/LanguageContext'

export default function MealSlot({ mealType, meal, onClick }) {
    const { t } = useTranslation()
    const mealLabels = t('meals')
    const mealLabel = mealLabels[mealType]
    
    const isEmpty = !meal
    const ingredients = meal?.ingredients || []

    return (
        <div
            className={`meal-slot ${isEmpty ? 'meal-slot--empty' : ''}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
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
