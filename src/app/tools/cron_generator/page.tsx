'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import ToolHeader from '@/components/ToolHeader';
import { useLanguage } from '@/context/LanguageContext';
import { CronExpressionParser } from 'cron-parser';
import cronstrue from 'cronstrue/i18n';

// 添加CSS变量样式
const styles = {
  card: "card p-6",
  input: "search-input w-full",
  secondaryBtn: "btn-secondary text-xs px-3 py-1",
  primaryBtn: "btn-primary text-xs px-3 py-1 mr-2",
  primaryText: "text-primary",
  secondaryText: "text-secondary",
  tertiaryText: "text-tertiary",
  formattedBlock: "p-2 bg-block rounded-md border border-purple-glow w-full",
  codeBlock: "bg-block px-1 rounded",
  iconButton: "text-tertiary hover:text-purple transition-colors",
  radioGroup: "flex gap-2 mb-4 flex-wrap",
  radioItem: "px-2 py-1 rounded cursor-pointer border text-tertiary",
  radioItemSelected: "px-2 py-1 rounded cursor-pointer border border-purple bg-purple/10 text-purple",
  label: "block mb-1 text-sm text-tertiary",
  wrapper: "mb-6",
  errorText: "text-red-500 mt-1 text-sm",
  presetButton: "btn-secondary w-full text-left mb-2 px-3 py-2 text-sm",
  previewBox: "rounded-md bg-purple/5 p-3 border border-purple/20 text-sm mb-3",
  executionsList: "rounded-md border border-purple/10 max-h-96 overflow-y-auto text-sm mt-2",
  executionItem: "p-2 border-b border-purple/10 last:border-0",
  selectBox: "search-input text-sm w-full mb-2"
};

// 预设的cron表达式
const presets = [
  { label: 'every_minute', value: '* * * * *' },        // 每分钟
  { label: 'every_hour', value: '0 * * * *' },          // 每小时
  { label: 'every_day_midnight', value: '0 0 * * *' },  // 每天零点
  { label: 'every_day_morning', value: '0 8 * * *' },   // 每天早8点
  { label: 'every_monday', value: '0 9 * * MON' },      // 每周一上午9点
  { label: 'every_month_first', value: '0 0 1 * *' },   // 每月1号零点
];

// 表达式类型
type ExpressionType = 'every' | 'specific' | 'range' | 'interval' | 'not_specified';

// 表达式部分字段定义
interface ExpressionField {
  type: ExpressionType;
  value?: string | number;
  start?: string | number;
  end?: string | number;
  step?: string | number;
}

// 默认值配置
interface FieldDefaultValues {
  value: string | number;
  start: string | number;
  end: string | number;
  step: number;
}

