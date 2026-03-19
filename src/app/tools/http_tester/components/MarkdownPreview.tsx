import React, { useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck, faDownload, faTimes, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { createPortal } from 'react-dom';

interface MarkdownPreviewProps {
  markdown: string;
  isOpen: boolean;
  onClose: () => void;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ markdown, isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 处理关闭模态框
  const handleClose = () => {
    onClose();
  };
  
  // 处理点击模态框外部关闭
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && e.target === e.currentTarget) {
      handleClose();
    }
  };
  
  // 处理复制文档内容
  const handleCopy = () => {
    navigator.clipboard.writeText(markdown)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('复制失败', err));
  };
  
  // 处理下载文档
  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // 使用固定的文件名，不再从文档标题提取
    const fileName = 'api_document.md';
    
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // 打开ShowDoc官网
  const openShowDoc = () => {
    window.open('https://www.showdoc.com.cn/', '_blank');
  };
  
  // 监听ESC键关闭模态窗口
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);
  
  // 当打开模态框时，禁止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // 自动聚焦文本框，但不选中内容，以便用户可以正常阅读
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // 如果模态框未打开，不渲染任何内容
  if (!isOpen) return null;
  
  // 模态窗口的内容
  const modalContent = (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-block-strong/80 backdrop-blur-sm"
      onClick={handleOutsideClick}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div 
        ref={modalRef} 
        className="relative bg-block border border-purple-glow rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col"
      >
        {/* 模态框标题 */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-purple-glow/30">
          <h3 className="text-lg font-medium text-primary">接口文档预览</h3>
          <button 
            className="text-tertiary hover:text-primary" 
            onClick={handleClose}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        {/* ShowDoc推荐信息 */}
        <div className="px-6 py-3 bg-purple/10 border-b border-purple-glow/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-secondary">
                <span className="text-purple font-medium">推荐：</span>
                此文档使用ShowDoc风格编写，可直接复制到ShowDoc平台进行团队分享和管理
              </span>
            </div>
            <button
              onClick={openShowDoc}
              className="text-xs text-purple hover:text-purple-hover flex items-center gap-1 transition-colors"
            >
              访问ShowDoc官网
              <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
            </button>
          </div>
        </div>
        
        {/* 模态框内容 */}
        <div className="flex-1 overflow-auto p-6">
          <textarea
            ref={textareaRef}
            className="w-full h-full min-h-[500px] p-5 bg-block-strong border border-purple-glow/30 rounded-lg text-primary font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-purple-glow"
            value={markdown}
            readOnly
            style={{ 
              lineHeight: '1.7',
              letterSpacing: '0.3px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              scrollBehavior: 'smooth',
              whiteSpace: 'pre',
              overflowWrap: 'normal',
              tabSize: 2
            }}
          />
        </div>
        
        {/* 模态框底部操作按钮 */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-purple-glow/30">
          <span className="text-sm text-tertiary mr-auto">
            使用 <a href="https://www.showdoc.com.cn/" target="_blank" rel="noopener noreferrer" className="text-purple hover:underline">ShowDoc</a> 可更好地管理和共享接口文档
          </span>
          <button
            className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm"
            onClick={handleDownload}
          >
            <FontAwesomeIcon icon={faDownload} />
            下载文档
          </button>
          <button
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
            onClick={handleCopy}
          >
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
            {copied ? '已复制' : '复制文档'}
          </button>
        </div>
      </div>
    </div>
  );
  
  // 使用React Portal将模态窗口渲染到body元素下，保证它不受父元素影响
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  
  return null;
};

export default MarkdownPreview; 