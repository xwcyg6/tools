'use client';

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

// 添加所有FontAwesome图标到库中
library.add(fas);

export type ShapeType = 'circle' | 'square' | 'rounded-square' | 'hexagon';

interface IconCanvasProps {
  icon: IconDefinition;
  backgroundColor: string;
  iconColor: string;
  shape: ShapeType;
  iconSize: number;
  canvasSize?: number;
}

export interface IconCanvasRef {
  getCanvas: () => HTMLCanvasElement | null;
  generateIcon: (size: number) => Promise<string>;
}

const IconCanvas = forwardRef<IconCanvasRef, IconCanvasProps>(({
  icon,
  backgroundColor,
  iconColor,
  shape,
  iconSize,
  canvasSize = 200
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 独立的绘制函数，可以绘制到任意context和尺寸
  const drawIconToContext = React.useCallback(async (ctx: CanvasRenderingContext2D, size: number) => {
    // 启用抗锯齿设置
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 清空画布
    ctx.clearRect(0, 0, size, size);

    // 绘制背景
    ctx.fillStyle = backgroundColor;
    
    const padding = (size * 5) / 200; // 按比例调整padding
    const backgroundSize = size - padding * 2;
    
    switch (shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, backgroundSize / 2, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case 'square':
        ctx.fillRect(padding, padding, backgroundSize, backgroundSize);
        break;
      case 'rounded-square':
        ctx.beginPath();
        const radius = backgroundSize * 0.15; // 15% 圆角
        ctx.roundRect(padding, padding, backgroundSize, backgroundSize, radius);
        ctx.fill();
        break;
      case 'hexagon':
        const centerX = size / 2;
        const centerY = size / 2;
        const hexRadius = backgroundSize / 2;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x = centerX + hexRadius * Math.cos(angle);
          const y = centerY + hexRadius * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        break;
    }

    // 绘制FontAwesome图标
    try {
      // 创建SVG字符串
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 ${icon.icon[0]} ${icon.icon[1]}">
          <path fill="${iconColor}" d="${icon.icon[4]}"/>
        </svg>
      `;
      
      // 将SVG转换为blob URL
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      // 创建图片对象
      const img = new Image();
      
      return new Promise<void>((resolve) => {
        img.onload = () => {
          // 计算图标绘制位置和大小
          const iconDrawSize = (size * iconSize) / 100;
          const iconX = (size - iconDrawSize) / 2;
          const iconY = (size - iconDrawSize) / 2;
          
          // 绘制图标
          ctx.drawImage(img, iconX, iconY, iconDrawSize, iconDrawSize);
          
          // 清理URL
          URL.revokeObjectURL(svgUrl);
          resolve();
        };
        
        img.onerror = () => {
          // 如果SVG加载失败，使用降级方案
          URL.revokeObjectURL(svgUrl);
          
          // 降级方案：使用文字符号
          ctx.fillStyle = iconColor;
          const fontSize = (size * iconSize) / 300; // 调整字体大小
          ctx.font = `${fontSize}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // 使用emoji符号作为降级
          const fallbackSymbols: Record<string, string> = {
            'heart': '♥',
            'star': '★',
            'home': '⌂',
            'user': '👤',
            'envelope': '✉',
            'phone': '📞',
            'shopping-cart': '🛒',
            'play': '▶',
            'music': '♪',
            'camera': '📷',
            'gift': '🎁',
            'check': '✓',
            'bookmark': '🔖',
            'coffee': '☕',
          };
          
          const symbol = fallbackSymbols[icon.iconName] || '●';
          ctx.fillText(symbol, size / 2, size / 2);
          resolve();
        };
        
        img.src = svgUrl;
      });
      
    } catch (error) {
      console.error('绘制图标失败:', error);
      
      // 最终降级方案：绘制一个简单的圆点
      ctx.fillStyle = iconColor;
      ctx.beginPath();
      const dotRadius = (size * iconSize) / 400;
      ctx.arc(size / 2, size / 2, dotRadius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [icon, backgroundColor, iconColor, shape, iconSize]);

  // 绘制图标到画布
  const drawIcon = React.useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    await drawIconToContext(ctx, canvasSize);
  }, [drawIconToContext, canvasSize]);

  // 生成指定尺寸的图标
  const generateIcon = React.useCallback(async (size: number): Promise<string> => {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx || !canvasRef.current) {
      throw new Error('无法创建画布');
    }

    tempCanvas.width = size;
    tempCanvas.height = size;

    // 启用高质量抗锯齿
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';
    
    // 始终重新绘制以获得最佳质量
    await drawIconToContext(tempCtx, size);
    
    return tempCanvas.toDataURL('image/png');
  }, [canvasSize, drawIconToContext]);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    generateIcon
  }), [generateIcon]);

  // 当参数变化时重新绘制
  useEffect(() => {
    drawIcon().catch(console.error);
  }, [drawIcon]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg shadow-lg border border-purple-glow/20"
      style={{ 
        maxWidth: `${canvasSize}px`, 
        maxHeight: `${canvasSize}px`,
        width: '100%',
        height: 'auto'
      }}
    />
  );
});

IconCanvas.displayName = 'IconCanvas';

export default IconCanvas; 