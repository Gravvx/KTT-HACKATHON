import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

const languages = {
  en: { name: 'English', code: 'en', flag: '🇬🇧' },
  hi: { name: 'हिंदी', code: 'hi', flag: '🇮🇳' },
  mr: { name: 'मराठी', code: 'mr', flag: '🇮🇳' },
  bn: { name: 'বাংলা', code: 'bn', flag: '🇮🇳' },
  te: { name: 'తెలుగు', code: 'te', flag: '🇮🇳' },
  ta: { name: 'தமிழ்', code: 'ta', flag: '🇮🇳' },
  gu: { name: 'ગુજરાતી', code: 'gu', flag: '🇮🇳' },
  kn: { name: 'ಕನ್ನಡ', code: 'kn', flag: '🇮🇳' }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('preferredLanguage');
    if (saved && languages[saved]) {
      setCurrentLanguage(saved);
    }
  }, []);

  const changeLanguage = (languageCode) => {
    if (languages[languageCode]) {
      setCurrentLanguage(languageCode);
      localStorage.setItem('preferredLanguage', languageCode);
    }
  };

  const value = {
    currentLanguage,
    changeLanguage,
    languages,
    currentLanguageInfo: languages[currentLanguage]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
