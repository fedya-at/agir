import React, { createContext, useContext, useState, useEffect } from "react";
import translations from "../utils/translations";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("app-language");
    return savedLanguage || "fr"; // Default to French
  });

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("app-language", newLanguage);
  };

  const t = (key) => {
    const keys = key.split(".");
    let translation = translations[language];

    for (const k of keys) {
      if (translation && typeof translation === "object") {
        translation = translation[k];
      } else {
        // Fallback to French if key not found in current language
        translation = translations.fr;
        for (const fallbackKey of keys) {
          if (translation && typeof translation === "object") {
            translation = translation[fallbackKey];
          } else {
            break;
          }
        }
        break;
      }
    }

    return translation || key;
  };

  const value = {
    language,
    changeLanguage,
    t,
    translate: t, // Alias for backward compatibility
    isEnglish: language === "en",
    isFrench: language === "fr",
  };

  useEffect(() => {
    // Update document language attribute
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
