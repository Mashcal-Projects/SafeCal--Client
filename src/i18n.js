import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";

// const isDevelopment = process.env.NODE_ENV === 'development';
i18n
  .use(HttpApi) // Load translations using http
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass the i18n instance to react-i18next
  .init({
    fallbackLng: "he",
    supportedLngs: ['en', 'he'],
    load: 'languageOnly', 
    debug: true,
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    backend: {
      //   loadPath: isDevelopment ? '/src/locales/{{lng}}/{{ns}}.json' : '/locales/{{lng}}/{{ns}}.json',
      // loadPath: "/src/locales/{{lng}}/{{ns}}.json",
      loadPath: '/locales/{{lng}}/{{ns}}.json', 
    },
    ns: ["dashboard", "login", "report"], // List of namespaces
    defaultNS: "dashboard", // Default namespace used if not specified
  });

export default i18n;
