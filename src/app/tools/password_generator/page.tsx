'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ToolHeader from '@/components/ToolHeader';
import { useLanguage } from '@/context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faDownload, faKey, faRefresh, faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';

const styles = {
  card: "card p-6",
  input: "search-input w-full",
  label: "block mb-1 text-sm text-tertiary",
  section: "mb-6",
  row: "grid grid-cols-1 md:grid-cols-2 gap-4",
  checkbox: "flex items-center gap-2 text-sm text-tertiary",
  numberInput: "search-input w-full",
  btn: "btn-secondary text-xs px-3 py-1",
  primaryBtn: "btn-primary text-xs px-3 py-1",
  listItem: "flex items-center justify-between p-2 border border-purple/20 rounded-md bg-purple/5",
  code: "font-mono break-all",
  hint: "text-xs text-tertiary",
  chips: "flex flex-wrap gap-2",
  chip: "px-2 py-1 rounded border border-purple/30 text-xs text-tertiary bg-purple/10",
  iconButton: "text-tertiary hover:text-purple transition-colors",
};

type CharsetOptionKey = 'uppercase' | 'lowercase' | 'digits' | 'symbols';

const DEFAULT_SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/\\|";
const SIMILAR_CHARS = "Il1O0o";
const AMBIGUOUS_SYMBOLS = "{}[]()/\\'\"`~,;:.<>";

