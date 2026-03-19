export const ymlPropertiesConverterEn = {
  title: 'YML & Properties Converter',
  description: 'Convert between YML/YAML and Properties configuration file formats',
  select_format_type: 'Select Conversion Direction',
  direction: {
    yml_to_properties: 'YML to Properties',
    properties_to_yml: 'Properties to YML'
  },
  actions: {
    load_example: 'Load Example',
    clear: 'Clear',
    convert: 'Convert',
    converting: 'Converting...',
    copy: 'Copy',
    copied: 'Copied',
    download: 'Download'
  },
  advanced_options: {
    show: 'Show Advanced Options',
    hide: 'Hide Advanced Options',
    properties: {
      delimiter: 'Key-Value Delimiter',
      delimiters: {
        equals: 'Equals (=)',
        colon: 'Colon (:)'
      },
      escape_unicode: 'Escape Unicode',
      sort_keys: 'Sort Keys'
    },
    yml: {
      indent: 'Indent Spaces',
      quote_strings: 'Quote Strings',
      sort_keys: 'Sort Keys'
    },
    description: 'These options will affect the format and structure of the conversion result.'
  },
  input: {
    yml: 'YML/YAML Input',
    properties: 'Properties Input',
    yml_placeholder: 'Enter YML/YAML data...',
    properties_placeholder: 'Enter Properties data...'
  },
  output: {
    yml: 'YML/YAML Output',
    properties: 'Properties Output',
    yml_placeholder: 'Converted YML/YAML will appear here...',
    properties_placeholder: 'Converted Properties will appear here...'
  },
  notes: {
    title: 'Conversion Notes',
    items: {
      0: 'YML supports hierarchical structure, while Properties uses dots for hierarchy',
      1: 'Unicode escapes in Properties files will be properly handled',
      2: 'The conversion will try to preserve data structures, but some complex structures may be limited',
      3: 'Arrays in Properties are represented as indexed keys (e.g.: list.0, list.1)'
    }
  },
  errors: {
    invalid_yml: 'Invalid YML/YAML format',
    invalid_properties: 'Invalid Properties format',
    conversion_error: 'Error occurred during conversion',
    copy_failed: 'Copy failed:',
    clipboard_error: 'Failed to copy to clipboard'
  }
};

export default ymlPropertiesConverterEn; 