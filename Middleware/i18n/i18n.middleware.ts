import i18next from "i18next";
import es from "./locales/es";
import en from "./locales/en";

i18next.init({
  fallbackLng: "es",
  resources: {
    es: {
      translation: es,
    },
    en: {
      translation: en,
    },
  },
});
