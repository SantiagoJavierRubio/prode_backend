import { Request, Response, NextFunction } from "express";
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

export const setLocale = (req: Request, res: Response, next: NextFunction) => {
  let locale = req.headers["preferred-language"];
  if (locale instanceof Array) locale = locale[0];
  if (!locale) locale = "es";
  i18next.changeLanguage(locale);
  next();
};
