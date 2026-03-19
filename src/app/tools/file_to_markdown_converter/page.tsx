'use client';

import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faSpinner, 
  faDownload, 
  faCopy, 
  faCheck, 
  faTrash,
  faFileCode
} from '@fortawesome/free-solid-svg-icons';
import ToolHeader from '@/components/ToolHeader';
import BackToTop from '@/components/BackToTop';
import tools from '@/config/tools';
import { apiClient } from '@/lib/api-client';
import { useLanguage } from '@/context/LanguageContext';

// 转换结果接口
interface ConversionResult {
  markdown_content: string;
  conversion_time_seconds: number;
  original_filename?: string;
}

// CSS样式
const styles = {
  container: "min-h-screen flex flex-col max-w-[1440px] mx-auto p-4 md:p-6",
  card: "card p-6",
  actionBar: "flex flex-wrap items-center justify-between gap-3 p-4 bg-block rounded-lg border border-purple-glow mb-6",
  uploadSection: "flex flex-col items-center p-6 bg-block rounded-lg border-2 border-dashed border-purple-glow/50 cursor-pointer hover:border-purple-glow transition-colors mb-6",
  uploadIcon: "text-purple text-3xl mb-4",
  uploadText: "text-center text-secondary mb-2",
  supportedFormats: "text-center text-sm text-tertiary",
  hiddenInput: "hidden",
  loading: "flex flex-col items-center justify-center p-6 bg-block rounded-lg mb-6",
  spinner: "animate-spin text-purple text-2xl mb-4",
  loadingText: "text-secondary",
  fileName: "text-sm text-secondary max-w-full truncate",
  fileInfo: "flex items-center p-4 bg-block-strong rounded-lg border border-purple-glow/30 mb-4",
  fileIcon: "text-purple mr-3 text-xl",
  fileDetails: "flex-1",
  fileActions: "flex gap-2",
  resultContainer: "w-full",
  resultHeader: "flex items-center justify-between mb-4",
  resultTitle: "text-lg font-medium text-primary",
  markdownOutput: "w-full h-[500px] p-4 bg-block-strong border border-purple-glow/30 rounded-lg text-primary font-mono text-sm resize-y overflow-auto focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple",
  buttonGroup: "flex flex-wrap gap-3",
  actionButton: "btn-secondary flex items-center",
  convertButton: "btn-primary flex items-center",
  iconMargin: "mr-2",
  infoBox: "p-4 bg-block rounded-lg border border-purple-glow/30 mb-6",
  infoText: "text-tertiary text-sm",
  errorContainer: "p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 mb-6",
  successContainer: "p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 mb-6",
  warningText: "text-yellow-500 text-sm mt-2",
};

// 支持的文件格式
const SUPPORTED_FILE_FORMATS = [
  '.docx', '.pdf', '.pptx', '.xlsx', '.html', '.htm', '.rtf', '.txt', '.csv', '.json', '.xml', '.epub', '.md'
];

