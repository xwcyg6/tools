'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCopy, faCheck, faDownload,
  faUpload, faTrash
} from '@fortawesome/free-solid-svg-icons';
import dynamic from 'next/dynamic';
import ToolHeader from '@/components/ToolHeader';
import BackToTop from '@/components/BackToTop';
import tools from '@/config/tools';
import type { Content } from 'vanilla-jsoneditor';
import { useLanguage } from '@/context/LanguageContext';

// 添加CSS变量样式
const styles = {
  card: "card p-6",
  container: "min-h-screen flex flex-col max-w-[1440px] mx-auto p-4 md:p-6",
  actionBar: "flex flex-wrap items-center gap-3 p-4 bg-block rounded-lg border border-purple-glow",
  input: "bg-block-strong text-primary border border-purple-glow/30 rounded px-3 py-1 text-sm focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple",
  statusMsg: "px-4 py-2 bg-block rounded-lg border border-purple-glow/30 text-secondary animate-fadeIn",
  editorContainer: "overflow-hidden border border-purple-glow/30 rounded-lg shadow-lg",
  fileNameLabel: "text-sm text-secondary",
  loaderContainer: "h-[400px] flex items-center justify-center bg-block rounded-lg",
  loaderBox: "flex flex-col items-center",
  loaderSpinner: "w-8 h-8 border-2 border-purple border-t-transparent rounded-full animate-spin mb-4",
  loaderText: "text-secondary"
};

// 动态导入JsonEditor组件，避免SSR问题
const JsonEditor = dynamic(() => import('@/components/JsonEditor'), { 
  ssr: false,
  loading: () => {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.loaderBox}>
          <div className={styles.loaderSpinner}></div>
          <span className={styles.loaderText}>Loading JSON Editor...</span>
        </div>
      </div>
    );
  }
});

export default function JsonEditorTool() {
  // 从工具配置中获取当前工具信息
  const toolConfig = tools.find(tool => tool.code === 'json_editor');
  const { t } = useLanguage();
  
  // 状态管理
  const [content, setContent] = useState<Content>({ json: { example: t('tools.json_editor.edit_json_here') } });
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState('data.json');
  const [statusMessage, setStatusMessage] = useState('');

  // 复制JSON到剪贴板
  const copyToClipboard = () => {
    try {
      // 获取当前JSON内容
      let jsonString;
      if ('json' in content && content.json) {
        jsonString = JSON.stringify(content.json, null, 2);
      } else if ('text' in content && content.text) {
        jsonString = content.text;
      } else {
        throw new Error(t('tools.json_editor.invalid_json'));
      }
      
      // 复制到剪贴板
      navigator.clipboard.writeText(jsonString)
        .then(() => {
          setCopied(true);
          setStatusMessage(t('tools.json_editor.copied_to_clipboard'));
          setTimeout(() => {
            setCopied(false);
            setStatusMessage('');
          }, 2000);
        })
        .catch(err => {
          console.error(t('tools.json_editor.copy_failed'), err);
          setStatusMessage(t('tools.json_editor.copy_failed'));
        });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      setStatusMessage(t('tools.json_editor.copy_failed'));
    }
  };

  // 下载JSON文件
  const downloadJson = () => {
    try {
      // 获取当前JSON内容
      let jsonString;
      if ('json' in content && content.json) {
        jsonString = JSON.stringify(content.json, null, 2);
      } else if ('text' in content && content.text) {
        jsonString = content.text;
      } else {
        throw new Error(t('tools.json_editor.invalid_json'));
      }
      
      // 创建下载链接
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // 清理
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      setStatusMessage(t('tools.json_editor.download_success').replace('{fileName}', fileName));
      setTimeout(() => setStatusMessage(''), 2000);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      setStatusMessage(t('tools.json_editor.download_failed'));
    }
  };

  // 上传JSON文件
  const uploadJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target?.result as string;
        try {
          // 尝试解析为JSON
          const jsonData = JSON.parse(fileContent);
          setContent({ json: jsonData });
          setStatusMessage(t('tools.json_editor.loaded_file').replace('{fileName}', file.name));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_parseError) {
          // 如果解析失败，则以文本形式加载
          setContent({ text: fileContent });
          setStatusMessage(t('tools.json_editor.loaded_as_text').replace('{fileName}', file.name));
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        setStatusMessage(t('tools.json_editor.read_file_failed'));
      }
      
      // 重置文件输入框
      event.target.value = '';
      
      setTimeout(() => setStatusMessage(''), 2000);
    };
    
    reader.readAsText(file);
  };

  // 清空编辑器
  const clearEditor = () => {
    if (confirm(t('tools.json_editor.confirm_clear'))) {
      setContent({ json: {} });
      setStatusMessage(t('tools.json_editor.editor_cleared'));
      setTimeout(() => setStatusMessage(''), 2000);
    }
  };
  
  // 修改文件名
  const handleFileNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let name = event.target.value.trim();
    if (!name) name = 'data.json';
    if (!name.endsWith('.json')) name += '.json';
    setFileName(name);
  };

  // 编辑器内容变化处理
  const handleContentChange = (updatedContent: Content) => {
    setContent(updatedContent);
  };

  return (
    <div className={styles.container}>
      {/* 工具头部 */}
      <ToolHeader 
        toolCode="json_editor"
        icon={toolConfig?.icon || tools[0].icon}
        title=""
        description=""
      />
      
      {/* 主要内容区 */}
      <div className="grid grid-cols-1 gap-6">
        {/* 操作栏 */}
        <div className={styles.actionBar}>
          {/* 文件操作按钮 */}
          <div className="flex flex-wrap items-center gap-2">
            <button 
              className="btn-secondary"
              onClick={copyToClipboard}
              title={t('tools.json_editor.copy')}
            >
              <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="mr-2" />
              {t('tools.json_editor.copy')}
            </button>
            
            <button 
              className="btn-secondary"
              onClick={downloadJson}
              title={t('tools.json_editor.download')}
            >
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              {t('tools.json_editor.download')}
            </button>
            
            <label className="btn-secondary cursor-pointer">
              <FontAwesomeIcon icon={faUpload} className="mr-2" />
              {t('tools.json_editor.upload')}
              <input 
                type="file" 
                accept=".json,application/json" 
                className="hidden"
                onChange={uploadJson}
              />
            </label>
            
            <button 
              className="btn-secondary"
              onClick={clearEditor}
              title={t('tools.json_editor.clear')}
            >
              <FontAwesomeIcon icon={faTrash} className="mr-2" />
              {t('tools.json_editor.clear')}
            </button>
          </div>
          
          {/* 文件名输入框 */}
          <div className="flex items-center gap-2 ml-auto">
            <label htmlFor="filename" className={styles.fileNameLabel}>{t('tools.json_editor.file_name')}</label>
            <input 
              id="filename"
              type="text" 
              value={fileName} 
              onChange={handleFileNameChange}
              className={styles.input}
            />
          </div>
        </div>
        
        {/* 状态消息 */}
        {statusMessage && (
          <div className={styles.statusMsg}>
            {statusMessage}
          </div>
        )}
        
        {/* JSON编辑器 */}
        <div className={styles.editorContainer}>
          <JsonEditor
            content={content}
            onChange={handleContentChange}
            className="h-[600px] w-full"
          />
        </div>
      </div>
      
      {/* 返回顶部按钮 */}
      <BackToTop />
    </div>
  );
} 