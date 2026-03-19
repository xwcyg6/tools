import { NextRequest, NextResponse } from 'next/server';
import iconv from 'iconv-lite';

// 定义API源
const API_SOURCES = [
  {
    name: '太平洋电脑网',
    url: 'https://whois.pconline.com.cn/ipJson.jsp?ip={ip}&json=true',
    encoding: 'gbk' // 使用GBK编码
  },
  {
    name: 'IP.CN',
    url: 'https://www.ip.cn/api/index?ip={ip}&type=0',
    encoding: 'utf-8'
  },
  {
    name: 'ip-api.com',
    url: 'http://ip-api.com/json/{ip}?lang=zh-CN',
    encoding: 'utf-8'
  },
  {
    name: '百度IP',
    url: 'https://opendata.baidu.com/api.php?co=&resource_id=6006&oe=utf8&query={ip}',
    encoding: 'utf-8'
  },
  {
    name: '淘宝IP',
    url: 'https://ip.taobao.com/outGetIpInfo?ip={ip}&accessKey=alibaba-inc',
    encoding: 'utf-8'
  },
  {
    name: '新浪IP',
    url: 'https://int.dpool.sina.com.cn/iplookup/iplookup.php?format=json&ip={ip}',
    encoding: 'utf-8'
  },
  {
    name: '美图IP',
    url: 'https://webapi-pc.meitu.com/common/ip_location?ip={ip}',
    encoding: 'utf-8'
  },
  {
    name: 'Vore',
    url: 'https://api.vore.top/api/IPdata?ip={ip}',
    encoding: 'utf-8'
  },
  {
    name: 'IPApi.is',
    url: 'https://api.ipapi.is/?ip={ip}',
    encoding: 'utf-8'
  },
  {
    name: 'GeoJS',
    url: 'https://get.geojs.io/v1/ip/geo/{ip}.json',
    encoding: 'utf-8'
  },
  {
    name: '顺为API',
    url: 'https://api.itapi.cn/api/ip/ipv4?ip={ip}',
    encoding: 'utf-8'
  },
  // 添加新的API源
  {
    name: 'IPInfoDB',
    url: 'https://api.ipinfodb.com/v3/ip-city/?key=free&ip={ip}&format=json',
    encoding: 'utf-8'
  },
  {
    name: 'IP-API',
    url: 'https://ip-api.com/json/{ip}?lang=zh-CN&fields=status,country,regionName,city,district,isp,org,as,mobile,proxy,hosting,query',
    encoding: 'utf-8'
  },
  {
    name: 'IPWHOIS',
    url: 'https://ipwhois.app/json/{ip}?lang=zh',
    encoding: 'utf-8'
  },
  {
    name: 'IPGeolocation',
    url: 'https://api.ipgeolocation.io/ipgeo?apiKey=free&ip={ip}',
    encoding: 'utf-8'
  }
];

// 安全配置
const SECURITY_CONFIG = {
  // 每个IP每天允许的最大请求次数
  maxDailyRequests: 1000000,
  
  // 每个IP每小时允许的最大请求次数
  maxHourlyRequests: 3000,
  
  // 允许查询的最大IP数量（用于批量查询防护）
  maxBatchSize: 5,
  
  // IP地址格式验证的正则表达式
  ipRegex: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  
  // 黑名单IP前缀（用于防止查询敏感IP）
  blacklistedPrefixes: [
    '192.168.',
    '10.',
    '172.16.',
    '172.17.',
    '172.18.',
    '172.19.',
    '172.20.',
    '172.21.',
    '172.22.',
    '172.23.',
    '172.24.',
    '172.25.',
    '172.26.',
    '172.27.',
    '172.28.',
    '172.29.',
    '172.30.',
    '172.31.',
    '127.',
    '0.'
  ],
};

// 定义类型
interface CacheEntry {
  data: Record<string, unknown>;
  timestamp: number;
  source?: string;
}

interface RequestLimitRecord {
  hourly: { count: number, resetTime: number };
  daily: { count: number, resetTime: number };
  lastRequestTime: number;
}

// 内存缓存，用于存储IP查询结果和速率限制
const ipCache = new Map<string, CacheEntry>();
const requestLimits = new Map<string, RequestLimitRecord>();

