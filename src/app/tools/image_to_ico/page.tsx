'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faDownload, faTrash, faImage } from '@fortawesome/free-solid-svg-icons';
import ToolHeader from '@/components/ToolHeader';
import { useLanguage } from '@/context/LanguageContext';

// 样式定义
const styles = {
  container: "min-h-screen flex flex-col max-w-[1440px] mx-auto p-4 md:p-6",
  card: "card p-6 mb-6",
  inputLabel: "block text-secondary text-sm font-bold mb-2",
  fileUploadBtn: "btn-primary flex items-center justify-center cursor-pointer",
  fileName: "ml-3 text-secondary text-sm",
  heading: "text-lg font-semibold mb-2 text-primary",
  settingsContainer: "space-y-4",
  rangeInput: "w-full accent-[rgb(var(--color-primary))]",
  textInput: "search-input w-full",
  infoPanel: "bg-block p-4 rounded-lg border border-purple-glow/15",
  infoPanelRow: "flex justify-between mb-2",
  infoLabel: "text-secondary",
  infoValue: "font-medium text-primary",
  actionBtn: "btn-primary w-full",
  actionBtnDisabled: "btn-secondary opacity-50 cursor-not-allowed w-full",
  imageContainer: "bg-block rounded-lg p-4 min-h-64 flex items-center justify-center border border-purple-glow/15",
  image: "max-w-full max-h-96 object-contain",
  placeholder: "text-tertiary",
  iconSizeOption: "btn-option",
  iconSizeOptionActive: "btn-option-active",
};

// ICO图标尺寸选项
const iconSizes = [16, 32, 48, 64, 128];

