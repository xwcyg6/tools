export const pdfCompressorZh = {
  title: 'PDF压缩器',
  description: '高效压缩PDF文件，减小文件大小，保持文档质量',
  compression_settings: {
    title: '压缩设置',
    quality: '压缩质量',
    quality_high: '高质量 (文件较大)',
    quality_medium: '中等质量 (推荐)',
    quality_low: '低质量 (文件最小)',
    image_compression: '压缩图片',
    font_subsetting: '字体子集化',
    metadata_removal: '移除元数据',
    remove_bookmarks: '移除书签',
    remove_annotations: '移除注释'
  },
  upload_area: {
    title: '上传PDF文件',
    subtitle: '支持拖拽上传，最大100MB',
    button: '选择文件'
  },
  actions: {
    compress: '开始压缩',
    download: '下载',
    clear: '清空'
  },
  status: {
    compressing: '正在压缩...',
    completed: '压缩完成',
    failed: '压缩失败',
    ready: '准备就绪'
  },
  results: {
    title: '压缩结果',
    original_size: '原始大小',
    compressed_size: '压缩后',
    compression_ratio: '压缩率'
  },
  errors: {
    no_file: '请先选择PDF文件',
    file_too_large: '文件过大，请选择小于100MB的文件',
    invalid_format: '不支持的文件格式，请选择PDF文件',
    compression_failed: '压缩失败，请检查文件',
    library_failed: 'PDF处理库加载失败'
  }
}; 