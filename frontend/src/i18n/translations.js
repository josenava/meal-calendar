export const translations = {
    en: {
        // App header
        appTitle: 'Meal Planner',
        appSubtitle: 'Plan your weekly meals with ease',
        
        // Navigation
        previousWeek: 'Previous week',
        nextWeek: 'Next week',
        
        // Loading
        loading: 'Loading...',
        errorLoadingMeals: 'Error loading meals',
        
        // Meal types
        meals: {
            breakfast: 'Breakfast',
            lunch: 'Lunch',
            dinner: 'Dinner'
        },
        
        // Weekdays (short)
        weekdaysShort: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        
        // Weekdays (mini for date picker)
        weekdaysMini: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
        
        // Months
        months: [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ],
        
        // Meal slot
        addMeal: 'Add {mealType}',
        
        // Modal
        editMeal: 'Edit {mealType}',
        addMealTitle: 'Add {mealType}',
        mealName: 'Meal name',
        mealNamePlaceholder: 'Enter meal name...',
        ingredients: 'Ingredients',
        addIngredientPlaceholder: 'Add ingredient...',
        add: 'Add',
        removeIngredient: 'Remove {ingredient}',
        close: 'Close',
        
        // Copy section
        copyToAnotherDay: 'Copy to another day',
        selectDate: 'Select a date',
        cancel: 'Cancel',
        copy: 'Copy',
        copying: 'Copying...',
        
        // Actions
        delete: 'Delete',
        save: 'Save',
        saving: 'Saving...',
        
        // Toast messages
        mealAdded: 'Meal added!',
        mealUpdated: 'Meal updated!',
        mealDeleted: 'Meal deleted!',
        mealCopied: 'Meal copied!',
        
        // Language
        language: 'Language',
        
        // Search
        searchByIngredient: 'Search by ingredient',
        searchPlaceholder: 'Enter ingredient name...',
        noResults: 'No meals found',
        searching: 'Searching...',
        
        // Date locale
        dateLocale: 'en-US'
    },
    es: {
        // App header
        appTitle: 'Planificador de Comidas',
        appSubtitle: 'Planifica tus comidas semanales fácilmente',
        
        // Navigation
        previousWeek: 'Semana anterior',
        nextWeek: 'Semana siguiente',
        
        // Loading
        loading: 'Cargando...',
        errorLoadingMeals: 'Error al cargar las comidas',
        
        // Meal types
        meals: {
            breakfast: 'Desayuno',
            lunch: 'Comida',
            dinner: 'Cena'
        },
        
        // Weekdays (short)
        weekdaysShort: ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'],
        
        // Weekdays (mini for date picker)
        weekdaysMini: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'],
        
        // Months
        months: [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ],
        
        // Meal slot
        addMeal: 'Añadir {mealType}',
        
        // Modal
        editMeal: 'Editar {mealType}',
        addMealTitle: 'Añadir {mealType}',
        mealName: 'Nombre de la comida',
        mealNamePlaceholder: 'Introduce el nombre...',
        ingredients: 'Ingredientes',
        addIngredientPlaceholder: 'Añadir ingrediente...',
        add: 'Añadir',
        removeIngredient: 'Eliminar {ingredient}',
        close: 'Cerrar',
        
        // Copy section
        copyToAnotherDay: 'Copiar a otro día',
        selectDate: 'Elige una fecha',
        cancel: 'Cancelar',
        copy: 'Copiar',
        copying: 'Copiando...',
        
        // Actions
        delete: 'Eliminar',
        save: 'Guardar',
        saving: 'Guardando...',
        
        // Toast messages
        mealAdded: '¡Comida añadida!',
        mealUpdated: '¡Comida actualizada!',
        mealDeleted: '¡Comida eliminada!',
        mealCopied: '¡Comida copiada!',
        
        // Language
        language: 'Idioma',
        
        // Search
        searchByIngredient: 'Buscar por ingrediente',
        searchPlaceholder: 'Introduce nombre del ingrediente...',
        noResults: 'No se encontraron comidas',
        searching: 'Buscando...',
        
        // Date locale
        dateLocale: 'es-ES'
    }
}

export const defaultLanguage = 'en'
export const supportedLanguages = ['en', 'es']