export default function PasswordGenerator() {
  const { t } = useLanguage();

  const [length, setLength] = useState(12);
  const [count, setCount] = useState(10);
  const [forceAllSets, setForceAllSets] = useState(true);
  const [includeSets, setIncludeSets] = useState<Record<CharsetOptionKey, boolean>>({
    uppercase: true,
    lowercase: true,
    digits: true,
    symbols: true,
  });
  const [customInclude, setCustomInclude] = useState('');
  const [excludeChars, setExcludeChars] = useState(SIMILAR_CHARS);
  const [avoidSimilar, setAvoidSimilar] = useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | 'all' | null>(null);

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const charset = useMemo(() => {
    let chars = '';
    if (includeSets.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeSets.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (includeSets.digits) chars += '0123456789';
    if (includeSets.symbols) chars += DEFAULT_SYMBOLS;
    if (customInclude) chars += customInclude;

    let excludes = excludeChars || '';
    if (avoidSimilar) excludes += SIMILAR_CHARS;
    if (avoidAmbiguous) excludes += AMBIGUOUS_SYMBOLS;

    if (excludes) {
      const excludeSet = new Set(excludes.split(''));
      chars = Array.from(new Set(chars.split('')))
        .filter((c) => !excludeSet.has(c))
        .join('');
    }
    return chars;
  }, [includeSets, customInclude, excludeChars, avoidSimilar, avoidAmbiguous]);

  const ensureAllSets = (candidate: string): boolean => {
    if (!forceAllSets) return true;
    const checks = [
      !includeSets.uppercase || /[A-Z]/.test(candidate),
      !includeSets.lowercase || /[a-z]/.test(candidate),
      !includeSets.digits || /[0-9]/.test(candidate),
      !includeSets.symbols || new RegExp(`[${escapeForRegex(DEFAULT_SYMBOLS)}]`).test(candidate),
    ];
    return checks.every(Boolean);
  };

  const generateOne = (pool: string, len: number): string => {
    if (!pool) return '';
    const array = new Uint32Array(len);
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < len; i++) array[i] = Math.floor(Math.random() * 0xffffffff);
    }
    const chars = [] as string[];
    for (let i = 0; i < len; i++) {
      const idx = array[i] % pool.length;
      chars.push(pool[idx]);
    }
    return chars.join('');
  };

  const generate = () => {
    const pool = charset;
    const list: string[] = [];
    const target = Math.min(Math.max(count, 1), 100);
    const len = Math.min(Math.max(length, 4), 128);

    let attempts = 0;
    while (list.length < target && attempts < target * 100) {
      attempts++;
      const candidate = generateOne(pool, len);
      if (candidate && ensureAllSets(candidate)) {
        list.push(candidate);
      }
    }
    setResults(list);
  };

  const copyOne = async (idx: number) => {
    try {
      await navigator.clipboard.writeText(results[idx] || '');
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {}
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(results.join('\n'));
      setCopiedIndex('all');
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {}
  };

  const downloadTxt = () => {
    const blob = new Blob([results.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'passwords.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSet = (key: CharsetOptionKey) => {
    setIncludeSets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const reset = () => {
    setLength(12);
    setCount(10);
    setForceAllSets(true);
    setIncludeSets({ uppercase: true, lowercase: true, digits: true, symbols: true });
    setCustomInclude('');
    setExcludeChars(SIMILAR_CHARS);
    setAvoidSimilar(true);
    setAvoidAmbiguous(false);
    setResults([]);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <ToolHeader
        toolCode="password_generator"
        icon={faKey}
        title={t('tools.password_generator.title')}
        description={t('tools.password_generator.description')}
      />

      <div className={styles.section}>
        <div className={styles.card}>
          <div className={styles.row}>
            <div>
              <label className={styles.label}>{t('tools.password_generator.length')}</label>
              <input
                className={styles.numberInput}
                type="number"
                min={4}
                max={128}
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value || '0') || 0)}
              />
              <div className={styles.hint}>{t('tools.password_generator.length_hint')}</div>
            </div>
            <div>
              <label className={styles.label}>{t('tools.password_generator.count')}</label>
              <input
                className={styles.numberInput}
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value || '0') || 0)}
              />
              <div className={styles.hint}>{t('tools.password_generator.count_hint')}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className={styles.checkbox}>
                <input id="uppercase" type="checkbox" checked={includeSets.uppercase} onChange={() => toggleSet('uppercase')} />
                <label htmlFor="uppercase">{t('tools.password_generator.set_uppercase')}</label>
              </div>
              <div className={styles.checkbox}>
                <input id="lowercase" type="checkbox" checked={includeSets.lowercase} onChange={() => toggleSet('lowercase')} />
                <label htmlFor="lowercase">{t('tools.password_generator.set_lowercase')}</label>
              </div>
              <div className={styles.checkbox}>
                <input id="digits" type="checkbox" checked={includeSets.digits} onChange={() => toggleSet('digits')} />
                <label htmlFor="digits">{t('tools.password_generator.set_digits')}</label>
              </div>
              <div className={styles.checkbox}>
                <input id="symbols" type="checkbox" checked={includeSets.symbols} onChange={() => toggleSet('symbols')} />
                <label htmlFor="symbols">{t('tools.password_generator.set_symbols')}</label>
              </div>
              <div className={styles.checkbox}>
                <input id="forceAll" type="checkbox" checked={forceAllSets} onChange={() => setForceAllSets(!forceAllSets)} />
                <label htmlFor="forceAll">{t('tools.password_generator.force_all_sets')}</label>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className={styles.label}>{t('tools.password_generator.custom_include')}</label>
                <input
                  className={styles.input}
                  type="text"
                  value={customInclude}
                  onChange={(e) => setCustomInclude(e.target.value)}
                  placeholder={t('tools.password_generator.custom_include_placeholder')}
                />
                <div className={styles.hint}>{t('tools.password_generator.custom_include_hint')}</div>
              </div>
              <div>
                <label className={styles.label}>{t('tools.password_generator.exclude_chars')}</label>
                <input
                  className={styles.input}
                  type="text"
                  value={excludeChars}
                  onChange={(e) => setExcludeChars(e.target.value)}
                  placeholder={t('tools.password_generator.exclude_chars_placeholder')}
                />
                <div className={styles.chips}>
                  <button className={styles.chip} onClick={() => setAvoidSimilar(!avoidSimilar)}>
                    {avoidSimilar ? t('tools.password_generator.avoid_similar_on') : t('tools.password_generator.avoid_similar_off')}
                  </button>
                  <button className={styles.chip} onClick={() => setAvoidAmbiguous(!avoidAmbiguous)}>
                    {avoidAmbiguous ? t('tools.password_generator.avoid_ambiguous_on') : t('tools.password_generator.avoid_ambiguous_off')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button className={styles.primaryBtn} onClick={generate}>
              <FontAwesomeIcon icon={faRefresh} className="mr-2" /> {t('tools.password_generator.generate')}
            </button>
            <button className={styles.btn} onClick={copyAll}>
              <FontAwesomeIcon icon={copiedIndex === 'all' ? faCheck : faCopy} className="mr-2" /> {t('tools.password_generator.copy_all')}
            </button>
            <button className={styles.btn} onClick={downloadTxt}>
              <FontAwesomeIcon icon={faDownload} className="mr-2" /> {t('tools.password_generator.download')}
            </button>
            <button className={styles.btn} onClick={reset}>
              <FontAwesomeIcon icon={faTrash} className="mr-2" /> {t('tools.password_generator.reset')}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.card}>
          <h2 className="text-xl font-medium mb-4">{t('tools.password_generator.results')}</h2>
          <div className="space-y-2">
            {results.length === 0 && (
              <div className={styles.hint}>{t('tools.password_generator.no_result')}</div>
            )}
            {results.map((pwd, idx) => (
              <div className={styles.listItem} key={idx}>
                <div className={styles.code}>{pwd}</div>
                <button className={styles.iconButton} onClick={() => copyOne(idx)} title={t('tools.password_generator.copy_one')}>
                  <FontAwesomeIcon icon={copiedIndex === idx ? faCheck : faCopy} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function escapeForRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


