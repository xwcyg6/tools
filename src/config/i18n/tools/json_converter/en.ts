export const jsonConverterEn = {
  title: 'JSON Converter',
  description: 'Convert between JSON and XML/CSV/YAML formats',
  select_format_type: 'Select Conversion Format Type',
  format_types: {
    xml: {
      name: 'XML',
      description: 'Convert between JSON and XML'
    },
    csv: {
      name: 'CSV',
      description: 'Convert between JSON and CSV'
    },
    yaml: {
      name: 'YAML',
      description: 'Convert between JSON and YAML'
    }
  },
  direction: {
    json_to_format: 'JSON',
    format_to_json: '{format}'
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
    csv: {
      delimiter: 'Delimiter',
      delimiters: {
        comma: 'Comma (,)',
        semicolon: 'Semicolon (;)',
        tab: 'Tab',
        pipe: 'Pipe (|)'
      },
      include_header: 'Include Header',
      generate_header: 'Generate CSV Header',
      parse_header: 'Parse CSV Header as Field Names'
    },
    xml: {
      root_element: 'XML Root Element Name',
      root_placeholder: 'Root element name'
    },
    description: 'These options will affect the format and structure of the conversion result.'
  },
  input: {
    json: 'JSON Input',
    format: '{format} Input',
    json_placeholder: 'Please enter JSON data...',
    format_placeholder: 'Please enter {format} data...'
  },
  output: {
    json: 'JSON Output',
    format: '{format} Output',
    json_placeholder: 'Converted JSON will appear here...',
    format_placeholder: 'Converted {format} will appear here...'
  },
  notes: {
    title: 'Conversion Notes',
    xml: {
      title: 'Notes for JSON and XML conversion:',
      items: [
        'JSON object keys will be converted to XML elements',
        'XML attributes may be lost during conversion',
        'Array elements will be converted to repeated elements with the same name'
      ]
    },
    csv: {
      title: 'Notes for JSON and CSV conversion:',
      items: [
        'CSV format is best suited for flat data structures',
        'Nested objects will be flattened or merged into a single field',
        'Complex structures may lose information during conversion'
      ]
    },
    yaml: {
      title: 'Notes for JSON and YAML conversion:',
      items: [
        'YAML supports richer data types and comments',
        'JSON is a strict subset of YAML',
        'Most data structures are preserved during conversion'
      ]
    }
  },
  errors: {
    invalid_json: 'Invalid JSON format',
    conversion_error: 'An error occurred during conversion',
    copy_failed: 'Copy failed:',
    clipboard_error: 'Failed to copy to clipboard'
  }
};

export default jsonConverterEn; 