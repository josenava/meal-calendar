/**
 * Test utilities for components that use translations
 */
import { render } from '@testing-library/react'
import { LanguageProvider } from '../i18n/LanguageContext'

/**
 * Custom render function that wraps components with LanguageProvider
 */
export function renderWithI18n(ui, options = {}) {
    const Wrapper = ({ children }) => (
        <LanguageProvider>
            {children}
        </LanguageProvider>
    )
    
    return render(ui, { wrapper: Wrapper, ...options })
}

export * from '@testing-library/react'
