import { useTranslation } from '../i18n/LanguageContext'

const FLAGS = {
    en: '🇬🇧',
    es: '🇪🇸'
}

const LABELS = {
    en: 'English',
    es: 'Español'
}

export default function LanguageSwitcher() {
    const { language, setLanguage, supportedLanguages } = useTranslation()
    
    return (
        <div className="language-switcher">
            {supportedLanguages.map((lang) => (
                <button
                    key={lang}
                    className={`language-switcher__btn ${lang === language ? 'language-switcher__btn--active' : ''}`}
                    onClick={() => setLanguage(lang)}
                    aria-label={LABELS[lang]}
                    title={LABELS[lang]}
                >
                    <span className="language-switcher__flag">{FLAGS[lang]}</span>
                    <span className="language-switcher__label">{LABELS[lang]}</span>
                </button>
            ))}
        </div>
    )
}
