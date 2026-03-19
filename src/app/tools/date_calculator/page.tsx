'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faCopy, faCheck, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import ToolHeader from '@/components/ToolHeader';
import { useLanguage } from '@/context/LanguageContext';

// 添加CSS变量样式
const styles = {
  card: "card p-6",
  input: "search-input w-full",
  textarea: "w-full p-3 bg-block border border-purple-glow rounded-lg text-primary focus:border-[#6366F1] focus:outline-none focus:ring-1 focus:ring-[#6366F1] transition-all",
  label: "text-secondary font-medium", 
  secondaryText: "text-sm text-tertiary",
  resultItem: "flex justify-between items-center py-2 border-b border-purple-glow/10",
  resultLabel: "text-sm text-secondary",
  resultValue: "text-sm text-primary font-semibold",
  iconButton: "text-tertiary hover:text-purple transition-colors",
  button: "text-left w-full px-3 py-2 rounded-md text-sm text-secondary hover:bg-block-hover transition-colors",
  tabButton: "px-3 py-2 text-sm font-medium transition-all",
  activeTab: "bg-block text-primary shadow-sm",
  inactiveTab: "text-tertiary",
  secondaryBtn: "flex items-center gap-1 text-sm px-2 py-1 rounded bg-block-strong hover:bg-block-hover text-secondary transition-colors",
  formGroup: "mb-6",
  dateInput: "search-input w-full text-primary bg-block border border-purple-glow rounded-md focus:border-purple focus:outline-none px-3 py-2",
  resultBox: "p-3 bg-block rounded-md border border-purple-glow mb-4",
  dateUnitSelector: "grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4",
}

// 时间单位常量
enum TimeUnit {
  YEARS = 'years',
  MONTHS = 'months',
  WEEKS = 'weeks',
  DAYS = 'days',
  HOURS = 'hours',
  MINUTES = 'minutes',
}

