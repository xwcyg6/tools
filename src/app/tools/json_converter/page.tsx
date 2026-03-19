'use client';

import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExchangeAlt, faCopy, faCheck, faSyncAlt, 
  faEraser, faDownload, faCog, faInfoCircle,
  faCode
} from '@fortawesome/free-solid-svg-icons';
import ToolHeader from '@/components/ToolHeader';
import BackToTop from '@/components/BackToTop';
import tools from '@/config/tools';
import { useLanguage } from '@/context/LanguageContext';

// 格式转换函数
import { 
  jsonToXml, xmlToJson, 
  jsonToCsv, csvToJson,
  jsonToYaml, yamlToJson 
} from './converters';

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
  formatTypeBtn: "flex items-center gap-2 p-3 rounded-lg border border-purple-glow/20 transition-all hover:border-purple-glow",
  formatTypeBtnActive: "bg-purple-glow/10 border-purple",
  actionBtn: "btn-secondary flex items-center gap-2",
  actionBtnPrimary: "btn-primary flex items-center gap-2",
  swapBtn: "bg-block p-2 rounded-full hover:bg-block-hover transition-colors text-purple",
  advancedOptionsBtn: "text-sm flex items-center gap-1 text-secondary hover:text-primary transition-colors",
  advancedOptionsContainer: "mt-4 p-4 bg-block-strong rounded-lg",
  progressContainer: "flex items-center justify-center min-h-[200px]",
  flexRow: "flex flex-col sm:flex-row gap-4 justify-between items-center",
  formatGroup: "grid grid-cols-1 md:grid-cols-3 gap-3",
}

