export const pdfConverterZh = {
  title: 'PDF转换器',
  description: 'PDF转图片和文本提取工具，支持批量转换',
  upload_area: {
    title: '拖拽PDF文件到此处或点击上传',
    subtitle: '支持PDF格式，最大100MB',
    button: '选择文件'
  },
  conversion_types: {
    pdf_to_image: 'PDF转图片',
    pdf_to_text: 'PDF转文本'
  },
  settings: {
    image_format: '图片格式',
    image_quality: '图片质量',
    page_range: '页面范围',
    output_format: '输出格式',
    compression: '压缩设置'
  },
  options: {
    formats: {
      png: 'PNG',
      jpeg: 'JPEG',
      webp: 'WebP'
    },
    quality: {
      high: '高质量',
      medium: '中等质量',
      low: '低质量'
    }
  },
  actions: {
    convert: '开始转换',
    download: '下载',
    preview: '预览',
    clear: '清空'
  },
  status: {
    converting: '转换中...',
    completed: '转换完成',
    failed: '转换失败',
    ready: '准备就绪'
  },
  errors: {
    file_too_large: '文件过大，请选择小于100MB的文件',
    invalid_format: '不支持的文件格式',
    conversion_failed: '转换失败，请检查文件',
    no_file: '请先选择文件'
  }
}; 