import zh from './zh';
import en from './en';

export const languages = {
  zh,
  en
};

export type Language = keyof typeof languages;
export type LanguageData = typeof zh | typeof en;

export default languages; 