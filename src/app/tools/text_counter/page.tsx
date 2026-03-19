'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator, faCopy, faCheck, faTrash, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
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
}

// 字数统计结果类型
interface CountResult {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  chineseWords: number;
  englishWords: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  chineseCharacters: number;
}

export default function TextCounter() {
  const { t } = useLanguage();
  // 输入文本
  const [text, setText] = useState('');
  // 统计结果
  const [counts, setCounts] = useState<CountResult>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    chineseWords: 0,
    englishWords: 0,
    sentences: 0,
    paragraphs: 0,
    lines: 0,
    chineseCharacters: 0
  });
  // 复制状态
  const [copied, setCopied] = useState(false);
  
  // 文本变化时更新统计结果
  useEffect(() => {
    countText(text);
  }, [text]);
  
  // 统计文本
  const countText = (value: string) => {
    if (!value) {
      setCounts({
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        chineseWords: 0,
        englishWords: 0,
        sentences: 0,
        paragraphs: 0,
        lines: 0,
        chineseCharacters: 0
      });
      return;
    }
    
    // 总字符数
    const characters = value.length;
    
    // 不含空格的字符数
    const charactersNoSpaces = value.replace(/\s/g, '').length;
    
    // 中文字符数
    const chineseCharacters = (value.match(/[\u4e00-\u9fa5]/g) || []).length;
    
    // 英文单词数
    const englishWords = value.match(/[a-zA-Z]+/g)?.length || 0;
    
    // 中文词数 (根据标点符号和空格分隔)
    const chineseText = value.match(/[\u4e00-\u9fa5]+/g)?.join('') || '';
    // 中文大约每2个字一个词
    const chineseWords = Math.ceil(chineseText.length / 2);
    
    // 总词数 (简单估算)
    const words = englishWords + chineseWords;
    
    // 句子数 (根据句号、问号、感叹号统计)
    const sentences = (value.match(/[.!?。！？]+/g) || []).length || (value.length > 0 ? 1 : 0);
    
    // 段落数 (根据空行分隔)
    const paragraphs = value.split(/\n\s*\n/).filter(Boolean).length || (value.length > 0 ? 1 : 0);
    
    // 行数
    const lines = value.split('\n').length;
    
    setCounts({
      characters,
      charactersNoSpaces,
      words,
      chineseWords,
      englishWords,
      sentences,
      paragraphs,
      lines,
      chineseCharacters
    });
  };
  
  // 复制统计结果
  const copyResults = () => {
    const resultText = t('tools.text_counter.copy_result_text')
      .replace('{characters}', counts.characters.toString())
      .replace('{charactersNoSpaces}', counts.charactersNoSpaces.toString())
      .replace('{chineseCharacters}', counts.chineseCharacters.toString())
      .replace('{words}', counts.words.toString())
      .replace('{chineseWords}', counts.chineseWords.toString())
      .replace('{englishWords}', counts.englishWords.toString())
      .replace('{sentences}', counts.sentences.toString())
      .replace('{paragraphs}', counts.paragraphs.toString())
      .replace('{lines}', counts.lines.toString());
    
    navigator.clipboard.writeText(resultText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error(t('tools.text_counter.copy_failed'), err));
  };
  
  // 清空输入
  const clearText = () => {
    setText('');
  };
  
  // 加载示例文本
  const loadExample = (type: 'chinese' | 'english') => {
    if (type === 'chinese') {
      setText('这是一个中文文本示例。\n\n这是第二段落，包含了一些中文内容。这个工具可以统计文本中的字符数、词数和其他信息。\n\n第三段落结束。');
    } else {
      setText('This is an English text example.\n\nThis is the second paragraph, containing English content. This tool can count characters, words, and other information in the text.\n\nThe third paragraph ends here.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-[1440px] mx-auto p-4 md:p-6">
      <ToolHeader 
        toolCode="text_counter"
        icon={faCalculator}
        title=""
        description=""
      />
      
      {/* 主内容区 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* 统计结果 */}
        <div className="md:col-span-4 space-y-6 order-2 md:order-1">
          <div className={styles.card}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-md font-medium text-primary">{t('tools.text_counter.statistics_results')}</h2>
              <button 
                className={styles.iconButton}
                onClick={copyResults}
              >
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="mr-1" />
                {copied ? t('tools.text_counter.copied') : t('tools.text_counter.copy_results')}
              </button>
            </div>
            
            <div className="space-y-1">
              {/* 字符统计 */}
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>{t('tools.text_counter.statistics.total_characters')}</span>
                <span className={styles.resultValue}>{counts.characters}</span>
              </div>
              
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>{t('tools.text_counter.statistics.characters_no_spaces')}</span>
                <span className={styles.resultValue}>{counts.charactersNoSpaces}</span>
              </div>
              
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>{t('tools.text_counter.statistics.chinese_characters')}</span>
                <span className={styles.resultValue}>{counts.chineseCharacters}</span>
              </div>
              
              {/* 单词统计 */}
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>{t('tools.text_counter.statistics.total_words')}</span>
                <span className={styles.resultValue}>{counts.words}</span>
              </div>
              
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>{t('tools.text_counter.statistics.chinese_words')}</span>
                <span className={styles.resultValue}>{counts.chineseWords}</span>
              </div>
              
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>{t('tools.text_counter.statistics.english_words')}</span>
                <span className={styles.resultValue}>{counts.englishWords}</span>
              </div>
              
              {/* 其他统计 */}
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>{t('tools.text_counter.statistics.sentences')}</span>
                <span className={styles.resultValue}>{counts.sentences}</span>
              </div>
              
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>{t('tools.text_counter.statistics.paragraphs')}</span>
                <span className={styles.resultValue}>{counts.paragraphs}</span>
              </div>
              
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>{t('tools.text_counter.statistics.lines')}</span>
                <span className={styles.resultValue}>{counts.lines}</span>
              </div>
            </div>
          </div>
          
          <div className={styles.card}>
            <h2 className="text-md font-medium text-primary mb-4">{t('tools.text_counter.tool_options')}</h2>
            <div className="space-y-2">
              <button
                className={styles.button}
                onClick={() => loadExample('chinese')}
              >
                {t('tools.text_counter.load_chinese_example')}
              </button>
              <button
                className={styles.button}
                onClick={() => loadExample('english')}
              >
                {t('tools.text_counter.load_english_example')}
              </button>
            </div>
          </div>
        </div>
        
        {/* 文本输入 */}
        <div className="md:col-span-8 order-1 md:order-2">
          <div className={styles.card}>
            <h2 className="text-md font-medium text-primary mb-4">{t('tools.text_counter.input_text')}</h2>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('tools.text_counter.input_placeholder')}
              className={styles.textarea}
              rows={20}
            />
            
            <div className="flex justify-end mt-4">
              <button
                className="btn-secondary"
                onClick={clearText}
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                {t('tools.text_counter.clear')}
              </button>
            </div>
          </div>
          
          {!text && (
            <div className="flex items-center justify-center p-4 mt-4 text-tertiary">
              <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
              {t('tools.text_counter.empty_notice')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}