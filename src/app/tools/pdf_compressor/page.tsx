'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import ToolHeader from '@/components/ToolHeader';
import FileUpload from '@/components/FileUpload';
import ActionButton from '@/components/ActionButton';
import ProgressBar from '@/components/ProgressBar';
import { faCompress, faDownload } from '@fortawesome/free-solid-svg-icons';

interface CompressionResult {
  url: string;
  filename: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

interface CompressionSettings {
  quality: 'high' | 'medium' | 'low';
  imageCompression: boolean;
  fontSubsetting: boolean;
  metadataRemoval: boolean;
  removeBookmarks: boolean;
  removeAnnotations: boolean;
}

export default function PDFCompressorPage() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<CompressionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pdfjsLib, setPdfjsLib] = useState<typeof import('pdfjs-dist') | null>(null);
  const [isClient, setIsClient] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<CompressionSettings>({
    quality: 'medium',
    imageCompression: true,
    fontSubsetting: true,
    metadataRemoval: false,
    removeBookmarks: false,
    removeAnnotations: false,
  });

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
        setError(t('tools.pdf_compressor.errors.library_failed'));
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

  // 压缩PDF文件
  const compressPDF = async (pdfFile: File): Promise<CompressionResult> => {
    if (!pdfjsLib) {
      throw new Error('PDF处理库未加载');
    }

    const arrayBuffer = await pdfFile.arrayBuffer();
    const originalSize = pdfFile.size;

    try {
      // 使用PDF.js加载PDF
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      // 创建新的PDF文档
      const { PDFDocument } = await import('pdf-lib');
      const newPdfDoc = await PDFDocument.create();

      // 根据质量设置确定压缩参数
      const qualitySettings = {
        high: { imageQuality: 0.8, imageScale: 1.0 },
        medium: { imageQuality: 0.6, imageScale: 0.8 },
        low: { imageQuality: 0.4, imageScale: 0.6 }
      };

      const currentQuality = qualitySettings[settings.quality];

      // 处理每一页
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        setProgress((pageNum / numPages) * 80); // 80%用于页面处理

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: currentQuality.imageScale });

        // 创建canvas渲染页面
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderContext).promise;

        // 将canvas转换为图片
        const imageBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!);
          }, 'image/jpeg', currentQuality.imageQuality);
        });

        // 将图片嵌入到新PDF中
        const imageBytes = await imageBlob.arrayBuffer();
        const image = await newPdfDoc.embedJpg(imageBytes);
        const pageWidth = viewport.width;
        const pageHeight = viewport.height;

        const newPage = newPdfDoc.addPage([pageWidth, pageHeight]);
        newPage.drawImage(image, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
        });
      }

      // 生成压缩后的PDF
      const compressedPdfBytes = await newPdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 20,
        updateFieldAppearances: false,
      });

      setProgress(90);

      // 创建Blob和URL
      const compressedBlob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(compressedBlob);
      const filename = pdfFile.name.replace('.pdf', '_compressed.pdf');
      const compressedSize = compressedBlob.size;
      const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

      setProgress(100);

      return {
        url,
        filename,
        originalSize,
        compressedSize,
        compressionRatio,
      };
    } catch (error) {
      console.error('PDF压缩错误:', error);
      throw new Error('PDF压缩失败');
    }
  };

  const startCompression = useCallback(async () => {
    if (files.length === 0) {
      setError(t('tools.pdf_compressor.errors.no_file'));
      return;
    }

    if (!pdfjsLib) {
      setError(t('tools.pdf_compressor.errors.library_failed'));
      return;
    }
    
    // 滚动到页面顶部，确保用户能看到进度
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setIsCompressing(true);
    setProgress(0);
    setError(null);
    setResults([]);
    
    // 开始压缩时滚动到进度条
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
      const compressionResults: CompressionResult[] = [];

      // 只处理PDF文件
      const pdfFiles = files.filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
      if (pdfFiles.length === 0) {
        setError(t('tools.pdf_compressor.errors.invalid_format'));
        return;
      }

      for (let i = 0; i < pdfFiles.length; i++) {
        setProgress((i / pdfFiles.length) * 10); // 前10%用于文件准备
        const result = await compressPDF(pdfFiles[i]);
        compressionResults.push(result);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setResults(compressionResults);
      
      // 压缩完成后滚动到结果区域
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    } catch (err) {
      console.error('压缩错误:', err);
      setError(t('tools.pdf_compressor.errors.compression_failed'));
    } finally {
      setIsCompressing(false);
    }
  }, [files, settings, t, pdfjsLib]);

  const downloadResult = useCallback((result: CompressionResult) => {
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
        toolCode="pdf_compressor"
        title={t('tools.pdf_compressor.title')}
        description={t('tools.pdf_compressor.description')}
        icon={faCompress}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 压缩设置 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">{t('tools.pdf_compressor.compression_settings.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('tools.pdf_compressor.compression_settings.quality')}
                </label>
                <select
                  value={settings.quality}
                  onChange={(e) => setSettings(prev => ({ ...prev, quality: e.target.value as 'high' | 'medium' | 'low' }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                >
                  <option value="high">{t('tools.pdf_compressor.compression_settings.quality_high')}</option>
                  <option value="medium">{t('tools.pdf_compressor.compression_settings.quality_medium')}</option>
                  <option value="low">{t('tools.pdf_compressor.compression_settings.quality_low')}</option>
                </select>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="imageCompression"
                    checked={settings.imageCompression}
                    onChange={(e) => setSettings(prev => ({ ...prev, imageCompression: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="imageCompression" className="text-sm">
                    {t('tools.pdf_compressor.compression_settings.image_compression')}
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="fontSubsetting"
                    checked={settings.fontSubsetting}
                    onChange={(e) => setSettings(prev => ({ ...prev, fontSubsetting: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="fontSubsetting" className="text-sm">
                    {t('tools.pdf_compressor.compression_settings.font_subsetting')}
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="metadataRemoval"
                    checked={settings.metadataRemoval}
                    onChange={(e) => setSettings(prev => ({ ...prev, metadataRemoval: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="metadataRemoval" className="text-sm">
                    {t('tools.pdf_compressor.compression_settings.metadata_removal')}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 文件上传 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <FileUpload
              accept=".pdf"
              maxSize={100 * 1024 * 1024}
              multiple={true}
              onFileSelect={handleFileSelect}
              onError={handleFileError}
              title={t('tools.pdf_compressor.upload_area.title')}
              subtitle={t('tools.pdf_compressor.upload_area.subtitle')}
              buttonText={t('tools.pdf_compressor.upload_area.button')}
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* 压缩进度 */}
          {isCompressing && (
            <div data-progress>
              <ProgressBar
                progress={progress}
                status={t('tools.pdf_compressor.status.compressing')}
                onCancel={() => setIsCompressing(false)}
              />
            </div>
          )}

          {/* 操作按钮 */}
          {files.length > 0 && !isCompressing && (
            <div className="flex gap-4">
              <ActionButton
                onClick={startCompression}
                loading={isCompressing}
                disabled={files.length === 0 || !pdfjsLib}
              >
                {t('tools.pdf_compressor.actions.compress')}
              </ActionButton>
              <ActionButton
                onClick={clearAll}
                variant="secondary"
              >
                {t('tools.pdf_compressor.actions.clear')}
              </ActionButton>
            </div>
          )}

          {/* 压缩结果 */}
          {results.length > 0 && (
            <div ref={resultsRef} className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">{t('tools.pdf_compressor.results.title')}</h3>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium">{result.filename}</p>
                        <p className="text-xs text-gray-400">
                          {t('tools.pdf_compressor.results.original_size')}: {formatFileSize(result.originalSize)} | 
                          {t('tools.pdf_compressor.results.compressed_size')}: {formatFileSize(result.compressedSize)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${
                          result.compressionRatio > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {result.compressionRatio > 0 ? '-' : '+'}{Math.abs(result.compressionRatio).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <ActionButton
                        onClick={() => downloadResult(result)}
                        variant="primary"
                        size="sm"
                        icon={faDownload}
                      >
                        {t('tools.pdf_compressor.actions.download')}
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