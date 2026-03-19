import { NextRequest, NextResponse } from 'next/server';

// 定义支持的HTTP方法
const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

// 安全限制配置
const SECURITY_CONFIG = {
  // 请求体大小限制（2MB）
  maxBodySize: 2 * 1024 * 1024,
  
  // URL黑名单（正则表达式）
  urlBlacklist: [
    /localhost/i,
    /127(\.|%2E|%2e|-|%2D|%2d)0(\.|%2E|%2e|-|%2D|%2d)0(\.|%2E|%2e|-|%2D|%2d)1/i, // 127.0.0.1 及变种
    /127(\.|%2E|%2e)([0-9]{1,3})(\.|%2E|%2e)([0-9]{1,3})(\.|%2E|%2e)([0-9]{1,3})/i, // 所有127.0.0.0/8
    /^0\./i, // 0.0.0.0
    /192(\.|%2E|%2e)168(\.|%2E|%2e)/i, // 192.168.x.x
    /10(\.|%2E|%2e)([0-9]{1,3})(\.|%2E|%2e)([0-9]{1,3})(\.|%2E|%2e)([0-9]{1,3})/i, // 10.x.x.x
    /172(\.|%2E|%2e)(1[6-9]|2[0-9]|3[0-1])(\.|%2E|%2e)([0-9]{1,3})(\.|%2E|%2e)([0-9]{1,3})/i, // 172.16-31.x.x
    /169(\.|%2E|%2e)254(\.|%2E|%2e)/i,  // 链路本地地址
    /::1/i, // IPv6 localhost
    /fc00::/i, // IPv6 私有地址
    /fe80::/i, // IPv6 链路本地地址
    /file:/i,  // 本地文件
    /ftp:/i,   // FTP协议
    /internal\./i, // internal域名
    /intranet\./i, // intranet域名
    /private\./i,  // private域名
    /corp\./i,     // 企业内网域名
    /\.local$/i,   // .local域名
    /\.internal$/i, // .internal域名
    /\.localhost$/i, // .localhost域名
    /nip\.io$/i,   // nip.io域名服务，常用于内网绕过
    /sslip\.io$/i, // sslip.io域名，类似nip.io
    /xip\.io$/i,   // xip.io域名，类似nip.io
    /lvh\.me$/i,   // lvh.me，指向127.0.0.1
    /localtest\.me$/i, // localtest.me，指向127.0.0.1
  ],
  
  // 域名解析安全检查
  domainChecks: [
    // 屏蔽包含内网IP数字的域名
    /((^|\.)127\.|\.0\.0\.|\.(192\.168|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))\.|\.254\.)/i,
  ],
  
  // 敏感端口黑名单
  portBlacklist: [
    // 系统和服务端口
    '21', '22', '23', '25', '53', '69', '110', '111', '119', '123', '135', '137', '138', '139', '143', '161', '162', 
    '389', '445', '465', '514', '515', '587', '631', '636', '989', '990', '993', '995',
    // 数据库端口
    '1433', '1434', '1521', '1522', '3306', '5000', '5432', '5433', '6379', '9042', '27017', '27018', '27019', '28017',  
    // 中间件和缓存端口
    '8161', '9000', '9092', '9200', '9300', '11211', '50000', '50070', '50075', '50090',
    // Web服务和开发端口
    '4000', '4001', '8001', '8008', '8088', '8443', '8888', '9001', '9090',"8016","8017","9443",
    // 代理和VPN端口
    '1080', '3128', '8118', '9091',
    // 远程管理和监控端口
    '3389', '5900', '5901', '5902', '5903', '8834', '10000',
    // 其他常见的敏感服务端口
    '873', '2049', '2181', '2375', '2376', '3690', '4369', '4444', '4505', '4506', '5601', '5672', '5984', '6000', '6001',
    '7001', '7002', '7077', '8009', '8983', '9990', '15672', '49152', '49153', '49154', '49155'
  ],
  
  // 允许的最大响应大小（5MB）
  maxResponseSize: 5 * 1024 * 1024,
  
  // 重定向安全检查
  maxRedirects: 5, // 最大重定向次数
  checkRedirects: true, // 是否检查重定向
};

// 请求频率限制存储
const rateLimits = new Map<string, {count: number, timestamp: number}>();
const RATE_LIMIT = 20; // 每分钟最大请求数
const RATE_WINDOW = 60 * 1000; // 1分钟窗口期

/**
 * 安全检查URL
 */
function isUrlSafe(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    
    // 检查协议
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }
    
    // 检查URL黑名单
    if (SECURITY_CONFIG.urlBlacklist.some(pattern => pattern.test(url.hostname))) {
      return false;
    }
    
    // 检查端口黑名单
    if (url.port && SECURITY_CONFIG.portBlacklist.includes(url.port)) {
      return false;
    }
    
    // 检查域名特征
    if (SECURITY_CONFIG.domainChecks.some(pattern => pattern.test(url.hostname))) {
      return false;
    }
    
    // 检查IP格式的主机名
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = url.hostname.match(ipv4Regex);
    
    if (ipMatch) {
      const octets = ipMatch.slice(1, 5).map(Number);
      
      // 检查是否为内网IP地址
      if (
        octets[0] === 10 || // 10.0.0.0/8
        (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) || // 172.16.0.0/12
        (octets[0] === 192 && octets[1] === 168) || // 192.168.0.0/16
        (octets[0] === 127) || // 127.0.0.0/8
        (octets[0] === 0) || // 0.0.0.0/8
        (octets[0] === 169 && octets[1] === 254) || // 169.254.0.0/16
        (octets[0] >= 224) // 组播和保留地址
      ) {
        return false;
      }
    }
    
    return true;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return false;
  }
}

