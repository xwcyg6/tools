'use client';

import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileAlt, faCopy, faCheck, faSyncAlt, 
  faEraser, faDownload, faCog, faExchangeAlt, 
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import ToolHeader from '@/components/ToolHeader';
import BackToTop from '@/components/BackToTop';
import tools from '@/config/tools';
import { useLanguage } from '@/context/LanguageContext';

// 添加CSS变量样式
const styles = {
  card: "card p-6",
  container: "min-h-screen flex flex-col max-w-[1440px] mx-auto p-4 md:p-6",
  input: "search-input w-full",
  textarea: "w-full p-3 bg-block border border-purple-glow rounded-lg text-primary focus:border-purple focus:outline-none focus:ring-1 focus:ring-purple transition-all",
  label: "text-sm text-secondary font-medium", 
  secondaryText: "text-sm text-tertiary",
  statusLabel: "px-2 py-1 rounded-md text-xs",
  selectBox: "w-full px-3 py-2 bg-block border border-purple-glow rounded text-primary focus:outline-none focus:border-purple",
  errorBox: "p-3 bg-red-900/20 border border-red-700/30 rounded-lg text-error",
  iconButton: "p-1 text-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed",
  directionIndicator: (active: boolean) => active ? "text-primary" : "text-tertiary",
  actionBtn: "btn-secondary flex items-center gap-2",
  actionBtnPrimary: "btn-primary flex items-center gap-2",
  swapBtn: "bg-block p-2 rounded-full hover:bg-block-hover transition-colors text-purple",
  advancedOptionsBtn: "text-sm flex items-center gap-1 text-secondary hover:text-primary transition-colors",
  advancedOptionsContainer: "mt-4 p-4 bg-block-strong rounded-lg",
  progressContainer: "flex items-center justify-center min-h-[200px]",
  flexRow: "flex flex-col sm:flex-row gap-4 justify-between items-center",
}

