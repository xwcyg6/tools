'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faExchangeAlt, faSync, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import ToolHeader from '@/components/ToolHeader';
import { useLanguage } from '@/context/LanguageContext';

// 添加CSS变量样式
const styles = {
  card: "card p-6",
  input: "search-input w-full",
  secondaryBtn: "btn-secondary text-xs px-3 py-1",
  primaryText: "text-primary",
  secondaryText: "text-secondary",
  tertiaryText: "text-tertiary",
  formattedBlock: "p-2 bg-block rounded-md border border-purple-glow w-full",
  codeBlock: "bg-block px-1 rounded",
  iconButton: "text-tertiary hover:text-purple transition-colors",
  swapBtn: "text-tertiary hover:text-purple transition-colors p-3 rounded-full hover:bg-purple-glow/10",
}

export default function TimestampConverter() {
  const { t } = useLanguage();
  // 当前系统时间（用于内部计算，不直接渲染）
  const [_currentTime, setCurrentTime] = useState(new Date());
  
  // 显示的当前时间戳，避免服务器端渲染不匹配问题
  const [displayTimestamp, setDisplayTimestamp] = useState<string>('');
  
  // 时间戳和日期时间的状态
  const [timestamp, setTimestamp] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [formattedDateTime, setFormattedDateTime] = useState('');
  
  // 是否交换位置
  const [swapped, setSwapped] = useState(false);
  
  // 常用时间格式列表
  const [commonTimestamps, setCommonTimestamps] = useState<{ label: string; value: number }[]>([]);

  // 复制状态
  const [copiedTimestamp, setCopiedTimestamp] = useState(false);
  const [copiedDateTime, setCopiedDateTime] = useState(false);
  
  // 添加初始化标记
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 首次加载时初始化数据
  useEffect(() => {
    if (!isInitialized) {
      const now = new Date();
      
      // 只初始化当前时间和常用时间戳列表，不设置输入框的初始值
      setCurrentTime(now);
      updateCommonTimestamps(now);
      
      // 客户端设置当前时间戳显示
      setDisplayTimestamp(Math.floor(now.getTime() / 1000).toString());
      
      // 标记为已初始化
      setIsInitialized(true);
    }
  }, []);
  
  // 设置定时器每秒更新当前时间
  useEffect(() => {
    // 启动定时器每秒更新当前时间
    const timer = setInterval(updateCurrentTime, 1000);
    
    // 清理函数
    return () => clearInterval(timer);
  }, []);
  
  // 更新当前时间和相关值
  const updateCurrentTime = () => {
    const now = new Date();
    setCurrentTime(now);
    
    // 设置当前时间戳显示，客户端渲染
    setDisplayTimestamp(Math.floor(now.getTime() / 1000).toString());
    
    // 只更新常用时间戳列表，不修改用户输入
    updateCommonTimestamps(now);
  };
  
  // 更新常用时间戳列表
  const updateCommonTimestamps = (date: Date) => {
    const nowTs = Math.floor(date.getTime() / 1000);
    const commonTs = [
      { label: t('tools.timestamp_converter.current_time'), value: nowTs },
      { label: t('tools.timestamp_converter.today_zero'), value: Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 1000) },
      { label: t('tools.timestamp_converter.this_monday'), value: Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 1).getTime() / 1000) },
      { label: t('tools.timestamp_converter.this_month_start'), value: Math.floor(new Date(date.getFullYear(), date.getMonth(), 1).getTime() / 1000) },
      { label: t('tools.timestamp_converter.this_year_start'), value: Math.floor(new Date(date.getFullYear(), 0, 1).getTime() / 1000) },
    ];
    
    setCommonTimestamps(commonTs);
  };
  
  // 时间戳转日期时间
  const timestampToDateTime = (ts: string) => {
    if (!ts) return;
    
    try {
      // 如果时间戳是毫秒级的（13位），转换为秒级
      let timestampInSeconds = parseInt(ts);
      if (ts.length >= 13) {
        timestampInSeconds = Math.floor(timestampInSeconds / 1000);
      }
      
      const date = new Date(timestampInSeconds * 1000);
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        return;
      }
      
      // 格式化日期时间
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      setDateTime(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);
      setFormattedDateTime(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
    } catch (error) {
      console.error(t('tools.timestamp_converter.timestamp_conversion_error'), error);
    }
  };
  
  // 日期时间转时间戳
  const dateTimeToTimestamp = (dt: string) => {
    if (!dt) return;
    
    try {
      const date = new Date(dt);
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        return;
      }
      
      const ts = Math.floor(date.getTime() / 1000);
      setTimestamp(ts.toString());
    } catch (error) {
      console.error(t('tools.timestamp_converter.datetime_conversion_error'), error);
    }
  };
  
  // 处理时间戳输入变化
  const handleTimestampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTimestamp(value);
    timestampToDateTime(value);
  };
  
  // 处理日期时间输入变化
  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateTime(value);
    
    // 更新格式化的日期时间显示
    if (value) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const seconds = String(date.getSeconds()).padStart(2, '0');
          
          setFormattedDateTime(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
          
          // 同时更新datetime输入框格式
          setDateTime(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);
        }
      } catch (error) {
        console.error(t('tools.timestamp_converter.datetime_format_error'), error);
      }
    }
    
    dateTimeToTimestamp(value);
  };
  
  // 刷新计算，使用当前时间
  const refreshWithCurrentTime = () => {
    const now = new Date();
    const currentTimestamp = Math.floor(now.getTime() / 1000);
    setTimestamp(currentTimestamp.toString());
    timestampToDateTime(currentTimestamp.toString());
  };
  
  // 使用常用时间戳
  const handleUseCommonTimestamp = (ts: number) => {
    const tsStr = ts.toString();
    setTimestamp(tsStr);
    timestampToDateTime(tsStr);
  };
  
  // 复制时间戳到剪贴板
  const copyTimestamp = () => {
    if (!timestamp) return;
    
    navigator.clipboard.writeText(timestamp)
      .then(() => {
        setCopiedTimestamp(true);
        setTimeout(() => setCopiedTimestamp(false), 2000);
      })
      .catch(err => console.error(t('tools.timestamp_converter.copy_failed'), err));
  };
  
  // 复制日期时间到剪贴板
  const copyDateTime = () => {
    if (!formattedDateTime) return;
    
    navigator.clipboard.writeText(formattedDateTime)
      .then(() => {
        setCopiedDateTime(true);
        setTimeout(() => setCopiedDateTime(false), 2000);
      })
      .catch(err => console.error(t('tools.timestamp_converter.copy_failed'), err));
  };
  
  // 交换时间戳和日期时间位置
  const swapPositions = () => {
    // 添加动画过渡效果
    const container = document.getElementById('converter-container');
    if (container) {
      container.classList.add('animate-pulse');
      setTimeout(() => {
        container.classList.remove('animate-pulse');
      }, 500);
    }
    
    // 切换位置状态
    setSwapped(!swapped);
  };

  // 使用当前时间更新日期时间输入
  const setCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const nowDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    setDateTime(nowDateTime);
    setFormattedDateTime(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
    
    // 转换为时间戳
    const timestamp = Math.floor(now.getTime() / 1000);
    setTimestamp(timestamp.toString());
  };

  // 渲染时间戳区域
  const renderTimestampSection = () => (
    <div id="timestamp-section" className="flex flex-col gap-4 transition-all duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-primary">{t('tools.timestamp_converter.timestamp')}</h2>
        <div className="flex items-center text-xs text-tertiary">
          <span className="mr-1">{t('tools.timestamp_converter.current_time_colon')}</span>
          <span>{displayTimestamp}</span>
        </div>
      </div>
      
      <div className="relative">
        <input
          type="text"
          value={timestamp}
          onChange={handleTimestampChange}
          placeholder={t('tools.timestamp_converter.enter_unix_timestamp')}
          className={styles.input}
        />
        <button 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-purple transition-colors"
          onClick={refreshWithCurrentTime}
          title={t('tools.timestamp_converter.use_current_time')}
        >
          <FontAwesomeIcon icon={faSync} />
        </button>
      </div>

      <div className="text-sm text-tertiary flex gap-2 flex-wrap items-center">
        <span className="whitespace-nowrap">{t('tools.timestamp_converter.common_timestamps')}:</span>
        <div className="flex flex-wrap gap-2">
          {commonTimestamps.map((ts, index) => (
            <button
              key={index}
              className={styles.secondaryBtn}
              onClick={() => handleUseCommonTimestamp(ts.value)}
            >
              {ts.label}
            </button>
          ))}
        </div>
      </div>
      
      {timestamp && (
        <div className="flex items-center justify-between gap-2">
          <div className={styles.formattedBlock}>
            <code>{timestamp}</code>
          </div>
          <button 
            onClick={copyTimestamp}
            className={styles.iconButton}
            title={t('tools.timestamp_converter.copy_timestamp')}
          >
            <FontAwesomeIcon icon={copiedTimestamp ? faCheck : faCopy} />
          </button>
        </div>
      )}
    </div>
  );
  
  // 渲染日期时间区域
  const renderDateTimeSection = () => (
    <div id="datetime-section" className="flex flex-col gap-4 transition-all duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-primary">{t('tools.timestamp_converter.datetime')}</h2>
      </div>
      
      <div className="relative">
        <input
          type="text"
          value={dateTime}
          onChange={handleDateTimeChange}
          placeholder={t('tools.timestamp_converter.enter_datetime')}
          className={styles.input}
        />
        <button 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-purple transition-colors"
          onClick={setCurrentDateTime}
          title={t('tools.timestamp_converter.use_current_time')}
        >
          <FontAwesomeIcon icon={faSync} />
        </button>
      </div>
      
      {formattedDateTime && (
        <div className="flex items-center justify-between gap-2">
          <div className={styles.formattedBlock}>
            <code>{formattedDateTime}</code>
          </div>
          <button 
            onClick={copyDateTime}
            className={styles.iconButton}
            title={t('tools.timestamp_converter.copy_datetime')}
          >
            <FontAwesomeIcon icon={copiedDateTime ? faCheck : faCopy} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col max-w-[1440px] mx-auto p-4 md:p-6">
      <ToolHeader
        icon={faClock}
        toolCode="timestamp_converter"
        title=""
        description=""
      />
      
      <div id="converter-container" className="relative card p-6">
        <div className={`grid gap-6 ${swapped ? 'grid-rows-[auto_auto]' : 'grid-rows-[auto_auto]'}`}>
          {swapped ? (
            <>
              {renderDateTimeSection()}
              {renderTimestampSection()}
            </>
          ) : (
            <>
              {renderTimestampSection()}
              {renderDateTimeSection()}
            </>
          )}
        </div>
        
        <button 
          className={`absolute left-1/2 -translate-x-1/2 ${swapped ? 'top-[calc(50%+1rem)]' : 'top-[calc(50%+1rem)]'} ${styles.swapBtn}`}
          onClick={swapPositions}
          title={t('tools.timestamp_converter.swap_positions')}
        >
          <FontAwesomeIcon icon={faExchangeAlt} className={`${swapped ? 'rotate-90' : 'rotate-90'} transition-transform`} />
        </button>
      </div>
    </div>
  );
} 