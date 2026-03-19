import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles';
import { RequestHeader } from '../types';
import { useLanguage } from '@/context/LanguageContext';

interface RequestHeadersProps {
  headers: RequestHeader[];
  onAddHeader: () => void;
  onUpdateHeader: (id: string, key: string, value: string) => void;
  onRemoveHeader: (id: string) => void;
}

const RequestHeaders: React.FC<RequestHeadersProps> = ({
  headers,
  onAddHeader,
  onUpdateHeader,
  onRemoveHeader,
}) => {
  const { t } = useLanguage();

  return (
    <div>
      <div className="mb-4">
        <button 
          className="btn-secondary text-xs px-3 py-1"
          onClick={onAddHeader}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          {t('tools.http_tester.add_header')}
        </button>
      </div>
      
      {headers.map(header => (
        <div key={header.id} className={styles.headerRow}>
          <input 
            type="text"
            placeholder={t('tools.http_tester.header_key')}
            value={header.key}
            onChange={(e) => onUpdateHeader(header.id, e.target.value, header.value)}
            className="flex-1 bg-block text-primary px-3 py-1 text-sm rounded-md border border-purple-glow/20 focus:border-purple-glow"
          />
          <input
            type="text"
            placeholder={t('tools.http_tester.header_value')}
            value={header.value}
            onChange={(e) => onUpdateHeader(header.id, header.key, e.target.value)}
            className="flex-1 bg-block text-primary px-3 py-1 text-sm rounded-md border border-purple-glow/20 focus:border-purple-glow"
          />
          <button 
            onClick={() => onRemoveHeader(header.id)}
            className={styles.iconButton}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default RequestHeaders; 