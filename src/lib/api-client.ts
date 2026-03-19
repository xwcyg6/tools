/**
 * API客户端工具
 * 用于处理与后端API的所有交互，集成安全验证和令牌管理
 */

import { addAntiCrawlingHeaders, generateSecurityHeaders } from '@/utils/security';

// API客户端配置选项接口
interface ApiClientOptions {
  // 是否自动处理令牌无效的情况（默认开启）
  autoHandleTokenRefresh?: boolean;
  // 特定的API端点是否需要令牌验证
  endpointsRequiringToken?: string[];
  // 预处理请求的钩子函数
  requestInterceptor?: (request: RequestInit) => RequestInit;
  // 预处理响应的钩子函数
  responseInterceptor?: (response: Response) => Promise<Response>;
}

// API请求选项接口，继承自标准的RequestInit接口
interface ApiRequestOptions extends RequestInit {
  // 是否绕过安全检查（仅用于特殊情况）
  bypassSecurity?: boolean;
}

// 令牌管理相关配置
const TOKEN_CONFIG = {
  // 本地存储中保存令牌的键名
  storageKey: 'jisuxiang_client_token',
  // 令牌有效期，默认2小时
  tokenLifetime: 2 * 60 * 60 * 1000,
};

// 所有API端点默认都需要令牌验证
const DEFAULT_PROTECTED_ENDPOINTS = [
  '/api/',
  // 以下是特别指定的API端点，方便单独配置
  '/api/markdown-convert',
  '/api/ip',
  // 添加其他需要保护的API端点
];

/**
 * API客户端类
 */
class ApiClient {
  private baseUrl: string;
  private options: ApiClientOptions;
  private token: string | null = null;
  private tokenLoadedFromStorage = false;

  /**
   * 构造函数
   */
  constructor(baseUrl: string = '', options: ApiClientOptions = {}) {
    this.baseUrl = baseUrl;
    this.options = {
      autoHandleTokenRefresh: true,
      endpointsRequiringToken: DEFAULT_PROTECTED_ENDPOINTS,
      ...options
    };
    
    // 尝试从localStorage中加载令牌
    if (typeof window !== 'undefined') {
      this.loadTokenFromStorage();
    }
  }

  /**
   * 从本地存储加载令牌
   */
  private loadTokenFromStorage(): void {
    if (this.tokenLoadedFromStorage) return;
    
    try {
      const storedToken = localStorage.getItem(TOKEN_CONFIG.storageKey);
      if (storedToken) {
        this.token = storedToken;
        this.tokenLoadedFromStorage = true;
      }
    } catch (error) {
      console.error('从本地存储加载令牌失败:', error);
    }
  }

  /**
   * 保存令牌到本地存储
   */
  private saveTokenToStorage(token: string): void {
    try {
      localStorage.setItem(TOKEN_CONFIG.storageKey, token);
      this.tokenLoadedFromStorage = true;
    } catch (error) {
      console.error('保存令牌到本地存储失败:', error);
    }
  }

  /**
   * 清除令牌
   */
  public clearToken(): void {
    this.token = null;
    try {
      localStorage.removeItem(TOKEN_CONFIG.storageKey);
    } catch (error) {
      console.error('清除令牌失败:', error);
    }
  }

  /**
   * 设置新令牌
   */
  public setToken(token: string): void {
    this.token = token;
    this.saveTokenToStorage(token);
  }

  /**
   * 获取当前的令牌
   */
  public getToken(): string | null {
    return this.token;
  }

  /**
   * 检查端点是否需要令牌认证
   */
  private endpointRequiresToken(url: string): boolean {
    // 默认所有API接口都需要令牌验证
    if (url.startsWith('/api/')) {
      return true;
    }
    
    const { endpointsRequiringToken } = this.options;
    if (!endpointsRequiringToken || endpointsRequiringToken.length === 0) {
      return false;
    }

    return endpointsRequiringToken.some(endpoint => url.startsWith(endpoint));
  }