export default function JsonConverter() {
  const { t } = useLanguage();
  // 从工具配置中获取当前工具信息
  const toolConfig = tools.find(tool => tool.code === 'json_converter');
  
  // 格式类型选项
  const formatTypes = [
    { id: 'xml', name: t('tools.json_converter.format_types.xml.name'), description: t('tools.json_converter.format_types.xml.description') },
    { id: 'csv', name: t('tools.json_converter.format_types.csv.name'), description: t('tools.json_converter.format_types.csv.description') },
    { id: 'yaml', name: t('tools.json_converter.format_types.yaml.name'), description: t('tools.json_converter.format_types.yaml.description') },
  ];
  
  // 状态管理
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [formatType, setFormatType] = useState('xml');
  const [direction, setDirection] = useState('json_to_format'); // 'json_to_format' 或 'format_to_json'
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState(false);
  const [csvDelimiter, setCsvDelimiter] = useState(',');
  const [csvHeader, setCsvHeader] = useState(true);
  const [xmlRootName, setXmlRootName] = useState('root');
  
  // 引用
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLTextAreaElement>(null);
  
  // 执行转换
  const performConversion = () => {
    if (!inputText.trim()) {
      setOutputText('');
      setError('');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    try {
      let result = '';
      const options = {
        delimiter: csvDelimiter,
        header: csvHeader,
        rootName: xmlRootName
      };
      
      if (direction === 'json_to_format') {
        // 首先验证输入是有效的JSON
        try {
          JSON.parse(inputText);
        } catch {
          throw new Error(t('tools.json_converter.errors.invalid_json'));
        }
        
        // JSON 转换为其他格式
        if (formatType === 'xml') {
          result = jsonToXml(inputText, options);
        } else if (formatType === 'csv') {
          result = jsonToCsv(inputText, options);
        } else if (formatType === 'yaml') {
          result = jsonToYaml(inputText);
        }
      } else {
        // 其他格式转换为JSON
        if (formatType === 'xml') {
          result = xmlToJson(inputText);
        } else if (formatType === 'csv') {
          result = csvToJson(inputText, options);
        } else if (formatType === 'yaml') {
          result = yamlToJson(inputText);
        }
      }
      
      setOutputText(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('tools.json_converter.errors.conversion_error'));
      }
      setOutputText('');
    } finally {
      setIsProcessing(false);
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
      .catch(err => {
        console.error(t('tools.json_converter.errors.copy_failed'), err);
        setError(t('tools.json_converter.errors.clipboard_error'));
      });
  };
  
  // 下载输出结果
  const downloadOutput = () => {
    if (!outputText) return;
    
    let extension = 'txt';
    let mimeType = 'text/plain';
    
    if (direction === 'json_to_format') {
      if (formatType === 'xml') {
        extension = 'xml';
        mimeType = 'application/xml';
      } else if (formatType === 'csv') {
        extension = 'csv';
        mimeType = 'text/csv';
      } else if (formatType === 'yaml') {
        extension = 'yaml';
        mimeType = 'application/x-yaml';
      }
    } else {
      extension = 'json';
      mimeType = 'application/json';
    }
    
    const blob = new Blob([outputText], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted.${extension}`;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };
  
  // 清空输入和输出
  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setError('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // 交换方向
  const swapDirection = () => {
    setDirection(direction === 'json_to_format' ? 'format_to_json' : 'json_to_format');
    // 交换输入和输出的内容
    setInputText(outputText);
    setOutputText('');
    setError('');
  };
  
  // 加载示例
  const loadExample = () => {
    const jsonExample = `{
  "person": {
    "name": "张三",
    "age": 28,
    "isStudent": false,
    "address": {
      "city": "北京",
      "district": "海淀区",
      "postal": "100000"
    },
    "hobbies": ["读书", "旅游", "编程"]
  }
}`;
    
    const xmlExample = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <person>
    <n>张三</n>
    <age>28</age>
    <isStudent>false</isStudent>
    <address>
      <city>北京</city>
      <district>海淀区</district>
      <postal>100000</postal>
    </address>
    <hobbies>读书</hobbies>
    <hobbies>旅游</hobbies>
    <hobbies>编程</hobbies>
  </person>
</root>`;
    
    const csvExample = `name,age,isStudent,city,district,postal,hobbies
张三,28,false,北京,海淀区,100000,"读书,旅游,编程"`;
    
    const yamlExample = `person:
  name: 张三
  age: 28
  isStudent: false
  address:
    city: 北京
    district: 海淀区
    postal: '100000'
  hobbies:
    - 读书
    - 旅游
    - 编程`;
    
    // 根据当前格式和方向加载示例
    if (direction === 'json_to_format') {
      setInputText(jsonExample);
    } else {
      if (formatType === 'xml') {
        setInputText(xmlExample);
      } else if (formatType === 'csv') {
        setInputText(csvExample);
      } else if (formatType === 'yaml') {
        setInputText(yamlExample);
      }
    }
    
    setOutputText('');
    setError('');
  };
  
  return (
    <div className={styles.container}>
      {/* 工具头部 */}
      <ToolHeader 
        icon={toolConfig?.icon || faCode}
        toolCode="json_converter"
        title=""
        description=""
      />
      
      {/* 主内容区域 */}
      <div className={styles.card}>
        {/* 格式类型选择 */}
        <div className="space-y-6">
          {/* 格式选择区域 */}
          <div>
            <h2 className="text-primary font-medium mb-4">{t('tools.json_converter.select_format_type')}</h2>
            <div className={styles.formatGroup}>
              {formatTypes.map((type) => (
                <button
                  key={type.id}
                  className={`${styles.formatTypeBtn} ${formatType === type.id ? styles.formatTypeBtnActive : ''}`}
                  onClick={() => setFormatType(type.id)}
                >
                  <span className="font-medium">{type.name}</span>
                  <span className="text-sm text-tertiary">{type.description}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* 转换方向选择 */}
          <div className={styles.flexRow}>
            <div className="flex items-center space-x-4">
              <span className={styles.directionIndicator(direction === 'json_to_format')}>
                {t('tools.json_converter.direction.json_to_format')}
              </span>
              
              <button 
                onClick={swapDirection}
                className={styles.swapBtn}
              >
                <FontAwesomeIcon 
                  icon={faExchangeAlt} 
                  className={`transition-transform ${direction === 'format_to_json' ? 'rotate-180' : ''}`}
                />
              </button>
              
              <span className={styles.directionIndicator(direction === 'format_to_json')}>
                {t('tools.json_converter.direction.format_to_json').replace('{format}', formatType.toUpperCase())}
              </span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={loadExample}
                className={styles.actionBtn}
              >
                <FontAwesomeIcon icon={faSyncAlt} />
                {t('tools.json_converter.actions.load_example')}
              </button>
              
              <button
                onClick={clearAll}
                disabled={!inputText}
                className={styles.actionBtn}
              >
                <FontAwesomeIcon icon={faEraser} />
                {t('tools.json_converter.actions.clear')}
              </button>
            </div>
          </div>
          
          {/* 高级选项切换 */}
          <div>
            <button 
              onClick={() => setAdvancedOptions(!advancedOptions)}
              className={styles.advancedOptionsBtn}
            >
              <FontAwesomeIcon icon={faCog} />
              {advancedOptions 
                ? t('tools.json_converter.advanced_options.hide')
                : t('tools.json_converter.advanced_options.show')}
            </button>
            
            {/* 高级选项面板 */}
            {advancedOptions && (
              <div className={styles.advancedOptionsContainer}>
                {formatType === 'csv' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={styles.label}>{t('tools.json_converter.advanced_options.csv.delimiter')}</label>
                      <select 
                        value={csvDelimiter} 
                        onChange={(e) => setCsvDelimiter(e.target.value)}
                        className={styles.selectBox}
                      >
                        <option value=",">{t('tools.json_converter.advanced_options.csv.delimiters.comma')}</option>
                        <option value=";">{t('tools.json_converter.advanced_options.csv.delimiters.semicolon')}</option>
                        <option value="\t">{t('tools.json_converter.advanced_options.csv.delimiters.tab')}</option>
                        <option value="|">{t('tools.json_converter.advanced_options.csv.delimiters.pipe')}</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={styles.label}>{t('tools.json_converter.advanced_options.csv.include_header')}</label>
                      <div className="mt-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={csvHeader}
                            onChange={(e) => setCsvHeader(e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-secondary">
                            {direction === 'json_to_format' 
                              ? t('tools.json_converter.advanced_options.csv.generate_header')
                              : t('tools.json_converter.advanced_options.csv.parse_header')}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                
                {formatType === 'xml' && (
                  <div>
                    <label className={styles.label}>{t('tools.json_converter.advanced_options.xml.root_element')}</label>
                    <input
                      type="text"
                      value={xmlRootName}
                      onChange={(e) => setXmlRootName(e.target.value)}
                      placeholder={t('tools.json_converter.advanced_options.xml.root_placeholder')}
                      className={styles.input}
                    />
                  </div>
                )}
                
                <div className="mt-4">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-tertiary mr-2" />
                    <p className={styles.secondaryText}>{t('tools.json_converter.advanced_options.description')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* 转换区域 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 输入框 */}
            <div className="space-y-3">
              <label className={styles.label}>
                {direction === 'json_to_format' 
                  ? t('tools.json_converter.input.json')
                  : t('tools.json_converter.input.format').replace('{format}', formatType.toUpperCase())}
              </label>
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className={styles.textarea}
                placeholder={direction === 'json_to_format' 
                  ? t('tools.json_converter.input.json_placeholder')
                  : t('tools.json_converter.input.format_placeholder').replace('{format}', formatType.toUpperCase())}
                rows={15}
              />
            </div>
            
            {/* 输出框 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className={styles.label}>
                  {direction === 'json_to_format' 
                    ? t('tools.json_converter.output.format').replace('{format}', formatType.toUpperCase())
                    : t('tools.json_converter.output.json')}
                </label>
                
                <div className="flex gap-2">
                  <button
                    onClick={performConversion}
                    className={styles.actionBtnPrimary}
                    disabled={!inputText || isProcessing}
                  >
                    {isProcessing ? t('tools.json_converter.actions.converting') : t('tools.json_converter.actions.convert')}
                  </button>
                </div>
              </div>
              
              {isProcessing ? (
                <div className={styles.progressContainer}>
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple"></div>
                </div>
              ) : (
                <>
                  <textarea
                    ref={outputRef}
                    value={outputText}
                    readOnly
                    className={styles.textarea}
                    placeholder={direction === 'json_to_format' 
                      ? t('tools.json_converter.output.format_placeholder').replace('{format}', formatType.toUpperCase())
                      : t('tools.json_converter.output.json_placeholder')}
                    rows={15}
                  />
                
                  {/* 错误信息 */}
                  {error && (
                    <div className={styles.errorBox}>
                      {error}
                    </div>
                  )}
                  
                  {/* 操作按钮 */}
                  {outputText && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={copyToClipboard}
                        className={styles.actionBtn}
                      >
                        <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                        {copied ? t('tools.json_converter.actions.copied') : t('tools.json_converter.actions.copy')}
                      </button>
                      
                      <button
                        onClick={downloadOutput}
                        className={styles.actionBtn}
                      >
                        <FontAwesomeIcon icon={faDownload} />
                        {t('tools.json_converter.actions.download')}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* 说明部分 */}
          <div className="p-4 bg-block rounded-lg">
            <h3 className="text-primary font-medium mb-2">{t('tools.json_converter.notes.title')}</h3>
            <div className="text-sm text-tertiary">
              {formatType === 'xml' && (
                <div>
                  <p>{t('tools.json_converter.notes.xml.title')}</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>{t('tools.json_converter.notes.xml.items.0')}</li>
                    <li>{t('tools.json_converter.notes.xml.items.1')}</li>
                    <li>{t('tools.json_converter.notes.xml.items.2')}</li>
                  </ul>
                </div>
              )}
              
              {formatType === 'csv' && (
                <div>
                  <p>{t('tools.json_converter.notes.csv.title')}</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>{t('tools.json_converter.notes.csv.items.0')}</li>
                    <li>{t('tools.json_converter.notes.csv.items.1')}</li>
                    <li>{t('tools.json_converter.notes.csv.items.2')}</li>
                  </ul>
                </div>
              )}
              
              {formatType === 'yaml' && (
                <div>
                  <p>{t('tools.json_converter.notes.yaml.title')}</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>{t('tools.json_converter.notes.yaml.items.0')}</li>
                    <li>{t('tools.json_converter.notes.yaml.items.1')}</li>
                    <li>{t('tools.json_converter.notes.yaml.items.2')}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 回到顶部按钮 */}
      <BackToTop />
    </div>
  );
} 