/**
 * 检查请求频率限制
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimits.get(ip);
  
  if (!userLimit) {
    rateLimits.set(ip, { count: 1, timestamp: now });
    return true;
  }
  
  // 如果时间窗口已过，重置计数
  if (now - userLimit.timestamp > RATE_WINDOW) {
    rateLimits.set(ip, { count: 1, timestamp: now });
    return true;
  }
  
  // 增加计数并检查是否超过限制
  userLimit.count++;
  if (userLimit.count > RATE_LIMIT) {
    return false;
  }
  
  return true;
}

/**
 * 安全检查重定向URL
 */
async function checkRedirectSafety(url: string, redirectCount = 0): Promise<boolean> {
  if (redirectCount >= SECURITY_CONFIG.maxRedirects) {
    return false; // 超过最大重定向次数
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // 检查是否有重定向
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        // 构建完整的重定向URL
        const redirectUrl = new URL(location, url).toString();
        
        // 检查重定向URL安全性
        if (!isUrlSafe(redirectUrl)) {
          return false;
        }
        
        // 递归检查下一个重定向
        return await checkRedirectSafety(redirectUrl, redirectCount + 1);
      }
    }
    
    return true;
  } catch (error) {
    console.error('重定向检查失败:', error);
    return false; // 出错时保守处理，拒绝请求
  }
}

/**
 * 处理所有HTTP请求的代理路由
 */
export async function POST(request: NextRequest) {
  // 获取客户端IP
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  // 检查请求频率限制
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: '请求频率过高，请稍后再试' },
      { status: 429 }
    );
  }
  
  try {
    // 获取请求体中的请求配置
    const requestConfig = await request.json();
    const { url, method, headers = {}, body } = requestConfig;

    // 验证请求参数
    if (!url) {
      return NextResponse.json(
        { error: '缺少必要的URL参数' },
        { status: 400 }
      );
    }

    if (!method || !ALLOWED_METHODS.includes(method)) {
      return NextResponse.json(
        { error: '不支持的HTTP方法' },
        { status: 400 }
      );
    }
    
    // 检查URL安全性
    if (!isUrlSafe(url)) {
      return NextResponse.json(
        { error: '请求URL不安全或不被允许' },
        { status: 403 }
      );
    }
    
    // 检查重定向安全性
    if (SECURITY_CONFIG.checkRedirects) {
      const isRedirectSafe = await checkRedirectSafety(url);
      if (!isRedirectSafe) {
        return NextResponse.json(
          { error: '重定向目标不安全或不被允许' },
          { status: 403 }
        );
      }
    }
    
    // 检查请求体大小
    if (body && typeof body === 'string' && body.length > SECURITY_CONFIG.maxBodySize) {
      return NextResponse.json(
        { error: '请求体超过大小限制' },
        { status: 413 }
      );
    }
    
    // 移除或净化敏感请求头
    const sanitizedHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      // 跳过敏感请求头
      if (['host', 'origin', 'referer', 'cookie', 'authorization'].includes(key.toLowerCase())) {
        continue;
      }
      sanitizedHeaders[key] = value as string;
    }

    // 设置安全的请求头
    sanitizedHeaders['X-Forwarded-By'] = 'JiSuXiang-Proxy';
    sanitizedHeaders['User-Agent'] = sanitizedHeaders['User-Agent'] || 'JiSuXiang-Proxy/1.0';

    // 准备请求选项
    const fetchOptions: RequestInit = {
      method,
      headers: sanitizedHeaders,
      // 只在适用的方法中添加请求体
      ...(method !== 'GET' && method !== 'HEAD' && body ? { body } : {}),
      redirect: 'follow',
    };

    // 发送请求
    const startTime = performance.now();
    
    // 设置超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时
    
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
  
      // 获取响应头
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
  
      // 根据Content-Type处理响应
      const contentType = response.headers.get('content-type') || '';
      let responseData;
      let responseText;
      
      // 检查响应大小
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > SECURITY_CONFIG.maxResponseSize) {
        return NextResponse.json({
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          data: '响应内容过大，已被截断',
          time: responseTime,
          size: parseInt(contentLength),
        });
      }
  
      if (contentType.includes('application/json')) {
        responseData = await response.json();
        responseText = JSON.stringify(responseData);
      } else {
        responseText = await response.text();
        responseData = responseText;
      }
      
      // 检查响应体大小
      if (responseText.length > SECURITY_CONFIG.maxResponseSize) {
        return NextResponse.json({
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          data: '响应内容过大，已被截断',
          time: responseTime,
          size: responseText.length,
        });
      }
  
      // 计算响应大小（近似值）
      const responseSize = Buffer.from(responseText || '').length;
  
      // 返回代理响应结果
      return NextResponse.json({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseData,
        time: responseTime,
        size: responseSize,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error('代理请求错误:', error);
    
    // 提供友好的错误信息，不泄露详细的错误细节
    let errorMessage = '代理请求失败';
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = '请求超时';
      } else {
        errorMessage = '请求失败：' + (error.message.includes('fetch') ? '无法连接到目标服务器' : '未知错误');
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 