'use client';

import React, { useRef, useEffect } from 'react';

interface MarkdownPreviewProps {
  htmlContent: string;
}

export default function MarkdownPreview({ htmlContent }: MarkdownPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  // 在渲染后处理所有可能的脚本和危险内容
  useEffect(() => {
    if (!previewRef.current) return;

    const container = previewRef.current;
    
    // 禁用所有链接默认行为
    const links = container.querySelectorAll('a');
    links.forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      
      // 阻止链接点击默认行为，除非特别需要允许
      link.addEventListener('click', (e) => {
        e.preventDefault();
      });
    });

    // 移除所有脚本标签
    const scripts = container.querySelectorAll('script');
    scripts.forEach(script => script.remove());

    // 处理所有iframe，确保它们有sandbox属性
    const iframes = container.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      iframe.setAttribute('sandbox', 'allow-scripts');
      iframe.setAttribute('loading', 'lazy');
    });
    
  }, [htmlContent]);

  return (
    <div 
      className="markdown-preview-container prose prose-invert"
      ref={previewRef}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
} 