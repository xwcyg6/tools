'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import languages, { Language, LanguageData } from '@/config/i18n';

interface LanguageContextType {
  language: Language;
  t: (key: string) => string;
  changeLanguage: (lang: Language) => void;
  languageData: LanguageData;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('zh');
  const [languageData, setLanguageData] = useState<LanguageData>(languages.zh);
  
  // 根据浏览器语言和本地存储初始化语言设置
  useEffect(() => {
    // 检查localStorage中是否有语言设置
    const savedLanguage = localStorage.getItem('language') as Language;
    
    if (savedLanguage && languages[savedLanguage]) {
      setLanguage(savedLanguage);
      setLanguageData(languages[savedLanguage]);
      // 同步更新HTML的lang属性
      document.documentElement.lang = savedLanguage === 'zh' ? 'zh-CN' : 'en';
    } else {
      // 根据浏览器语言判断
      const browserLang = navigator.language.toLowerCase().split('-')[0];
      const defaultLang = browserLang === 'zh' ? 'zh' : 'en';
      
      setLanguage(defaultLang);
      setLanguageData(languages[defaultLang]);
      localStorage.setItem('language', defaultLang);
      // 同步更新HTML的lang属性
      document.documentElement.lang = defaultLang === 'zh' ? 'zh-CN' : 'en';
    }
  }, []);
  
  // 翻译函数
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: Record<string, unknown> | string | unknown = languageData;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in (value as Record<string, unknown>)) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // 如果找不到翻译，输出警告并返回键名
        console.warn(`[i18n] Missing translation for key: ${key} in language: ${language}`);
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`[i18n] Translation for key: ${key} is not a string in language: ${language}`);
      return key;
    }
    
    return value;
  };
  
  // 切换语言
  const changeLanguage = (lang: Language) => {
    if (languages[lang]) {
      setLanguage(lang);
      setLanguageData(languages[lang]);
      localStorage.setItem('language', lang);
      
      // 更新HTML的lang属性
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    }
  };
  
  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage, languageData }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 自定义hook，方便使用语言上下文
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 