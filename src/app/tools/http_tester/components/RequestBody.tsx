import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles';
import { FormField } from '../types';
import { useLanguage } from '@/context/LanguageContext';

interface RequestBodyProps {
  bodyFormat: 'json' | 'text' | 'form';
  body: string;
  formFields: FormField[];
  onBodyChange: (body: string) => void;
  onBodyFormatChange: (format: 'json' | 'text' | 'form') => void;
  onAddFormField: () => void;
  onUpdateFormField: (id: string, key: string, value: string) => void;
  onRemoveFormField: (id: string) => void;
}

const RequestBody: React.FC<RequestBodyProps> = ({
  bodyFormat,
  body,
  formFields,
  onBodyChange,
  onBodyFormatChange,
  onAddFormField,
  onUpdateFormField,
  onRemoveFormField,
}) => {
  const { t } = useLanguage();

  return (
    <div>
      {/* 请求体格式选择 */}
      <div className="flex gap-2 mb-4">
        <button 
          className={styles.methodButton(bodyFormat === 'json')}
          onClick={() => onBodyFormatChange('json')}
        >
          {t('tools.http_tester.json_format')}
        </button>
        <button 
          className={styles.methodButton(bodyFormat === 'text')}
          onClick={() => onBodyFormatChange('text')}
        >
          {t('tools.http_tester.text_format')}
        </button>
        <button
          className={styles.methodButton(bodyFormat === 'form')}
          onClick={() => onBodyFormatChange('form')}
        >
          {t('tools.http_tester.form_format')}
        </button>
      </div>
      
      {bodyFormat === 'json' && (
        <>
          <textarea 
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            placeholder='{\n  "key": "value"\n}'
            className={styles.textArea}
          />
          <div className="mt-2 text-xs text-tertiary">
            {t('tools.http_tester.enter_request_body')}
          </div>
        </>
      )}
      
      {bodyFormat === 'text' && (
        <textarea 
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder={t('tools.http_tester.enter_request_body')}
          className={styles.textArea}
        />
      )}
      
      {bodyFormat === 'form' && (
        <div>
          <div className="mb-4">
            <button 
              className="btn-secondary text-xs px-3 py-1"
              onClick={onAddFormField}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-1" />
              {t('tools.http_tester.add_form_field')}
            </button>
          </div>
          
          {formFields.map(field => (
            <div key={field.id} className={styles.headerRow}>
              <input 
                type="text"
                placeholder={t('tools.http_tester.form_field_key')}
                value={field.key}
                onChange={(e) => onUpdateFormField(field.id, e.target.value, field.value)}
                className="flex-1 bg-block text-primary px-3 py-1 text-sm rounded-md border border-purple-glow/20 focus:border-purple-glow"
              />
              <input
                type="text"
                placeholder={t('tools.http_tester.form_field_value')}
                value={field.value}
                onChange={(e) => onUpdateFormField(field.id, field.key, e.target.value)}
                className="flex-1 bg-block text-primary px-3 py-1 text-sm rounded-md border border-purple-glow/20 focus:border-purple-glow"
              />
              <button 
                onClick={() => onRemoveFormField(field.id)}
                className={styles.iconButton}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          ))}
          
          <div className="mt-2 text-xs text-tertiary">
            {t('tools.http_tester.enter_request_body')}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestBody; 