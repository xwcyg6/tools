'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLock, 
  faCopy, 
  faCheck, 
  faInfoCircle, 
  faRedo,
  faEraser
} from '@fortawesome/free-solid-svg-icons';
import ToolHeader from '@/components/ToolHeader';
import BackToTop from '@/components/BackToTop';
import * as CryptoJS from 'crypto-js';
import { useLanguage } from '@/context/LanguageContext';

// 添加CSS变量样式
const styles = {
  container: "min-h-screen flex flex-col max-w-[1440px] mx-auto p-4 md:p-6",
  card: "card p-6",
  heading: "text-lg font-medium text-primary mb-1",
  label: "block text-sm text-secondary font-medium mb-1",
  input: "w-full p-3 bg-block border border-purple-glow rounded-lg text-primary focus:border-purple focus:outline-none focus:ring-1 focus:ring-purple transition-all",
  textarea: "w-full h-36 p-3 bg-block border border-purple-glow rounded-lg text-primary focus:border-purple focus:outline-none focus:ring-1 focus:ring-purple transition-all font-mono resize-y",
  actionBtn: "btn-secondary flex items-center gap-2",
  actionBtnPrimary: "btn-primary flex items-center gap-2",
  secondaryText: "text-sm text-tertiary",
  error: "p-3 bg-red-900/20 border border-red-700/30 rounded-lg text-error",
  success: "p-3 bg-green-900/20 border border-green-700/30 rounded-lg text-success",
  tabButton: "px-3 py-2 text-sm font-medium transition-all",
  activeTab: "bg-block text-primary shadow-sm",
  inactiveTab: "text-tertiary hover:text-secondary",
  flexBetween: "flex flex-col sm:flex-row gap-4 justify-between items-center",
  twoColumns: "grid grid-cols-1 md:grid-cols-2 gap-6",
};

// 加密算法类型
type CryptoType = 'md5' | 'sha1' | 'sha256' | 'sha512' | 'aes' | 'base64';

