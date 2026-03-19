import React from 'react';
import styles from '../styles';
import { HistoryItem, HttpMethod } from '../types';
import { useLanguage } from '@/context/LanguageContext';

interface RequestHistoryProps {
  history: HistoryItem[];
  showHistory: boolean;
  onToggleHistory: () => void;
  onClearHistory: () => void;
  onLoadFromHistory: (item: {url: string, method: HttpMethod}) => void;
}

const RequestHistory: React.FC<RequestHistoryProps> = ({
  history,
  showHistory,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onToggleHistory,
  onClearHistory,
  onLoadFromHistory,
}) => {
  const { t } = useLanguage();
  
  // 格式化日期
  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  return (
    <div className={styles.card}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg text-primary font-medium">{t('tools.http_tester.history')}</h2>
        <div className="flex gap-2">
          {/* <button 
            className="text-sm text-tertiary hover:text-secondary"
            onClick={onToggleHistory}
          >
            {showHistory ? '隐藏' : '显示'}
          </button> */}
          {history.length > 0 && (
            <button 
              className="text-sm text-tertiary hover:text-error"
              onClick={onClearHistory}
            >
              {t('tools.http_tester.clear_history')}
            </button>
          )}
        </div>
      </div>
      
      {history.length > 0 ? (
        <div className="space-y-1">
          {history.map((item, index) => (
            <div 
              key={index} 
              className={styles.historyItem}
              onClick={() => onLoadFromHistory(item)}
            >
              <div className="flex items-center gap-2">
                <span className={styles.historyMethod(item.method)}>
                  {item.method}
                </span>
                <span className="text-sm text-primary truncate max-w-[200px]">
                  {item.url}
                </span>
              </div>
              <span className="text-xs text-tertiary">
                {formatDate(item.timestamp)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-tertiary py-4">
          {t('tools.http_tester.history_empty')}
        </div>
      )}
      
      {!showHistory && history.length > 0 && (
        <div className="text-sm text-tertiary mt-4">
          <p>{t('tools.http_tester.history')}</p>
        </div>
      )}
    </div>
  );
};

export default RequestHistory; 