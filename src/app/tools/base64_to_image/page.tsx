'use client';

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTrash, faImage, faCopy, faCheck, faExchangeAlt, faUpload } from '@fortawesome/free-solid-svg-icons';
import ToolHeader from '@/components/ToolHeader';
import { useLanguage } from '@/context/LanguageContext';
import tools from '@/config/tools';
import BackToTop from '@/components/BackToTop';

// 添加CSS变量样式
const styles = {
  container: "min-h-screen flex flex-col max-w-[1440px] mx-auto p-4 md:p-6",
  card: "card p-6 mb-6",
  inputLabel: "block text-secondary text-sm font-bold mb-2",
  heading: "text-lg font-semibold mb-2 text-primary",
  textArea: "search-input w-full h-56 font-mono text-sm",
  switchBtn: "btn-secondary flex items-center justify-center my-4 mx-auto",
  imageContainer: "bg-block rounded-lg p-4 min-h-64 flex items-center justify-center border border-purple-glow/15 mt-4",
  image: "max-w-full max-h-96 object-contain",
  placeholder: "text-tertiary",
  actionBtn: "w-full",
  actionBtnDisabled: "btn-secondary opacity-50 cursor-not-allowed w-full",
  errorMsg: "mt-2 text-red-500 text-sm",
  successMsg: "mt-2 text-green-500 text-sm",
  copyBtn: "btn-secondary text-sm py-1 px-3 flex items-center",
  fileUploadBtn: "btn-primary flex items-center justify-center cursor-pointer",
  fileName: "ml-3 text-secondary text-sm",
  tabs: "flex mb-6 border-b border-purple-glow/20",
  tab: "py-2 px-4 cursor-pointer text-secondary border-b-2 border-transparent",
  activeTab: "py-2 px-4 text-primary border-b-2 border-primary font-medium",
};

// 转换模式类型
type ConversionMode = 'base64_to_image' | 'image_to_base64';

