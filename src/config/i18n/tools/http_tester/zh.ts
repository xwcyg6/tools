export const httpTesterZh = {
  title: 'HTTP请求测试',
  description: 'API接口调试工具，支持多种请求方法和参数设置',
  
  // 请求表单
  http_request: 'HTTP请求',
  clear: '清空',
  enter_url: '输入URL',
  send_request: '发送请求',
  public_network: '公网',
  local_network: '本地/局域网',
  
  // 请求参数标签页
  request_headers: '请求头',
  request_body: '请求体',
  
  // 请求头部分
  add_header: '添加请求头',
  header_key: '名称',
  header_value: '值',
  
  // 请求体部分
  body_format: '请求体格式',
  json_format: 'JSON',
  text_format: '文本',
  form_format: '表单',
  enter_request_body: '输入请求体内容',
  add_form_field: '添加表单字段',
  form_field_key: '字段名',
  form_field_value: '字段值',
  
  // 历史记录
  history: '历史记录',
  history_empty: '暂无历史记录',
  clear_history: '清空历史',
  clear_history_confirm: '确定要清空历史记录吗？',
  
  // 响应结果
  response_result: '响应结果',
  copied: '已复制',
  copy: '复制',
  generate_doc: '生成文档',
  response_body: '响应体',
  response_headers: '响应头',
  request_info: '请求信息',
  
  // 请求信息
  request_method: '请求方法',
  request_url: '请求URL',
  request_body_sent: '请求体',
  network_mode: '网络模式',
  network_mode_public: '公网模式',
  network_mode_local: '本地/局域网模式',
  
  // 状态和错误
  loading: '请求中...',
  copy_failed: '复制失败',
  
  // 跨域设置弹窗
  cors_settings: '本地/局域网跨域设置指南',
  close: '关闭',
  cors_description: '当发送请求到本地或局域网服务时，浏览器的同源策略会阻止跨域请求。为了允许这些请求，你需要在服务端配置CORS（跨域资源共享）响应头。',
  cors_warning: '在生产环境中，请谨慎配置CORS，建议使用更严格的设置，而不是允许所有源访问。以下配置仅用于本地开发和测试。',
  
  // HTTPS访问HTTP问题
  https_to_http_title: 'HTTPS访问HTTP服务问题',
  https_to_http_description: '当您通过HTTPS网站访问HTTP内部服务时，浏览器的安全策略会阻止这种"混合内容"请求。以下是推荐的解决方案：',
  solution_one: '方案一：为内部服务配置HTTPS证书',
  solution_one_1: '使用自签名证书（开发环境）',
  solution_one_2: '使用内网CA签发证书（企业环境）',
  solution_one_3: '修改内部服务配置，启用HTTPS',
  solution_two: '方案二：调整浏览器安全设置（仅开发环境）',
  solution_two_1: 'Chrome: 点击地址栏锁图标 → 站点设置 → 不安全内容 → 允许',
  solution_two_2: 'Firefox: 地址栏输入 about:config → 搜索并禁用 security.mixed_content.block_active_content',
  solution_two_3: 'Edge: 点击地址栏锁图标 → 站点权限 → 不安全内容 → 允许',
  security_note: '注意：调整浏览器安全设置仅建议在开发环境使用，会降低浏览器安全性。生产环境应使用HTTPS证书方案。',
  
  // 其他提示
  need_advanced: '需要高级测试功能? 试试RunAPI'
};

export default httpTesterZh; 