// 处理特定编码的响应
async function handleEncodedResponse(response: Response, apiSource: typeof API_SOURCES[0]): Promise<unknown> {
  try {
    // 对于GBK编码的API，需要特殊处理
    if (apiSource.encoding === 'gbk') {
      try {
        const buffer = await response.arrayBuffer();
        const text = iconv.decode(Buffer.from(buffer), 'gbk');
        console.log(`GBK解码结果: ${text.substring(0, 100)}...`);
        
        // 处理可能的JSONP响应
        if (apiSource.name === '太平洋电脑网') {
          const jsonStart = text.indexOf('{');
          const jsonEnd = text.lastIndexOf('}') + 1;
          if (jsonStart >= 0 && jsonEnd > jsonStart) {
            const jsonText = text.substring(jsonStart, jsonEnd);
            try {
              return JSON.parse(jsonText);
            } catch (error) {
              console.error('解析JSON失败:', error);
              throw new Error('解析GBK编码的JSON失败');
            }
          }
        }
        
        try {
          return JSON.parse(text);
        } catch (error) {
          console.error('解析GBK响应失败:', error);
          throw new Error('无法解析GBK编码的响应');
        }
      } catch (decodingError) {
        console.error('GBK解码失败:', decodingError);
        throw new Error('GBK编码处理失败');
      }
    } else {
      // UTF-8或其他编码，尝试直接解析为JSON
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        try {
          return await response.json();
        } catch (error) {
          console.error('JSON解析失败:', error);
          throw new Error('JSON解析错误');
        }
      } else {
        try {
          const text = await response.text();
          console.log(`响应文本开头: ${text.substring(0, 100)}...`);
          
          // 尝试解析为JSON
          try {
            return JSON.parse(text);
          } catch {
            // 尝试提取JSONP响应中的JSON部分
            const jsonpMatch = text.match(/\w+\((.*)\)/);
            if (jsonpMatch && jsonpMatch[1]) {
              try {
                return JSON.parse(jsonpMatch[1]);
              } catch (e) {
                console.error('JSONP解析失败:', e);
              }
            }
            
            // 尝试提取任何JSON对象
            const jsonMatch = text.match(/\{.*\}/);
            if (jsonMatch) {
              try {
                return JSON.parse(jsonMatch[0]);
              } catch (e) {
                console.error('JSON提取失败:', e);
              }
            }
            
            // 处理纯文本IP
            const ipMatch = text.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
            if (ipMatch) {
              return { ip: ipMatch[0] };
            }
            
            console.error('所有解析方法都失败，响应内容:', text.substring(0, 200));
            throw new Error('无法解析API响应');
          }
        } catch (textError) {
          console.error('获取响应文本失败:', textError);
          throw new Error('读取响应文本失败');
        }
      }
    }
  } catch (error) {
    console.error('处理API响应时发生未捕获的错误:', error);
    throw error;
  }
}

/**
 * 验证IP地址格式是否有效
 */
function isValidIpAddress(ip: string): boolean {
  return SECURITY_CONFIG.ipRegex.test(ip);
}

/**
 * 检查IP是否在黑名单中
 */
function isBlacklistedIp(ip: string): boolean {
  return SECURITY_CONFIG.blacklistedPrefixes.some(prefix => ip.startsWith(prefix));
}

/**
 * 检查请求限制
 */
function checkRequestLimit(clientIp: string): boolean {
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  const dayMs = 24 * hourMs;
  
  // 获取或初始化请求限制记录
  let record = requestLimits.get(clientIp);
  if (!record) {
    record = {
      hourly: { count: 0, resetTime: now + hourMs },
      daily: { count: 0, resetTime: now + dayMs },
      lastRequestTime: 0
    };
    requestLimits.set(clientIp, record);
  }
  
  // 重置过期的计数器
  if (now > record.hourly.resetTime) {
    record.hourly = { count: 0, resetTime: now + hourMs };
  }
  if (now > record.daily.resetTime) {
    record.daily = { count: 0, resetTime: now + dayMs };
  }
  
  // 增加计数并检查限制
  record.hourly.count++;
  record.daily.count++;
  record.lastRequestTime = now;
  
  // 检查是否超出限制
  return (
    record.hourly.count <= SECURITY_CONFIG.maxHourlyRequests &&
    record.daily.count <= SECURITY_CONFIG.maxDailyRequests
  );
}

