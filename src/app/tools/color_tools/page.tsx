'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette, faCopy, faCheck, faPlus, faTrash, faRandom, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import ToolHeader from '@/components/ToolHeader';
import BackToTop from '@/components/BackToTop';
import { useLanguage } from '@/context/LanguageContext';

// 颜色格式类型
type ColorFormat = 'hex' | 'rgb' | 'hsl';

// 调色板颜色类型
interface PaletteColor {
  id: string;
  hex: string;
  name: string;
}

// 添加CSS变量样式
const styles = {
  card: "card p-6",
  heading: "text-lg font-medium text-primary mb-4",
  subheading: "text-md font-medium text-primary mb-4",
  secondaryText: "text-sm text-tertiary",
  iconButton: "text-secondary hover:text-primary transition-colors",
  deleteBtn: "text-secondary hover:text-error transition-colors",
  colorInput: "w-16 h-16 cursor-pointer rounded-md overflow-hidden border-0",
  colorTextInput: "w-full px-3 py-2 bg-block border border-purple-glow rounded-md text-primary pr-10",
  formatButton: (active: boolean) => `text-xs px-3 py-1 ${active ? 'bg-purple-glow/20 text-purple' : 'bg-block-strong text-secondary'}`,
  paletteItem: "flex items-center justify-between p-2 rounded-md hover:bg-block-hover transition-colors",
  paletteColorBox: "w-8 h-8 rounded-md cursor-pointer border border-block-strong",
  colorLabel: "text-sm text-primary",
  colorValue: "text-xs text-secondary font-mono",
  colorContrastBox: "p-3 rounded-md text-center",
  colorPreview: "h-32 rounded-md mb-4 flex items-center justify-center relative overflow-hidden",
  colorPreviewText: "bg-black bg-opacity-40 px-4 py-2 rounded-md text-white",
  colorShadesBox: "h-16 rounded-md flex items-center justify-center transition-all duration-200 cursor-pointer hover:transform hover:scale-105",
  harmonicColorBox: "h-24 rounded-md flex items-center justify-center transition-transform cursor-pointer hover:scale-105",
}

