export const regexTesterZh = {
  title: '正则表达式测试',
  description: '实时验证正则表达式匹配效果',
  examples: {
    title: '常用示例',
    email: '电子邮箱',
    phone: '手机号码',
    url: 'URL地址',
    ip: 'IP地址',
    chinese: '中文字符'
  },
  example_texts: {
    phone: '联系电话：13812345678 或 联系邮箱：test@example.com',
    url: '访问 https://example.com 或 http://localhost:3000',
    ip: '服务器IP: 192.168.1.1 和 10.0.0.1 以及 256.256.256.256',
    chinese: 'Hello 你好，世界！World'
  },
  options: '正则选项',
  flags: '标志位',
  flag_descriptions: {
    global: '全局',
    case_insensitive: '忽略大小写',
    multiline: '多行',
    dotall: '点匹配所有'
  },
  show_capture_groups: '显示捕获组',
  regex_expression: '正则表达式',
  copy: '复制',
  enter_regex: '输入正则表达式...',
  test_text: '测试文本',
  character_count: '字符数',
  enter_test_text: '输入待测试的文本...',
  match_results: '匹配结果',
  match_count: '匹配数量',
  found: '找到',
  matches: '个匹配项',
  original_text_length: '原文本长度',
  result_characters: '字符',
  no_matches: '无匹配结果',
  capture_groups: '捕获组详情',
  match: '匹配'
};

export default regexTesterZh; 