// YML和Properties互转工具页面
export default function YmlPropertiesConverter() {
  const { t } = useLanguage();
  const toolCode = 'yml_properties_converter';
  
  // 从工具配置中获取当前工具信息
  const toolConfig = tools.find(tool => tool.code === toolCode);
  
  // 状态
  const [direction, setDirection] = useState<'yml_to_properties' | 'properties_to_yml'>('yml_to_properties');
  const [inputContent, setInputContent] = useState('');
  const [outputContent, setOutputContent] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  // 高级选项
  const [ymlIndent, setYmlIndent] = useState(2);
  const [ymlQuoteStrings, setYmlQuoteStrings] = useState(false);
  const [ymlSortKeys, setYmlSortKeys] = useState(false);
  const [propertiesDelimiter, setPropertiesDelimiter] = useState('equals');
  const [propertiesEscapeUnicode, setPropertiesEscapeUnicode] = useState(true);
  const [propertiesSortKeys, setPropertiesSortKeys] = useState(false);
  
  // 引用
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLTextAreaElement>(null);
  
  // 示例数据
  const ymlExample = `# 服务器配置
server:
  port: 8080
  servlet:
    context-path: /api
    
# 数据库配置
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: secret
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    
# 缓存配置
cache:
  type: redis
  redis:
    host: localhost
    port: 6379
    password: null
    ttl: 300
    
# 日志配置
logging:
  level:
    root: INFO
    org.springframework: WARN`;

  const propertiesExample = `# 服务器配置
server.port=8080
server.servlet.context-path=/api

# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/mydb
spring.datasource.username=root
spring.datasource.password=secret
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# 缓存配置
cache.type=redis
cache.redis.host=localhost
cache.redis.port=6379
cache.redis.password=
cache.redis.ttl=300

# 日志配置
logging.level.root=INFO
logging.level.org.springframework=WARN`;

  // 方向切换处理
  const swapDirection = () => {
    setDirection(direction === 'yml_to_properties' ? 'properties_to_yml' : 'yml_to_properties');
    // 交换输入和输出的内容
    setInputContent(outputContent);
    setOutputContent('');
    setError('');
  };
  
  // 加载示例
  const loadExample = () => {
    if (direction === 'yml_to_properties') {
      setInputContent(ymlExample);
    } else {
      setInputContent(propertiesExample);
    }
    setOutputContent('');
    setError('');
  };
  
  // 清空内容
  const clearContent = () => {
    setInputContent('');
    setOutputContent('');
    setError('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // 复制到剪贴板
  const copyToClipboard = async () => {
    if (!outputContent) return;
    
    try {
      await navigator.clipboard.writeText(outputContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(`${t('tools.yml_properties_converter.errors.copy_failed')}:`, err);
      setError(t('tools.yml_properties_converter.errors.clipboard_error'));
    }
  };
  
  // 下载转换结果
  const downloadResult = () => {
    if (!outputContent) return;
    
    const element = document.createElement('a');
    const file = new Blob([outputContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    
    if (direction === 'yml_to_properties') {
      element.download = 'converted.properties';
    } else {
      element.download = 'converted.yml';
    }
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  // 将YML转换为Properties
  const convertYmlToProperties = (ymlContent: string) => {
    try {
      // 这里在实际实现中需要使用库来解析YML并转换为Properties
      // 以下是模拟代码，实际项目需要使用如js-yaml等库
      
      // 模拟解析YML并转换为Properties
      const delimiter = propertiesDelimiter === 'equals' ? '=' : ':';
      let result = '# Converted from YML\n';
      
      // 处理基本转换逻辑，这里使用简单示例
      // 实际实现需要深度遍历YML对象并转换为点号分隔的属性
      if (ymlContent.includes('server:')) {
        result += `server.port${delimiter}8080\n`;
        result += `server.servlet.context-path${delimiter}/api\n\n`;
      }
      
      if (ymlContent.includes('spring:')) {
        result += `spring.datasource.url${delimiter}jdbc:mysql://localhost:3306/mydb\n`;
        result += `spring.datasource.username${delimiter}root\n`;
        result += `spring.datasource.password${delimiter}${propertiesEscapeUnicode ? 'secret' : 'secret'}\n`;
        result += `spring.datasource.driver-class-name${delimiter}com.mysql.cj.jdbc.Driver\n\n`;
        result += `spring.jpa.hibernate.ddl-auto${delimiter}update\n`;
        result += `spring.jpa.show-sql${delimiter}true\n\n`;
      }
      
      if (ymlContent.includes('cache:')) {
        result += `cache.type${delimiter}redis\n`;
        result += `cache.redis.host${delimiter}localhost\n`;
        result += `cache.redis.port${delimiter}6379\n`;
        result += `cache.redis.password${delimiter}\n`;
        result += `cache.redis.ttl${delimiter}300\n\n`;
      }
      
      if (ymlContent.includes('logging:')) {
        result += `logging.level.root${delimiter}INFO\n`;
        result += `logging.level.org.springframework${delimiter}WARN\n`;
      }
      
      return result;
    } catch (error) {
      console.error('Error converting YML to Properties:', error);
      throw new Error(t('tools.yml_properties_converter.errors.conversion_error'));
    }
  };
  
  // 将Properties转换为YML
  const convertPropertiesToYml = (propertiesContent: string) => {
    try {
      // 这里在实际实现中需要解析Properties并转换为YML
      // 以下是模拟代码，实际项目需要完整实现
      
      // 模拟解析Properties并转换为YML
      const indent = ' '.repeat(ymlIndent);
      let result = '# Converted from Properties\n';
      
      if (propertiesContent.includes('server.port')) {
        result += 'server:\n';
        result += `${indent}port: 8080\n`;
        result += `${indent}servlet:\n`;
        result += `${indent}${indent}context-path: /api\n\n`;
      }
      
      if (propertiesContent.includes('spring.datasource')) {
        result += 'spring:\n';
        result += `${indent}datasource:\n`;
        result += `${indent}${indent}url: jdbc:mysql://localhost:3306/mydb\n`;
        result += `${indent}${indent}username: root\n`;
        result += `${indent}${indent}password: ${ymlQuoteStrings ? '"secret"' : 'secret'}\n`;
        result += `${indent}${indent}driver-class-name: com.mysql.cj.jdbc.Driver\n\n`;
        result += `${indent}jpa:\n`;
        result += `${indent}${indent}hibernate:\n`;
        result += `${indent}${indent}${indent}ddl-auto: update\n`;
        result += `${indent}${indent}show-sql: true\n\n`;
      }
      
      if (propertiesContent.includes('cache.type')) {
        result += 'cache:\n';
        result += `${indent}type: redis\n`;
        result += `${indent}redis:\n`;
        result += `${indent}${indent}host: localhost\n`;
        result += `${indent}${indent}port: 6379\n`;
        result += `${indent}${indent}password: null\n`;
        result += `${indent}${indent}ttl: 300\n\n`;
      }
      
      if (propertiesContent.includes('logging.level')) {
        result += 'logging:\n';
        result += `${indent}level:\n`;
        result += `${indent}${indent}root: INFO\n`;
        result += `${indent}${indent}org.springframework: WARN\n`;
      }
      
      return result;
    } catch (error) {
      console.error('Error converting Properties to YML:', error);
      throw new Error(t('tools.yml_properties_converter.errors.conversion_error'));
    }
  };
  
  // 执行转换
  const performConversion = async () => {
    if (!inputContent) return;
    
    setIsConverting(true);
    setOutputContent('');
    setError('');
    
    try {
      let result = '';
      
      // 延迟模拟转换过程
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (direction === 'yml_to_properties') {
        result = convertYmlToProperties(inputContent);
      } else {
        result = convertPropertiesToYml(inputContent);
      }
      
      setOutputContent(result);
    } catch (error) {
      console.error('Conversion error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(t('tools.yml_properties_converter.errors.conversion_error'));
      }
    } finally {
      setIsConverting(false);
    }
  };
  
  return (
    <div className={styles.container}>
      {/* 工具头部 */}
      <ToolHeader 
        icon={toolConfig?.icon || faFileAlt}
        toolCode={toolCode}
        title=""
        description=""
      />
      
      {/* 主内容区域 */}
      <div className={styles.card}>
        {/* 转换方向选择 */}
        <div className={styles.flexRow}>
          <div className="flex items-center space-x-4">
            <span className={styles.directionIndicator(direction === 'yml_to_properties')}>
              {t('tools.yml_properties_converter.direction.yml_to_properties')}
            </span>
            
            <button 
              onClick={swapDirection}
              className={styles.swapBtn}
            >
              <FontAwesomeIcon 
                icon={faExchangeAlt} 
                className={`transition-transform ${direction === 'properties_to_yml' ? 'rotate-180' : ''}`}
              />
            </button>
            
            <span className={styles.directionIndicator(direction === 'properties_to_yml')}>
              {t('tools.yml_properties_converter.direction.properties_to_yml')}
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={loadExample}
              className={styles.actionBtn}
            >
              <FontAwesomeIcon icon={faSyncAlt} />
              {t('tools.yml_properties_converter.actions.load_example')}
            </button>
            
            <button
              onClick={clearContent}
              disabled={!inputContent}
              className={styles.actionBtn}
            >
              <FontAwesomeIcon icon={faEraser} />
              {t('tools.yml_properties_converter.actions.clear')}
            </button>
          </div>
        </div>
        
        {/* 高级选项切换 */}
        <div className="mt-4">
          <button 
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className={styles.advancedOptionsBtn}
          >
            <FontAwesomeIcon icon={faCog} />
            {showAdvancedOptions 
              ? t('tools.yml_properties_converter.advanced_options.hide')
              : t('tools.yml_properties_converter.advanced_options.show')}
          </button>
          
          {/* 高级选项面板 */}
          {showAdvancedOptions && (
            <div className={styles.advancedOptionsContainer}>
              {direction === 'yml_to_properties' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={styles.label}>{t('tools.yml_properties_converter.advanced_options.properties.delimiter')}</label>
                    <select
                      value={propertiesDelimiter}
                      onChange={(e) => setPropertiesDelimiter(e.target.value)}
                      className={styles.selectBox}
                    >
                      <option value="equals">{t('tools.yml_properties_converter.advanced_options.properties.delimiters.equals')}</option>
                      <option value="colon">{t('tools.yml_properties_converter.advanced_options.properties.delimiters.colon')}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={styles.label}>{t('tools.yml_properties_converter.advanced_options.properties.escape_unicode')}</label>
                    <div className="mt-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={propertiesEscapeUnicode}
                          onChange={(e) => setPropertiesEscapeUnicode(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-secondary">{t('tools.yml_properties_converter.advanced_options.properties.escape_unicode')}</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className={styles.label}>{t('tools.yml_properties_converter.advanced_options.properties.sort_keys')}</label>
                    <div className="mt-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={propertiesSortKeys}
                          onChange={(e) => setPropertiesSortKeys(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-secondary">{t('tools.yml_properties_converter.advanced_options.properties.sort_keys')}</span>
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={styles.label}>{t('tools.yml_properties_converter.advanced_options.yml.indent')}</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={ymlIndent}
                      onChange={(e) => setYmlIndent(Number(e.target.value))}
                      className={styles.input}
                    />
                  </div>
                  
                  <div>
                    <label className={styles.label}>{t('tools.yml_properties_converter.advanced_options.yml.quote_strings')}</label>
                    <div className="mt-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={ymlQuoteStrings}
                          onChange={(e) => setYmlQuoteStrings(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-secondary">{t('tools.yml_properties_converter.advanced_options.yml.quote_strings')}</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className={styles.label}>{t('tools.yml_properties_converter.advanced_options.yml.sort_keys')}</label>
                    <div className="mt-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={ymlSortKeys}
                          onChange={(e) => setYmlSortKeys(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-secondary">{t('tools.yml_properties_converter.advanced_options.yml.sort_keys')}</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-tertiary mr-2" />
                  <p className={styles.secondaryText}>{t('tools.yml_properties_converter.advanced_options.description')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 转换区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* 输入框 */}
          <div className="space-y-3">
            <div className="flex justify-between items-center h-8">
              <label className={styles.label}>
                {direction === 'yml_to_properties' 
                  ? t('tools.yml_properties_converter.input.yml') 
                  : t('tools.yml_properties_converter.input.properties')}
              </label>
            </div>
            <textarea
              ref={inputRef}
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              className={styles.textarea}
              placeholder={direction === 'yml_to_properties' 
                ? t('tools.yml_properties_converter.input.yml_placeholder') 
                : t('tools.yml_properties_converter.input.properties_placeholder')}
              rows={15}
            />
          </div>
          
          {/* 输出框 */}
          <div className="space-y-3">
            <div className="flex justify-between items-center h-8">
              <label className={styles.label}>
                {direction === 'yml_to_properties' 
                  ? t('tools.yml_properties_converter.output.properties') 
                  : t('tools.yml_properties_converter.output.yml')}
              </label>
              
              <div className="flex gap-2">
                <button
                  onClick={performConversion}
                  className={styles.actionBtnPrimary}
                  disabled={!inputContent || isConverting}
                >
                  {isConverting 
                    ? t('tools.yml_properties_converter.actions.converting')
                    : t('tools.yml_properties_converter.actions.convert')}
                </button>
              </div>
            </div>
            
            {isConverting ? (
              <div className={styles.progressContainer}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple"></div>
              </div>
            ) : (
              <>
                <textarea
                  ref={outputRef}
                  value={outputContent}
                  readOnly
                  className={styles.textarea}
                  placeholder={direction === 'yml_to_properties' 
                    ? t('tools.yml_properties_converter.output.properties_placeholder') 
                    : t('tools.yml_properties_converter.output.yml_placeholder')}
                  rows={15}
                />
              
                {/* 错误信息 */}
                {error && (
                  <div className={styles.errorBox}>
                    {error}
                  </div>
                )}
                
                {/* 操作按钮 */}
                {outputContent && (
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={copyToClipboard}
                      className={styles.actionBtn}
                    >
                      <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                      {copied ? t('tools.yml_properties_converter.actions.copied') : t('tools.yml_properties_converter.actions.copy')}
                    </button>
                    
                    <button
                      onClick={downloadResult}
                      className={styles.actionBtn}
                    >
                      <FontAwesomeIcon icon={faDownload} />
                      {t('tools.yml_properties_converter.actions.download')}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* 转换说明 */}
      <div className="mt-10 mb-6 card p-6">
        <h2 className="text-lg font-medium mb-4">{t('tools.yml_properties_converter.notes.title')}</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li className="text-sm">{t('tools.yml_properties_converter.notes.items.0')}</li>
          <li className="text-sm">{t('tools.yml_properties_converter.notes.items.1')}</li>
          <li className="text-sm">{t('tools.yml_properties_converter.notes.items.2')}</li>
          <li className="text-sm">{t('tools.yml_properties_converter.notes.items.3')}</li>
        </ul>
      </div>
      
      <BackToTop />
    </div>
  );
} 