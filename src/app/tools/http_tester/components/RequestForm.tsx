import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faInfoCircle, faTimes, faCode, faServer, faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles';
import { HttpMethod, NetworkType } from '../types';
import { useLanguage } from '@/context/LanguageContext';

// 定义跨域配置弹窗组件
interface CorsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CorsModal: React.FC<CorsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = React.useState<'nginx' | 'php' | 'node' | 'java' | 'python' | 'go'>('nginx');
  const { t } = useLanguage();
  
  if (!isOpen) return null;
  
  const tabClasses = (isActive: boolean) => 
    `px-3 py-2 text-xs font-medium rounded-t-md ${
      isActive 
        ? 'bg-background text-purple border-t border-l border-r border-purple-glow/30' 
        : 'bg-card hover:bg-background/60 text-tertiary hover:text-secondary transition-colors'
    }`;
  
  return (
    <>
      {/* 背景蒙层 - 使用透明度动画 */}
      <div 
        className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
        role="button"
        aria-label={t('tools.http_tester.close')}
        tabIndex={0}
      ></div>
      
      {/* 弹窗本身 - 使用弹性盒使其居中 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-scaleIn">
        <div 
          className="bg-card w-full max-w-3xl rounded-lg shadow-xl border border-purple-glow/30 overflow-hidden flex flex-col" 
          style={{ 
            maxHeight: 'calc(100vh - 40px)',
            transform: 'translate3d(0,0,0)' // 强制硬件加速，避免某些浏览器渲染问题
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 标题栏 */}
          <div className="bg-background p-4 flex items-center justify-between border-b border-purple-glow/30 shrink-0">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faNetworkWired} className="text-purple mr-2" />
              <h3 className="text-primary font-medium">{t('tools.http_tester.cors_settings')}</h3>
            </div>
            <button 
              onClick={onClose}
              className="text-tertiary hover:text-purple transition-colors p-1 rounded-full hover:bg-background/60"
              aria-label={t('tools.http_tester.close')}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          
          {/* 内容区 */}
          <div className="p-5 overflow-auto flex-grow">
            <p className="text-secondary mb-4">
              {t('tools.http_tester.cors_description')}
            </p>
            
            <div className="bg-amber-900/20 border border-amber-500/30 p-3 rounded-md mb-5">
              <p className="text-amber-400 text-sm flex items-start">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2 mt-0.5" />
                <span>{t('tools.http_tester.cors_warning')}</span>
              </p>
            </div>

            {/* HTTPS到HTTP问题说明 */}
            <div className="bg-purple-900/20 border border-purple-500/30 p-3 rounded-md mb-5">
              <h4 className="font-medium text-purple-400 mb-1 flex items-center text-sm">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                {t('tools.http_tester.https_to_http_title')}
              </h4>
              <p className="text-secondary text-sm mb-2">
                {t('tools.http_tester.https_to_http_description')}
              </p>
              <ul className="text-secondary text-sm list-disc pl-5 space-y-1">
                <li className="font-medium">{t('tools.http_tester.solution_one')}
                  <ul className="list-disc ml-5 mt-1 text-xs font-normal">
                    <li>{t('tools.http_tester.solution_one_1')}</li>
                    <li>{t('tools.http_tester.solution_one_2')}</li>
                    <li>{t('tools.http_tester.solution_one_3')}</li>
                  </ul>
                </li>
                <li className="font-medium mt-2">{t('tools.http_tester.solution_two')}
                  <ul className="list-disc ml-5 mt-1 text-xs font-normal">
                    <li>{t('tools.http_tester.solution_two_1')}</li>
                    <li>{t('tools.http_tester.solution_two_2')}</li>
                    <li>{t('tools.http_tester.solution_two_3')}</li>
                  </ul>
                </li>
              </ul>
              <div className="bg-red-900/20 border border-red-500/30 p-2 rounded mt-3 text-xs text-red-300">
                <span className="font-medium">{t('tools.http_tester.security_note')}</span>
              </div>
            </div>
            
            {/* 选项卡 - 使用sticky定位保持在顶部 */}
            <div className="flex mb-0 gap-1 flex-wrap sticky top-0 bg-card pt-1 -mt-1 -mx-1 px-1 pb-1 z-10">
              <button className={tabClasses(activeTab === 'nginx')} onClick={() => setActiveTab('nginx')}>
                <FontAwesomeIcon icon={faServer} className="mr-1" /> Nginx
              </button>
              <button className={tabClasses(activeTab === 'php')} onClick={() => setActiveTab('php')}>
                <FontAwesomeIcon icon={faCode} className="mr-1" /> PHP
              </button>
              <button className={tabClasses(activeTab === 'node')} onClick={() => setActiveTab('node')}>
                <FontAwesomeIcon icon={faCode} className="mr-1" /> Node.js
              </button>
              <button className={tabClasses(activeTab === 'python')} onClick={() => setActiveTab('python')}>
                <FontAwesomeIcon icon={faCode} className="mr-1" /> Python
              </button>
              <button className={tabClasses(activeTab === 'java')} onClick={() => setActiveTab('java')}>
                <FontAwesomeIcon icon={faCode} className="mr-1" /> Java
              </button>
              <button className={tabClasses(activeTab === 'go')} onClick={() => setActiveTab('go')}>
                <FontAwesomeIcon icon={faCode} className="mr-1" /> Go
              </button>
            </div>
            
            {/* 代码区 */}
            <div className="bg-background border border-purple-glow/30 rounded-md p-4 overflow-auto mt-2" style={{ maxHeight: '350px' }}>
              {activeTab === 'nginx' && (
                <pre className="text-xs text-secondary font-mono whitespace-pre">
                  <code>{`# 在 Nginx 的 server 或 location 块中添加：

location /api/ {
    # 允许所有来源访问（开发环境使用）
    add_header 'Access-Control-Allow-Origin' '*' always;
    
    # 允许的请求方法
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
    
    # 允许的请求头
    add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Connection, User-Agent, Cookie' always;
    
    # 允许浏览器缓存预检请求结果，单位秒
    add_header 'Access-Control-Max-Age' '3600' always;
    
    # 处理 OPTIONS 预检请求
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
        add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Connection, User-Agent, Cookie';
        add_header 'Access-Control-Max-Age' '3600';
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' '0';
        return 204;
    }
    
    # 你的其他配置...
}`}</code>
                </pre>
              )}
              
              {activeTab === 'php' && (
                <pre className="text-xs text-secondary font-mono whitespace-pre">
                  <code>{`<?php
// 在 PHP 脚本开头添加以下代码：

// 允许所有来源访问（开发环境使用）
header("Access-Control-Allow-Origin: *");

// 如果需要发送 Cookie
// header("Access-Control-Allow-Origin: http://localhost:3000"); // 指定来源
// header("Access-Control-Allow-Credentials: true");

// 允许的请求方法
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");

// 允许的请求头
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, Connection, User-Agent, Cookie");

// 处理 OPTIONS 预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 204 No Content");
    exit;
}

// 你的 PHP 代码...
`}</code>
                </pre>
              )}
              
              {activeTab === 'node' && (
                <pre className="text-xs text-secondary font-mono whitespace-pre">
                  <code>{`// 方法 1: 使用 Express 框架和 cors 中间件
const express = require('express');
const cors = require('cors');
const app = express();

// 基本配置: 允许所有来源
app.use(cors());

// 高级配置
app.use(cors({
  origin: '*', // 或特定域名 'http://localhost:3000'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false // 如果需要发送 Cookie，设为 true
}));

// 方法 2: 不使用中间件，手动设置响应头
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }
  next();
});

// 你的路由代码...
`}</code>
                </pre>
              )}
              
              {activeTab === 'python' && (
                <pre className="text-xs text-secondary font-mono whitespace-pre">
                  <code>{`# 方法 1: 使用 Flask
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# 允许所有路由的 CORS
CORS(app)

# 或者，更具体的配置
CORS(app, resources={
    r"/api/*": {
        "origins": "*",  # 或特定域名 ["http://localhost:3000"]
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# 方法 2: 使用 FastAPI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=False,  # 是否支持 cookies
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头
)

# 方法 3: 使用 Django
# 在 settings.py 中添加:
INSTALLED_APPS = [
    # ...其他应用
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ...其他中间件
]

CORS_ALLOW_ALL_ORIGINS = True  # 允许所有来源

# 或者指定来源
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
# ]
`}</code>
                </pre>
              )}
              
              {activeTab === 'java' && (
                <pre className="text-xs text-secondary font-mono whitespace-pre">
                  <code>{`// 方法 1: 使用 Spring Boot (添加过滤器)
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // 允许所有来源访问
        config.addAllowedOrigin("*");
        // 或者允许特定来源
        // config.addAllowedOrigin("http://localhost:3000");
        
        // 允许发送 Cookie
        // config.setAllowCredentials(true);
        
        // 允许的请求方法
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");
        
        // 允许的请求头
        config.addAllowedHeader("*");
        
        // 预检请求的缓存时间
        config.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}

// 方法 2: 使用 Spring Boot (使用 @CrossOrigin 注解)
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MyController {
    
    @GetMapping("/api/data")
    public String getData() {
        return "数据响应";
    }
}

// 方法 3: 在 Servlet 中手动设置响应头
@WebServlet("/api/*")
public class ApiServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // 设置 CORS 响应头
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        // 正常处理请求...
    }
    
    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // 处理预检请求
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setHeader("Access-Control-Max-Age", "3600");
        response.setStatus(HttpServletResponse.SC_NO_CONTENT);
    }
}
`}</code>
                </pre>
              )}
              
              {activeTab === 'go' && (
                <pre className="text-xs text-secondary font-mono whitespace-pre">
                  <code>{`// 方法 1: 使用 net/http 标准库
package main

import (
	"net/http"
)

func setCorsHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		setCorsHeaders(w)

		// 处理预检请求
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	apiHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// API 处理逻辑...
	})

	// 应用中间件
	http.Handle("/api/", corsMiddleware(apiHandler))
	http.ListenAndServe(":8080", nil)
}

// 方法 2: 使用 Gin 框架
package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"time"
)

func main() {
	r := gin.Default()

	// CORS 中间件配置
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
		MaxAge:           12 * time.Hour,
	}))

	// 路由处理
	r.GET("/api/data", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "数据响应",
		})
	})

	r.Run(":8080")
}
`}</code>
                </pre>
              )}
            </div>
          </div>
          
          {/* 底部按钮 */}
          <div className="bg-background p-4 border-t border-purple-glow/30 flex justify-end shrink-0">
            <button 
              className="btn-primary"
              onClick={onClose}
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

