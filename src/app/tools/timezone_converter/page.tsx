'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import ToolHeader from '@/components/ToolHeader';
import { useLanguage } from '@/context/LanguageContext';

// 添加CSS变量样式
const styles = {
  card: "card p-6",
  input: "search-input w-full",
  textarea: "w-full p-3 bg-block border border-purple-glow rounded-lg text-primary focus:border-[#6366F1] focus:outline-none focus:ring-1 focus:ring-[#6366F1] transition-all resize-none",
  label: "text-secondary font-medium", 
  secondaryText: "text-sm text-tertiary",
  resultItem: "flex justify-between items-center py-2 border-b border-purple-glow/10",
  resultLabel: "text-sm text-secondary",
  resultValue: "text-sm text-primary font-semibold",
  iconButton: "text-tertiary hover:text-purple transition-colors",
  button: "text-left w-full px-3 py-2 rounded-md text-sm text-secondary hover:bg-block-hover transition-colors",
  formGroup: "mb-6",
  resultBox: "p-2 bg-block rounded border border-purple-glow/30 break-all",
  timezoneList: "bg-block-strong rounded-lg p-4 text-xs text-tertiary",
}

// 获取所有时区
const getTimezones = (): string[] => {
  return [
    'UTC',
    'America/New_York', // 美国东部
    'America/Chicago', // 美国中部
    'America/Denver', // 美国山地
    'America/Los_Angeles', // 美国西部
    'Europe/London', // 英国
    'Europe/Paris', // 法国
    'Europe/Berlin', // 德国
    'Europe/Moscow', // 俄罗斯
    'Asia/Shanghai', // 中国
    'Asia/Tokyo', // 日本
    'Asia/Seoul', // 韩国
    'Asia/Singapore', // 新加坡
    'Asia/Dubai', // 迪拜
    'Asia/Kolkata', // 印度
    'Australia/Sydney', // 澳大利亚悉尼
    'Pacific/Auckland', // 新西兰
    'America/Sao_Paulo', // 巴西
  ];
};

// 时区分组
const timezoneGroups = [
  {
    name: 'asia_pacific',
    zones: [
      { name: 'china', value: 'Asia/Shanghai', offset: '+08:00' },
      { name: 'japan', value: 'Asia/Tokyo', offset: '+09:00' },
      { name: 'korea', value: 'Asia/Seoul', offset: '+09:00' },
      { name: 'singapore', value: 'Asia/Singapore', offset: '+08:00' },
      { name: 'india', value: 'Asia/Kolkata', offset: '+05:30' },
      { name: 'australia', value: 'Australia/Sydney', offset: '+10:00/+11:00' },
    ]
  },
  {
    name: 'europe',
    zones: [
      { name: 'uk', value: 'Europe/London', offset: '+00:00/+01:00' },
      { name: 'france', value: 'Europe/Paris', offset: '+01:00/+02:00' },
      { name: 'germany', value: 'Europe/Berlin', offset: '+01:00/+02:00' },
      { name: 'russia', value: 'Europe/Moscow', offset: '+03:00' },
    ]
  },
  {
    name: 'americas',
    zones: [
      { name: 'us_eastern', value: 'America/New_York', offset: '-05:00/-04:00' },
      { name: 'us_central', value: 'America/Chicago', offset: '-06:00/-05:00' },
      { name: 'us_western', value: 'America/Los_Angeles', offset: '-08:00/-07:00' },
      { name: 'brazil', value: 'America/Sao_Paulo', offset: '-03:00/-02:00' },
    ]
  }
];

// 获取指定时区当前时间
const getCurrentTimeInTimezone = (timezone: string): string => {
  try {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: timezone
    };
    
    return new Intl.DateTimeFormat('zh-CN', options).format(now).replace(/\//g, '-');
  } catch (error) {
    console.error('时区时间错误:', error);
    return '无法获取时区时间';
  }
};

