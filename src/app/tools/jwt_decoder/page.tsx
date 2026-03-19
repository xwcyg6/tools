'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faCopy, faCheck, faEraser, faSync, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import ToolHeader from '@/components/ToolHeader';
import BackToTop from '@/components/BackToTop';
import tools from '@/config/tools';
import { useLanguage } from '@/context/LanguageContext';

interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}

interface JwtHeader {
  alg: string;
  typ: string;
  [key: string]: unknown;
}

interface DecodedJwt {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
  isValid: boolean;
  expirationStatus: 'valid' | 'expired' | 'not-set';
  expiresIn?: string;
}

// 添加CSS变量样式
const styles = {
  card: "card p-6",
  textArea: "w-full h-24 p-3 bg-block border border-purple-glow rounded-lg text-primary focus:border-purple focus:outline-none focus:ring-1 focus:ring-purple transition-all resize-none font-mono",
  preArea: "w-full h-80 p-3 bg-block border border-purple-glow rounded-lg text-primary overflow-auto scrollbar-thin scrollbar-thumb-block-strong scrollbar-track-block font-mono text-sm whitespace-pre-wrap",
  label: "text-secondary font-medium",
  error: "p-3 bg-red-900/20 border border-red-700/30 text-red-500 rounded-lg",
  success: "p-3 bg-green-900/20 border border-green-700/30 text-success rounded-lg",
  tabButton: (isActive: boolean) => `px-4 py-2 font-medium text-sm ${isActive ? 'text-purple border-b-2 border-purple' : 'text-tertiary hover:text-secondary'}`,
  copyButton: "flex items-center gap-1 text-sm px-2 py-1 rounded bg-block-strong hover:bg-block-strong/80 text-secondary transition-colors",
  statusBox: (type: 'valid' | 'expired' | 'not-set') => {
    if (type === 'valid') return "px-2 py-1 rounded-md text-xs bg-green-900/10 text-success";
    if (type === 'expired') return "px-2 py-1 rounded-md text-xs bg-red-900/10 text-error";
    return "px-2 py-1 rounded-md text-xs bg-block-strong text-tertiary";
  },
  heading: "text-primary font-medium mb-2",
  secondaryText: "text-sm text-tertiary",
  highlight: "text-purple",
  tokenPart: "rounded px-2 py-1 text-xs text-white font-mono",
  headerPart: "bg-blue-500",
  payloadPart: "bg-purple-500",
  signaturePart: "bg-green-500"
}