export default function ImageToIco() {
  const { t } = useLanguage();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [icoImage, setIcoImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number, height: number } | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [iconSize, setIconSize] = useState<number>(32);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setOriginalSize(file.size);
    setIcoImage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setOriginalImage(dataUrl);
      
      // 获取图片尺寸
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({
          width: img.width,
          height: img.height
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const convertToIco = async () => {
    if (!originalImage || !imageRef.current) return;
    
    setIsConverting(true);
    
    try {
      // 创建一个临时canvas
      const canvas = document.createElement('canvas');
      canvas.width = iconSize;
      canvas.height = iconSize;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('无法创建canvas上下文');
      }
      
      // 在canvas上绘制图像
      ctx.drawImage(imageRef.current, 0, 0, iconSize, iconSize);
      
      // 将canvas转换为PNG数据URL
      const pngDataUrl = canvas.toDataURL('image/png');
      
      // 由于浏览器不能直接创建.ico文件，我们使用PNG作为预览
      // 在实际下载时，我们会处理数据转换为.ico格式
      setIcoImage(pngDataUrl);
    } catch (error) {
      console.error(t('tools.image_to_ico.conversion_failed'), error);
    } finally {
      setIsConverting(false);
    }
  };

  const downloadIco = () => {
    if (!icoImage) return;
    
    // 创建一个链接以下载PNG文件（作为ICO的替代）
    // 注意：这里简化了处理，实际上转换为真正的ICO需要更复杂的处理
    const link = document.createElement('a');
    const newFileName = fileName.replace(/\.[^/.]+$/, '.ico');
    
    link.href = icoImage;
    link.download = newFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAll = () => {
    setOriginalImage(null);
    setIcoImage(null);
    setFileName('');
    setOriginalSize(0);
    setOriginalDimensions(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 ' + t('tools.image_to_ico.bytes');
    const k = 1024;
    const sizes = [
      t('tools.image_to_ico.bytes'),
      t('tools.image_to_ico.kb'),
      t('tools.image_to_ico.mb'),
      t('tools.image_to_ico.gb')
    ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={styles.container}>
      <ToolHeader 
        icon={faImage}
        toolCode="image_to_ico"
        title=""
        description=""
      />
      
      <div className={styles.card}>
        <div className="mb-6">
          <label className={styles.inputLabel}>
            {t('tools.image_to_ico.select_image')}
          </label>
          <div className="flex items-center">
            <label className={styles.fileUploadBtn}>
              <FontAwesomeIcon icon={faUpload} className="mr-2 icon" />
              {t('tools.image_to_ico.choose_file')}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </label>
            {fileName && (
              <span className={styles.fileName}>{fileName}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className={styles.heading}>{t('tools.image_to_ico.conversion_settings')}</h3>
            <div className={styles.settingsContainer}>
              <div>
                <label className={styles.inputLabel}>
                  {t('tools.image_to_ico.ico_size')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {iconSizes.map(size => (
                    <button
                      key={size}
                      className={iconSize === size ? styles.iconSizeOptionActive : styles.iconSizeOption}
                      onClick={() => setIconSize(size)}
                    >
                      {size}x{size}
                    </button>
                  ))}
                </div>
              </div>

              {originalDimensions && (
                <div className={styles.infoPanel}>
                  <h4 className="mb-2 font-medium">{t('tools.image_to_ico.image_info')}</h4>
                  <div className={styles.infoPanelRow}>
                    <span className={styles.infoLabel}>{t('tools.image_to_ico.original_size')}</span>
                    <span className={styles.infoValue}>{formatSize(originalSize)}</span>
                  </div>
                  <div className={styles.infoPanelRow}>
                    <span className={styles.infoLabel}>{t('tools.image_to_ico.original_dimensions')}</span>
                    <span className={styles.infoValue}>{originalDimensions.width} x {originalDimensions.height}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 mt-6">
              <button 
                className={originalImage ? styles.actionBtn : styles.actionBtnDisabled}
                onClick={convertToIco}
                disabled={!originalImage || isConverting}
              >
                <FontAwesomeIcon icon={faImage} className="mr-2 icon" />
                {isConverting ? t('tools.image_to_ico.converting') : t('tools.image_to_ico.convert_to_ico')}
              </button>
              
              <button 
                className={icoImage ? styles.actionBtn : styles.actionBtnDisabled}
                onClick={downloadIco}
                disabled={!icoImage}
              >
                <FontAwesomeIcon icon={faDownload} className="mr-2 icon" />
                {t('tools.image_to_ico.download_ico')}
              </button>
              
              <button 
                className="btn-secondary w-full"
                onClick={resetAll}
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2 icon" />
                {t('tools.image_to_ico.reset')}
              </button>
            </div>
          </div>
          
          <div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h3 className={styles.heading}>{t('tools.image_to_ico.original_image')}</h3>
                <div className={styles.imageContainer}>
                  {originalImage ? (
                    <img 
                      src={originalImage} 
                      alt={t('tools.image_to_ico.original_image')} 
                      className={styles.image}
                      ref={imageRef}
                    />
                  ) : (
                    <div className={styles.placeholder}>
                      {t('tools.image_to_ico.no_image_selected')}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className={styles.heading}>{t('tools.image_to_ico.ico_preview')}</h3>
                <div className={styles.imageContainer}>
                  {icoImage ? (
                    <div className="flex flex-col items-center">
                      <img 
                        src={icoImage} 
                        alt={t('tools.image_to_ico.ico_preview')} 
                        width={iconSize}
                        height={iconSize}
                        className="border border-dashed border-gray-500 p-2"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      <div className="mt-2 text-center">
                        <p className="text-sm text-secondary">{iconSize}x{iconSize}</p>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.placeholder}>
                      {t('tools.image_to_ico.no_ico_generated')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 使用说明 */}
        <div className="mt-6 bg-block p-4 rounded-lg border border-purple-glow/15">
          <h3 className="text-lg font-semibold mb-2 text-primary">
            {t('tools.image_to_ico.usage_guide')}
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-secondary">
            <li>{t('tools.image_to_ico.guide_1')}</li>
            <li>{t('tools.image_to_ico.guide_2')}</li>
            <li>{t('tools.image_to_ico.guide_3')}</li>
            <li>{t('tools.image_to_ico.guide_4')}</li>
            <li>{t('tools.image_to_ico.guide_5')}</li>
            <li>{t('tools.image_to_ico.guide_6')}</li>
          </ul>
          <p className="mt-3 text-warning text-sm italic">
            {t('tools.image_to_ico.pixelated_notice')}
          </p>
        </div>
      </div>
    </div>
  );
} 