/**
 * 从缓存获取IP信息或标记为需要刷新
 */
function getCachedIpInfo(ip: string): { data: Record<string, unknown> | null; needsRefresh: boolean } {
  const cacheEntry = ipCache.get(ip);
  const now = Date.now();
  
  // 如果缓存不存在或已过期（超过1小时），需要刷新
  if (!cacheEntry || now - cacheEntry.timestamp > 60 * 60 * 1000) {
    return { data: null, needsRefresh: true };
  }
  
  return { data: cacheEntry.data, needsRefresh: false };
}

/**
 * 更新IP缓存
 */
function updateIpCache(ip: string, data: Record<string, unknown>): void {
  ipCache.set(ip, {
    data,
    timestamp: Date.now()
  });
  
  // 清理缓存（如果缓存大小超过1000条记录）
  if (ipCache.size > 1000) {
    // 找出最旧的100条记录并删除
    const entries = Array.from(ipCache.entries());
    entries
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, 100)
      .forEach(([key]) => ipCache.delete(key));
  }
}

/**
 * 获取客户端的真实IP地址
 */
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for可能包含多个IP，取第一个
    return forwardedFor.split(',')[0].trim();
  }
  
  // 尝试从其他标头获取
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // 如果都没有，尝试从远程地址获取
  const remoteAddr = request.headers.get('remote-addr') || '';
  return remoteAddr;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  let ip = searchParams.get('ip') || '';
  const source = searchParams.get('source') || 'auto';
  const checkSelf = ip === 'self' || ip === '';
  
  console.log(`开始IP查询请求: ${ip ? ip : '请求自身IP'}, 源: ${source}`);
  
  // 获取客户端IP
  const clientIp = getClientIP(request);
  console.log(`客户端IP: ${clientIp}`);
  
  // 检查请求频率限制
  if (!checkRequestLimit(clientIp)) {
    console.log(`请求频率限制: IP ${clientIp} 超出限制`);
    return NextResponse.json(
      { error: '请求次数过多，请稍后再试' },
      { status: 429 }
    );
  }
  
  // 如果是查询自己的IP或未提供IP
  if (checkSelf) {
    ip = clientIp;
    console.log(`自查询模式，使用客户端IP: ${ip}`);
    if (!ip || ip === '127.0.0.1' || ip === 'localhost') {
      // 无法获取客户端IP，返回错误
      console.log('无法获取有效的客户端IP');
      return NextResponse.json(
        { 
          data: {
            ip: '无法获取您的IP地址',
            country: '未知',
            region: '未知',
            city: '未知',
            isp: '未知'
          },
          source: '本地分析'
        }
      );
    }
  } else {
    // 验证IP地址格式
    if (!ip || !isValidIpAddress(ip)) {
      console.log(`无效的IP地址格式: ${ip}`);
      return NextResponse.json(
        { error: '无效的IP地址格式' },
        { status: 400 }
      );
    }
    
    // 检查是否尝试查询黑名单IP（内网IP等）
    if (isBlacklistedIp(ip)) {
      console.log(`黑名单IP: ${ip}`);
      return NextResponse.json({
        data: {
          ip: ip,
          country: '本地网络',
          region: '私有网络',
          city: '内部网络',
          isp: '本地连接'
        },
        source: '本地分析'
      });
    }
  }
  
  try {
    // 检查缓存
    const { data: cachedData, needsRefresh } = getCachedIpInfo(ip);
    if (cachedData && !needsRefresh) {
      console.log(`从缓存中获取IP信息: ${ip}`);
      return NextResponse.json({
        data: cachedData,
        source: cachedData.source || '缓存数据',
        requestType: checkSelf ? 'self' : 'query',
        cached: true
      });
    }
    
    // 检查是否为本地IP或保留IP，直接显示特殊信息
    if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || 
        (ip.startsWith('172.') && parseInt(ip.split('.')[1]) >= 16 && parseInt(ip.split('.')[1]) <= 31)) {
      
      let ipType = '本地网络';
      if (ip === '127.0.0.1') {
        ipType = '环回地址';
      } else if (ip.startsWith('192.168.')) {
        ipType = '私有网络 (C类)';
      } else if (ip.startsWith('10.')) {
        ipType = '私有网络 (A类)';
      } else if (ip.startsWith('172.')) {
        ipType = '私有网络 (B类)';
      }
      
      console.log(`检测到本地/保留IP: ${ip}, 类型: ${ipType}`);
      
      const localNetworkData = {
        ip: ip,
        country: '本地网络',
        region: ipType,
        city: '内部网络',
        isp: '本地连接'
      };
      
      // 更新缓存
      updateIpCache(ip, localNetworkData);
      
      return NextResponse.json({
        data: localNetworkData,
        source: '本地分析',
        requestType: checkSelf ? 'self' : 'query'
      });
    }
    
    // 根据source选择单一API源或尝试所有API源
    const apiSources = source === 'auto' 
      ? API_SOURCES 
      : API_SOURCES.filter(s => s.name === source);
      
    if (apiSources.length === 0) {
      console.log(`未找到API源: ${source}`);
      return NextResponse.json(
        { error: '指定的API源不存在' },
        { status: 400 }
      );
    }
    
    console.log(`准备查询IP: ${ip}, 将尝试 ${apiSources.length} 个API源`);
    
    // 逐个尝试API源
    for (const apiSource of apiSources) {
      try {
        const url = apiSource.url.replace('{ip}', ip);
        console.log(`尝试API源: ${apiSource.name}, URL: ${url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        console.log(`发送请求到: ${url}`);
        try {
          const response = await fetch(url, { 
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'application/json, text/plain, */*',
              'Referer': 'https://jisuxiang.com/'
            },
            cache: 'no-store',  // 不使用缓存
            next: { revalidate: 0 }  // Next.js特定配置，确保不缓存
          });
          clearTimeout(timeoutId);
          
          console.log(`API ${apiSource.name} 响应状态: ${response.status}`);
          
          if (!response.ok) {
            console.error(`API ${apiSource.name} 响应状态不正常: ${response.status}`);
            continue; // 尝试下一个API源
          }
          
          // 处理响应数据，考虑编码
          try {
            console.log(`处理API ${apiSource.name} 响应，编码: ${apiSource.encoding}`);
            const data = await handleEncodedResponse(response, apiSource);
            
            // 额外记录API响应，方便调试
            console.log(`API ${apiSource.name} 响应成功:`, 
                      JSON.stringify(data).substring(0, 200) + 
                      (JSON.stringify(data).length > 200 ? '...' : ''));
            
            // 检查数据是否有效（不是空对象或没有有效字段）
            if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
              console.log(`API ${apiSource.name} 返回了空数据`);
              continue; // 尝试下一个API源
            }
            
            // 更新缓存
            if (data && typeof data === 'object') {
              updateIpCache(ip, { ...data as Record<string, unknown>, source: apiSource.name });
            } else {
              // 如果不是对象，创建一个新对象存储
              updateIpCache(ip, { rawData: data, source: apiSource.name });
            }
            
            // 返回原始数据和API源信息
            console.log(`返回API ${apiSource.name} 的数据`);
            return NextResponse.json({
              data,
              source: apiSource.name,
              // 如果是请求自己的IP，添加标记
              requestType: checkSelf ? 'self' : 'query'
            });
          } catch (parseError) {
            console.error(`API ${apiSource.name} 解析失败:`, parseError);
            continue; // 解析失败，尝试下一个API
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          console.error(`API ${apiSource.name} 的fetch操作失败:`, fetchError);
          continue; // fetch失败，尝试下一个API
        }
      } catch (error) {
        console.error(`API ${apiSource.name} 请求过程中发生未知错误:`, error);
        // 继续尝试下一个API
      }
    }
    
    console.log(`所有API源都失败，返回基本IP信息: ${ip}`);
    
    // 所有API都失败，但仍然返回一个基本的IP信息
    const fallbackData = {
      ip: ip,
      country: '未知',
      region: '未知',
      city: '未知',
      isp: '未知'
    } as Record<string, unknown>;
    
    // 更新缓存，但设置为短期缓存（10分钟）
    updateIpCache(ip, { 
      ...fallbackData, 
      source: 'IP解析失败' 
    });
    
    return NextResponse.json({
      data: fallbackData,
      source: 'IP解析失败',
      requestType: checkSelf ? 'self' : 'query'
    });
  } catch (error) {
    console.error('IP查询出错:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 