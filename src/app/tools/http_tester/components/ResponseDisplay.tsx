import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faCopy, faCheck, faFileAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles';
import { HttpResponse, HttpMethod, NetworkType } from '../types';
import JsonRenderer from './JsonRenderer';
import { generateMarkdownDoc } from '../utils';
import MarkdownPreview from './MarkdownPreview';
import { useLanguage } from '@/context/LanguageContext';

interface ResponseDisplayProps {
  response: HttpResponse | null;
  url: string;
  method: HttpMethod;
  headers: {key: string; value: string; id: string}[];
  body: string;
  bodyFormat: 'json' | 'text' | 'form';
  formFields: {key: string; value: string; id: string}[];
  networkType: NetworkType;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ 
  response, 
  url, 
  method, 
  headers, 
  body, 
  bodyFormat, 
  formFields, 
  networkType
}) => {
  const { t } = useLanguage();
  const [responseTab, setResponseTab] = useState<'body' | 'headers' | 'info'>('body');
  const [copiedJson, setCopiedJson] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // 美化JSON
  const formatJson = (json: string): string => {
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  };
  
  // 检测内容是否为JSON
  const isJsonContent = (data: unknown): boolean => {
    // 检查响应头中的Content-Type
    if (response?.headers && response.headers['content-type']?.includes('application/json')) {
      return true;
    }
    
    // 对于对象类型的数据，直接判定为JSON
    if (typeof data === 'object' && data !== null) {
      return true;
    }
    
    // 尝试解析字符串
    if (typeof data === 'string') {
      try {
        JSON.parse(data);
        return true;
      } catch {
        return false;
      }
    }
    
    return false;
  };
  
  // 复制响应内容
  const copyResponse = () => {
    if (!response) return;
    
    const textToCopy = responseTab === 'body' 
      ? typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data, null, 2)
      : Object.entries(response.headers)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
      })
      .catch(err => console.error(t('tools.http_tester.copy_failed'), err));
  };

  // 生成并显示Markdown接口文档
  const handleGenerateMarkdown = () => {
    if (!response) return;
    
    const markdownDoc = generateMarkdownDoc(
      url,
      method, 
      headers, 
      body, 
      bodyFormat,
      formFields,
      response,
      networkType
    );
    
    setMarkdownContent(markdownDoc);
    setShowMarkdownPreview(true);
  };
  
  // 关闭Markdown预览窗口
  const handleCloseMarkdownPreview = () => {
    setShowMarkdownPreview(false);
  };

  // 调整响应区域高度以适应可用空间并跟随内容变化
  useEffect(() => {
    if (!response) return;
    
    const adjustHeight = () => {
      if (!containerRef.current || !contentRef.current) return;
      
      // 计算可用的视窗高度
      const viewportHeight = window.innerHeight;
      // 获取容器到视窗顶部的距离
      const containerTop = containerRef.current.getBoundingClientRect().top;
      // 设置底部边距
      const bottomMargin = 40;
      // 计算容器可用的最大高度（视口高度限制）
      const maxViewportHeight = viewportHeight - containerTop - bottomMargin;
      
      // 获取内容实际高度
      const contentHeight = contentRef.current.scrollHeight;
      
      // 设置容器初始高度为视口可用高度
      let targetHeight = Math.max(600, maxViewportHeight);
      
      // 如果内容高度超过初始高度，则让容器跟随内容增高
      // 最小高度600px，最大不超过内容高度+100px（为头部和边距预留空间）
      if (contentHeight > targetHeight - 100) {
        targetHeight = Math.min(contentHeight + 100, 2000); // 设置一个最大值2000px，防止过长
      }
      
      // 应用高度
      containerRef.current.style.minHeight = `${targetHeight}px`;
    };
    
    // 初始调整
    adjustHeight();
    
    // 设置一个延时调整，确保内容渲染完成后再次计算高度
    const timeoutId = setTimeout(adjustHeight, 100);
    
    // 监听窗口大小变化
    window.addEventListener('resize', adjustHeight);
    
    return () => {
      window.removeEventListener('resize', adjustHeight);
      clearTimeout(timeoutId);
    };
  }, [response, responseTab]);

  return (
    <div className={`${styles.card}`} ref={containerRef}>
      <h2 className="text-lg text-primary font-medium mb-4">{t('tools.http_tester.response_result')}</h2>
      
      {response ? (
        <div className="flex flex-col flex-grow w-full">
          {/* 响应头部 */}
          <div className={styles.responseHeader}>
            <div className="flex items-center gap-2">
              <span className={styles.statusBadge(response.status)}>
                {response.status}
              </span>
              <span className="text-sm text-secondary">
                {response.statusText}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={styles.statsText}>
                {response.size} bytes | {response.time}ms
              </div>
              
              <button 
                className={styles.copyButton}
                onClick={copyResponse}
                title={t('tools.http_tester.copy')}
              >
                <FontAwesomeIcon icon={copiedJson ? faCheck : faCopy} />
                {copiedJson ? t('tools.http_tester.copied') : t('tools.http_tester.copy')}
              </button>
              
              <button 
                className={styles.copyButton}
                onClick={handleGenerateMarkdown}
                title={t('tools.http_tester.generate_doc')}
              >
                <FontAwesomeIcon icon={faFileAlt} className="mr-1" />
                {t('tools.http_tester.generate_doc')}
              </button>
            </div>
          </div>
          
          {/* 响应标签页 */}
          <div className="border-b border-purple-glow/30 mb-4">
            <div className="flex">
              <button 
                className={styles.tabButton(responseTab === 'body')}
                onClick={() => setResponseTab('body')}
              >
                {t('tools.http_tester.response_body')}
              </button>
              <button 
                className={styles.tabButton(responseTab === 'headers')}
                onClick={() => setResponseTab('headers')}
              >
                {t('tools.http_tester.response_headers')}
              </button>
              <button 
                className={styles.tabButton(responseTab === 'info')}
                onClick={() => setResponseTab('info')}
              >
                {t('tools.http_tester.request_info')}
              </button>
            </div>
          </div>
          
          {/* 响应内容 */}
          <div className={`${styles.responseBox} flex-grow`} ref={contentRef}>
            {responseTab === 'body' && (
              <>
                {isJsonContent(response.data) 
                  ? <JsonRenderer data={response.data} />
                  : (typeof response.data === 'string' 
                    ? response.data
                    : formatJson(JSON.stringify(response.data)))}
                    
              </>
            )}
            
            {responseTab === 'headers' && (
              Object.entries(response.headers).map(([key, value]) => (
                <div key={key}>
                  <span className="text-purple">{key}</span>: {value}
                </div>
              ))
            )}
            
            {responseTab === 'info' && (
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-purple font-medium">{t('tools.http_tester.network_mode')}:</span> {networkType === 'local' ? t('tools.http_tester.network_mode_local') : t('tools.http_tester.network_mode_public')}
                  {networkType === 'local' && (
                    <span className="ml-2 text-amber-400 text-xs">
                      <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                      {t('tools.http_tester.cors_description')}
                    </span>
                  )}
                </div>
                <div className="text-sm">
                  <span className="text-purple font-medium">{t('tools.http_tester.request_url')}:</span> {url}
                </div>
                <div className="text-sm">
                  <span className="text-purple font-medium">{t('tools.http_tester.request_method')}:</span> {method}
                </div>
                <div className="text-sm">
                  <span className="text-purple font-medium">{t('tools.http_tester.response_result')}:</span> {response.time}ms
                </div>
                <div className="text-sm">
                  <span className="text-purple font-medium">{t('tools.http_tester.response_result')}:</span> {response.size} bytes
                </div>
                {Object.entries(headers).length > 0 && (
                  <div>
                    <div className="text-purple font-medium text-sm mt-4 mb-2">{t('tools.http_tester.request_headers')}</div>
                    <div className="bg-background/40 p-3 rounded text-xs">
                      {headers.filter(h => h.key && h.value).map((header, index) => (
                        <div key={header.id || index}>
                          {header.key}: {header.value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {['POST', 'PUT', 'PATCH'].includes(method) && (
                  <div>
                    <div className="text-purple font-medium text-sm mt-4 mb-2">{t('tools.http_tester.request_body')}</div>
                    <div className="bg-background/40 p-3 rounded text-xs break-all font-mono">
                      {bodyFormat === 'json' ? formatJson(body) : 
                       bodyFormat === 'form' ? 
                         formFields.filter(f => f.key && f.value)
                           .map((field, _index) => `${field.key}=${field.value}`)
                           .join('&') : 
                         body}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-tertiary">
          <FontAwesomeIcon icon={faGlobe} className="text-4xl mb-4 text-purple-glow" />
          <p>{t('tools.http_tester.enter_url')}</p>
        </div>
      )}
      
      {/* Markdown预览模态窗口 */}
      <MarkdownPreview 
        markdown={markdownContent}
        isOpen={showMarkdownPreview}
        onClose={handleCloseMarkdownPreview}
      />
    </div>
  );
};

export default ResponseDisplay; 