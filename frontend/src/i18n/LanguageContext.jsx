import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { translations, defaultLanguage, supportedLanguages } from './translations'

const LanguageContext = createContext(null)

// Safe localStorage access
const storage = {
    getItem: (key) => {
        try {
            return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null
        } catch {
            return null
        }
    },
    setItem: (key, value) => {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(key, value)
            }
        } catch {
            // Ignore storage errors
        }
    }
}

// Get initial language from localStorage or browser preference
function getInitialLanguage() {
    // Check localStorage first
    const stored = storage.getItem('language')
    if (stored && supportedLanguages.includes(stored)) {
        return stored
    }
    
    // Check browser language
    if (typeof navigator !== 'undefined') {
        const browserLang = navigator.language?.split('-')[0]
        if (browserLang && supportedLanguages.includes(browserLang)) {
            return browserLang
        }
    }
    
    return defaultLanguage
}

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(getInitialLanguage)
    
    const setLanguage = useCallback((lang) => {
        if (supportedLanguages.includes(lang)) {
            setLanguageState(lang)
            storage.setItem('language', lang)
        }
    }, [])
    
    // Get translation with optional interpolation
    const t = useCallback((key, params = {}) => {
        const keys = key.split('.')
        let value = translations[language]
        
        for (const k of keys) {
            value = value?.[k]
            if (value === undefined) break
        }
        
        // Fallback to default language if not found
        if (value === undefined) {
            value = translations[defaultLanguage]
            for (const k of keys) {
                value = value?.[k]
                if (value === undefined) break
            }
        }
        
        // Return key if still not found
        if (value === undefined) {
            return key
        }
        
        // If it's not a string, return as is (for arrays, objects)
        if (typeof value !== 'string') {
            return value
        }
        
        // Interpolate parameters
        return value.replace(/\{(\w+)\}/g, (_, paramKey) => params[paramKey] ?? `{${paramKey}}`)
    }, [language])
    
    const contextValue = useMemo(() => ({
        language,
        setLanguage,
        t,
        supportedLanguages
    }), [language, setLanguage, t])
    
    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useTranslation() {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider')
    }
    return context
}