export default function CronGenerator() {
  const { t } = useLanguage();
  const [currentLanguage, setCurrentLanguage] = useState('zh');

  // 使用一个有效的预设作为初始表达式 - 每天零点（无秒格式）
  const [customExpression, setCustomExpression] = useState('0 0 * * *');
  const [isCustomExpressionValid, setIsCustomExpressionValid] = useState(true);
  const [hasUserEdited, setHasUserEdited] = useState(false);

  // 生成的表达式
  const [generatedExpression, setGeneratedExpression] = useState('0 0 * * *');
  
  // 表达式的可读描述
  const [expressionDescription, setExpressionDescription] = useState('');
  
  // 下一次执行时间
  const [nextExecutions, setNextExecutions] = useState<string[]>([]);
  
  // 复制状态
  const [copied, setCopied] = useState(false);
  
  // 执行次数
  const [executionCount, setExecutionCount] = useState(10);
  
  // 表达式各部分的设置
  const [second, setSecond] = useState<ExpressionField>({ type: 'specific', value: 0 });
  const [minute, setMinute] = useState<ExpressionField>({ type: 'specific', value: 0 });
  const [hour, setHour] = useState<ExpressionField>({ type: 'specific', value: 0 });
  const [day, setDay] = useState<ExpressionField>({ type: 'every' });
  const [month, setMonth] = useState<ExpressionField>({ type: 'every' });
  const [week, setWeek] = useState<ExpressionField>({ type: 'not_specified' });
  const [year, setYear] = useState<ExpressionField>({ type: 'not_specified' });

  // 监听语言变化
  useEffect(() => {
    if (t) {
      setCurrentLanguage(t('language_code') || 'zh');
    }
  }, [t]);

  // 组件初始化时，设置一个安全的默认状态
  useEffect(() => {
    try {
      // 安全地初始化
      setCustomExpression('0 0 * * *'); // 每天零点（标准5字段格式）
      setGeneratedExpression('0 0 * * *');
      
      // 避免初始化时触发解析
      setTimeout(() => {
        parseCustomExpression(); 
      }, 100);
    } catch (err) {
      console.error('Initialization error:', err);
    }
  }, []);

  // 当自定义表达式变化时，解析并更新
  useEffect(() => {
    parseCustomExpression();
  }, [customExpression, currentLanguage, executionCount]);

  // 当生成的各部分发生变化时，更新生成的表达式
  useEffect(() => {
    generateExpression();
  }, [second, minute, hour, day, month, week, year]);

  // 解析自定义表达式
  const parseCustomExpression = () => {
    if (!customExpression || customExpression.trim() === '') {
      setIsCustomExpressionValid(false);
      setNextExecutions([]);
      setExpressionDescription('');
      return;
    }
    
    try {
      // 处理Cron表达式格式
      let parsableCronExpression = customExpression.trim();
      
      // cron-parser 不支持 '?' 作为通配符，将其替换为 '*'
      parsableCronExpression = parsableCronExpression.replace(/\?/g, '*');
      
      // 分割表达式并计算字段数
      const fields = parsableCronExpression.split(/\s+/).filter(Boolean);
      
      // cron-parser要求标准的cron格式（5个字段，无秒）
      // 如果有6个字段（带秒），需要特殊处理
      let intervalExpression = parsableCronExpression;
      let hasSeconds = false;
      
      if (fields.length === 6) {
        // 6个字段(带秒)，提取出秒字段，使用其余5个字段
        hasSeconds = true;
        intervalExpression = fields.slice(1).join(' '); // 去掉秒字段
      } else if (fields.length !== 5) {
        throw new Error(`Invalid cron expression: expected 5 or 6 fields, got ${fields.length}`);
      }
      
      // 使用5个字段格式解析
      const options = { 
        currentDate: new Date(),
        utc: false
      };
      
      const interval = CronExpressionParser.parse(intervalExpression, options);
      
      // 获取下一次执行时间
      const next: string[] = [];
      let iterCount = 0;
      try {
        for (const date of interval) {
          if (iterCount >= executionCount) break;
          // 如果原表达式带有秒字段，且秒字段不是'0'或'*'，则需要调整生成的时间
          if (hasSeconds && fields[0] !== '0' && fields[0] !== '*') {
            // 获取下一个执行的分钟，然后加上秒字段值
            const execDate = date.toDate();
            // 这里简化处理，直接使用原始时间
            next.push(execDate.toLocaleString());
          } else {
            next.push(date.toDate().toLocaleString());
          }
          iterCount++;
        }
        
        setNextExecutions(next);
        setIsCustomExpressionValid(true);
      } catch (iterErr) {
        console.error('Error getting next execution times:', iterErr);
        setNextExecutions([]);
        setIsCustomExpressionValid(false);
      }
      
      // 获取表达式的可读描述
      try {
        const cronOptions = { 
          locale: currentLanguage,
          use24HourTimeFormat: true,
          verbose: true,
          throwExceptionOnParseError: false, 
          includeSeconds: hasSeconds
        };
        const description = cronstrue.toString(parsableCronExpression, cronOptions);
        setExpressionDescription(description);
      } catch (e) {
        console.error('Failed to get expression description:', e);
        setExpressionDescription('');
      }
    } catch (e) {
      console.error('Invalid cron expression:', e);
      setIsCustomExpressionValid(false);
      setNextExecutions([]);
      setExpressionDescription('');
    }
  };

  // 生成表达式
  const generateExpression = () => {
    // 获取每个字段的值
    // 注意：生成5字段标准Cron格式（不包含秒）
    const minuteValue = getFieldValue(minute, '*');
    const hourValue = getFieldValue(hour, '*');
    const dayValue = getFieldValue(day, '*');
    const monthValue = getFieldValue(month, '*');
    const weekValue = getFieldValue(week, '?').replace('?', '*'); // 确保替换?为*
    
    // 组合成完整表达式
    const expression = `${minuteValue} ${hourValue} ${dayValue} ${monthValue} ${weekValue}`;
    
    setGeneratedExpression(expression);
    setCustomExpression(expression);
    // 生成新表达式时重置用户编辑状态
    setHasUserEdited(false);
  };

  // 根据字段类型获取对应的值
  const getFieldValue = (field: ExpressionField, defaultValue: string): string => {
    switch (field.type) {
      case 'every':
        return defaultValue;
      case 'specific':
        return field.value?.toString() || defaultValue;
      case 'range':
        return `${field.start}-${field.end}`;
      case 'interval':
        return `${field.start || '*'}/${field.step || 1}`;
      case 'not_specified':
        return defaultValue === '?' ? '?' : '*';
      default:
        return defaultValue;
    }
  };

  // 处理表达式类型变更
  const handleTypeChange = (field: string, type: ExpressionType) => {
    const defaultValues: Record<string, FieldDefaultValues> = {
      'second': { value: 0, start: 0, end: 59, step: 1 },
      'minute': { value: 0, start: 0, end: 59, step: 1 },
      'hour': { value: 0, start: 0, end: 23, step: 1 },
      'day': { value: 1, start: 1, end: 31, step: 1 },
      'month': { value: 1, start: 1, end: 12, step: 1 },
      'week': { value: 'MON', start: 'MON', end: 'FRI', step: 1 },
      'year': { value: 2024, start: 2024, end: 2030, step: 1 }
    };

    const newField: ExpressionField = { 
      type, 
      value: defaultValues[field].value,
      start: defaultValues[field].start,
      end: defaultValues[field].end,
      step: defaultValues[field].step
    };

    switch (field) {
      case 'second':
        setSecond(newField);
        break;
      case 'minute':
        setMinute(newField);
        break;
      case 'hour':
        setHour(newField);
        break;
      case 'day':
        setDay(newField);
        break;
      case 'month':
        setMonth(newField);
        break;
      case 'week':
        setWeek(newField);
        break;
      case 'year':
        setYear(newField);
        break;
    }
  };

  // 处理字段属性变更
  const handleFieldChange = (field: string, prop: string, value: string | number) => {
    const updateField = (current: ExpressionField): ExpressionField => {
      return { ...current, [prop]: value };
    };

    switch (field) {
      case 'second':
        setSecond(updateField(second));
        break;
      case 'minute':
        setMinute(updateField(minute));
        break;
      case 'hour':
        setHour(updateField(hour));
        break;
      case 'day':
        setDay(updateField(day));
        break;
      case 'month':
        setMonth(updateField(month));
        break;
      case 'week':
        setWeek(updateField(week));
        break;
      case 'year':
        setYear(updateField(year));
        break;
    }
  };

  // 复制表达式
  const copyExpression = () => {
    try {
      navigator.clipboard.writeText(customExpression);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(t('tools.cron_generator.copy_failed'), err);
    }
  };

  // 渲染表达式类型选择
  const renderTypeOptions = (field: string, currentType: ExpressionType) => {
    const types: ExpressionType[] = ['every', 'specific', 'range', 'interval'];
    
    // 只有day和week可以互斥（一个指定了，另一个可以不指定）
    if (field === 'day' || field === 'week') {
      types.push('not_specified');
    }
    
    return (
      <div className={styles.radioGroup}>
        {types.map((type) => (
          <div
            key={type}
            className={currentType === type ? styles.radioItemSelected : styles.radioItem}
            onClick={() => handleTypeChange(field, type)}
          >
            {t(`tools.cron_generator.${type}`)}
          </div>
        ))}
      </div>
    );
  };

  // 渲染表达式字段输入
  const renderFieldInput = (field: string, currentField: ExpressionField) => {
    const options: Record<string, string[]> = {
      'month': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      'week': ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
    };

    switch (currentField.type) {
      case 'specific':
        if (field === 'month' || field === 'week') {
          return (
            <select
              className={styles.selectBox}
              value={currentField.value?.toString()}
              onChange={(e) => handleFieldChange(field, 'value', e.target.value)}
            >
              {options[field].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          );
        } else {
          return (
            <input
              type="number"
              className={styles.input}
              value={currentField.value}
              onChange={(e) => handleFieldChange(field, 'value', parseInt(e.target.value))}
            />
          );
        }
      
      case 'range':
        if (field === 'month' || field === 'week') {
          return (
            <div className="flex items-center gap-2">
              <select
                className={styles.selectBox}
                value={currentField.start?.toString()}
                onChange={(e) => handleFieldChange(field, 'start', e.target.value)}
              >
                {options[field].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <span>{t('tools.cron_generator.to')}</span>
              <select
                className={styles.selectBox}
                value={currentField.end?.toString()}
                onChange={(e) => handleFieldChange(field, 'end', e.target.value)}
              >
                {options[field].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          );
        } else {
          return (
            <div className="flex items-center gap-2">
              <input
                type="number"
                className={styles.input}
                value={currentField.start}
                onChange={(e) => handleFieldChange(field, 'start', parseInt(e.target.value))}
              />
              <span>{t('tools.cron_generator.to')}</span>
              <input
                type="number"
                className={styles.input}
                value={currentField.end}
                onChange={(e) => handleFieldChange(field, 'end', parseInt(e.target.value))}
              />
            </div>
          );
        }
      
      case 'interval':
        return (
          <div className="flex items-center gap-2">
            <span>{t('tools.cron_generator.from')}</span>
            <input
              type="number"
              className={styles.input}
              value={currentField.start === '*' ? '' : currentField.start}
              placeholder="*"
              onChange={(e) => handleFieldChange(field, 'start', e.target.value ? parseInt(e.target.value) : '*')}
            />
            <span>{t('tools.cron_generator.step')}</span>
            <input
              type="number"
              className={styles.input}
              value={currentField.step}
              onChange={(e) => handleFieldChange(field, 'step', parseInt(e.target.value) || 1)}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderFieldSection = (field: string, currentField: ExpressionField, label: string) => {
    return (
      <div className={styles.wrapper}>
        <div className="font-medium mb-2">{label}</div>
        {renderTypeOptions(field, currentField.type)}
        {renderFieldInput(field, currentField)}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <ToolHeader
        toolCode="cron_generator"
        icon={faCalendarAlt} 
        title={t('tools.cron_generator.title')}
        description={t('tools.cron_generator.description')}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：生成表达式 */}
        <div className="lg:col-span-2">
          <div className={styles.card}>
            <h2 className="text-xl font-medium mb-4">{t('tools.cron_generator.generate')}</h2>
            
            {/* 不显示秒字段
            {renderFieldSection('second', second, t('tools.cron_generator.second'))} */}
            {renderFieldSection('minute', minute, t('tools.cron_generator.minute'))}
            {renderFieldSection('hour', hour, t('tools.cron_generator.hour'))}
            {renderFieldSection('day', day, t('tools.cron_generator.day'))}
            {renderFieldSection('month', month, t('tools.cron_generator.month'))}
            {renderFieldSection('week', week, t('tools.cron_generator.week'))}
            {/* 不显示年字段 
            {renderFieldSection('year', year, t('tools.cron_generator.year'))} */}
          </div>
        </div>
        
        {/* 右侧：预览和解析 */}
        <div>
          <div className={styles.card}>
            <h2 className="text-xl font-medium mb-4">{t('tools.cron_generator.expression_preview')}</h2>
            
            <div className={styles.previewBox}>
              <div className="flex items-center justify-between">
                <span className="font-mono">{generatedExpression}</span>
                <button 
                  className={styles.iconButton} 
                  onClick={copyExpression}
                  title={t('tools.cron_generator.copy_expression')}
                >
                  <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                </button>
              </div>
              {expressionDescription && (
                <div className="mt-2 text-tertiary">
                  {expressionDescription}
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <label className={styles.label}>{t('tools.cron_generator.custom_expression')}</label>
              <input
                type="text"
                className={styles.input}
                value={customExpression}
                onChange={(e) => {
                  setCustomExpression(e.target.value);
                  setHasUserEdited(true);
                }}
              />
              {!isCustomExpressionValid && hasUserEdited && (
                <div className={styles.errorText}>{t('tools.cron_generator.invalid_expression')}</div>
              )}
            </div>
            
            <div className="mb-4">
              <label className={styles.label}>{t('tools.cron_generator.next_executions_count')}</label>
              <input
                type="number"
                className={styles.input}
                value={executionCount}
                onChange={(e) => setExecutionCount(parseInt(e.target.value) || 10)}
                min="1"
                max="100"
              />
            </div>
            
            {/* 执行时间列表移到这里 */}
            {nextExecutions.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xl font-medium mb-4">{t('tools.cron_generator.execution_times')}</h2>
                <div className={styles.executionsList}>
                  {nextExecutions.map((time, index) => (
                    <div key={index} className={styles.executionItem}>
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-purple" />
                      {time}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* 常用表达式放在单独的卡片中 */}
          <div className={`${styles.card} mt-4`}>
            <h2 className="text-xl font-medium mb-4">{t('tools.cron_generator.presets')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  className={styles.presetButton}
                  onClick={() => {
                    setCustomExpression(preset.value);
                    setHasUserEdited(false);
                  }}
                >
                  {t(`tools.cron_generator.${preset.label}`)}
                  <div className="text-xs text-tertiary mt-1">{preset.value}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 