export default function TimezoneConverter() {
  const { t } = useLanguage();
  
  // 日期时间字符串
  const [dateTimeString, setDateTimeString] = useState('');
  // 源时区
  const [sourceTimezone, setSourceTimezone] = useState('Asia/Shanghai');
  // 目标时区
  const [targetTimezone, setTargetTimezone] = useState('America/New_York');
  // 转换结果
  const [convertedTime, setConvertedTime] = useState('');
  // 详细转换结果
  const [conversionDetails, setConversionDetails] = useState('');
  // 可用时区列表
  const [timezones, setTimezones] = useState<string[]>([]);
  // 复制状态
  const [copied, setCopied] = useState(false);
  
  // 初始化时区列表
  useEffect(() => {
    setTimezones(getTimezones());
    
    // 初始化当前时间
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    setDateTimeString(`${year}-${month}-${day}T${hours}:${minutes}`);
  }, []);
  
  // 当输入变化时更新转换结果
  useEffect(() => {
    if (dateTimeString && sourceTimezone && targetTimezone) {
      convertTimezone();
    }
  }, [dateTimeString, sourceTimezone, targetTimezone]);
  
  // 时区转换
  const convertTimezone = () => {
    try {
      if (!dateTimeString) return;
      
      // 创建源时区的日期对象
      const sourceDate = new Date(dateTimeString);
      
      // 检查日期是否有效
      if (isNaN(sourceDate.getTime())) {
        setConvertedTime(t('tools.timezone_converter.invalid_date_time'));
        setConversionDetails(t('tools.timezone_converter.please_enter_valid_date_time'));
        return;
      }
      
      // 获取源时区的时间表示
      const sourceFormatter = new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: sourceTimezone
      });
      
      // 获取目标时区的时间表示
      const targetFormatter = new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: targetTimezone
      });
      
      const sourceFormatted = sourceFormatter.format(sourceDate).replace(/\//g, '-');
      const targetFormatted = targetFormatter.format(sourceDate).replace(/\//g, '-');
      
      setConvertedTime(targetFormatted);
      
      // 构建详细结果
      const sourceTimezoneInfo = Intl.DateTimeFormat('zh-CN', { timeZoneName: 'long', timeZone: sourceTimezone }).format(sourceDate);
      const targetTimezoneInfo = Intl.DateTimeFormat('zh-CN', { timeZoneName: 'long', timeZone: targetTimezone }).format(sourceDate);
      
      const details = `${t('tools.timezone_converter.source_time')}: ${sourceFormatted} (${sourceTimezoneInfo})
${t('tools.timezone_converter.target_time')}: ${targetFormatted} (${targetTimezoneInfo})
${t('tools.timezone_converter.timestamp')}: ${Math.floor(sourceDate.getTime() / 1000)}
${t('tools.timezone_converter.iso_format')}: ${sourceDate.toISOString()}`;
      
      setConversionDetails(details);
    } catch (error) {
      console.error(t('tools.timezone_converter.timezone_conversion_error')+':', error);
      setConvertedTime(t('tools.timezone_converter.timezone_conversion_error'));
      setConversionDetails(t('tools.timezone_converter.timezone_conversion_error'));
    }
  };
  
  // 复制转换结果
  const copyResult = () => {
    if (!convertedTime) return;
    
    navigator.clipboard.writeText(convertedTime)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error(t('tools.timezone_converter.copy_failed')+':', err));
  };
  
  // 使用当前时间
  const useCurrentTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    setDateTimeString(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-[1440px] mx-auto p-4 md:p-6">
      <ToolHeader 
        toolCode="timezone_converter"
        icon={faClock}
        title=""
        description=""
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧面板 */}
        <div className="lg:col-span-7 space-y-6">
          {/* 日期时间输入 */}
          <div className={styles.card}>
            <h2 className="text-lg font-medium text-primary">{t('tools.timezone_converter.date_time')}</h2>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="datetime-local"
                value={dateTimeString}
                onChange={(e) => setDateTimeString(e.target.value)}
                className={styles.input}
              />
              <button
                className="btn-secondary whitespace-nowrap"
                onClick={useCurrentTime}
                title={t('tools.timezone_converter.use_current_time')}
              >
                <FontAwesomeIcon icon={faClock} className="mr-2" />
                {t('tools.timezone_converter.current_time')}
              </button>
            </div>
            
            {/* 源时区选择 */}
            <div className="mt-6">
              <h2 className="text-lg font-medium text-primary">{t('tools.timezone_converter.source_timezone')}</h2>
              <div className="mt-4">
                <select
                  value={sourceTimezone}
                  onChange={(e) => setSourceTimezone(e.target.value)}
                  className={styles.input}
                >
                  {timezones.map(timezone => (
                    <option key={timezone} value={timezone}>
                      {timezone} ({getCurrentTimeInTimezone(timezone)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* 目标时区选择 */}
            <div className="mt-6">
              <h2 className="text-lg font-medium text-primary">{t('tools.timezone_converter.target_timezone')}</h2>
              <div className="mt-4">
                <select
                  value={targetTimezone}
                  onChange={(e) => setTargetTimezone(e.target.value)}
                  className={styles.input}
                >
                  {timezones.map(timezone => (
                    <option key={timezone} value={timezone}>
                      {timezone} ({getCurrentTimeInTimezone(timezone)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* 转换结果 */}
          <div className={styles.card}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-primary">{t('tools.timezone_converter.conversion_result')}</h2>
              <button 
                onClick={copyResult} 
                className={styles.iconButton}
                disabled={!convertedTime}
              >
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="mr-1" />
                {copied ? t('tools.timezone_converter.copied') : t('tools.timezone_converter.copy')}
              </button>
            </div>
            
            {convertedTime ? (
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-secondary">{t('tools.timezone_converter.converted_time')}</h3>
                  <div className="text-primary">
                    {convertedTime}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-secondary">{t('tools.timezone_converter.detailed_result')}</h3>
                  <div className={styles.resultBox}>
                    <pre className="font-mono text-sm text-primary whitespace-pre-wrap">
                      {conversionDetails}
                    </pre>
                  </div>
                  <div className="mt-2 flex flex-col gap-1 text-xs text-tertiary">
                    <p>{t('tools.timezone_converter.timezone_display_note')}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.timezoneList}>
                {t('tools.timezone_converter.input_date_time_select_timezone')}
              </div>
            )}
            
            <div className="mt-2 text-xs text-tertiary">
              <p>{t('tools.timezone_converter.timezone_note')}</p>
            </div>
          </div>
        </div>
        
        {/* 右侧面板 */}
        <div className="lg:col-span-5">
          <div className={styles.card}>
            <h3 className="text-sm font-medium text-secondary mb-2">{t('tools.timezone_converter.common_timezone_info')}</h3>
            <div className={styles.timezoneList}>
              {timezoneGroups.map((group) => (
                <div key={group.name} className="mb-4">
                  <h4 className="font-medium mb-2">{t(`tools.timezone_converter.${group.name}`)}</h4>
                  <div className="pl-2 border-l-2 border-purple-glow/50">
                    {group.zones.map((zone) => (
                      <div key={zone.value} className="mb-2">
                        <div className="font-medium">{t(`tools.timezone_converter.${zone.name}`)}</div>
                        <div className="flex justify-between text-xs">
                          <span>{zone.value}</span>
                          <span>{zone.offset}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="text-xs">
                <p className="mb-2">{t('tools.timezone_converter.about_timezone')}</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>{t('tools.timezone_converter.timezone_offset_info')}</li>
                  <li>{t('tools.timezone_converter.timezone_dst_info')}</li>
                  <li>{t('tools.timezone_converter.dst_implementation')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 