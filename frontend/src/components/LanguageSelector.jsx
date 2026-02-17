import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function LanguageSelector({ variant = 'default' }) {
    const { language, setLanguage, languages } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentLang = languages.find(l => l.code === language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const baseStyles = variant === 'minimal'
        ? "flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm"
        : "flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-sm font-medium";

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={baseStyles}
                aria-label="Select language"
            >
                <Globe className="w-4 h-4 text-purple-600" />
                <span className="hidden sm:inline">{currentLang.flag}</span>
                <span className="hidden md:inline">{currentLang.code.toUpperCase()}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Select Language</p>
                    </div>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                setLanguage(lang.code);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-purple-50 transition-colors ${language === lang.code ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{lang.flag}</span>
                                <span className="font-medium">{lang.name}</span>
                            </div>
                            {language === lang.code && (
                                <Check className="w-4 h-4 text-purple-600" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
