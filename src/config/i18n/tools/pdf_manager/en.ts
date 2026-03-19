export const pdfManagerEn = {
  title: 'PDF Merge & Split',
  description: 'Merge, split from PDF files ',
  upload_area: {
    title: 'Drag and drop PDF files here or click to upload',
    subtitle: 'Supports multiple PDF files, single file up to 100MB, total size up to 500MB',
    button: 'Choose Files'
  },
  operation_mode: {
    title: 'Operation Mode',
    merge: 'Merge Mode',
    split: 'Split Mode',
    extract: 'Page Extract'
  },
  merge_mode: {
    title: 'Merge Settings',
    file_order: 'File Order',
    output_name: 'Output Filename',
    compression: 'Compression'
  },
  split_mode: {
    title: 'Split Settings',
    split_method: 'Split Method',
    page_range: 'Page Range',
    custom_ranges: 'Custom Ranges',
    equal_parts: 'Equal Parts'
  },
  split_methods: {
    single_pages: 'Single Pages',
    single_pages_description: 'Split each page into a separate PDF file',
    custom_ranges: 'Custom Ranges',
    equal_parts: 'Equal Parts',
    by_range: 'By Range'
  },
  page_range: {
    title: 'Page Range',
    start_page: 'Start Page',
    end_page: 'End Page',
    total_pages: 'Total Pages',
    preview: 'Preview'
  },
  custom_ranges: {
    title: 'Custom Ranges',
    add_range: 'Add Range',
    remove_range: 'Remove Range',
    range_format: 'Format: 1-5,7-10,15',
    placeholder: 'Enter page ranges, e.g.: 1-5,7-10,15',
    single_page: 'Page {page}',
    page_range: 'Pages {start}-{end}'
  },
  equal_parts: {
    title: 'Equal Parts',
    parts_count: 'Number of Parts',
    pages_per_part: 'Pages per Part'
  },
  extract_mode: {
    title: 'Page Extract',
    extract_pages: 'Extract Pages',
    page_numbers: 'Page Numbers',
    page_numbers_hint: 'Enter page numbers separated by commas, support ranges like: 1,3,5-8,10',
    output_format: 'Output Format'
  },
  file_list: {
    title: 'File List',
    drag_hint: 'Drag files to reorder',
    total_size: 'Total Size',
    page_count: 'Total Pages',
    remove_file: 'Remove File'
  },
  output_settings: {
    title: 'Output Settings',
    filename_prefix: 'Filename Prefix',
    include_page_numbers: 'Include Page Numbers',
    compression: 'Compression'
  },
  actions: {
    merge: 'Start Merge',
    split: 'Start Split',
    extract: 'Start Extract',
    preview: 'Preview',
    download: 'Download',
    download_all: 'Download All',
    download_selected: 'Download Selected',
    clear: 'Clear'
  },
  status: {
    merging: 'Merging...',
    splitting: 'Splitting...',
    extracting: 'Extracting...',
    completed: 'Operation completed',
    failed: 'Operation failed',
    ready: 'Ready'
  },
  results: {
    title: 'Operation Results',
    files_count: 'File Count',
    total_size: 'Total Size',
    download_all: 'Download All Files',
    download_selected: 'Download Selected Files'
  },
  errors: {
    file_too_large: 'Files too large, single file cannot exceed 100MB, total size cannot exceed 500MB',
    invalid_format: 'Unsupported file format, please select PDF files',
    operation_failed: 'Operation failed, please check the files',
    no_files: 'Please select files first',
    need_at_least_two: 'Merge mode requires at least two PDF files',
    invalid_range: 'Invalid page range',
    range_out_of_bounds: 'Page range exceeds file page count',
    invalid_parts_count: 'Number of parts must be greater than 1',
    no_ranges: 'Please add at least one split range',
    invalid_page_numbers: 'Invalid page numbers'
  }
}; 