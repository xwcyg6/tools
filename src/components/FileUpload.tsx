'use client';

import React, { useCallback, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faFile, faTimes } from '@fortawesome/free-solid-svg-icons';

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // 以字节为单位
  multiple?: boolean;
  onFileSelect: (files: File[]) => void;
  onError?: (error: string) => void;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  className?: string;
}

export default function FileUpload({
  accept = '*',
  maxSize = 100 * 1024 * 1024, // 默认100MB
  multiple = false,
  onFileSelect,
  onError,
  title = '拖拽文件到此处或点击上传',
  subtitle = '支持多种格式',
  buttonText = '选择文件',
  className = ''
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const validateFiles = useCallback((files: FileList): File[] => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      // 检查文件大小
      if (file.size > maxSize) {
        errors.push(`文件 ${file.name} 过大，最大支持 ${Math.round(maxSize / 1024 / 1024)}MB`);
        return;
      }

      // 检查文件类型
      if (accept !== '*' && !file.type.match(new RegExp(accept.replace(/\*/g, '.*')))) {
        errors.push(`文件 ${file.name} 格式不支持`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      onError?.(errors.join('\n'));
      return [];
    }

    return validFiles;
  }, [accept, maxSize, onError]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      onFileSelect(validFiles);
    }
  }, [validateFiles, onFileSelect]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (!files) return;

    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      onFileSelect(validFiles);
    }
  }, [validateFiles, onFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = useCallback((index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  }, [selectedFiles, onFileSelect]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 文件上传区域 */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragOver 
            ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20' 
            : 'border-purple-500 hover:border-purple-400'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <FontAwesomeIcon 
          icon={faCloudUploadAlt} 
          className="text-4xl text-purple-500 mb-4" 
        />
        <h3 className="text-xl font-semibold mb-2 text-gray-100">
          {title}
        </h3>
        <p className="text-gray-400 mb-4">
          {subtitle}
        </p>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
          {buttonText}
        </button>
        <input
          id="file-upload"
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* 已选择的文件列表 */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">已选择的文件：</h4>
          {selectedFiles.map((file, index) => (
            <div 
              key={`${file.name}-${index}`}
              className="flex items-center justify-between bg-gray-800 rounded-lg p-3"
            >
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faFile} className="text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-100">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 