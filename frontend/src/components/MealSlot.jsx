const MEAL_LABELS = {
    breakfast: 'Desayuno',
    lunch: 'Almuerzo',
    dinner: 'Cena'
}

export default function MealSlot({ mealType, meal, onClick }) {
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
                    <span className="meal-slot__add-text">Añadir {MEAL_LABELS[mealType]}</span>
                </>
            ) : (
                <>
                    <div className="meal-slot__type">{MEAL_LABELS[mealType]}</div>
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