export default function CryptoTools() {
  // 使用多语言支持
  const { t } = useLanguage();
  
  // 状态管理
  const [activeAlgorithm, setActiveAlgorithm] = useState<CryptoType>('md5');
  const [inputText, setInputText] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [output, setOutput] = useState('');
  const [isDecoding, setIsDecoding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 清除状态提示的定时器
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (error || success) {
      timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [error, success]);

  // 当算法更改时，重置解码状态
  useEffect(() => {
    if (!algorithms[activeAlgorithm].isEncodeDecode) {
      setIsDecoding(false);
    }
    setOutput('');
    setError(null);
  }, [activeAlgorithm]);

  // 处理加密或解密操作
  const processOperation = () => {
    setError(null);
    setSuccess(null);
    setOutput('');
    
    if (!inputText.trim()) {
      setError(t('tools.crypto_tools.input_required'));
      return;
    }
    
    if (algorithms[activeAlgorithm].needsKey && !secretKey.trim()) {
      setError(t('tools.crypto_tools.key_required'));
      return;
    }
    
    try {
      let result = '';
      
      switch (activeAlgorithm) {
        case 'md5':
          result = CryptoJS.MD5(inputText).toString();
          break;
          
        case 'sha1':
          result = CryptoJS.SHA1(inputText).toString();
          break;
          
        case 'sha256':
          result = CryptoJS.SHA256(inputText).toString();
          break;
          
        case 'sha512':
          result = CryptoJS.SHA512(inputText).toString();
          break;
          
        case 'aes':
          if (isDecoding) {
            // 解密操作
            try {
              const decrypted = CryptoJS.AES.decrypt(inputText, secretKey);
              result = decrypted.toString(CryptoJS.enc.Utf8);
              
              if (!result) {
                throw new Error(t('tools.crypto_tools.decryption_failed'));
              }
            } catch {
              throw new Error(t('tools.crypto_tools.decryption_failed'));
            }
          } else {
            // 加密操作
            result = CryptoJS.AES.encrypt(inputText, secretKey).toString();
          }
          break;
          
        case 'base64':
          if (isDecoding) {
            // Base64解码
            try {
              result = CryptoJS.enc.Base64.parse(inputText).toString(CryptoJS.enc.Utf8);
            } catch {
              throw new Error(t('tools.crypto_tools.base64_decode_failed'));
            }
          } else {
            // Base64编码
            result = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(inputText));
          }
          break;
      }
      
      setOutput(result);
      setSuccess(isDecoding ? t('tools.crypto_tools.decryption_success') : t('tools.crypto_tools.encryption_success'));
    } catch (err) {
      console.error('处理错误:', err);
      setError(`${isDecoding ? t('tools.crypto_tools.decrypt') : t('tools.crypto_tools.encrypt')}失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  // 复制结果到剪贴板
  const copyToClipboard = () => {
    if (!output) return;
    
    navigator.clipboard.writeText(output)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('复制失败:', err);
        setError(t('tools.crypto_tools.copy_failed'));
      });
  };

  // 清空所有内容
  const clearAll = () => {
    setInputText('');
    setSecretKey('');
    setOutput('');
    setError(null);
    setSuccess(null);
  };

  // 加载示例
  const loadExample = () => {
    const examples: Record<CryptoType, { input: string; key?: string }> = {
      md5: { input: 'Hello, World!' },
      sha1: { input: 'Hello, World!' },
      sha256: { input: 'Hello, World!' },
      sha512: { input: 'Hello, World!' },
      aes: { input: 'Hello, World!', key: 'secret-key-12345' },
      base64: { input: 'Hello, World!' }
    };
    
    const example = examples[activeAlgorithm];
    setInputText(example.input);
    if (example.key) {
      setSecretKey(example.key);
    }
    
    setOutput('');
    setError(null);
    setSuccess(null);
  };

  // 加密算法信息映射
  const algorithms = {
    md5: {
      name: t('tools.crypto_tools.algorithms.md5.name'),
      description: t('tools.crypto_tools.algorithms.md5.description'),
      needsKey: false,
      isEncodeDecode: false,
    },
    sha1: {
      name: t('tools.crypto_tools.algorithms.sha1.name'),
      description: t('tools.crypto_tools.algorithms.sha1.description'),
      needsKey: false,
      isEncodeDecode: false,
    },
    sha256: {
      name: t('tools.crypto_tools.algorithms.sha256.name'),
      description: t('tools.crypto_tools.algorithms.sha256.description'),
      needsKey: false,
      isEncodeDecode: false,
    },
    sha512: {
      name: t('tools.crypto_tools.algorithms.sha512.name'),
      description: t('tools.crypto_tools.algorithms.sha512.description'),
      needsKey: false,
      isEncodeDecode: false,
    },
    aes: {
      name: t('tools.crypto_tools.algorithms.aes.name'),
      description: t('tools.crypto_tools.algorithms.aes.description'),
      needsKey: true,
      isEncodeDecode: true,
    },
    base64: {
      name: t('tools.crypto_tools.algorithms.base64.name'),
      description: t('tools.crypto_tools.algorithms.base64.description'),
      needsKey: false,
      isEncodeDecode: true,
    }
  };

  return (
    <div className={styles.container}>
      {/* 工具头部 */}
      <ToolHeader 
        icon={faLock}
        toolCode="crypto_tools"
        title=""
        description=""
      />
      
      {/* 主内容区域 */}
      <div className={styles.card}>
        <div className="space-y-6">
          {/* 算法选择 */}
          <div className="bg-block-strong p-1 rounded-md flex flex-wrap">
            {Object.entries(algorithms).map(([key, algo]) => (
              <button
                key={key}
                className={`${styles.tabButton} ${activeAlgorithm === key ? styles.activeTab : styles.inactiveTab}`}
                onClick={() => setActiveAlgorithm(key as CryptoType)}
              >
                {algo.name}
              </button>
            ))}
          </div>
          
          {/* 算法描述 */}
          <div className={styles.secondaryText}>
            {algorithms[activeAlgorithm].description}
          </div>
          
          {/* 操作按钮和状态切换 */}
          <div className={styles.flexBetween}>
            {/* 编码/解码切换 */}
            {algorithms[activeAlgorithm].isEncodeDecode && (
              <div className="flex items-center bg-block-strong rounded-md p-1">
                <button
                  className={`${styles.tabButton} ${!isDecoding ? styles.activeTab : styles.inactiveTab}`}
                  onClick={() => setIsDecoding(false)}
                >
                  {activeAlgorithm === 'base64' ? t('tools.crypto_tools.encode') : t('tools.crypto_tools.encrypt')}
                </button>
                <button
                  className={`${styles.tabButton} ${isDecoding ? styles.activeTab : styles.inactiveTab}`}
                  onClick={() => setIsDecoding(true)}
                >
                  {activeAlgorithm === 'base64' ? t('tools.crypto_tools.decode') : t('tools.crypto_tools.decrypt')}
                </button>
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={loadExample}
                className={styles.actionBtn}
              >
                <FontAwesomeIcon icon={faRedo} />
                {t('tools.crypto_tools.load_example')}
              </button>
              
              <button
                onClick={clearAll}
                className={styles.actionBtn}
                disabled={!inputText}
              >
                <FontAwesomeIcon icon={faEraser} />
                {t('tools.crypto_tools.clear')}
              </button>
            </div>
          </div>
          
          {/* 输入输出部分 */}
          <div className={styles.twoColumns}>
            {/* 输入区域 */}
            <div className="space-y-4">
              {/* 输入文本 */}
              <div>
                <label className={styles.label}>
                  {isDecoding 
                    ? (activeAlgorithm === 'base64' ? t('tools.crypto_tools.base64_encoded') : t('tools.crypto_tools.encrypted_text')) 
                    : t('tools.crypto_tools.input_text')}
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isDecoding 
                    ? (activeAlgorithm === 'base64' ? t('tools.crypto_tools.base64_decode_placeholder') : t('tools.crypto_tools.decrypt_placeholder')) 
                    : t('tools.crypto_tools.input_placeholder')}
                  className={styles.textarea}
                />
              </div>
              
              {/* 密钥输入 */}
              {algorithms[activeAlgorithm].needsKey && (
                <div>
                  <label className={styles.label}>{t('tools.crypto_tools.secret_key')}</label>
                  <input
                    type="text"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder={t('tools.crypto_tools.key_placeholder')}
                    className={styles.input}
                  />
                </div>
              )}
              
              <div>
                <button
                  onClick={processOperation}
                  className={styles.actionBtnPrimary}
                  disabled={!inputText}
                >
                  <FontAwesomeIcon icon={faLock} />
                  {isDecoding 
                    ? (activeAlgorithm === 'base64' ? t('tools.crypto_tools.decode') : t('tools.crypto_tools.decrypt')) 
                    : (activeAlgorithm === 'base64' ? t('tools.crypto_tools.encode') : (algorithms[activeAlgorithm].isEncodeDecode ? t('tools.crypto_tools.encrypt') : t('tools.crypto_tools.calculate')))}
                </button>
              </div>
            </div>
            
            {/* 输出区域 */}
            <div className="space-y-4">
              <div>
                <label className={styles.label}>
                  {isDecoding 
                    ? t('tools.crypto_tools.decoded_result') 
                    : (algorithms[activeAlgorithm].isEncodeDecode ? t('tools.crypto_tools.encrypted_result') : t('tools.crypto_tools.hash_result'))}
                </label>
                <textarea
                  value={output}
                  readOnly
                  placeholder={t('tools.crypto_tools.result_placeholder')}
                  className={styles.textarea}
                />
              </div>
              
              {output && (
                <div className="flex justify-end">
                  <button
                    onClick={copyToClipboard}
                    className={styles.actionBtn}
                  >
                    <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                    {copied ? t('tools.crypto_tools.copied') : t('tools.crypto_tools.copy_result')}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* 状态消息 */}
          {error && (
            <div className={styles.error}>
              <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
              {error}
            </div>
          )}
          
          {success && (
            <div className={styles.success}>
              <FontAwesomeIcon icon={faCheck} className="mr-2" />
              {success}
            </div>
          )}
          
          {/* 算法信息说明 */}
          <div className="p-4 bg-block rounded-lg">
            <h3 className="text-primary font-medium mb-2">{t('tools.crypto_tools.algorithm_info')}</h3>
            <div className={styles.secondaryText}>
              <p className="mb-2">
                <strong>{algorithms[activeAlgorithm].name}:</strong>{' '}
                {algorithms[activeAlgorithm].description}
              </p>
              
              {activeAlgorithm === 'md5' && (
                <p>{t('tools.crypto_tools.algorithms.md5.additional_info')}</p>
              )}
              
              {activeAlgorithm === 'sha1' && (
                <p>{t('tools.crypto_tools.algorithms.sha1.additional_info')}</p>
              )}
              
              {activeAlgorithm === 'sha256' && (
                <p>{t('tools.crypto_tools.algorithms.sha256.additional_info')}</p>
              )}
              
              {activeAlgorithm === 'sha512' && (
                <p>{t('tools.crypto_tools.algorithms.sha512.additional_info')}</p>
              )}
              
              {activeAlgorithm === 'aes' && (
                <p>{t('tools.crypto_tools.algorithms.aes.additional_info')}</p>
              )}
              
              {activeAlgorithm === 'base64' && (
                <p>{t('tools.crypto_tools.algorithms.base64.additional_info')}</p>
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