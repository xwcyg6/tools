export const ymlPropertiesConverterZh = {
  title: 'YML与Properties互转',
  description: '在YML/YAML与Properties配置文件格式之间相互转换',
  select_format_type: '选择转换方向',
  direction: {
    yml_to_properties: 'YML转Properties',
    properties_to_yml: 'Properties转YML'
  },
  actions: {
    load_example: '加载示例',
    clear: '清空',
    convert: '转换',
    converting: '转换中...',
    copy: '复制',
    copied: '已复制',
    download: '下载'
  },
  advanced_options: {
    show: '显示高级选项',
    hide: '隐藏高级选项',
    properties: {
      delimiter: '键值分隔符',
      delimiters: {
        equals: '等号 (=)',
        colon: '冒号 (:)'
      },
      escape_unicode: 'Unicode转义',
      sort_keys: '按键排序'
    },
    yml: {
      indent: '缩进空格数',
      quote_strings: '字符串加引号',
      sort_keys: '按键排序'
    },
    description: '这些选项将影响转换结果的格式和结构。'
  },
  input: {
    yml: 'YML/YAML 输入',
    properties: 'Properties 输入',
    yml_placeholder: '请输入YML/YAML数据...',
    properties_placeholder: '请输入Properties数据...'
  },
  output: {
    yml: 'YML/YAML 输出',
    properties: 'Properties 输出',
    yml_placeholder: '转换后的YML/YAML将显示在这里...',
    properties_placeholder: '转换后的Properties将显示在这里...'
  },
  notes: {
    title: '转换说明',
    items: {
      0: 'YML支持层级结构，而Properties使用点号表示层级',
      1: 'Properties文件中的Unicode转义将被正确处理',
      2: '转换过程会尽量保留数据结构，但某些复杂结构可能会受限',
      3: '数组在Properties中表示为带索引的键（如: list.0, list.1）'
    }
  },
  errors: {
    invalid_yml: '输入的YML/YAML格式无效',
    invalid_properties: '输入的Properties格式无效',
    conversion_error: '转换过程中发生错误',
    copy_failed: '复制失败:',
    clipboard_error: '复制到剪贴板失败'
  }
};

export default ymlPropertiesConverterZh; 