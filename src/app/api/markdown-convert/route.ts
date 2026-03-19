import { NextRequest, NextResponse } from 'next/server';

// API密钥，实际应用中应该从环境变量获取
const API_KEY = 'markitdown-api-key-hyrtjhyt464h5346vt3453y34534tsfsf';
const API_URL = 'http://jisuxiang-markitdown:8000/convert';

// 文件大小限制（50MB）
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// 支持的文件格式
const SUPPORTED_FILE_FORMATS = ['.docx', '.pdf', '.pptx', '.xlsx', '.html', '.htm', '.rtf', '.txt', '.csv', '.json', '.xml', '.epub', '.md'];

// 安全配置
const SECURITY_CONFIG = {
  // 可接受的内容类型
  allowedContentTypes: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/pdf', // pdf
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'text/html', // html/htm
    'application/rtf', // rtf
    'text/plain', // txt
    'text/csv', // csv
    'application/json', // json
    'application/xml', 'text/xml', // xml
    'application/epub+zip', // epub
    'text/markdown', // md
  ],
  
  // 文件内容类型与扩展名映射(简化)
  contentTypeExtMap: {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'text/html': '.html',
    'application/rtf': '.rtf',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'application/json': '.json',
    'application/xml': '.xml',
    'text/xml': '.xml',
    'application/epub+zip': '.epub',
    'text/markdown': '.md',
  },
};

/**
 * 检查文件类型是否安全
 */
async function isFileSafe(file: File): Promise<boolean> {
  try {
    // 检查MIME类型
    const contentType = file.type;
    
    // 检查内容类型是否在允许列表中
    if (!SECURITY_CONFIG.allowedContentTypes.includes(contentType)) {
      return false;
    }
    
    // 对于没有MIME类型的文件进行额外检查
    if (!contentType && file.name) {
      const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
      return SUPPORTED_FILE_FORMATS.includes(ext);
    }
    
    // 进行基本的内容头检查（仅对某些格式）
    // 这需要访问文件二进制数据
    // 对于简化版可以跳过，实际应用中可以读取文件头几个字节做进一步检验
    
    return true;
  } catch (error) {
    console.error('文件安全检查失败:', error);
    return false;
  }
}

/**
 * 处理文件转Markdown的请求
 */
export async function POST(request: NextRequest) {
  try {
    // 只接受multipart/form-data请求
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: '不支持的请求格式，请使用multipart/form-data' },
        { status: 415 }
      );
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '没有提供文件' },
        { status: 400 }
      );
    }

    // 检查文件格式
    const fileName = file.name.toLowerCase();
    const fileExtension = '.' + (fileName.split('.').pop() || '');
    
    if (fileExtension === '.doc' || fileExtension === '.ppt' || fileExtension === '.xls') {
      return NextResponse.json(
        { error: `不支持旧版Office文档(${fileExtension})格式，请先使用Microsoft Office或WPS等软件将文档另存为新格式后再上传` },
        { status: 400 }
      );
    }
    
    if (!SUPPORTED_FILE_FORMATS.includes(fileExtension)) {
      return NextResponse.json(
        { error: `不支持的文件格式：${fileExtension}。支持的格式包括：${SUPPORTED_FILE_FORMATS.join(', ')}` },
        { status: 400 }
      );
    }

    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `文件过大，最大支持50MB（当前文件大小: ${(file.size / (1024 * 1024)).toFixed(2)}MB）` },
        { status: 400 }
      );
    }
    
    // 进行文件安全检查
    if (!(await isFileSafe(file))) {
      return NextResponse.json(
        { error: '文件类型不安全或与扩展名不匹配' },
        { status: 400 }
      );
    }

    // 创建一个新的FormData对象，用于发送到目标API
    const apiFormData = new FormData();
    apiFormData.append('file', file);

    // 发送请求到目标API
    console.log('发送请求到:', API_URL);
    console.log('文件名:', file.name, '文件类型:', file.type, '文件大小:', file.size);
    
    let response;
    try {
      response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
          'User-Agent': 'JiSuXiang-API/1.0',
          // 注意：不要手动设置Content-Type，让浏览器自动设置
        },
        body: apiFormData,
      });
      
      console.log('响应状态:', response.status, response.statusText);
    } catch (error) {
      console.error('发送请求失败:', error);
      return NextResponse.json(
        { error: '连接到文档转换服务失败' },
        { status: 502 }
      );
    }

    // 检查响应状态
    if (!response.ok) {
      // 尝试获取错误信息
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || `服务器返回错误: ${response.status}`;
      } catch {
        errorMessage = `服务器返回错误: ${response.status}`;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // 返回API的响应
    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('文件转换错误:', error);
    
    return NextResponse.json(
      { error: '服务器处理请求时出错' },
      { status: 500 }
    );
  }
}

/**
 * 配置请求体大小限制 (50MB)
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}; 