export default function ColorTools() {
  const { t, language } = useLanguage();
  
  // 主颜色输入
  const [mainColor, setMainColor] = useState('#6366F1');
  const [mainColorFormat, setMainColorFormat] = useState<ColorFormat>('hex');
  
  // 颜色展示
  const [colorValues, setColorValues] = useState({
    hex: '#6366F1',
    rgb: 'rgb(99, 102, 241)',
    hsl: 'hsl(239, 84%, 67%)',
  });
  
  // 亮暗变体
  const [colorShades, setColorShades] = useState<string[]>([]);
  
  // 互补和谐色
  const [complementaryColors, setComplementaryColors] = useState<string[]>([]);
  const [analogousColors, setAnalogousColors] = useState<string[]>([]);
  
  // 调色板
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [showPaletteInput, setShowPaletteInput] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState('');
  
  // 复制状态
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  
  // 默认示例调色板
  const getExamplePalette = () => [
    { id: 'primary', hex: '#6366F1', name: t('tools.color_tools.example_palette.primary') },
    { id: 'secondary', hex: '#8B5CF6', name: t('tools.color_tools.example_palette.secondary') },
    { id: 'accent', hex: '#EC4899', name: t('tools.color_tools.example_palette.accent') },
    { id: 'dark', hex: '#1E293B', name: t('tools.color_tools.example_palette.dark') },
    { id: 'light', hex: '#F1F5F9', name: t('tools.color_tools.example_palette.light') },
  ];
  
  // 初始化
  useEffect(() => {
    // 从本地存储加载调色板或使用示例
    const savedPalette = localStorage.getItem('colorPalette');
    
    if (savedPalette) {
      setPalette(JSON.parse(savedPalette));
    } else {
      setPalette(getExamplePalette());
    }
    
    // 初始化颜色计算
    updateColorValues(mainColor);
  }, [language]);
  
  // 当主颜色改变时，更新所有颜色值
  useEffect(() => {
    updateColorValues(mainColor);
  }, [mainColor]);
  
  // 使用特性的展示 - 在组件顶部定义可能用到的功能列表
  const features = [
    'HEX、RGB、HSL三种颜色格式的转换和复制',
    '亮度色阶展示，快速选择不同亮度的相同颜色',
    '互补色和邻近色展示，帮助设计和谐的配色方案',
    '个性化调色板保存，支持添加和删除自定义颜色'
  ];
  
  // 更新颜色值
  const updateColorValues = (hexColor: string) => {
    try {
      // 验证颜色格式
      if (!/^#[0-9A-Fa-f]{6}$/.test(hexColor)) {
        return;
      }
      
      // 计算 RGB
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      
      // RGB 格式
      const rgbValue = `rgb(${r}, ${g}, ${b})`;
      
      // 计算 HSL
      const rNorm = r / 255;
      const gNorm = g / 255;
      const bNorm = b / 255;
      
      const max = Math.max(rNorm, gNorm, bNorm);
      const min = Math.min(rNorm, gNorm, bNorm);
      const diff = max - min;
      
      let h = 0;
      if (max === min) {
        h = 0;
      } else if (max === rNorm) {
        h = ((gNorm - bNorm) / diff + (gNorm < bNorm ? 6 : 0)) * 60;
      } else if (max === gNorm) {
        h = ((bNorm - rNorm) / diff + 2) * 60;
      } else {
        h = ((rNorm - gNorm) / diff + 4) * 60;
      }
      
      const l = (max + min) / 2;
      const s = diff === 0 ? 0 : diff / (1 - Math.abs(2 * l - 1));
      
      // HSL 格式
      const hslValue = `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
      
      // 更新所有颜色值
      setColorValues({
        hex: hexColor,
        rgb: rgbValue,
        hsl: hslValue,
      });
      
      // 计算颜色变体
      calculateColorShades(hexColor);
      
      // 计算互补和谐色
      calculateComplementary(h, s, l);
      calculateAnalogous(h, s, l);
    } catch (error) {
      console.error(t('tools.color_tools.copy_failed'), error);
    }
  };
  
  // 计算颜色的亮度变体
  const calculateColorShades = (hexColor: string) => {
    const shades: string[] = [];
    
    // 解析颜色
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // 创建9个亮度变体（从10%到90%）
    for (let i = 0.1; i <= 0.9; i += 0.1) {
      // 亮度变化
      const factor = i < 0.5 ? i * 2 : 1; // 暗色处理
      
      // 调整颜色
      const newR = Math.round(r * factor);
      const newG = Math.round(g * factor);
      const newB = Math.round(b * factor);
      
      // 转换回十六进制
      const newHex = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
      
      shades.push(newHex);
    }
    
    setColorShades(shades.reverse()); // 从暗到亮排序
  };
  
  // 计算互补色
  const calculateComplementary = (h: number, s: number, l: number) => {
    const complementaryH = (h + 180) % 360;
    const complementaryRgb = hslToRgb(complementaryH / 360, s, l);
    const complementaryHex = rgbToHex(complementaryRgb[0], complementaryRgb[1], complementaryRgb[2]);
    
    setComplementaryColors([complementaryHex]);
  };
  
  // 计算邻近和谐色
  const calculateAnalogous = (h: number, s: number, l: number) => {
    const analogous: string[] = [];
    
    // 计算邻近色（-30°, +30°）
    const angles = [-30, 30];
    for (const angle of angles) {
      const newH = (h + angle + 360) % 360;
      const analogousRgb = hslToRgb(newH / 360, s, l);
      const analogousHex = rgbToHex(analogousRgb[0], analogousRgb[1], analogousRgb[2]);
      
      analogous.push(analogousHex);
    }
    
    setAnalogousColors(analogous);
  };
  
  // HSL 转 RGB 辅助函数
  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // 灰色
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    ];
  };
  
  // RGB转Hex辅助函数
  const rgbToHex = (r: number, g: number, b: number): string => {
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
  
  // 处理主颜色输入变化
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMainColor(e.target.value);
  };
  
  // 处理格式选择
  const handleFormatChange = (format: ColorFormat) => {
    setMainColorFormat(format);
  };
  
  // 复制颜色值
  const copyColorValue = (format: string) => {
    const textToCopy = colorValues[format as keyof typeof colorValues];
    
    try {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopiedFormat(format);
        setTimeout(() => setCopiedFormat(null), 2000);
      });
    } catch (err) {
      console.error(t('tools.color_tools.copy_failed'), err);
    }
  };
  
  // 添加到调色板
  const addToPalette = () => {
    if (!newPaletteName.trim()) return;
    
    const newColor: PaletteColor = {
      id: Date.now().toString(),
      hex: mainColor,
      name: newPaletteName.trim()
    };
    
    const updatedPalette = [...palette, newColor];
    setPalette(updatedPalette);
    
    // 保存到本地存储
    try {
      localStorage.setItem('colorPalette', JSON.stringify(updatedPalette));
    } catch (err) {
      console.error(t('tools.color_tools.save_palette_error'), err);
    }
    
    setNewPaletteName('');
    setShowPaletteInput(false);
  };
  
  // 从调色板删除颜色
  const removeFromPalette = (id: string) => {
    const updatedPalette = palette.filter(color => color.id !== id);
    setPalette(updatedPalette);
    
    // 更新本地存储
    localStorage.setItem('colorPalette', JSON.stringify(updatedPalette));
  };
  
  // 从调色板选择颜色
  const selectFromPalette = (hex: string) => {
    setMainColor(hex);
  };
  
  // 生成随机颜色
  const generateRandomColor = () => {
    const randomHex = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    setMainColor(randomHex);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-[1440px] mx-auto p-4 md:p-6">
      <ToolHeader 
        toolCode="color_tools"
        icon={faPalette}
        title=""
        description=""
      />
      
      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 左侧面板 - 调色板 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 颜色选择和格式 */}
          <div className={styles.card}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={styles.subheading}>{t('tools.color_tools.color_selection')}</h2>
              <button
                className={styles.iconButton}
                onClick={generateRandomColor}
              >
                <FontAwesomeIcon icon={faRandom} className="mr-1" />
                {t('tools.color_tools.random_color')}
              </button>
            </div>
              
            <div className="flex flex-row gap-4">
              <input
                type="color"
                value={mainColor}
                onChange={handleColorChange}
                className={styles.colorInput}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex rounded-md overflow-hidden border border-block-strong">
                    {(['hex', 'rgb', 'hsl'] as ColorFormat[]).map((format) => (
                      <button
                        key={format}
                        className={styles.formatButton(mainColorFormat === format)}
                        onClick={() => handleFormatChange(format)}
                      >
                        {t(`tools.color_tools.color_formats.${format}`)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={colorValues[mainColorFormat]}
                    readOnly
                    className={styles.colorTextInput}
                  />
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                    onClick={() => copyColorValue(mainColorFormat)}
                  >
                    <FontAwesomeIcon icon={copiedFormat === mainColorFormat ? faCheck : faCopy} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* 调色板 */}
          <div className={styles.card}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={styles.subheading}>{t('tools.color_tools.color_palette')}</h2>
              <div className="flex items-center gap-2">
                <button 
                  className={styles.iconButton}
                  onClick={() => setShowPaletteInput(true)}
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-1" />
                  {t('tools.color_tools.palette_actions.add_color')}
                </button>
              </div>
            </div>
            
            {/* 添加新颜色 */}
            {showPaletteInput && (
              <div className="bg-block-hover rounded-md p-3 mb-4">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-md border border-block-strong"
                    style={{ backgroundColor: mainColor }}
                  ></div>
                  <div className="flex-1">
                    <label className="block text-sm text-secondary mb-1">
                      {t('tools.color_tools.palette_color_name')}
                    </label>
                    <input 
                      type="text"
                      className="w-full px-2 py-1 bg-block border border-block-strong rounded-md text-primary text-sm"
                      placeholder={t('tools.color_tools.palette_color_name_input')}
                      value={newPaletteName}
                      onChange={(e) => setNewPaletteName(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-3 gap-2">
                  <button 
                    className="text-xs px-3 py-1 bg-block-strong text-secondary rounded-md"
                    onClick={() => {
                      setShowPaletteInput(false);
                      setNewPaletteName('');
                    }}
                  >
                    {t('tools.color_tools.cancel')}
                  </button>
                  <button 
                    className="text-xs px-3 py-1 bg-purple-glow/20 text-purple rounded-md"
                    onClick={addToPalette}
                  >
                    {t('tools.color_tools.add')}
                  </button>
                </div>
              </div>
            )}
            
            {/* 颜色列表 */}
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {palette.map((color) => (
                <div key={color.id} className={styles.paletteItem}>
                  <div className="flex items-center gap-2">
                    <div 
                      className={styles.paletteColorBox}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => selectFromPalette(color.hex)}
                    ></div>
                    <div>
                      <div className={styles.colorLabel}>{color.name}</div>
                      <div className={styles.colorValue}>{color.hex}</div>
                    </div>
                  </div>
                  <button 
                    className={styles.deleteBtn}
                    onClick={() => removeFromPalette(color.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 右侧面板 - 颜色变体 */}
        <div className="lg:col-span-3 space-y-6">
          {/* 颜色预览 */}
          <div className={styles.card}>
            <h2 className={styles.subheading}>{t('tools.color_tools.color_preview')}</h2>
            <div 
              className={styles.colorPreview}
              style={{ backgroundColor: mainColor }}
            >
              <div className={styles.colorPreviewText}>
                {colorValues[mainColorFormat]}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm text-primary mb-2">{t('tools.color_tools.contrast_effects')}</h3>
                <div className="space-y-2">
                  <div 
                    className={styles.colorContrastBox}
                    style={{ backgroundColor: mainColor, color: '#FFFFFF' }}
                  >
                    {t('tools.color_tools.white_text')}
                  </div>
                  <div 
                    className={styles.colorContrastBox}
                    style={{ backgroundColor: mainColor, color: '#000000' }}
                  >
                    {t('tools.color_tools.black_text')}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm text-primary mb-2">{t('tools.color_tools.border_background')}</h3>
                <div className="space-y-2">
                  <div 
                    className={styles.colorContrastBox + " bg-block"}
                    style={{ border: `2px solid ${mainColor}` }}
                  >
                    <span className="text-primary">{t('tools.color_tools.border_effect')}</span>
                  </div>
                  <div 
                    className={styles.colorContrastBox}
                    style={{ backgroundColor: `${mainColor}40` }}
                  >
                    <span className="text-primary">{t('tools.color_tools.transparent_background')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 颜色变体 */}
          <div className={styles.card}>
            <h2 className={styles.subheading}>{t('tools.color_tools.color_variants')}</h2>
            <div className="grid grid-cols-9 gap-1 mb-6">
              {colorShades.map((shade, index) => (
                <div 
                  key={index} 
                  className={styles.colorShadesBox}
                  style={{ backgroundColor: shade }}
                  onClick={() => setMainColor(shade)}
                  title={shade}
                >
                  <span className="text-xs font-mono text-white bg-black bg-opacity-30 px-1 rounded">
                    {index * 10 + 10}%
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm text-primary mb-2">{t('tools.color_tools.complementary_color')}</h3>
              <div className="grid grid-cols-1 gap-2">
                {complementaryColors.map((color, index) => (
                  <div 
                    key={index} 
                    className={styles.harmonicColorBox}
                    style={{ backgroundColor: color }}
                    onClick={() => setMainColor(color)}
                  >
                    <span className="text-sm font-mono text-white bg-black bg-opacity-30 px-2 py-1 rounded">
                      {color}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm text-primary mb-2">{t('tools.color_tools.analogous_harmony')}</h3>
              <div className="grid grid-cols-2 gap-2">
                {analogousColors.map((color, index) => (
                  <div 
                    key={index} 
                    className={styles.harmonicColorBox}
                    style={{ backgroundColor: color }}
                    onClick={() => setMainColor(color)}
                  >
                    <span className="text-sm font-mono text-white bg-black bg-opacity-30 px-2 py-1 rounded">
                      {color}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* 说明 */}
          <div className={styles.card}>
            <div className="flex items-center gap-2 mb-3">
              <FontAwesomeIcon icon={faInfoCircle} className="text-purple" />
              <h2 className="text-primary font-medium">{t('tools.color_tools.usage_guide.title')}</h2>
            </div>
            <p className={styles.secondaryText}>
              {t('tools.color_tools.usage_guide.content')}
            </p>
            <ul className="list-disc pl-5 text-sm text-tertiary">
              {features.map((feature, index) => (
                <li key={index}>{t(`tools.color_tools.usage_guide.features.${index}`) || feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* 回到顶部按钮 */}
      <BackToTop position="bottom-right" offset={30} size="medium" />
    </div>
  );
} 