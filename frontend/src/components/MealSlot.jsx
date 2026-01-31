const MEAL_LABELS = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner'
}

export default function MealSlot({ mealType, meal, onClick }) {
    const isEmpty = !meal

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
                    <span className="meal-slot__add-text">Add {MEAL_LABELS[mealType]}</span>
                </>
            ) : (
                <>
                    <div className="meal-slot__type">{MEAL_LABELS[mealType]}</div>
                    <div className="meal-slot__name">{meal.name}</div>
                </>
            )}
        </div>
    )
}