export default function Base64ImageConverter() {
  const { t } = useLanguage();
  
  // 从工具配置中获取当前工具图标
  const toolIcon = tools.find(tool => tool.code === 'base64_to_image')?.icon || faImage;
  
  // 状态管理
  const [conversionMode, setConversionMode] = useState<ConversionMode>('base64_to_image');
  
  // Base64转图片状态
  const [base64Input, setBase64Input] = useState('');
  const [imageOutput, setImageOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [fileName, setFileName] = useState<string>('image');
  const [copied, setCopied] = useState(false);
  
  // 图片转Base64状态
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [base64Output, setBase64Output] = useState<string>('');
  const [rawBase64Output, setRawBase64Output] = useState<string>('');
  const [outputWithPrefix, setOutputWithPrefix] = useState<boolean>(true);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [base64Copied, setBase64Copied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 当Base64输入变化时处理转换（Base64转图片）
  useEffect(() => {
    if (conversionMode !== 'base64_to_image' || !base64Input.trim()) {
      setImageOutput(null);
      setError(null);
      setMimeType('');
      return;
    }
    
    try {
      // 清除可能的数据URL前缀
      const processedInput = base64Input.trim();
      
      // 检查是否已经是完整的数据URL
      if (processedInput.startsWith('data:')) {
        // 从数据URL中提取MIME类型
        const mimeMatch = processedInput.match(/^data:([^;]+);base64,/);
        if (mimeMatch) {
          setMimeType(mimeMatch[1]);
          // 使用完整的数据URL
          setImageOutput(processedInput);
          setError(null);
          
          // 根据MIME类型设置合适的文件扩展名
          updateFileNameFromMimeType(mimeMatch[1]);
        } else {
          throw new Error(t('tools.base64_to_image.invalid_data_url'));
        }
      } else {
        // 假设这是原始Base64，需要添加数据URL前缀
        // 尝试推断MIME类型或使用默认值
        const inferredMimeType = inferMimeTypeFromBase64(processedInput);
        setMimeType(inferredMimeType);
        
        // 创建完整的数据URL
        const dataUrl = `data:${inferredMimeType};base64,${processedInput}`;
        setImageOutput(dataUrl);
        setError(null);
        
        // 根据MIME类型设置合适的文件扩展名
        updateFileNameFromMimeType(inferredMimeType);
      }
    } catch (err) {
      console.error('Error processing base64:', err);
      setError((err as Error).message || t('tools.base64_to_image.processing_error'));
      setImageOutput(null);
    }
  }, [base64Input, conversionMode, t]);
  
  // 从Base64数据推断MIME类型的简单逻辑
  const inferMimeTypeFromBase64 = (base64String: string): string => {
    // 默认为PNG
    let mimeType = 'image/png';
    
    // 检查前几个字符以尝试推断类型
    // 注意：这是一个非常简化的版本，实际生产中可能需要更复杂的逻辑
    const firstChars = base64String.substring(0, 4);
    
    if (firstChars.startsWith('/9j/')) {
      mimeType = 'image/jpeg';
    } else if (firstChars.startsWith('iVBO') || firstChars.startsWith('IVBO')) {
      mimeType = 'image/png';
    } else if (firstChars.startsWith('R0lG')) {
      mimeType = 'image/gif';
    } else if (firstChars.startsWith('UE5H')) {
      mimeType = 'image/png';
    } else if (firstChars.startsWith('Qk0=')) {
      mimeType = 'image/bmp';
    } else if (firstChars.startsWith('PHN2')) {
      mimeType = 'image/svg+xml';
    } else if (firstChars.startsWith('AAAA')) {
      mimeType = 'image/webp';
    }
    
    return mimeType;
  };
  
  // 根据MIME类型更新文件名的扩展名
  const updateFileNameFromMimeType = (mime: string) => {
    let extension = 'png'; // 默认扩展名
    
    // 根据MIME类型设置扩展名
    if (mime === 'image/jpeg' || mime === 'image/jpg') {
      extension = 'jpg';
    } else if (mime === 'image/png') {
      extension = 'png';
    } else if (mime === 'image/gif') {
      extension = 'gif';
    } else if (mime === 'image/bmp') {
      extension = 'bmp';
    } else if (mime === 'image/svg+xml') {
      extension = 'svg';
    } else if (mime === 'image/webp') {
      extension = 'webp';
    }
    
    setFileName(`image.${extension}`);
  };
  
  // 清空输入和输出（Base64转图片）
  const clearBase64ToImage = () => {
    setBase64Input('');
    setImageOutput(null);
    setError(null);
    setMimeType('');
    setFileName('image');
  };
  
  // 清空输入和输出（图片转Base64）
  const clearImageToBase64 = () => {
    setUploadedFile(null);
    setUploadedImage(null);
    setBase64Output('');
    setRawBase64Output('');
    setUploadError(null);
    setUploadSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // 下载图片
  const downloadImage = () => {
    if (!imageOutput) return;
    
    const link = document.createElement('a');
    link.href = imageOutput;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // 加载示例Base64
  const loadExample = () => {
    // 一个简单的彩色渐变PNG图像的Base64
    const exampleBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TtSIVByuIOGSoThZERRylikWwUNoKrTqYXPohNGlIUlwcBdeCgx+LVQcXZ10dXAVB8APE1cVJ0UVK/F9SaBHjwXE/3t173L0DhGaVqWbPOKBqlpFOxMVcflUMvCKIEMKIISgxU5+TZRm4jq97+Ph6F+NZ3uf+HANKwWSATySeY7phEW8QT29aOud94ggrSQrxOfGYQRckfuS67PIb55LDAs8MGZnUPHGEWCx1sdzFrGKoxFPEUUXVKN+fc1nhvMVZrdZZ+578hcGCtpLhOs1RJLCEJFIQIaOOCqqwEKNVI8VEmvbjHv4Rx58il0yuChg5FlCDCsnxg//B727N0uSEmxROAH0vtv0xAoR2gVbDtr+Pbbt1AgSegSut499oAjOfpDc6WuwIGNwGLq47mrIHXO4AQ0+GbMqO5KcpFIvA+xl9Uw4YuAUCa25vzX2cPgBpamX5Nxg4AiJlyl73eHdPd2//nmn39wNZjHKYJHtTZAAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+cMEwwTIg9nvK0AAACbSURBVHja7dAxAQAgDMAwwL/n8SSBJ2uGLdite3YEhhCGEIYQhhCGEIYQhhCGEIYQhhCGEIYQhhCGEIYQhhCGEIYQhhCGEIYQhhCGEIYQhhCGEIYQhhCGEIYQhhCGEIYQhhCGEIYQhhCGEIYQhhCGEIYQhhCGEIYQhhCGEIYQhhCGEH8tC+O6BRrHuUAeAAAAAElFTkSuQmCC';
    
    setBase64Input(exampleBase64);
  };
  
  // 复制现有Base64到剪贴板（Base64转图片）
  const copyBase64 = () => {
    if (!base64Input) return;
    
    navigator.clipboard.writeText(base64Input)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        setError(t('tools.base64_to_image.copy_failed'));
      });
  };
  
  // 复制生成的Base64到剪贴板（图片转Base64）
  const copyGeneratedBase64 = () => {
    if (!base64Output) return;
    
    navigator.clipboard.writeText(base64Output)
      .then(() => {
        setBase64Copied(true);
        setTimeout(() => setBase64Copied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        setUploadError(t('tools.base64_to_image.copy_failed'));
      });
  };
  
  // 切换转换模式
  const toggleConversionMode = () => {
    setConversionMode(prevMode => 
      prevMode === 'base64_to_image' ? 'image_to_base64' : 'base64_to_image'
    );
    
    // 清空各自的状态
    clearBase64ToImage();
    clearImageToBase64();
  };
  
  // 处理文件上传（图片转Base64）
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      setUploadError(t('tools.base64_to_image.invalid_image_file'));
      return;
    }
    
    // 检查文件大小（限制为10MB）
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(t('tools.base64_to_image.file_too_large'));
      return;
    }
    
    setUploadedFile(file);
    setUploadError(null);
    
    // 读取并显示图片预览
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      
      // 提取Base64部分
      const base64WithPrefix = result;
      const base64Raw = result.split(',')[1];
      
      setRawBase64Output(base64Raw);
      setBase64Output(outputWithPrefix ? base64WithPrefix : base64Raw);
      
      setUploadSuccess(t('tools.base64_to_image.conversion_success'));
    };
    reader.onerror = () => {
      setUploadError(t('tools.base64_to_image.file_reading_error'));
    };
    reader.readAsDataURL(file);
  };
  
  // 切换输出格式（是否包含前缀）
  const toggleOutputFormat = () => {
    setOutputWithPrefix(!outputWithPrefix);
    setBase64Output(outputWithPrefix ? rawBase64Output : (uploadedImage || ''));
  };
  
  // 保存Base64内容为文本文件
  const saveBase64AsTextFile = () => {
    if (!base64Output) return;
    
    const blob = new Blob([base64Output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = uploadedFile ? `${uploadedFile.name}.txt` : 'base64_data.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className={styles.container}>
      {/* 工具标题 */}
      <ToolHeader 
        icon={toolIcon}
        toolCode="base64_to_image"
        title=""
        description=""
      />
      
      {/* 切换按钮 */}
      <button 
        className={styles.switchBtn}
        onClick={toggleConversionMode}
      >
        <FontAwesomeIcon icon={faExchangeAlt} className="mr-2 icon" />
        {conversionMode === 'base64_to_image' 
          ? t('tools.base64_to_image.switch_to_image_to_base64') 
          : t('tools.base64_to_image.switch_to_base64_to_image')
        }
      </button>
      
      {/* 选项卡 */}
      <div className={styles.tabs}>
        <div 
          className={conversionMode === 'base64_to_image' ? styles.activeTab : styles.tab}
          onClick={() => setConversionMode('base64_to_image')}
        >
          {t('tools.base64_to_image.base64_to_image_tab')}
        </div>
        <div 
          className={conversionMode === 'image_to_base64' ? styles.activeTab : styles.tab}
          onClick={() => setConversionMode('image_to_base64')}
        >
          {t('tools.base64_to_image.image_to_base64_tab')}
        </div>
      </div>
      
      {/* Base64转图片 */}
      {conversionMode === 'base64_to_image' && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 输入区域 */}
          <div className="w-full lg:w-1/2">
            <div className={styles.card}>
              <h2 className={styles.heading}>{t('tools.base64_to_image.input_title')}</h2>
              <label className={styles.inputLabel}>{t('tools.base64_to_image.base64_input')}</label>
              <textarea
                className={styles.textArea}
                value={base64Input}
                onChange={(e) => setBase64Input(e.target.value)}
                placeholder={t('tools.base64_to_image.input_placeholder')}
                spellCheck="false"
              />
              
              {error && <div className={styles.errorMsg}>{error}</div>}
              
              <div className="flex items-center justify-between mt-4">
                <button 
                  onClick={loadExample} 
                  className="btn-secondary"
                >
                  {t('tools.base64_to_image.load_example')}
                </button>
                
                <button
                  onClick={copyBase64}
                  disabled={!base64Input}
                  className={!base64Input ? styles.actionBtnDisabled : "btn-secondary"}
                >
                  <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="mr-2 icon" />
                  {copied ? t('common.copySuccess') : t('tools.base64_to_image.copy')}
                </button>
                
                <button 
                  onClick={clearBase64ToImage} 
                  className="btn-secondary"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2 icon" />
                  {t('tools.base64_to_image.clear_all')}
                </button>
              </div>
            </div>
          </div>
          
          {/* 输出区域 */}
          <div className="w-full lg:w-1/2">
            <div className={styles.card}>
              <h2 className={styles.heading}>{t('tools.base64_to_image.output_title')}</h2>
              
              <div className={styles.imageContainer}>
                {imageOutput ? (
                  <img
                    src={imageOutput}
                    alt={t('tools.base64_to_image.converted_image')}
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.placeholder}>
                    {t('tools.base64_to_image.no_image')}
                  </div>
                )}
              </div>
              
              {imageOutput && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-secondary text-sm">{t('tools.base64_to_image.image_type')}: {mimeType}</span>
                    <input
                      type="text"
                      className="search-input w-48"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder={t('tools.base64_to_image.file_name')}
                    />
                  </div>
                  
                  <button
                    onClick={downloadImage}
                    className="btn-primary w-full"
                    disabled={!imageOutput}
                  >
                    <FontAwesomeIcon icon={faDownload} className="mr-2 icon" />
                    {t('tools.base64_to_image.download_image')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 图片转Base64 */}
      {conversionMode === 'image_to_base64' && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 输入区域 */}
          <div className="w-full lg:w-1/2">
            <div className={styles.card}>
              <h2 className={styles.heading}>{t('tools.base64_to_image.image_input_title')}</h2>
              
              <div className="mb-6">
                <label className={styles.inputLabel}>
                  {t('tools.base64_to_image.select_image')}
                </label>
                <div className="flex items-center">
                  <label className={styles.fileUploadBtn}>
                    <FontAwesomeIcon icon={faUpload} className="mr-2 icon" />
                    {t('tools.base64_to_image.choose_file')}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </label>
                  {uploadedFile && (
                    <span className={styles.fileName}>{uploadedFile.name}</span>
                  )}
                </div>
              </div>
              
              {uploadError && <div className={styles.errorMsg}>{uploadError}</div>}
              {uploadSuccess && <div className={styles.successMsg}>{uploadSuccess}</div>}
              
              <div className={styles.imageContainer}>
                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt={t('tools.base64_to_image.uploaded_image')}
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.placeholder}>
                    {t('tools.base64_to_image.no_uploaded_image')}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-end mt-4">
                <button 
                  onClick={clearImageToBase64} 
                  className="btn-secondary"
                  disabled={!uploadedFile}
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2 icon" />
                  {t('tools.base64_to_image.clear_all')}
                </button>
              </div>
            </div>
          </div>
          
          {/* 输出区域 */}
          <div className="w-full lg:w-1/2">
            <div className={styles.card}>
              <h2 className={styles.heading}>{t('tools.base64_to_image.base64_output_title')}</h2>
              
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="includePrefix"
                  checked={outputWithPrefix}
                  onChange={toggleOutputFormat}
                  className="mr-2 accent-[rgb(var(--color-primary))] w-4 h-4"
                />
                <label htmlFor="includePrefix" className="text-secondary text-sm">
                  {t('tools.base64_to_image.include_prefix')}
                </label>
              </div>
              
              <textarea
                className={styles.textArea}
                value={base64Output}
                readOnly
                placeholder={t('tools.base64_to_image.output_placeholder')}
                spellCheck="false"
              />
              
              {uploadedFile && base64Output && (
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={copyGeneratedBase64}
                    className="btn-secondary"
                  >
                    <FontAwesomeIcon icon={base64Copied ? faCheck : faCopy} className="mr-2 icon" />
                    {base64Copied ? t('common.copySuccess') : t('tools.base64_to_image.copy_base64')}
                  </button>
                  
                  <button
                    onClick={saveBase64AsTextFile}
                    className="btn-primary"
                  >
                    <FontAwesomeIcon icon={faDownload} className="mr-2 icon" />
                    {t('tools.base64_to_image.save_as_text')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 使用说明 */}
      <div className="card p-4 mb-6 mt-6">
        <h3 className="text-md font-medium text-primary mb-2">{t('tools.base64_to_image.usage_guide')}</h3>
        <ul className="list-disc list-inside text-sm space-y-1 text-tertiary">
          {conversionMode === 'base64_to_image' ? (
            <>
              <li>{t('tools.base64_to_image.guide_1')}</li>
              <li>{t('tools.base64_to_image.guide_2')}</li>
              <li>{t('tools.base64_to_image.guide_3')}</li>
              <li>{t('tools.base64_to_image.guide_4')}</li>
            </>
          ) : (
            <>
              <li>{t('tools.base64_to_image.guide_5')}</li>
              <li>{t('tools.base64_to_image.guide_6')}</li>
              <li>{t('tools.base64_to_image.guide_7')}</li>
              <li>{t('tools.base64_to_image.guide_8')}</li>
            </>
          )}
        </ul>
      </div>
      
      {/* 回到顶部按钮 */}
      <BackToTop />
    </div>
  );
} 