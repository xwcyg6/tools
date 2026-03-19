'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFont, faExchangeAlt, faSyncAlt, faCopy, faCheck, faExclamationTriangle, faEraser } from '@fortawesome/free-solid-svg-icons';
import ToolHeader from '@/components/ToolHeader';
import BackToTop from '@/components/BackToTop';
import tools from '@/config/tools';
import { useLanguage } from '@/context/LanguageContext';

// 添加CSS变量样式
const styles = {
  card: "card p-6",
  container: "min-h-screen flex flex-col max-w-[1440px] mx-auto p-4 md:p-6",
  input: "search-input w-full",
  textarea: "w-full p-3 bg-block border border-purple-glow rounded-lg text-primary focus:border-purple focus:outline-none focus:ring-1 focus:ring-purple transition-all resize-none font-mono",
  label: "text-sm text-secondary font-medium",
  secondaryText: "text-sm text-tertiary",
  secondaryBtn: "flex items-center gap-1 text-sm px-2 py-1 rounded bg-block-strong hover:bg-block-hover text-secondary transition-colors",
  exchangeBtn: "bg-purple-glow/10 text-purple p-2 rounded-full hover:bg-purple-glow/20 transition-colors",
  error: "p-3 bg-red-900/20 border border-red-700/30 rounded-lg text-error",
  tabButton: "px-3 py-2 text-sm font-medium transition-all",
  activeTab: "bg-block text-primary shadow-sm",
  inactiveTab: "text-tertiary",
  actionBtn: "btn-secondary flex items-center gap-2",
  flexBetween: "flex flex-col sm:flex-row gap-4 justify-between items-center",
}