// 文件大小限制（50MB）
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export default function FileToMarkdownConverter() {
  // 使用语言上下文
  const { t } = useLanguage();
  
  // 从工具配置中获取当前工具信息
  const toolConfig = tools.find(tool => tool.code === 'file_to_markdown_converter');
  
  // 状态管理
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isFileTooLarge, setIsFileTooLarge] = useState(false);
  
  // 引用
  const fileInputRef = useRef<HTMLInputElement>(null);
  const markdownTextAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // 提交文件进行转换
  const handleSubmit = async () => {
    if (!file) {
      setError(t('tools.file_to_markdown_converter.no_file_selected'));
      return;
    }
    
    // 设置加载状态
    setLoading(true);
    setError(null);
    setSuccess(null);
    setMarkdown('');
    
    try {
      // 使用API客户端上传文件
      const result = await apiClient.uploadFile<ConversionResult>('/api/markdown-convert', file);
      
      // 更新状态
      setMarkdown(result.markdown_content);
      setSuccess(t('tools.file_to_markdown_converter.conversion_success').replace('{time}', result.conversion_time_seconds.toFixed(2)));
    } catch (err) {
      console.error(t('tools.file_to_markdown_converter.conversion_error'), err);
      setError((err as Error).message || t('tools.file_to_markdown_converter.conversion_error'));
    } finally {
      setLoading(false);
    }
  };
  
  // 处理文件选择
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    
    // 检查文件格式
    const fileExtension = selectedFile.name.toLowerCase().split('.').pop();
    if (fileExtension === 'doc' || fileExtension === 'ppt' || fileExtension === 'xls') {
      setError(t('tools.file_to_markdown_converter.old_office_format').replace('{format}', fileExtension));
      setIsFileTooLarge(true); // 使用这个状态来禁用转换按钮
      return;
    }
    
    // 检查文件大小
    if (selectedFile.size > MAX_FILE_SIZE) {
      setIsFileTooLarge(true);
      setError(t('tools.file_to_markdown_converter.file_too_large').replace('{size}', (selectedFile.size / (1024 * 1024)).toFixed(2)));
      return;
    }
    
    // 重置状态
    setMarkdown('');
    setError(null);
    setSuccess(null);
    setCopied(false);
    setIsFileTooLarge(false);
    
    // 设置选中的文件
    setFile(selectedFile);
  };
  
  // 打开文件选择器
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };
  
  // 处理拖放文件
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      // 检查文件格式
      const fileExtension = droppedFile.name.toLowerCase().split('.').pop();
      if (fileExtension === 'doc' || fileExtension === 'ppt' || fileExtension === 'xls') {
        setError(t('tools.file_to_markdown_converter.old_office_format').replace('{format}', fileExtension));
        setIsFileTooLarge(true); // 使用这个状态来禁用转换按钮
        return;
      }
      
      // 检查文件大小
      if (droppedFile.size > MAX_FILE_SIZE) {
        setIsFileTooLarge(true);
        setError(t('tools.file_to_markdown_converter.file_too_large').replace('{size}', (droppedFile.size / (1024 * 1024)).toFixed(2)));
        return;
      }
      
      // 重置状态
      setMarkdown('');
      setError(null);
      setSuccess(null);
      setCopied(false);
      setIsFileTooLarge(false);
      
      // 设置拖放的文件
      setFile(droppedFile);
    }
  };
  
  // 防止默认拖放行为
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  // 复制Markdown到剪贴板
  const copyToClipboard = () => {
    if (!markdown) return;
    
    navigator.clipboard.writeText(markdown)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error(t('tools.file_to_markdown_converter.copy_failed'), err);
        setError(t('tools.file_to_markdown_converter.copy_failed'));
      });
  };
  
  // 下载Markdown文件
  const downloadMarkdown = () => {
    if (!markdown) return;
    
    // 创建Blob对象
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = url;
    // 设置文件名，从原始文件名中提取基本名称
    const originalName = file?.name || 'document';
    const baseName = originalName.split('.').slice(0, -1).join('.') || originalName;
    link.download = `${baseName}.md`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    
    // 清理
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };
  
  // 清除选中的文件和结果
  const clearAll = () => {
    setFile(null);
    setMarkdown('');
    setError(null);
    setSuccess(null);
    setCopied(false);
    setIsFileTooLarge(false);
    
    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className={styles.container}>
      {/* 工具头部 */}
      {toolConfig && (
        <ToolHeader 
          title={toolConfig.title || ''}
          description={toolConfig.description || ''}
          icon={toolConfig.icon}
          toolCode="file_to_markdown_converter"
        />
      )}
      
      {/* 提示信息 */}
      <div className={styles.infoBox}>
        <p className={styles.infoText}>
          {t('tools.file_to_markdown_converter.description')}
          <strong className="block mt-2">
            {t('tools.file_to_markdown_converter.old_office_format').replace('{format}', 'doc/xls/ppt')}
          </strong>
        </p>
      </div>
      
      {/* 错误提示 */}
      {error && (
        <div className={styles.errorContainer}>
          {error}
        </div>
      )}
      
      {/* 成功提示 */}
      {success && (
        <div className={styles.successContainer}>
          {success}
        </div>
      )}
      
      {/* 始终显示上传区域 */}
      <div 
        className={styles.uploadSection}
        onClick={handleSelectFile}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <FontAwesomeIcon icon={faUpload} className={styles.uploadIcon} />
        <p className={styles.uploadText}>
          {file ? t('tools.file_to_markdown_converter.select_file') : t('tools.file_to_markdown_converter.drop_file_here')}
        </p>
        <p className={styles.supportedFormats}>
          {t('tools.file_to_markdown_converter.supported_formats')}
        </p>
        <p className={styles.warningText}>{t('tools.file_to_markdown_converter.file_too_large').replace('{size}', '50')}</p>
        <p className={styles.warningText}>{t('tools.file_to_markdown_converter.old_office_format').replace('{format}', 'doc/xls/ppt')}</p>
        <input
          type="file"
          ref={fileInputRef}
          className={styles.hiddenInput}
          onChange={handleFileChange}
          accept={SUPPORTED_FILE_FORMATS.join(',')}
        />
      </div>
      
      {/* 显示选中的文件信息 */}
      {file && !isFileTooLarge && (
        <div className={styles.fileInfo}>
          <FontAwesomeIcon icon={faFileCode} className={styles.fileIcon} />
          <div className={styles.fileDetails}>
            <div className="font-medium">{file.name}</div>
            <div className="text-sm text-secondary">{t('tools.file_to_markdown_converter.file_size')}: {(file.size / 1024).toFixed(1)} KB</div>
          </div>
          <div className={styles.fileActions}>
            <button 
              className={styles.convertButton}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className={styles.iconMargin} />
                  {t('tools.file_to_markdown_converter.converting')}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faFileCode} className={styles.iconMargin} />
                  {t('tools.file_to_markdown_converter.convert')}
                </>
              )}
            </button>
            
            <button 
              className={styles.actionButton}
              onClick={clearAll}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faTrash} className={styles.iconMargin} />
              {t('tools.file_to_markdown_converter.clear')}
            </button>
          </div>
        </div>
      )}
      
      {/* 加载状态 */}
      {loading && (
        <div className={styles.loading}>
          <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
          <p className={styles.loadingText}>{t('tools.file_to_markdown_converter.converting')}</p>
        </div>
      )}
      
      {/* 转换结果 - 仅显示纯文本结果 */}
      {markdown && (
        <div className={styles.resultContainer}>
          <div className={styles.resultHeader}>
            <h3 className={styles.resultTitle}>{t('tools.file_to_markdown_converter.markdown_output')}</h3>
            <div className={styles.buttonGroup}>
              <button 
                className={styles.actionButton}
                onClick={copyToClipboard}
              >
                <FontAwesomeIcon 
                  icon={copied ? faCheck : faCopy} 
                  className={styles.iconMargin} 
                />
                {copied ? t('tools.file_to_markdown_converter.copied') : t('tools.file_to_markdown_converter.copy')}
              </button>
              
              <button 
                className={styles.actionButton}
                onClick={downloadMarkdown}
              >
                <FontAwesomeIcon icon={faDownload} className={styles.iconMargin} />
                {t('tools.file_to_markdown_converter.download')}
              </button>
              
              <button 
                className={styles.actionButton}
                onClick={clearAll}
              >
                <FontAwesomeIcon icon={faTrash} className={styles.iconMargin} />
                {t('tools.file_to_markdown_converter.clear')}
              </button>
            </div>
          </div>
          
          <textarea
            ref={markdownTextAreaRef}
            className={styles.markdownOutput}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            spellCheck={false}
          />
        </div>
      )}
      
      {/* 回到顶部按钮 */}
      <BackToTop />
    </div>
  );
} 