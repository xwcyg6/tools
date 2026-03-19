/**
 * 安全工具函数
 */

interface MsCrypto {
  getRandomValues: (array: Uint32Array) => Uint32Array;
}

// 生成随机字符串
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const crypto = window.crypto || (window as unknown as { msCrypto: MsCrypto }).msCrypto; // 兼容性处理
  
  if (crypto && crypto.getRandomValues) {
    // 使用更安全的随机数生成方式
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);
    
    for (let i = 0; i < length; i++) {
      result += chars[values[i] % chars.length];
    }
  } else {
    // 降级方案，不太安全但保证兼容性
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  
  return result;
}

// 计算API请求签名
export function calculateRequestSignature(
  url: string,
  method: string,
  timestamp: number,
  nonce: string,
  body?: string | null,
  secret: string = 'jisuxiang-web-client'
): string {
  // 如果在浏览器环境
  if (typeof window !== 'undefined') {
    // 创建签名字符串
    const parts = [
      method.toUpperCase(),
      encodeURIComponent(url),
      timestamp,
      nonce,
    ];
    
    // 如果有请求体，添加请求体的摘要
    if (body) {
      // 在浏览器中计算简单摘要
      let bodyDigest = 0;
      for (let i = 0; i < body.length; i++) {
        bodyDigest = ((bodyDigest << 5) - bodyDigest) + body.charCodeAt(i);
        bodyDigest |= 0; // 转为32位整数
      }
      parts.push(bodyDigest.toString(16));
    }
    
    // 添加密钥
    parts.push(secret);
    
    // 计算签名(简化版，实际应该使用更强的哈希算法)
    const signatureString = parts.join('&');
    let signature = 0;
    
    for (let i = 0; i < signatureString.length; i++) {
      signature = ((signature << 5) - signature) + signatureString.charCodeAt(i);
      signature |= 0; // 转为32位整数
    }
    
    return (signature >>> 0).toString(16).padStart(8, '0');
  }
  
  // 服务器端环境
  return 'server-side-signature';
}

// 生成安全请求头
export function generateSecurityHeaders(
  url: string,
  method: string = 'GET',
  body?: string | null
): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = generateRandomString(16);
  const signature = calculateRequestSignature(url, method, timestamp, nonce, body);
  
  return {
    'X-Timestamp': timestamp.toString(),
    'X-Nonce': nonce,
    'X-Signature': signature,
    'X-Client': 'jisuxiang-web',
  };
}

// 检测可能的爬虫
export function isPotentialBot(): boolean {
  if (typeof window === 'undefined') return false;
  
  // 检查navigator对象
  const nav = window.navigator;
  const ua = nav.userAgent.toLowerCase();
  
  // 检测已知爬虫或自动化工具的痕迹
  const botPatterns = [
    'bot', 'spider', 'crawl', 'slurp', 'scrape', 'fetch',
    'phantomjs', 'headless', 'selenium', 'webdriver', 'puppeteer',
    'electron', 'browsix', 'curl', 'wget', 'axios', 'http-client',
  ];
  
  // 检查用户代理
  if (botPatterns.some(pattern => ua.includes(pattern))) {
    return true;
  }
  
  // 检查特定浏览器功能
  if (
    !('localStorage' in window) ||
    !('sessionStorage' in window) ||
    !('indexedDB' in window) ||
    !('document' in window) ||
    !('history' in window)
  ) {
    return true;
  }
  
  // 检查屏幕和窗口属性
  if (
    window.screen.height === 0 ||
    window.screen.width === 0 ||
    window.outerHeight === 0 ||
    window.outerWidth === 0
  ) {
    return true;
  }
  
  // 检查WebDriver属性(自动化工具)
  // 使用类型断言访问可能存在的属性
  if (
    (nav as unknown as {webdriver?: boolean}).webdriver || 
    (nav as unknown as {domAutomation?: boolean}).domAutomation ||
    nav.hasOwnProperty('__webdriver_script_fn')
  ) {
    return true;
  }
  
  return false;
}

// 获取浏览器指纹
export function getBrowserFingerprint(): string {
  if (typeof window === 'undefined') return 'server-side';
  
  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    new Date().getTimezoneOffset(),
    screen.colorDepth,
    navigator.cookieEnabled,
    screen.width + 'x' + screen.height,
    ('localStorage' in window ? 'yes' : 'no'),
    ('sessionStorage' in window ? 'yes' : 'no'),
    ('indexedDB' in window ? 'yes' : 'no'),
  ];
  
  // 计算简单的指纹
  const fingerprint = components.join('###');
  let hash = 0;
  
  for (let i = 0; i < fingerprint.length; i++) {
    hash = ((hash << 5) - hash) + fingerprint.charCodeAt(i);
    hash |= 0;
  }
  
  return (hash >>> 0).toString(16);
}

// 添加请求反爬虫头
export function addAntiCrawlingHeaders(headers: Record<string, string> = {}): Record<string, string> {
  const fingerprint = getBrowserFingerprint();
  const isBot = isPotentialBot();
  
  return {
    ...headers,
    'X-Browser-Fingerprint': fingerprint,
    'X-Client-Type': isBot ? 'potential-bot' : 'browser',
    'X-Requested-With': 'XMLHttpRequest',
  };
} 