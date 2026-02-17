import React, { createContext, useContext, useState, useEffect } from 'react';
import { t as translate, getInitialLanguage, languages } from '@/lib/i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(getInitialLanguage);
    const [dir, setDir] = useState('ltr');

    useEffect(() => {
        localStorage.setItem('favatis-language', language);
        const langConfig = languages.find(l => l.code === language);
        setDir(langConfig?.dir || 'ltr');
        document.documentElement.lang = language;
        document.documentElement.dir = langConfig?.dir || 'ltr';
    }, [language]);

    const t = (key) => translate(key, language);

    const value = {
        language,
        setLanguage,
        t,
        dir,
        languages
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export default LanguageContext;
