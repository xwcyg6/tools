export const pdfConverterEn = {
  title: 'PDF Converter',
  description: 'PDF to image and text extraction tool with batch processing support',
  upload_area: {
    title: 'Drag PDF files here or click to upload',
    subtitle: 'Supports PDF format, max 100MB',
    button: 'Choose Files'
  },
  conversion_types: {
    pdf_to_image: 'PDF to Image',
    pdf_to_text: 'PDF to Text'
  },
  settings: {
    image_format: 'Image Format',
    image_quality: 'Image Quality',
    page_range: 'Page Range',
    output_format: 'Output Format',
    compression: 'Compression Settings'
  },
  options: {
    formats: {
      png: 'PNG',
      jpeg: 'JPEG',
      webp: 'WebP'
    },
    quality: {
      high: 'High Quality',
      medium: 'Medium Quality',
      low: 'Low Quality'
    }
  },
  actions: {
    convert: 'Start Conversion',
    download: 'Download',
    preview: 'Preview',
    clear: 'Clear'
  },
  status: {
    converting: 'Converting...',
    completed: 'Conversion Completed',
    failed: 'Conversion Failed',
    ready: 'Ready'
  },
  errors: {
    file_too_large: 'File too large, please select files smaller than 100MB',
    invalid_format: 'Unsupported file format',
    conversion_failed: 'Conversion failed, please check the file',
    no_file: 'Please select files first'
  }
}; 