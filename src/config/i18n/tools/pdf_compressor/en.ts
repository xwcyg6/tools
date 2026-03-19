export const pdfCompressorEn = {
  title: 'PDF Compressor',
  description: 'Efficiently compress PDF files to reduce file size while maintaining document quality',
  compression_settings: {
    title: 'Compression Settings',
    quality: 'Compression Quality',
    quality_high: 'High Quality (Larger File)',
    quality_medium: 'Medium Quality (Recommended)',
    quality_low: 'Low Quality (Smallest File)',
    image_compression: 'Compress Images',
    font_subsetting: 'Font Subsetting',
    metadata_removal: 'Remove Metadata',
    remove_bookmarks: 'Remove Bookmarks',
    remove_annotations: 'Remove Annotations'
  },
  upload_area: {
    title: 'Upload PDF Files',
    subtitle: 'Drag and drop supported, max 100MB',
    button: 'Choose Files'
  },
  actions: {
    compress: 'Start Compression',
    download: 'Download',
    clear: 'Clear'
  },
  status: {
    compressing: 'Compressing...',
    completed: 'Compression Complete',
    failed: 'Compression Failed',
    ready: 'Ready'
  },
  results: {
    title: 'Compression Results',
    original_size: 'Original Size',
    compressed_size: 'Compressed Size',
    compression_ratio: 'Compression Ratio'
  },
  errors: {
    no_file: 'Please select PDF files first',
    file_too_large: 'File too large, please select files smaller than 100MB',
    invalid_format: 'Unsupported file format, please select PDF files',
    compression_failed: 'Compression failed, please check the file',
    library_failed: 'PDF processing library failed to load'
  }
}; 