interface RequestFormProps {
  url: string;
  method: HttpMethod;
  loading: boolean;
  networkType: NetworkType;
  onUrlChange: (url: string) => void;
  onMethodChange: (method: HttpMethod) => void;
  onNetworkTypeChange: (type: NetworkType) => void;
  onSendRequest: () => void;
}

const RequestForm: React.FC<RequestFormProps> = ({
  url,
  method,
  loading,
  networkType,
  onUrlChange,
  onMethodChange,
  onNetworkTypeChange,
  onSendRequest,
}) => {
  const { t } = useLanguage();
  
  // HTTP方法列表
  const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  
  // 显示或隐藏CORS设置弹窗
  const [showCorsModal, setShowCorsModal] = React.useState(false);
  
  // 检测是否为HTTP URL
  const isHttpUrl = React.useMemo(() => {
    try {
      return url.trim().toLowerCase().startsWith('http://');
    } catch {
      return false;
    }
  }, [url]);
  
  // 检测当前页面是否为HTTPS
  const [isCurrentPageHttps, setIsCurrentPageHttps] = React.useState(false);
  
  React.useEffect(() => {
    // 仅在客户端执行
    if (typeof window !== 'undefined') {
      setIsCurrentPageHttps(window.location.protocol === 'https:');
    }
  }, []);
  
  // 显示混合内容警告的条件
  const showMixedContentWarning = networkType === 'local' && isHttpUrl && isCurrentPageHttps;
  
  return (
    <div className="mb-6">
      <div className="flex gap-2 mb-2">
        {methods.map(m => (
          <button 
            key={m} 
            className={styles.methodButton(method === m)}
            onClick={() => onMethodChange(m)}
          >
            {m}
          </button>
        ))}
      </div>
      
      <div className="flex gap-2 mb-2">
        <input 
          type="text" 
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder={t('tools.http_tester.enter_url')}
          className={`${styles.input} ${showMixedContentWarning ? 'border-amber-500 focus:border-amber-500' : ''}`}
        />
        
        <button 
          className="btn-primary whitespace-nowrap"
          onClick={onSendRequest}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('tools.http_tester.loading')}
            </span>
          ) : (
            <span className="flex items-center">
              <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
              {t('tools.http_tester.send_request')}
            </span>
          )}
        </button>
      </div>

      {/* 混合内容特别警告 - 当检测到HTTPS页面请求HTTP URL时 */}
      {showMixedContentWarning && (
        <div className="mt-2 text-xs text-red-400 flex items-center mb-2">
          <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
          <span>{t('tools.http_tester.https_to_http_title')}</span>
          <button 
            className="ml-2 underline text-purple text-xs hover:text-purple-light transition-colors" 
            onClick={() => setShowCorsModal(true)}
          >
            {t('tools.http_tester.cors_settings')}
          </button>
        </div>
      )}

      {/* 本地/局域网选项 */}
      <div className="flex items-center gap-2 text-sm text-tertiary">
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="localNetwork"
            checked={networkType === 'local'}
            onChange={() => onNetworkTypeChange(networkType === 'local' ? 'public' : 'local')}
            className="mr-1 accent-purple cursor-pointer"
          />
          <label htmlFor="localNetwork" className="cursor-pointer">
            {t('tools.http_tester.local_network')}
          </label>
        </div>
        
        {networkType === 'local' && (
          <div className="flex items-center gap-1">
            <span className="text-amber-400 text-xs">
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
              {t('tools.http_tester.cors_settings')}
            </span>
            <button 
              className="text-purple text-xs border border-purple-glow/30 px-2 py-0.5 rounded hover:bg-background transition-colors" 
              onClick={() => setShowCorsModal(true)}
            >
              {t('tools.http_tester.cors_settings')}
            </button>
          </div>
        )}
      </div>
      
      {/* 替换原来的大型警告框为一个小链接 */}
      {networkType === 'local' && !showMixedContentWarning && (
        <div className="mt-2 text-xs flex items-center">
          <button 
            className="text-purple hover:text-purple-light transition-colors underline flex items-center"
            onClick={() => setShowCorsModal(true)}
          >
            <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
            {t('tools.http_tester.https_to_http_title')}
          </button>
        </div>
      )}
      
      {/* CORS设置弹窗 */}
      <CorsModal 
        isOpen={showCorsModal} 
        onClose={() => setShowCorsModal(false)} 
      />
    </div>
  );
};

export default RequestForm; 