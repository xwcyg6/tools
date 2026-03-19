'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import Compressor from 'compressorjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faDownload, faCog, faTrash, faImage } from '@fortawesome/free-solid-svg-icons';
import ToolHeader from '@/components/ToolHeader';
import { useLanguage } from '@/context/LanguageContext';

// 添加CSS变量样式
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
  successValue: "font-medium text-success",
  actionBtn: "w-full",
  actionBtnDisabled: "btn-secondary opacity-50 cursor-not-allowed w-full",
  imageContainer: "bg-block rounded-lg p-4 min-h-64 flex items-center justify-center border border-purple-glow/15",
  image: "max-w-full max-h-96 object-contain",
  placeholder: "text-tertiary",
};

export default function ImageCompressor() {
  const { t } = useLanguage();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [quality, setQuality] = useState<number>(80);
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [maxHeight, setMaxHeight] = useState<number>(1080);
  const [maintainRatio, setMaintainRatio] = useState<boolean>(true);
  const [compressFormat, setCompressFormat] = useState<string>('auto');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setOriginalSize(file.size);
    setCompressedImage(null);
    setCompressedSize(0);

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = () => {
    if (!fileInputRef.current?.files?.[0]) return;
    
    const file = fileInputRef.current.files[0];
    setIsCompressing(true);

    new Compressor(file, {
      quality: quality / 100,
      maxWidth,
      maxHeight,
      checkOrientation: true,
      convertSize: 5000000, // 如果图片大于5MB，则转换为JPEG
      mimeType: compressFormat === 'auto' ? undefined : `image/${compressFormat}`,
      success(result) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setCompressedImage(e.target?.result as string);
          setCompressedSize(result.size);
          setIsCompressing(false);
        };
        reader.readAsDataURL(result);
      },
      error(err) {
        console.error(t('tools.image_compressor.compression_failed'), err);
        setIsCompressing(false);
      },
    });
  };

  const downloadCompressedImage = () => {
    if (!compressedImage) return;
    
    const link = document.createElement('a');
    const ext = compressFormat === 'auto' 
      ? fileName.split('.').pop() 
      : compressFormat;
    
    const newFileName = fileName.replace(
      /\.[^/.]+$/, 
      `.compressed.${ext === 'auto' ? 'jpg' : ext}`
    );
    
    link.href = compressedImage;
    link.download = newFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAll = () => {
    setOriginalImage(null);
    setCompressedImage(null);
    setFileName('');
    setOriginalSize(0);
    setCompressedSize(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 ' + t('tools.image_compressor.bytes');
    const k = 1024;
    const sizes = [
      t('tools.image_compressor.bytes'),
      t('tools.image_compressor.kb'),
      t('tools.image_compressor.mb'),
      t('tools.image_compressor.gb')
    ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateReduction = (): string => {
    if (!originalSize || !compressedSize) return '0%';
    const reduction = ((originalSize - compressedSize) / originalSize) * 100;
    return `${reduction.toFixed(2)}%`;
  };

  return (
    <div className={styles.container}>
      {/* 使用 ToolHeader 组件 */}
      <ToolHeader 
        icon={faImage}
        toolCode="image_compressor"
        title=""
        description=""
      />
      
      {/* 主要内容区 */}
      <div className={styles.card}>
        <div className="mb-6">
          <label className={styles.inputLabel}>
            {t('tools.image_compressor.select_image')}
          </label>
          <div className="flex items-center">
            <label className={styles.fileUploadBtn}>
              <FontAwesomeIcon icon={faUpload} className="mr-2 icon" />
              {t('tools.image_compressor.choose_file')}
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
            <h3 className={styles.heading}>{t('tools.image_compressor.compression_settings')}</h3>
            <div className={styles.settingsContainer}>
              <div>
                <label className={styles.inputLabel}>
                  {t('tools.image_compressor.quality')} ({quality}%)
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className={styles.rangeInput}
                />
              </div>
              
              <div>
                <label className={styles.inputLabel}>
                  {t('tools.image_compressor.max_width')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(parseInt(e.target.value))}
                  className={styles.textInput}
                />
              </div>
              
              <div>
                <label className={styles.inputLabel}>
                  {t('tools.image_compressor.max_height')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxHeight}
                  onChange={(e) => setMaxHeight(parseInt(e.target.value))}
                  className={styles.textInput}
                />
              </div>
              
              <div>
                <label className={styles.inputLabel}>
                  {t('tools.image_compressor.output_format')}
                </label>
                <select
                  value={compressFormat}
                  onChange={(e) => setCompressFormat(e.target.value)}
                  className={styles.textInput}
                >
                  <option value="auto">{t('tools.image_compressor.auto_format')}</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintainRatio"
                  checked={maintainRatio}
                  onChange={(e) => setMaintainRatio(e.target.checked)}
                  className="mr-2 accent-[rgb(var(--color-primary))] w-4 h-4"
                />
                <label htmlFor="maintainRatio" className={styles.inputLabel}>
                  {t('tools.image_compressor.maintain_ratio')}
                </label>
              </div>
            </div>
          </div>
          
          <div>
            {originalImage && (
              <div className="mb-4">
                <h3 className={styles.heading}>{t('tools.image_compressor.compression_info')}</h3>
                <div className={styles.infoPanel}>
                  <div className={styles.infoPanelRow}>
                    <span className={styles.infoLabel}>{t('tools.image_compressor.original_size')}:</span>
                    <span className={styles.infoValue}>{formatSize(originalSize)}</span>
                  </div>
                  {compressedSize > 0 && (
                    <>
                      <div className={styles.infoPanelRow}>
                        <span className={styles.infoLabel}>{t('tools.image_compressor.compressed_size')}:</span>
                        <span className={styles.infoValue}>{formatSize(compressedSize)}</span>
                      </div>
                      <div className={styles.infoPanelRow}>
                        <span className={styles.infoLabel}>{t('tools.image_compressor.compression_ratio')}:</span>
                        <span className={styles.successValue}>{calculateReduction()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={compressImage}
                disabled={!originalImage || isCompressing}
                className={!originalImage || isCompressing ? styles.actionBtnDisabled : "btn-primary " + styles.actionBtn}
              >
                <FontAwesomeIcon icon={faCog} className="mr-2 icon" />
                {isCompressing ? t('tools.image_compressor.compressing') : t('tools.image_compressor.compress_image')}
              </button>
              
              <button
                onClick={downloadCompressedImage}
                disabled={!compressedImage}
                className={!compressedImage ? styles.actionBtnDisabled : "btn-primary " + styles.actionBtn}
                style={{ background: compressedImage ? 'linear-gradient(to right, var(--color-success), var(--color-success-hover))' : '' }}
              >
                <FontAwesomeIcon icon={faDownload} className="mr-2 icon" />
                {t('tools.image_compressor.download_compressed')}
              </button>
              
              <button
                onClick={resetAll}
                disabled={!originalImage}
                className={!originalImage ? styles.actionBtnDisabled : "btn-secondary " + styles.actionBtn}
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2 icon" />
                {t('tools.image_compressor.reset')}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className={styles.heading}>{t('tools.image_compressor.original_image')}</h3>
          <div className={styles.imageContainer}>
            {originalImage ? (
              <img 
                src={originalImage} 
                alt={t('tools.image_compressor.original_image')} 
                className={styles.image}
              />
            ) : (
              <div className={styles.placeholder}>{t('tools.image_compressor.no_image_selected')}</div>
            )}
          </div>
        </div>
        
        <div className="card p-4">
          <h3 className={styles.heading}>{t('tools.image_compressor.compressed_image')}</h3>
          <div className={styles.imageContainer}>
            {compressedImage ? (
              <img 
                src={compressedImage} 
                alt={t('tools.image_compressor.compressed_image')} 
                className={styles.image}
              />
            ) : (
              <div className={styles.placeholder}>
                {isCompressing ? t('tools.image_compressor.compressing') : t('tools.image_compressor.no_compressed_image')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 