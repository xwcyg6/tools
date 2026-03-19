'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt, faCopy, faCheck, faEraser, faHistory } from '@fortawesome/free-solid-svg-icons';
import ToolHeader from '@/components/ToolHeader';
import BackToTop from '@/components/BackToTop';
import tools from '@/config/tools';
import { useLanguage } from '@/context/LanguageContext';

// 添加CSS变量样式
const styles = {
  card: "card p-6",
  container: "min-h-screen flex flex-col max-w-[1440px] mx-auto p-4 md:p-6",
  textarea: "w-full p-3 bg-block border border-purple-glow rounded-lg text-primary focus:border-purple focus:outline-none focus:ring-1 focus:ring-purple transition-all",
  label: "text-sm text-secondary font-medium", 
  secondaryText: "text-sm text-tertiary",
  errorBox: "p-3 bg-red-900/20 border border-red-700/30 rounded-lg text-error",
  successBox: "p-3 bg-green-900/20 border border-green-700/30 rounded-lg text-success",
  iconButton: "p-1 text-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed",
  directionIndicator: (active: boolean) => active ? "text-primary" : "text-tertiary",
  historyItem: "flex px-3 py-2 text-sm rounded-lg cursor-pointer text-secondary hover:bg-block-hover transition-colors",
  noHistoryText: "text-sm text-tertiary py-2 text-center italic",
  swapButton: "bg-block p-2 rounded-full hover:bg-block-hover transition-colors",
  encodeLabel: (active: boolean) => `text-sm ${active ? 'text-purple' : 'text-tertiary'} cursor-pointer`,
  clearButton: "btn-secondary flex items-center gap-2",
  copyButton: "btn-primary flex items-center gap-2",
  historyButton: "btn-secondary flex items-center gap-2",
}

// 类型定义
type Direction = 'encode' | 'decode';
type EncodeMode = 'url' | 'component';

// 历史记录项目接口
interface HistoryItem {
  id: string;
  input: string;
  output: string;
  direction: Direction;
  mode: EncodeMode;
  timestamp: number;
}

