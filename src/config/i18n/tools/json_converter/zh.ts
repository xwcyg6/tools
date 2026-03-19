export const jsonConverterZh = {
  title: 'JSON转换工具',
  description: 'JSON与XML/CSV/YAML格式互相转换',
  select_format_type: '选择转换格式类型',
  format_types: {
    xml: {
      name: 'XML',
      description: 'JSON与XML之间互相转换'
    },
    csv: {
      name: 'CSV',
      description: 'JSON与CSV之间互相转换'
    },
    yaml: {
      name: 'YAML',
      description: 'JSON与YAML之间互相转换'
    }
  },
  direction: {
    json_to_format: 'JSON',
    format_to_json: '{format}'
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
    csv: {
      delimiter: '分隔符',
      delimiters: {
        comma: '逗号 (,)',
        semicolon: '分号 (;)',
        tab: '制表符 (Tab)',
        pipe: '竖线 (|)'
      },
      include_header: '包含表头',
      generate_header: '生成CSV表头',
      parse_header: '解析CSV表头作为字段名'
    },
    xml: {
      root_element: 'XML根元素名称',
      root_placeholder: '根元素名称'
    },
    description: '这些选项将影响转换结果的格式和结构。'
  },
  input: {
    json: 'JSON 输入',
    format: '{format} 输入',
    json_placeholder: '请输入JSON数据...',
    format_placeholder: '请输入{format}数据...'
  },
  output: {
    json: 'JSON 输出',
    format: '{format} 输出',
    json_placeholder: '转换后的JSON将显示在这里...',
    format_placeholder: '转换后的{format}将显示在这里...'
  },
  notes: {
    title: '转换说明',
    xml: {
      title: 'JSON与XML之间的转换注意事项:',
      items: [
        'JSON对象的键将转换为XML元素',
        'XML属性在转换后可能会丢失',
        '数组元素会被转换为同名的重复元素'
      ]
    },
    csv: {
      title: 'JSON与CSV之间的转换注意事项:',
      items: [
        'CSV格式最适合扁平的数据结构',
        '嵌套对象会被展平或合并为一个字段',
        '复杂结构可能会在转换过程中丢失信息'
      ]
    },
    yaml: {
      title: 'JSON与YAML之间的转换注意事项:',
      items: [
        'YAML支持更丰富的数据类型和注释',
        'JSON是YAML的严格子集',
        '转换过程中保留大部分数据结构'
      ]
    }
  },
  errors: {
    invalid_json: '输入的JSON格式无效',
    conversion_error: '转换过程中发生错误',
    copy_failed: '复制失败:',
    clipboard_error: '复制到剪贴板失败'
  }
};

export default jsonConverterZh; 