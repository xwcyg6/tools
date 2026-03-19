export const httpTesterEn = {
  title: 'HTTP Request Tester',
  description: 'API interface debugging tool, supporting various request methods and parameter settings',
  
  // Request form
  http_request: 'HTTP Request',
  clear: 'Clear',
  enter_url: 'Enter URL',
  send_request: 'Send Request',
  public_network: 'Public',
  local_network: 'Local/LAN',
  
  // Request parameter tabs
  request_headers: 'Request Headers',
  request_body: 'Request Body',
  
  // Request headers section
  add_header: 'Add Header',
  header_key: 'Name',
  header_value: 'Value',
  
  // Request body section
  body_format: 'Body Format',
  json_format: 'JSON',
  text_format: 'Text',
  form_format: 'Form',
  enter_request_body: 'Enter request body content',
  add_form_field: 'Add Form Field',
  form_field_key: 'Field Name',
  form_field_value: 'Field Value',
  
  // History
  history: 'History',
  history_empty: 'No history records',
  clear_history: 'Clear History',
  clear_history_confirm: 'Are you sure you want to clear the history?',
  
  // Response results
  response_result: 'Response Result',
  copied: 'Copied',
  copy: 'Copy',
  generate_doc: 'Generate Doc',
  response_body: 'Response Body',
  response_headers: 'Response Headers',
  request_info: 'Request Info',
  
  // Request information
  request_method: 'Request Method',
  request_url: 'Request URL',
  request_body_sent: 'Request Body',
  network_mode: 'Network Mode',
  network_mode_public: 'Public Network Mode',
  network_mode_local: 'Local/LAN Mode',
  
  // Status and errors
  loading: 'Loading...',
  copy_failed: 'Copy failed',
  
  // CORS settings modal
  cors_settings: 'Local/LAN CORS Settings Guide',
  close: 'Close',
  cors_description: 'When sending requests to local or LAN services, the browser\'s same-origin policy blocks cross-origin requests. To allow these requests, you need to configure CORS (Cross-Origin Resource Sharing) response headers on the server side.',
  cors_warning: 'In production environments, please configure CORS carefully. It is recommended to use stricter settings rather than allowing access from all sources. The following configurations are for local development and testing only.',
  
  // HTTPS to HTTP issues
  https_to_http_title: 'HTTPS to HTTP Service Access Issues',
  https_to_http_description: 'When you access HTTP internal services through an HTTPS website, the browser\'s security policy blocks such "mixed content" requests. Here are the recommended solutions:',
  solution_one: 'Solution 1: Configure HTTPS certificates for internal services',
  solution_one_1: 'Use self-signed certificates (development environment)',
  solution_one_2: 'Use intranet CA issued certificates (enterprise environment)',
  solution_one_3: 'Modify internal service configuration, enable HTTPS',
  solution_two: 'Solution 2: Adjust browser security settings (development environment only)',
  solution_two_1: 'Chrome: Click the lock icon in the address bar → Site settings → Insecure content → Allow',
  solution_two_2: 'Firefox: Enter about:config in the address bar → Search and disable security.mixed_content.block_active_content',
  solution_two_3: 'Edge: Click the lock icon in the address bar → Site permissions → Insecure content → Allow',
  security_note: 'Note: Adjusting browser security settings is only recommended for development environments and will reduce browser security. Production environments should use the HTTPS certificate solution.',
  
  // Other tips
  need_advanced: 'Need advanced testing features? Try RunAPI'
};

export default httpTesterEn; 