export const pdfManagerZh = {
  title: 'PDF合并与切割',
  description: 'PDF文件合并、切割',
  upload_area: {
    title: '拖拽PDF文件到此处或点击上传',
    subtitle: '支持多个PDF文件，单个文件不超过100MB，总大小不超过500MB',
    button: '选择文件'
  },
  operation_mode: {
    title: '操作模式',
    merge: '合并模式',
    split: '分割模式',
    extract: '页面提取'
  },
  merge_mode: {
    title: '合并设置',
    file_order: '文件顺序',
    output_name: '输出文件名',
    compression: '压缩设置'
  },
  split_mode: {
    title: '分割设置',
    split_method: '分割方式',
    page_range: '页面范围',
    custom_ranges: '自定义范围',
    equal_parts: '等分分割'
  },
  split_methods: {
    single_pages: '单页分割',
    single_pages_description: '将每个页面分割为单独的PDF文件',
    custom_ranges: '自定义范围',
    equal_parts: '等分分割',
    by_range: '按范围分割'
  },
  page_range: {
    title: '页面范围',
    start_page: '起始页',
    end_page: '结束页',
    total_pages: '总页数',
    preview: '预览'
  },
  custom_ranges: {
    title: '自定义范围',
    add_range: '添加范围',
    remove_range: '删除范围',
    range_format: '格式：1-5,7-10,15',
    placeholder: '输入页面范围，如：1-5,7-10,15',
    single_page: '第 {page} 页',
    page_range: '第 {start}-{end} 页'
  },
  equal_parts: {
    title: '等分分割',
    parts_count: '分割份数',
    pages_per_part: '每份页数'
  },
  extract_mode: {
    title: '页面提取',
    extract_pages: '提取页面',
    page_numbers: '页面编号',
    page_numbers_hint: '输入页面编号，用逗号分隔，支持范围如：1,3,5-8,10',
    output_format: '输出格式'
  },
  file_list: {
    title: '文件列表',
    drag_hint: '拖拽文件调整顺序',
    total_size: '总大小',
    page_count: '总页数',
    remove_file: '删除文件'
  },
  output_settings: {
    title: '输出设置',
    filename_prefix: '文件名前缀',
    include_page_numbers: '包含页码',
    compression: '压缩设置'
  },
  actions: {
    merge: '开始合并',
    split: '开始分割',
    extract: '开始提取',
    preview: '预览',
    download: '下载',
    download_all: '下载全部',
    download_selected: '下载选中',
    clear: '清空'
  },
  status: {
    merging: '合并中...',
    splitting: '分割中...',
    extracting: '提取中...',
    completed: '操作完成',
    failed: '操作失败',
    ready: '准备就绪'
  },
  results: {
    title: '操作结果',
    files_count: '文件数量',
    total_size: '总大小',
    download_all: '下载全部文件',
    download_selected: '下载选中文件'
  },
  errors: {
    file_too_large: '文件过大，单个文件不能超过100MB，总大小不能超过500MB',
    invalid_format: '不支持的文件格式，请选择PDF文件',
    operation_failed: '操作失败，请检查文件',
    no_files: '请先选择文件',
    need_at_least_two: '合并模式至少需要选择两个PDF文件',
    invalid_range: '无效的页面范围',
    range_out_of_bounds: '页面范围超出文件页数',
    invalid_parts_count: '分割份数必须大于1',
    no_ranges: '请至少添加一个分割范围',
    invalid_page_numbers: '无效的页面编号'
  }
}; 