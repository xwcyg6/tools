'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

interface ToolHeaderProps {
  title: string;
  description: string;
  icon: IconDefinition;
  toolCode: string;
}

export default function ToolHeader({ title, description, icon, toolCode }: ToolHeaderProps) {
  const router = useRouter();
  const { t } = useLanguage();
  
  // 返回首页
  const goBack = () => {
    router.push('/');
  };

  return (
    <header className="flex items-center gap-4 mb-8 rounded-lg p-4 shadow-md border">
      <button 
        className="btn-secondary px-3 py-2"
        onClick={goBack}
      >
        {t('common.backToHome')}
      </button>
      <div className="flex items-center gap-2">
        <div className="icon-container w-10 h-10 flex-shrink-0">
          <FontAwesomeIcon icon={icon} className="icon" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{title || t(`tools.${toolCode}.title`)}</h1>
          <p className="text-sm"
             style={{color: 'rgb(var(--color-text-secondary))'}}
          >{description || t(`tools.${toolCode}.description`)}</p>
        </div>
      </div>
    </header>
  );
} 