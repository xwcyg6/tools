export const passwordGeneratorZh = {
  title: '随机密码生成器',
  description: '支持自定义字符集、长度与数量，生成强随机密码',
  length: '密码长度',
  length_hint: '范围 4 - 128，推荐 12+ 保证强度',
  count: '生成数量',
  count_hint: '范围 1 - 100',
  set_uppercase: '包含大写字母 A-Z',
  set_lowercase: '包含小写字母 a-z',
  set_digits: '包含数字 0-9',
  set_symbols: '包含符号',
  force_all_sets: '强制每个密码至少包含所选类型',
  custom_include: '自定义追加字符',
  custom_include_placeholder: '例如：€¥✓',
  custom_include_hint: '这些字符会被加入候选集合',
  exclude_chars: '排除字符',
  exclude_chars_placeholder: '不希望出现的字符',
  avoid_similar_on: '忽略相似字符(I l 1 O 0 o)：开',
  avoid_similar_off: '忽略相似字符(I l 1 O 0 o)：关',
  avoid_ambiguous_on: '忽略歧义符号({}[]()/\\\'"`~,;:.<>)：开',
  avoid_ambiguous_off: '忽略歧义符号({}[]()/\\\'"`~,;:.<>)：关',
  generate: '生成',
  copy_all: '复制全部',
  download: '下载TXT',
  reset: '重置',
  results: '生成结果',
  no_result: '尚未生成密码',
  copy_one: '复制此行',
};

export default passwordGeneratorZh;