export default function UrlEncoder() {
  const { t } = useLanguage();
  // 从工具配置中获取当前工具信息
  const toolConfig = tools.find(tool => tool.code === 'url_encoder');
  
  // 状态管理
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [direction, setDirection] = useState<Direction>('encode');
  const [encodeMode, setEncodeMode] = useState<EncodeMode>('url');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // 从localStorage加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('urlEncoderHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error(t('tools.url_encoder.load_history_error'), e);
      }
    }
  }, [t]);
  
  // 保存历史记录到localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('urlEncoderHistory', JSON.stringify(history));
    }
  }, [history]);
  
  // 转换文本
  useEffect(() => {
    if (!inputText.trim()) {
      setOutputText('');
      setError('');
      return;
    }
    
    try {
      let result = '';
      
      if (direction === 'encode') {
        result = encodeMode === 'url' 
          ? encodeURI(inputText)
          : encodeURIComponent(inputText);
      } else {
        result = encodeMode === 'url' 
          ? decodeURI(inputText)
          : decodeURIComponent(inputText);
      }
      
      setOutputText(result);
      setError('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('tools.url_encoder.error_processing'));
      }
      setOutputText('');
    }
  }, [inputText, direction, encodeMode, t]);
  
  // 反转转换方向
  const swapDirection = () => {
    setDirection(prev => prev === 'encode' ? 'decode' : 'encode');
    setInputText(outputText);
    setOutputText('');
    setError('');
  };
  
  // 复制输出结果
  const copyOutput = () => {
    if (!outputText) return;
    
    navigator.clipboard.writeText(outputText)
      .then(() => {
        setCopied(true);
        setSuccess(t('tools.url_encoder.copied_to_clipboard'));
        
        // 添加到历史记录
        if (inputText.trim() && outputText.trim()) {
          const newItem: HistoryItem = {
            id: Date.now().toString(),
            input: inputText,
            output: outputText,
            direction,
            mode: encodeMode,
            timestamp: Date.now()
          };
          
          setHistory(prev => [newItem, ...prev.slice(0, 9)]); // 保留最近10条记录
        }
        
        setTimeout(() => {
          setCopied(false);
          setSuccess('');
        }, 2000);
      })
      .catch(err => {
        console.error(t('tools.url_encoder.copy_failed'), err);
        setError(t('tools.url_encoder.copy_failed'));
      });
  };
  
  // 清空输入输出
  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setError('');
    setSuccess('');
  };
  
  // 从历史记录中恢复
  const restoreFromHistory = (item: HistoryItem) => {
    setInputText(item.input);
    setDirection(item.direction);
    setEncodeMode(item.mode);
    setShowHistory(false);
  };
  
  // 清空历史记录
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('urlEncoderHistory');
  };
  
  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  return (
    <div className={styles.container}>
      {/* 工具头部 */}
      <ToolHeader 
        toolCode="url_encoder" 
        icon={toolConfig?.icon || faExchangeAlt}
        title=""
        description=""
      />
      
      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧面板 - 输入区域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 转换选项 */}
          <div className={styles.card}>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6 mb-2">
              {/* 转换方向选择器 */}
              <div className="flex items-center space-x-4">
                <span className={styles.directionIndicator(direction === 'encode')}>
                  {t('tools.url_encoder.original_text')}
                </span>
                
                <button onClick={swapDirection} className={styles.swapButton}>
                  <FontAwesomeIcon 
                    icon={faExchangeAlt} 
                    className={`${direction === 'encode' ? 'text-purple' : 'text-purple rotate-180'} transition-transform`}
                  />
                </button>
                
                <span className={styles.directionIndicator(direction === 'decode')}>
                  {t('tools.url_encoder.url_encoded_text')}
                </span>
              </div>
              
              {/* 编码模式选择器 */}
              <div className="flex items-center space-x-4">
                <label className={styles.encodeLabel(encodeMode === 'url')}>
                  <input 
                    type="radio" 
                    name="encodeMode" 
                    value="url" 
                    checked={encodeMode === 'url'} 
                    onChange={() => setEncodeMode('url')} 
                    className="sr-only" 
                  />
                  <span>{t('tools.url_encoder.uri_encoding')}</span>
                </label>
                
                <label className={styles.encodeLabel(encodeMode === 'component')}>
                  <input 
                    type="radio" 
                    name="encodeMode" 
                    value="component" 
                    checked={encodeMode === 'component'} 
                    onChange={() => setEncodeMode('component')}
                    className="sr-only" 
                  />
                  <span>{t('tools.url_encoder.uri_component_encoding')}</span>
                </label>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-tertiary">
              <p>
                {encodeMode === 'url' 
                  ? t('tools.url_encoder.uri_encoding_description')
                  : t('tools.url_encoder.uri_component_description')}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 输入文本区域 */}
            <div className="space-y-3">
              <label className={styles.label}>
                {direction === 'encode' ? t('tools.url_encoder.input_original_text') : t('tools.url_encoder.input_encoded_text')}
              </label>
              <textarea
                className={styles.textarea}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={direction === 'encode' ? t('tools.url_encoder.enter_text_to_encode') : t('tools.url_encoder.enter_text_to_decode')}
                rows={12}
              />
              <div className="flex justify-between">
                <button 
                  onClick={clearAll}
                  disabled={!inputText}
                  className={styles.clearButton}
                >
                  <FontAwesomeIcon icon={faEraser} />
                  {t('tools.url_encoder.clear')}
                </button>
                
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className={styles.historyButton}
                >
                  <FontAwesomeIcon icon={faHistory} />
                  {showHistory ? t('tools.url_encoder.hide_history') : t('tools.url_encoder.show_history')}
                </button>
              </div>
            </div>
            
            {/* 输出文本区域 */}
            <div className="space-y-3">
              <label className={styles.label}>
                {direction === 'encode' ? t('tools.url_encoder.encoding_result') : t('tools.url_encoder.decoding_result')}
              </label>
              <textarea
                className={styles.textarea}
                value={outputText}
                readOnly
                placeholder={direction === 'encode' ? t('tools.url_encoder.encoded_result_placeholder') : t('tools.url_encoder.decoded_result_placeholder')}
                rows={12}
              />
              
              <div className="flex justify-end">
                <button
                  onClick={copyOutput}
                  disabled={!outputText}
                  className={styles.copyButton}
                >
                  <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                  {copied ? t('tools.url_encoder.copied') : t('tools.url_encoder.copy_result')}
                </button>
              </div>
              
              {/* 消息区域 */}
              {error && <div className={styles.errorBox}>{error}</div>}
              {success && <div className={styles.successBox}>{success}</div>}
            </div>
          </div>
        </div>
        
        {/* 右侧面板 - 历史记录 */}
        <div className="space-y-6">
          <div className={styles.card}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium text-primary">{t('tools.url_encoder.history')}</h2>
              
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-sm text-secondary hover:text-primary transition-colors"
                >
                  {t('tools.url_encoder.clear_history')}
                </button>
              )}
            </div>
            
            {history.length > 0 ? (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {history.map(item => (
                  <div 
                    key={item.id} 
                    className={styles.historyItem}
                    onClick={() => restoreFromHistory(item)}
                  >
                    <div className="flex-1 truncate">
                      <div className="font-medium mb-1 truncate">{item.input.substring(0, 30)}{item.input.length > 30 ? '...' : ''}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-tertiary">
                          {item.direction === 'encode' ? t('tools.url_encoder.encode') : t('tools.url_encoder.decode')} • 
                          {item.mode === 'url' ? ' URI' : ' URI Component'}
                        </span>
                        <span className="text-xs text-tertiary">{formatTime(item.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noHistoryText}>
                {t('tools.url_encoder.no_history')}
              </div>
            )}
          </div>
          
          {/* 说明卡片 */}
          <div className={styles.card}>
            <h2 className="font-medium text-primary mb-4">{t('tools.url_encoder.url_encoding_explanation')}</h2>
            <div className="space-y-4 text-sm text-tertiary">
              <div>
                <h3 className="font-medium text-secondary mb-2">{t('tools.url_encoder.uri_vs_component')}</h3>
                <ul className="space-y-2">
                  <li><span className="text-primary">encodeURI</span>: {t('tools.url_encoder.encode_uri_description')}</li>
                  <li><span className="text-primary">encodeURIComponent</span>: {t('tools.url_encoder.encode_uri_component_description')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-secondary mb-2">{t('tools.url_encoder.usage_scenarios')}</h3>
                <ul className="space-y-2">
                  <li>{t('tools.url_encoder.scenario_1')}</li>
                  <li>{t('tools.url_encoder.scenario_2')}</li>
                  <li>{t('tools.url_encoder.scenario_3')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-secondary mb-2">{t('tools.url_encoder.encoding_rules')}</h3>
                <p>{t('tools.url_encoder.rules_1')}</p>
                <p>{t('tools.url_encoder.rules_2')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 回到顶部按钮 */}
      <BackToTop />
    </div>
  );
} 