// 格式化日期为显示格式
const formatDateForDisplay = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 格式化日期为输入框格式
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function DateCalculator() {
  const { t } = useLanguage();
  
  // 模式: 计算日期差值 or 添加/减去日期
  const [mode, setMode] = useState<'diff' | 'add'>('diff');
  
  // 日期差值计算的状态
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [diffResult, setDiffResult] = useState<{[key: string]: number}>({});
  
  // 日期加减的状态
  const [baseDate, setBaseDate] = useState<string>('');
  const [timeAmount, setTimeAmount] = useState<number>(1);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>(TimeUnit.DAYS);
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
  const [addResult, setAddResult] = useState<string>('');
  
  // 复制状态
  const [copied, setCopied] = useState<string | null>(null);
  
  // 初始化日期
  useEffect(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    setStartDate(formatDateForInput(oneWeekAgo));
    setEndDate(formatDateForInput(now));
    setBaseDate(formatDateForInput(now));
    
    // 初始化时计算一次
    calculateDateDiff(formatDateForInput(oneWeekAgo), formatDateForInput(now));
    calculateDateAddition(formatDateForInput(now), timeAmount, timeUnit, operation);
  }, []);
  
  // 计算日期差值
  const calculateDateDiff = (start: string, end: string) => {
    if (!start || !end) return;
    
    try {
      const startDateTime = new Date(start);
      const endDateTime = new Date(end);
      
      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        return;
      }
      
      // 计算毫秒差值
      const diffMs = endDateTime.getTime() - startDateTime.getTime();
      
      // 计算各个单位的差值
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffWeeks = Math.floor(diffDays / 7);
      
      // 计算月份差
      let months = (endDateTime.getFullYear() - startDateTime.getFullYear()) * 12;
      months += endDateTime.getMonth() - startDateTime.getMonth();
      
      // 计算年份差
      const diffYears = Math.floor(months / 12);
      
      // 设置结果
      setDiffResult({
        years: diffYears,
        months: months,
        weeks: diffWeeks,
        days: diffDays,
        hours: diffHours,
        minutes: diffMinutes,
        seconds: diffSeconds,
        milliseconds: diffMs
      });
    } catch (error) {
      console.error(t('tools.date_calculator.error.calculation_error'), error);
    }
  };
  
  // 计算日期加减
  const calculateDateAddition = (base: string, amount: number, unit: TimeUnit, op: 'add' | 'subtract') => {
    if (!base || isNaN(amount)) return;
    
    try {
      const baseDateTime = new Date(base);
      
      if (isNaN(baseDateTime.getTime())) {
        return;
      }
      
      const resultDate = new Date(baseDateTime);
      const sign = op === 'add' ? 1 : -1;
      
      switch (unit) {
        case TimeUnit.YEARS:
          resultDate.setFullYear(resultDate.getFullYear() + sign * amount);
          break;
        case TimeUnit.MONTHS:
          resultDate.setMonth(resultDate.getMonth() + sign * amount);
          break;
        case TimeUnit.WEEKS:
          resultDate.setDate(resultDate.getDate() + sign * amount * 7);
          break;
        case TimeUnit.DAYS:
          resultDate.setDate(resultDate.getDate() + sign * amount);
          break;
        case TimeUnit.HOURS:
          resultDate.setHours(resultDate.getHours() + sign * amount);
          break;
        case TimeUnit.MINUTES:
          resultDate.setMinutes(resultDate.getMinutes() + sign * amount);
          break;
      }
      
      // 格式化结果
      setAddResult(formatDateForDisplay(resultDate));
    } catch (error) {
      console.error(t('tools.date_calculator.error.calculation_error'), error);
    }
  };
  
  // 处理开始日期变更
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartDate(value);
    calculateDateDiff(value, endDate);
  };
  
  // 处理结束日期变更
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndDate(value);
    calculateDateDiff(startDate, value);
  };
  
  // 处理基准日期变更
  const handleBaseDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBaseDate(value);
    calculateDateAddition(value, timeAmount, timeUnit, operation);
  };
  
  // 处理时间数量变更
  const handleTimeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setTimeAmount(value);
      calculateDateAddition(baseDate, value, timeUnit, operation);
    }
  };
  
  // 处理时间单位变更
  const handleTimeUnitChange = (unit: TimeUnit) => {
    setTimeUnit(unit);
    calculateDateAddition(baseDate, timeAmount, unit, operation);
  };
  
  // 处理操作变更
  const handleOperationChange = (op: 'add' | 'subtract') => {
    setOperation(op);
    calculateDateAddition(baseDate, timeAmount, timeUnit, op);
  };
  
  // 复制结果
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(type);
        setTimeout(() => setCopied(null), 1500);
      })
      .catch(err => console.error(t('tools.date_calculator.error.copy_failed'), err));
  };
  
  // 设置开始日期为当前时间
  const setStartDateToCurrent = () => {
    const now = formatDateForInput(new Date());
    setStartDate(now);
    calculateDateDiff(now, endDate);
  };
  
  // 设置结束日期为当前时间
  const setEndDateToCurrent = () => {
    const now = formatDateForInput(new Date());
    setEndDate(now);
    calculateDateDiff(startDate, now);
  };
  
  // 设置基准日期为当前时间
  const setBaseDateToCurrent = () => {
    const now = formatDateForInput(new Date());
    setBaseDate(now);
    calculateDateAddition(now, timeAmount, timeUnit, operation);
  };
  
  // 交换开始和结束日期
  const swapDates = () => {
    const temp = startDate;
    setStartDate(endDate);
    setEndDate(temp);
    calculateDateDiff(endDate, temp);
  };
  
  // 渲染时间单位选择器
  const renderUnitSelector = () => {
    const units = [
      { value: TimeUnit.YEARS, label: t('tools.date_calculator.diff_calculator.year_unit') },
      { value: TimeUnit.MONTHS, label: t('tools.date_calculator.diff_calculator.month_unit') },
      { value: TimeUnit.WEEKS, label: t('tools.date_calculator.diff_calculator.week_unit') },
      { value: TimeUnit.DAYS, label: t('tools.date_calculator.diff_calculator.day_unit') },
      { value: TimeUnit.HOURS, label: t('tools.date_calculator.diff_calculator.hour_unit') },
      { value: TimeUnit.MINUTES, label: t('tools.date_calculator.diff_calculator.minute_unit') },
    ];
    
    return (
      <div className={styles.dateUnitSelector}>
        {units.map(unit => (
          <button
            key={unit.value}
            className={`btn-secondary px-2 py-1 text-xs ${timeUnit === unit.value ? 'bg-purple-glow/20 border-purple text-primary' : ''}`}
            onClick={() => handleTimeUnitChange(unit.value)}
          >
            {unit.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col max-w-[1440px] mx-auto p-4 md:p-6">
      <ToolHeader 
        icon={faCalendarAlt}
        toolCode="date_calculator"
        title=""
        description=""
      />
      
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div className="flex items-center bg-block rounded-md p-1">
          <button
            className={`${styles.tabButton} ${mode === 'diff' ? styles.activeTab : styles.inactiveTab} rounded-l-md`}
            onClick={() => setMode('diff')}
          >
            {t('tools.date_calculator.mode.diff')}
          </button>
          <button
            className={`${styles.tabButton} ${mode === 'add' ? styles.activeTab : styles.inactiveTab} rounded-r-md`}
            onClick={() => setMode('add')}
          >
            {t('tools.date_calculator.mode.add')}
          </button>
        </div>
      </div>
      
      {/* 日期差值计算 */}
      {mode === 'diff' && (
        <div className={styles.card}>
          <h2 className="text-lg font-medium text-primary mb-4">{t('tools.date_calculator.diff_calculator.title')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 输入部分 */}
            <div className="space-y-6">
              <div>
                <label className={styles.label}>{t('tools.date_calculator.diff_calculator.start_date')}</label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="datetime-local"
                    className={styles.dateInput}
                    value={startDate}
                    onChange={handleStartDateChange}
                  />
                  <button
                    className={styles.secondaryBtn}
                    onClick={setStartDateToCurrent}
                  >
                    {t('tools.date_calculator.diff_calculator.current')}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  className={styles.secondaryBtn}
                  onClick={swapDates}
                >
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                  {t('tools.date_calculator.diff_calculator.swap_dates')}
                </button>
              </div>
              
              <div>
                <label className={styles.label}>{t('tools.date_calculator.diff_calculator.end_date')}</label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="datetime-local"
                    className={styles.dateInput}
                    value={endDate}
                    onChange={handleEndDateChange}
                  />
                  <button
                    className={styles.secondaryBtn}
                    onClick={setEndDateToCurrent}
                  >
                    {t('tools.date_calculator.diff_calculator.current')}
                  </button>
                </div>
              </div>
            </div>
            
            {/* 结果部分 */}
            <div className={styles.resultBox}>
              <h3 className="text-primary font-medium mb-3">{t('tools.date_calculator.diff_calculator.result_title')}</h3>
              
              <div className="space-y-2">
                {Object.keys(diffResult).length > 0 ? (
                  <>
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>{t('tools.date_calculator.diff_calculator.years')}</span>
                      <div className="flex items-center gap-2">
                        <span className={styles.resultValue}>{diffResult.years} {t('tools.date_calculator.diff_calculator.year_unit')}</span>
                        <button
                          onClick={() => copyToClipboard(diffResult.years.toString(), 'years')}
                          className={styles.iconButton}
                        >
                          <FontAwesomeIcon icon={copied === 'years' ? faCheck : faCopy} />
                        </button>
                      </div>
                    </div>
                    
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>{t('tools.date_calculator.diff_calculator.months')}</span>
                      <div className="flex items-center gap-2">
                        <span className={styles.resultValue}>{diffResult.months} {t('tools.date_calculator.diff_calculator.month_unit')}</span>
                        <button
                          onClick={() => copyToClipboard(diffResult.months.toString(), 'months')}
                          className={styles.iconButton}
                        >
                          <FontAwesomeIcon icon={copied === 'months' ? faCheck : faCopy} />
                        </button>
                      </div>
                    </div>
                    
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>{t('tools.date_calculator.diff_calculator.weeks')}</span>
                      <div className="flex items-center gap-2">
                        <span className={styles.resultValue}>{diffResult.weeks} {t('tools.date_calculator.diff_calculator.week_unit')}</span>
                        <button
                          onClick={() => copyToClipboard(diffResult.weeks.toString(), 'weeks')}
                          className={styles.iconButton}
                        >
                          <FontAwesomeIcon icon={copied === 'weeks' ? faCheck : faCopy} />
                        </button>
                      </div>
                    </div>
                    
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>{t('tools.date_calculator.diff_calculator.days')}</span>
                      <div className="flex items-center gap-2">
                        <span className={styles.resultValue}>{diffResult.days} {t('tools.date_calculator.diff_calculator.day_unit')}</span>
                        <button
                          onClick={() => copyToClipboard(diffResult.days.toString(), 'days')}
                          className={styles.iconButton}
                        >
                          <FontAwesomeIcon icon={copied === 'days' ? faCheck : faCopy} />
                        </button>
                      </div>
                    </div>
                    
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>{t('tools.date_calculator.diff_calculator.hours')}</span>
                      <div className="flex items-center gap-2">
                        <span className={styles.resultValue}>{diffResult.hours} {t('tools.date_calculator.diff_calculator.hour_unit')}</span>
                        <button
                          onClick={() => copyToClipboard(diffResult.hours.toString(), 'hours')}
                          className={styles.iconButton}
                        >
                          <FontAwesomeIcon icon={copied === 'hours' ? faCheck : faCopy} />
                        </button>
                      </div>
                    </div>
                    
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>{t('tools.date_calculator.diff_calculator.minutes')}</span>
                      <div className="flex items-center gap-2">
                        <span className={styles.resultValue}>{diffResult.minutes} {t('tools.date_calculator.diff_calculator.minute_unit')}</span>
                        <button
                          onClick={() => copyToClipboard(diffResult.minutes.toString(), 'minutes')}
                          className={styles.iconButton}
                        >
                          <FontAwesomeIcon icon={copied === 'minutes' ? faCheck : faCopy} />
                        </button>
                      </div>
                    </div>
                    
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>{t('tools.date_calculator.diff_calculator.seconds')}</span>
                      <div className="flex items-center gap-2">
                        <span className={styles.resultValue}>{diffResult.seconds} {t('tools.date_calculator.diff_calculator.second_unit')}</span>
                        <button
                          onClick={() => copyToClipboard(diffResult.seconds.toString(), 'seconds')}
                          className={styles.iconButton}
                        >
                          <FontAwesomeIcon icon={copied === 'seconds' ? faCheck : faCopy} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-tertiary text-center py-4">
                    {t('tools.date_calculator.diff_calculator.no_valid_dates')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 日期加减计算 */}
      {mode === 'add' && (
        <div className={styles.card}>
          <h2 className="text-lg font-medium text-primary mb-4">{t('tools.date_calculator.add_calculator.title')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 输入部分 */}
            <div className="space-y-6">
              <div>
                <label className={styles.label}>{t('tools.date_calculator.add_calculator.base_date')}</label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="datetime-local"
                    className={styles.dateInput}
                    value={baseDate}
                    onChange={handleBaseDateChange}
                  />
                  <button
                    className={styles.secondaryBtn}
                    onClick={setBaseDateToCurrent}
                  >
                    {t('tools.date_calculator.diff_calculator.current')}
                  </button>
                </div>
              </div>
              
              <div>
                <label className={styles.label}>{t('tools.date_calculator.add_calculator.operation')}</label>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    className={`btn-secondary px-3 py-1 ${operation === 'add' ? 'bg-purple-glow/20 border-purple text-primary' : ''}`}
                    onClick={() => handleOperationChange('add')}
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    {t('tools.date_calculator.add_calculator.add')}
                  </button>
                  <button
                    className={`btn-secondary px-3 py-1 ${operation === 'subtract' ? 'bg-purple-glow/20 border-purple text-primary' : ''}`}
                    onClick={() => handleOperationChange('subtract')}
                  >
                    <FontAwesomeIcon icon={faMinus} className="mr-2" />
                    {t('tools.date_calculator.add_calculator.subtract')}
                  </button>
                </div>
              </div>
              
              <div>
                <label className={styles.label}>{t('tools.date_calculator.add_calculator.time_amount')}</label>
                <div className="mt-2">
                  <input
                    type="number"
                    min="1"
                    className={styles.dateInput}
                    value={timeAmount}
                    onChange={handleTimeAmountChange}
                  />
                </div>
              </div>
              
              <div>
                <label className={styles.label}>{t('tools.date_calculator.add_calculator.time_unit')}</label>
                <div className="mt-2">
                  {renderUnitSelector()}
                </div>
              </div>
            </div>
            
            {/* 结果部分 */}
            <div className={styles.resultBox}>
              <h3 className="text-primary font-medium mb-4">{t('tools.date_calculator.add_calculator.result_title')}</h3>
              
              {addResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-block-strong rounded-md text-center">
                    <div className="text-tertiary text-sm mb-1">
                      {operation === 'add' 
                        ? t('tools.date_calculator.add_calculator.add_result').replace('{amount}', timeAmount.toString()).replace('{unit}', 
                          timeUnit === TimeUnit.YEARS ? t('tools.date_calculator.diff_calculator.year_unit') : 
                          timeUnit === TimeUnit.MONTHS ? t('tools.date_calculator.diff_calculator.month_unit') : 
                          timeUnit === TimeUnit.WEEKS ? t('tools.date_calculator.diff_calculator.week_unit') : 
                          timeUnit === TimeUnit.DAYS ? t('tools.date_calculator.diff_calculator.day_unit') : 
                          timeUnit === TimeUnit.HOURS ? t('tools.date_calculator.diff_calculator.hour_unit') : 
                          t('tools.date_calculator.diff_calculator.minute_unit'))
                        : t('tools.date_calculator.add_calculator.subtract_result').replace('{amount}', timeAmount.toString()).replace('{unit}', 
                          timeUnit === TimeUnit.YEARS ? t('tools.date_calculator.diff_calculator.year_unit') : 
                          timeUnit === TimeUnit.MONTHS ? t('tools.date_calculator.diff_calculator.month_unit') : 
                          timeUnit === TimeUnit.WEEKS ? t('tools.date_calculator.diff_calculator.week_unit') : 
                          timeUnit === TimeUnit.DAYS ? t('tools.date_calculator.diff_calculator.day_unit') : 
                          timeUnit === TimeUnit.HOURS ? t('tools.date_calculator.diff_calculator.hour_unit') : 
                          t('tools.date_calculator.diff_calculator.minute_unit'))}
                    </div>
                    <div className="text-xl font-medium text-primary">
                      {addResult}
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      className="btn-secondary px-4 py-2"
                      onClick={() => copyToClipboard(addResult, 'result')}
                    >
                      <FontAwesomeIcon icon={copied === 'result' ? faCheck : faCopy} className="mr-2" />
                      {copied === 'result' ? t('tools.date_calculator.add_calculator.copied') : t('tools.date_calculator.add_calculator.copy_result')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-tertiary text-center py-4">
                  {t('tools.date_calculator.add_calculator.no_valid_input')}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-primary font-medium mb-2">{t('tools.date_calculator.add_calculator.notes_title')}</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-tertiary">
              <li>{t('tools.date_calculator.add_calculator.note1')}</li>
              <li>{t('tools.date_calculator.add_calculator.note2')}</li>
              <li>{t('tools.date_calculator.add_calculator.note3')}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 