export default function UnicodeConverter() {
  const { t } = useLanguage();
  
  // 从工具配置中获取当前工具信息
  const toolConfig = tools.find(tool => tool.code === 'unicode_converter');
  
  // 状态管理
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [operation, setOperation] = useState('encode'); // 'encode' 或 'decode'
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // 当输入文本或操作变化时，自动执行转换
  useEffect(() => {
    processConversion();
  }, [inputText, operation]);
  
  // 执行转换操作
  const processConversion = () => {
    setError(null);
    
    if (!inputText) {
      setOutputText('');
      return;
    }
    
    try {
      if (operation === 'encode') {
        // 文本转Unicode编码
        const result = Array.from(inputText)
          .map(char => {
            const code = char.charCodeAt(0);
            // 只转换非ASCII字符
            if (code > 127) {
              return `\\u${code.toString(16).padStart(4, '0')}`;
            }
            return char;
          })
          .join('');
        
        setOutputText(result);
      } else {
        // Unicode编码转文本
        const result = inputText.replace(/\\u([0-9a-fA-F]{4})/g, (match, group) => {
          return String.fromCharCode(parseInt(group, 16));
        });
        
        setOutputText(result);
      }
    } catch (err) {
      console.error(t('tools.unicode_converter.conversion_error'), err);
      setError(`${t('tools.unicode_converter.conversion_error')}${(err as Error).message}`);
      setOutputText('');
    }
  };
  
  // 复制输出内容到剪贴板
  const copyToClipboard = () => {
    if (!outputText) return;
    
    navigator.clipboard.writeText(outputText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error(t('tools.unicode_converter.copy_failed'), err));
  };
  
  // 清空输入和输出
  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setError(null);
  };
  
  // 切换操作类型（编码/解码）
  const toggleOperation = () => {
    // 交换输入和输出文本
    const newOperation = operation === 'encode' ? 'decode' : 'encode';
    const temp = inputText;
    setInputText(outputText);
    setOutputText(temp);
    setOperation(newOperation);
    setError(null);
  };
  
  // 加载示例文本
  const loadExample = () => {
    const examples = {
      encode: '你好，世界！Hello, World!',
      decode: '\\u4f60\\u597d\\uff0c\\u4e16\\u754c\\uff01Hello, World!'
    };
    
    setInputText(examples[operation as keyof typeof examples]);
  };

  return (
    <div className={styles.container}>
      {toolConfig && (
        <ToolHeader 
          toolCode="unicode_converter"
          title=""
          description=""
          icon={toolConfig.icon || faFont}
        />
      )}
      
      {/* 主要内容区域 */}
      <div className={styles.card}>
        <div className="space-y-6">
          {/* 操作类型切换 */}
          <div className={styles.flexBetween}>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-block-strong rounded-md p-1">
                <button
                  className={`${styles.tabButton} ${operation === 'encode' ? styles.activeTab : styles.inactiveTab}`}
                  onClick={() => setOperation('encode')}
                >
                  {t('tools.unicode_converter.text_to_unicode')}
                </button>
                <button
                  className={`${styles.tabButton} ${operation === 'decode' ? styles.activeTab : styles.inactiveTab}`}
                  onClick={() => setOperation('decode')}
                >
                  {t('tools.unicode_converter.unicode_to_text')}
                </button>
              </div>
              
              <div className={styles.secondaryText}>
                {operation === 'encode' 
                  ? t('tools.unicode_converter.text_to_unicode_description') 
                  : t('tools.unicode_converter.unicode_to_text_description')}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                className={styles.actionBtn}
                onClick={loadExample}
              >
                <FontAwesomeIcon icon={faSyncAlt} />
                {t('tools.unicode_converter.load_example')}
              </button>
              <button
                className={styles.actionBtn}
                onClick={clearAll}
              >
                <FontAwesomeIcon icon={faEraser} />
                {t('tools.unicode_converter.clear')}
              </button>
            </div>
          </div>
          
          {/* 输入输出区域 */}
          <div className="grid grid-cols-2 gap-6">
            {/* 输入框 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center h-8">
                <label className={styles.label}>
                  {operation === 'encode' 
                    ? t('tools.unicode_converter.original_text') 
                    : t('tools.unicode_converter.unicode_encoding')}
                </label>
              </div>
              <textarea
                className={styles.textarea}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={operation === 'encode' 
                  ? t('tools.unicode_converter.text_to_unicode_placeholder') 
                  : t('tools.unicode_converter.unicode_to_text_placeholder')}
                rows={10}
              />
            </div>
            
            {/* 输出框 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center h-8">
                <div className="flex items-center">
                  <label className={styles.label}>
                    {operation === 'encode' 
                      ? t('tools.unicode_converter.unicode_encoding') 
                      : t('tools.unicode_converter.converted_text')}
                  </label>
                  <button
                    onClick={toggleOperation}
                    className={styles.exchangeBtn}
                    title={t('tools.unicode_converter.swap_input_output')}
                  >
                    <FontAwesomeIcon icon={faExchangeAlt} />
                  </button>
                </div>
                <div>
                  <button
                    onClick={copyToClipboard}
                    className={styles.secondaryBtn}
                    disabled={!outputText}
                  >
                    <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                    {copied ? t('tools.unicode_converter.copied') : t('tools.unicode_converter.copy')}
                  </button>
                </div>
              </div>
              <textarea
                className={styles.textarea}
                value={outputText}
                readOnly
                placeholder={operation === 'encode' 
                  ? t('tools.unicode_converter.unicode_result_placeholder') 
                  : t('tools.unicode_converter.text_result_placeholder')}
                rows={10}
              />
            </div>
          </div>
          
          {/* 错误提示 */}
          {error && (
            <div className={styles.error}>
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
              {error}
            </div>
          )}
          
          {/* 功能说明 */}
          <div className="bg-block p-4 rounded-lg">
            <h3 className="text-primary font-medium mb-2">{t('tools.unicode_converter.feature_intro')}</h3>
            <p className={styles.secondaryText}>
              {t('tools.unicode_converter.unicode_description')}
            </p>
            <p className={styles.secondaryText}>
              {t('tools.unicode_converter.supported_operations')}
            </p>
            <ul className="list-disc pl-5 text-sm text-tertiary">
              <li>{t('tools.unicode_converter.operation_text_to_unicode')}</li>
              <li>{t('tools.unicode_converter.operation_unicode_to_text')}</li>
            </ul>
            <p className={styles.secondaryText}>
              {t('tools.unicode_converter.note')}
            </p>
          </div>
        </div>
      </div>
      
      {/* 回到顶部按钮 */}
      <BackToTop />
    </div>
  );
} 