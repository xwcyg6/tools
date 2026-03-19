'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import ToolHeader from '@/components/ToolHeader';
import FileUpload from '@/components/FileUpload';
import ActionButton from '@/components/ActionButton';
import ProgressBar from '@/components/ProgressBar';
import { faDownload, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';

interface ConversionResult {
  url: string;
  filename: string;
  size: number;
  type: 'image' | 'text';
}

export default function PDFConverterPage() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [conversionType, setConversionType] = useState<'pdf_to_image' | 'pdf_to_text'>('pdf_to_image');
  const [imageFormat, setImageFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [imageQuality, setImageQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pdfjsLib, setPdfjsLib] = useState<typeof import('pdfjs-dist') | null>(null);
  const [isClient, setIsClient] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // 确保只在客户端运行
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 动态导入PDF.js
  useEffect(() => {
    if (!isClient) return;

    const loadPDFJS = async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = '/lib/pdfjs-dist/pdf.worker.min.mjs';
        setPdfjsLib(pdfjs);
      } catch (error) {
        console.error('Failed to load PDF.js:', error);
        setError('PDF处理库加载失败');
      }
    };

    loadPDFJS();
  }, [isClient]);

  const handleFileSelect = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setError(null);
  }, []);

  const handleFileError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  // PDF转图片功能
  const convertPDFToImages = async (pdfFile: File): Promise<ConversionResult[]> => {
    if (!pdfjsLib) {
      throw new Error('PDF处理库未加载');
    }

    const arrayBuffer = await pdfFile.arrayBuffer();
    const results: ConversionResult[] = [];

    try {
      // 使用本地PDF.js来加载和渲染PDF
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        // 获取页面
        const page = await pdf.getPage(pageNum);
        
        // 设置渲染比例
        const scale = 2.0; // 提高分辨率
        const viewport = page.getViewport({ scale });

        // 创建canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // 渲染页面到canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderContext).promise;

        // 转换canvas为图片
        const quality = imageQuality === 'high' ? 1.0 : imageQuality === 'medium' ? 0.7 : 0.5;
        const mimeType = imageFormat === 'png' ? 'image/png' : imageFormat === 'jpeg' ? 'image/jpeg' : 'image/webp';
        
        // 等待canvas转换为blob
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob);
          }, mimeType, quality);
        });

        if (blob) {
          const url = URL.createObjectURL(blob);
          const filename = `${pdfFile.name.replace('.pdf', '')}_page_${pageNum}.${imageFormat}`;
          results.push({
            url,
            filename,
            size: blob.size,
            type: 'image'
          });
        }
      }

      return results;
    } catch (error) {
      console.error('PDF转换错误:', error);
      throw new Error('PDF转换失败');
    }
  };

  const startConversion = useCallback(async () => {
    if (files.length === 0) {
      setError(t('tools.pdf_converter.errors.no_file'));
      return;
    }

    if (!pdfjsLib) {
      setError('PDF处理库未加载，请刷新页面重试');
      return;
    }

    // 滚动到页面顶部，确保用户能看到进度
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setIsConverting(true);
    setProgress(0);
    setError(null);
    setResults([]);
    
    // 开始转换时滚动到进度条
    setTimeout(() => {
      const progressElement = document.querySelector('[data-progress]');
      if (progressElement) {
        progressElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 50);

    try {
      const conversionResults: ConversionResult[] = [];

      if (conversionType === 'pdf_to_image') {
        // 只处理PDF文件
        const pdfFiles = files.filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
        if (pdfFiles.length === 0) {
          setError('请选择PDF文件进行转换');
          return;
        }

        for (let i = 0; i < pdfFiles.length; i++) {
          setProgress((i / pdfFiles.length) * 100);
          const results = await convertPDFToImages(pdfFiles[i]);
          conversionResults.push(...results);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } else if (conversionType === 'pdf_to_text') {
        // PDF转文本功能 - 直接跳转到文件转Markdown工具
        window.open('https://www.jisuxiang.com/tools/file_to_markdown_converter', '_blank');
        return;
      }

      setProgress(100);
      setResults(conversionResults);
      
      // 转换完成后滚动到结果区域
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    } catch (err) {
      console.error('转换错误:', err);
      setError(t('tools.pdf_converter.errors.conversion_failed'));
    } finally {
      setIsConverting(false);
    }
  }, [files, conversionType, imageFormat, imageQuality, t, pdfjsLib]);

  const downloadResult = useCallback((result: ConversionResult) => {
    const link = document.createElement('a');
    link.href = result.url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const clearAll = useCallback(() => {
    // 清理之前的结果URL
    results.forEach(result => URL.revokeObjectURL(result.url));
    setFiles([]);
    setResults([]);
    setError(null);
    setProgress(0);
  }, [results]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 如果不在客户端，显示加载状态
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <ToolHeader 
        toolCode="pdf_converter"
        title={t('tools.pdf_converter.title')}
        description={t('tools.pdf_converter.description')}
        icon={faExchangeAlt}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 转换类型选择 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">转换类型</h3>
            <div className="grid grid-cols-2 gap-3">
              {(['pdf_to_image', 'pdf_to_text'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setConversionType(type)}
                  className={`p-3 rounded-lg border transition-colors ${
                    conversionType === type
                      ? 'border-purple-500 bg-purple-600 text-white'
                      : 'border-gray-600 hover:border-purple-500'
                  }`}
                >
                  {type === 'pdf_to_image' ? 'PDF转图片' : 'PDF转文本'}
                </button>
              ))}
            </div>
          </div>

          {/* PDF转文本提示 */}
          {conversionType === 'pdf_to_text' && (
            <div className="bg-blue-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium mb-2">推荐使用文件转Markdown工具</p>
                  <p className="text-sm opacity-90">
                    PDF转文本功能建议使用我们的文件转Markdown工具，支持更好的文本提取和格式转换。
                  </p>
                </div>
                <a
                  href="https://www.jisuxiang.com/tools/file_to_markdown_converter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-external-link-alt"></i>
                  打开工具
                </a>
              </div>
            </div>
          )}

          {/* 转换设置 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">转换设置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conversionType === 'pdf_to_image' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      图片格式
                    </label>
                    <select
                      value={imageFormat}
                      onChange={(e) => setImageFormat(e.target.value as 'png' | 'jpeg' | 'webp')}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                    >
                      <option value="png">PNG</option>
                      <option value="jpeg">JPEG</option>
                      <option value="webp">WebP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      图片质量
                    </label>
                    <select
                      value={imageQuality}
                      onChange={(e) => setImageQuality(e.target.value as 'high' | 'medium' | 'low')}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                    >
                      <option value="high">高质量</option>
                      <option value="medium">中等质量</option>
                      <option value="low">低质量</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 文件上传 - 在PDF转文本时隐藏 */}
          {conversionType !== 'pdf_to_text' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <FileUpload
                accept=".pdf"
                maxSize={100 * 1024 * 1024}
                multiple={true}
                onFileSelect={handleFileSelect}
                onError={handleFileError}
                title="上传PDF文件"
                subtitle="支持拖拽上传，最大100MB"
                buttonText="选择文件"
              />
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* 转换进度 */}
          {isConverting && (
            <div data-progress>
              <ProgressBar
                progress={progress}
                status="正在转换..."
                onCancel={() => setIsConverting(false)}
              />
            </div>
          )}

          {/* 操作按钮 */}
          {files.length > 0 && !isConverting && conversionType !== 'pdf_to_text' && (
            <div className="flex gap-4">
              <ActionButton
                onClick={startConversion}
                loading={isConverting}
                disabled={files.length === 0 || !pdfjsLib}
              >
                开始转换
              </ActionButton>
              <ActionButton
                onClick={clearAll}
                variant="secondary"
              >
                清空
              </ActionButton>
            </div>
          )}

          {/* 转换结果 */}
          {results.length > 0 && (
            <div ref={resultsRef} className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">转换结果</h3>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium">{result.filename}</p>
                        <p className="text-xs text-gray-400">{formatFileSize(result.size)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <ActionButton
                        onClick={() => downloadResult(result)}
                        variant="primary"
                        size="sm"
                        icon={faDownload}
                      >
                        下载
                      </ActionButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 