export default function JwtDecoder() {
  // 从工具配置中获取当前工具信息
  const toolConfig = tools.find(tool => tool.code === 'jwt_decoder');
  const { t } = useLanguage();
  
  // 状态管理
  const [jwtToken, setJwtToken] = useState('');
  const [decodedJwt, setDecodedJwt] = useState<DecodedJwt | null>(null);
  const [activeTab, setActiveTab] = useState<'header' | 'payload' | 'signature'>('payload');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  const [showTokenParts, setShowTokenParts] = useState(false);
  
  // 解析JWT
  useEffect(() => {
    if (!jwtToken.trim()) {
      setDecodedJwt(null);
      setError('');
      return;
    }
    
    try {
      const result = decodeJwt(jwtToken);
      setDecodedJwt(result);
      setError('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('tools.jwt_decoder.parsing_error'));
      }
      setDecodedJwt(null);
    }
  }, [jwtToken, t]);
  
  // 解码JWT令牌
  const decodeJwt = (token: string): DecodedJwt => {
    if (!token) {
      throw new Error(t('tools.jwt_decoder.token_empty'));
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error(t('tools.jwt_decoder.invalid_format'));
    }
    
    try {
      // 解码header和payload
      const header = JSON.parse(base64UrlDecode(parts[0])) as JwtHeader;
      const payload = JSON.parse(base64UrlDecode(parts[1])) as JwtPayload;
      const signature = parts[2];
      
      // 计算过期状态
      let expirationStatus: 'valid' | 'expired' | 'not-set' = 'not-set';
      let expiresIn: string | undefined;
      
      if (payload.exp) {
        const expiration = new Date(payload.exp * 1000);
        const now = new Date();
        
        if (expiration > now) {
          expirationStatus = 'valid';
          expiresIn = getTimeRemaining(expiration);
        } else {
          expirationStatus = 'expired';
        }
      }
      
      // 简单验证
      const isValid = verifySignatureFormat(token);
      
      return {
        header,
        payload,
        signature,
        isValid,
        expirationStatus,
        expiresIn
      };
    } catch {
      throw new Error(t('tools.jwt_decoder.parsing_failed'));
    }
  };
  
  // Base64 URL解码
  const base64UrlDecode = (str: string): string => {
    // 替换URL安全Base64字符为标准Base64
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // 添加填充字符
    while (base64.length % 4) {
      base64 += '=';
    }
    
    try {
      // 解码
      return decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      throw new Error(t('tools.jwt_decoder.invalid_base64'));
    }
  };
  
  // 验证签名格式
  const verifySignatureFormat = (token: string): boolean => {
    const parts = token.split('.');
    return parts.length === 3 && !!parts[2];
  };
  
  // 格式化JSON数据
  const formatJson = (obj: unknown): string => {
    return JSON.stringify(obj, null, 2);
  };
  
  // 计算剩余时间
  const getTimeRemaining = (expirationDate: Date): string => {
    const now = new Date();
    const diff = expirationDate.getTime() - now.getTime();
    
    if (diff <= 0) {
      return t('tools.jwt_decoder.expired');
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    let timeStr = '';
    if (days > 0) timeStr += `${days}${t('tools.jwt_decoder.days')} `;
    if (hours > 0 || days > 0) timeStr += `${hours}${t('tools.jwt_decoder.hours')} `;
    if (minutes > 0 || hours > 0 || days > 0) timeStr += `${minutes}${t('tools.jwt_decoder.minutes')} `;
    timeStr += `${seconds}${t('tools.jwt_decoder.seconds')}`;
    
    return timeStr;
  };
  
  // 复制当前标签内容到剪贴板
  const copyToClipboard = () => {
    if (!decodedJwt) return;
    
    let contentToCopy = '';
    
    if (activeTab === 'header') {
      contentToCopy = formatJson(decodedJwt.header);
    } else if (activeTab === 'payload') {
      contentToCopy = formatJson(decodedJwt.payload);
    } else {
      contentToCopy = decodedJwt.signature;
    }
    
    navigator.clipboard.writeText(contentToCopy)
      .then(() => {
        setCopied(true);
        setSuccess(t('tools.jwt_decoder.copied_content'));
        setTimeout(() => {
          setCopied(false);
          setSuccess('');
        }, 2000);
      })
      .catch(err => {
        console.error(t('tools.jwt_decoder.copy_failed'), err);
        setError(t('tools.jwt_decoder.clipboard_error'));
      });
  };
  
  // 复制完整的JWT令牌
  const copyFullToken = () => {
    if (!jwtToken) return;
    
    navigator.clipboard.writeText(jwtToken)
      .then(() => {
        setSuccess(t('tools.jwt_decoder.token_copied'));
        setTimeout(() => setSuccess(''), 2000);
      })
      .catch(err => {
        console.error(t('tools.jwt_decoder.copy_failed'), err);
        setError(t('tools.jwt_decoder.clipboard_error'));
      });
  };
  
  // 清空输入
  const clearAll = () => {
    setJwtToken('');
    setDecodedJwt(null);
    setError('');
    setSuccess('');
  };
  
  // 加载示例JWT
  const loadExample = () => {
    // 示例JWT（过期时间设置为创建后的1小时）
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: '1234567890',
      name: t('tools.jwt_decoder.example_user'),
      iat: now,
      exp: now + 3600
    };
    
    // 创建示例token的header和payload部分
    const header = { alg: 'HS256', typ: 'JWT' };

    // 使用安全的方式转换为Base64URL
    const headerB64 = base64UrlEncode(JSON.stringify(header));
    const payloadB64 = base64UrlEncode(JSON.stringify(payload));
    
    // 签名部分用随机字符替代
    const fakeSig = 'XqYSaj1HB9h0X5mJJwD9x_Z_U_Fel9YQcpP9ehZ0-0w';
    
    // 完整示例JWT
    const exampleJwt = `${headerB64}.${payloadB64}.${fakeSig}`;
    setJwtToken(exampleJwt);
  };
  
  // Base64 URL编码（支持Unicode字符）
  const base64UrlEncode = (str: string): string => {
    // 将字符串转换为UTF-8编码的字节数组
    const utf8Bytes = new TextEncoder().encode(str);
    
    // 将字节数组转换为二进制字符串
    let binaryStr = '';
    utf8Bytes.forEach(byte => {
      binaryStr += String.fromCharCode(byte);
    });
    
    // 使用btoa进行Base64编码，然后转换为URL安全的Base64
    return btoa(binaryStr)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };
  
  // 获取过期状态的显示文本和类名
  const getExpirationInfo = () => {
    if (!decodedJwt || decodedJwt.expirationStatus === 'not-set') {
      return {
        text: t('tools.jwt_decoder.not_set'),
        className: 'text-tertiary'
      };
    }
    
    if (decodedJwt.expirationStatus === 'valid') {
      return {
        text: t('tools.jwt_decoder.valid_remaining').replace('{time}', decodedJwt.expiresIn || ''),
        className: 'text-success'
      };
    } else {
      return {
        text: t('tools.jwt_decoder.expired'),
        className: 'text-error'
      };
    }
  };
  
  // 获取JWT令牌各部分
  const getTokenParts = () => {
    if (!jwtToken) return null;
    
    const parts = jwtToken.split('.');
    if (parts.length !== 3) return null;
    
    return {
      header: parts[0],
      payload: parts[1],
      signature: parts[2]
    };
  };
  
  return (
    <div className="min-h-screen flex flex-col max-w-[1440px] mx-auto p-4 md:p-6">
      <ToolHeader 
        toolCode="jwt_decoder"
        icon={toolConfig?.icon || faLock}
        title=""
        description=""
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧面板 */}
        <div className="lg:col-span-5">
          <div className={styles.card}>
            <h2 className="text-lg font-medium text-primary mb-4">{t('tools.jwt_decoder.decode_jwt')}</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className={styles.label}>{t('tools.jwt_decoder.jwt_token')}</label>
                  <button 
                    className="text-xs text-tertiary hover:text-secondary"
                    onClick={() => setShowTokenParts(!showTokenParts)}
                  >
                    {showTokenParts ? t('tools.jwt_decoder.hide_parts') : t('tools.jwt_decoder.show_parts')}
                  </button>
                </div>
                
                <textarea
                  className={styles.textArea}
                  value={jwtToken}
                  onChange={(e) => setJwtToken(e.target.value)}
                  placeholder={t('tools.jwt_decoder.paste_jwt')}
                />
              </div>
              
              {/* 显示令牌分段 */}
              {showTokenParts && (
                <div className="space-y-2">
                  <div className="text-xs text-tertiary">{t('tools.jwt_decoder.token_structure')}</div>
                  <div className="flex flex-col gap-2 text-xs">
                    {getTokenParts() && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className={`${styles.tokenPart} ${styles.headerPart}`}>{t('tools.jwt_decoder.header')}</span>
                          <span className="text-tertiary font-mono break-all">{getTokenParts()?.header}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`${styles.tokenPart} ${styles.payloadPart}`}>{t('tools.jwt_decoder.payload')}</span>
                          <span className="text-tertiary font-mono break-all">{getTokenParts()?.payload}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`${styles.tokenPart} ${styles.signaturePart}`}>{t('tools.jwt_decoder.signature')}</span>
                          <span className="text-tertiary font-mono break-all">{getTokenParts()?.signature}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {error && (
                <div className={styles.error}>
                  {error}
                </div>
              )}
              
              {success && (
                <div className={styles.success}>
                  {success}
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                <button className="btn-primary" onClick={loadExample}>
                  <FontAwesomeIcon icon={faSync} className="mr-2" />
                  {t('tools.jwt_decoder.load_example')}
                </button>
                
                <button className="btn-secondary" onClick={clearAll}>
                  <FontAwesomeIcon icon={faEraser} className="mr-2" />
                  {t('tools.jwt_decoder.clear')}
                </button>
                
                <button 
                  className="btn-secondary" 
                  onClick={copyFullToken}
                  disabled={!jwtToken}
                >
                  <FontAwesomeIcon icon={faCopy} className="mr-2" />
                  {t('tools.jwt_decoder.copy_token')}
                </button>
              </div>
              
              {decodedJwt && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-secondary">{t('tools.jwt_decoder.jwt_status')}</div>
                    <div className={`px-2 py-1 rounded-md text-xs ${decodedJwt.isValid ? 'bg-green-900/10 text-success' : 'bg-red-900/10 text-error'}`}>
                      {decodedJwt.isValid ? t('tools.jwt_decoder.format_valid') : t('tools.jwt_decoder.format_invalid')}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-secondary">{t('tools.jwt_decoder.expiration_status')}</div>
                    <div className={styles.statusBox(decodedJwt.expirationStatus)}>
                      {getExpirationInfo().text}
                    </div>
                  </div>
                  
                  {decodedJwt.payload.iat && (
                    <div className="flex items-center justify-between">
                      <div className="text-secondary">{t('tools.jwt_decoder.issue_time')}</div>
                      <div className="text-xs text-tertiary">
                        {new Date(decodedJwt.payload.iat * 1000).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 右侧面板 */}
        <div className="lg:col-span-7">
          {decodedJwt ? (
            <div className={styles.card}>
              <div className="border-b border-purple-glow/30 mb-4">
                <div className="flex">
                  <button
                    className={styles.tabButton(activeTab === 'header')}
                    onClick={() => setActiveTab('header')}
                  >
                    {t('tools.jwt_decoder.header_tab')}
                  </button>
                  <button
                    className={styles.tabButton(activeTab === 'payload')}
                    onClick={() => setActiveTab('payload')}
                  >
                    {t('tools.jwt_decoder.payload_tab')}
                  </button>
                  <button
                    className={styles.tabButton(activeTab === 'signature')}
                    onClick={() => setActiveTab('signature')}
                  >
                    {t('tools.jwt_decoder.signature_tab')}
                  </button>
                </div>
              </div>
              
              <div className="mb-4 flex justify-end">
                <button
                  className={styles.copyButton}
                  onClick={copyToClipboard}
                >
                  <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                  {copied ? t('tools.jwt_decoder.copied') : t('tools.jwt_decoder.copy')}
                </button>
              </div>
              
              <pre className={styles.preArea}>
                {activeTab === 'header' && formatJson(decodedJwt.header)}
                {activeTab === 'payload' && formatJson(decodedJwt.payload)}
                {activeTab === 'signature' && decodedJwt.signature}
              </pre>
            </div>
          ) : (
            <div className={styles.card}>
              <h3 className={styles.heading}>{t('tools.jwt_decoder.what_is_jwt')}</h3>
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faInfoCircle} className="text-purple" />
                <span className="text-secondary">{t('tools.jwt_decoder.jwt_full_name')}</span>
              </div>
              <p className={styles.secondaryText}>
                {t('tools.jwt_decoder.jwt_intro')}
              </p>
              <p className={styles.secondaryText}>
                {t('tools.jwt_decoder.jwt_parts')}
              </p>
              <ul className="list-disc pl-5 text-sm text-tertiary">
                <li><span className={styles.highlight}>Header</span> - {t('tools.jwt_decoder.header_desc')}</li>
                <li><span className={styles.highlight}>Payload</span> - {t('tools.jwt_decoder.payload_desc')}</li>
                <li><span className={styles.highlight}>Signature</span> - {t('tools.jwt_decoder.signature_desc')}</li>
              </ul>
              <p className={styles.secondaryText}>
                {t('tools.jwt_decoder.tool_purpose')}
              </p>
              
              <div className="mt-4 p-3 bg-block-strong rounded-lg">
                <h4 className="text-sm font-medium text-secondary mb-2">{t('tools.jwt_decoder.common_use_cases')}</h4>
                <ul className="list-disc pl-5 text-sm text-tertiary">
                  <li>{t('tools.jwt_decoder.use_case_1')}</li>
                  <li>{t('tools.jwt_decoder.use_case_2')}</li>
                  <li>{t('tools.jwt_decoder.use_case_3')}</li>
                  <li>{t('tools.jwt_decoder.use_case_4')}</li>
                  <li>{t('tools.jwt_decoder.use_case_5')}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <BackToTop />
    </div>
  );
} 