  /**
   * 通用请求方法
   */
  public async request<T>(
    url: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    // 构建完整URL
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    
    // 检查是否是FormData
    const isFormData = options.body instanceof FormData;
    
    // 准备请求头
    let headers: Record<string, string> = {
      // 只在非FormData请求中默认设置Content-Type
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers as Record<string, string> || {})
    };

    // 除非明确绕过安全检查，否则添加安全请求头
    if (!options.bypassSecurity) {
      // 如果需要令牌，添加令牌到请求头
      if (this.endpointRequiresToken(url) && this.token) {
        headers['X-Client-Token'] = this.token;
      }

      // 添加安全请求头和反爬虫头
      // 注意：对于FormData请求，不应该尝试序列化body
      headers = {
        ...headers,
        ...generateSecurityHeaders(url, options.method || 'GET', 
          (!isFormData && options.body) ? JSON.stringify(options.body) : null),
        ...addAntiCrawlingHeaders()
      };
    }

    // 合并请求选项
    const requestOptions: RequestInit = {
      ...options,
      headers
    };

    // 应用请求拦截器
    const finalRequestOptions = this.options.requestInterceptor
      ? this.options.requestInterceptor(requestOptions)
      : requestOptions;

    // 发送请求
    let response = await fetch(fullUrl, finalRequestOptions);
    
    // 应用响应拦截器
    if (this.options.responseInterceptor) {
      response = await this.options.responseInterceptor(response);
    }

    // 处理401错误（令牌无效或过期）
    if (response.status === 401 && this.options.autoHandleTokenRefresh) {
      const data = await response.json();
      
      // 如果收到新令牌，保存并重试请求
      if (data.token) {
        this.setToken(data.token);
        
        // 更新请求头中的令牌
        headers['X-Client-Token'] = data.token;
        
        // 重新发送请求
        const retryOptions: RequestInit = {
          ...finalRequestOptions,
          headers
        };
        
        const retryResponse = await fetch(fullUrl, retryOptions);
        
        // 解析并返回重试响应
        if (retryResponse.ok) {
          return await retryResponse.json();
        } else {
          throw new Error(`请求失败 (${retryResponse.status}): ${await retryResponse.text()}`);
        }
      }
    }

    // 处理非成功响应
    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || `请求失败 (${response.status})`;
      } catch (/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        _error
      ) {
        errorMessage = `请求失败 (${response.status}): ${await response.text()}`;
      }
      throw new Error(errorMessage);
    }

    // 解析并返回响应数据
    return await response.json();
  }

  /**
   * GET请求快捷方法
   */
  public async get<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  /**
   * POST请求快捷方法
   */
  public async post<T>(
    url: string,
    data?: unknown,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const isFormData = data instanceof FormData;
    
    // 创建新的选项对象，避免修改原始对象
    const newOptions = { ...options };
    
    // 如果是FormData，不设置Content-Type，让浏览器自动设置
    if (isFormData) {
      // 创建新的headers对象
      newOptions.headers = { ...(options.headers || {}) };
      // 确保删除任何Content-Type (使用类型断言解决TypeScript报错)
      const headers = newOptions.headers as Record<string, string>;
      delete headers['Content-Type'];
    } else {
      // 非FormData请求使用application/json
      newOptions.headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      };
    }
    
    // 设置请求方法和主体
    return this.request<T>(url, {
      ...newOptions,
      method: 'POST',
      body: isFormData ? data : data ? JSON.stringify(data) : undefined
    });
  }

  /**
   * PUT请求快捷方法
   */
  public async put<T>(
    url: string,
    data?: unknown,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  /**
   * DELETE请求快捷方法
   */
  public async delete<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  /**
   * 文件上传方法
   */
  public async uploadFile<T>(
    url: string,
    file: File,
    additionalData?: Record<string, string>,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    // 添加额外数据
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    
    return this.post<T>(url, formData, options);
  }
}

// 创建一个默认的API客户端实例
const apiClient = new ApiClient();

export { apiClient, ApiClient, type ApiClientOptions, type ApiRequestOptions }; 