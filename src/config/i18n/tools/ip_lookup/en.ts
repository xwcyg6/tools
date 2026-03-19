export const ipLookupEn = {
  title: 'IP Address Lookup',
  description: 'Query detailed information about IP addresses, including geolocation and ISP details',
  input_placeholder: 'Enter IP address to query',
  my_ip: 'My IP',
  search: 'Search',
  copy: 'Copy',
  copied: 'Copied',
  unknown: 'Unknown',
  result_title: 'Query Results',
  input_label: 'Enter IP Address:',
  input_placeholder_example: 'Example: 8.8.8.8',
  search_button: 'Search',
  my_ip_button: 'Lookup My IP Address',
  instruction_title: 'Instructions:',
  instructions: {
    line1: 'Enter an IP address and click the "Search" button',
    line2: 'Supports both IPv4 and IPv6 addresses',
    line3: 'Click "Lookup My IP Address" to get your current IP information',
    line4: 'Results include geolocation, ISP and technical details'
  },
  results: {
    title: 'Query Results',
    empty_state: 'Enter an IP address and click search to get detailed information',
    ip_address: 'IP Address'
  },
  ip_info: {
    ip: 'IP Address',
    country: 'Country/Region',
    region: 'Province',
    city: 'City',
    isp: 'ISP',
    timezone: 'Timezone',
    coordinates: 'Coordinates',
    source: 'Data Source',
    ip_type: 'IP Type',
    ip_class: 'IP Class',
    binary: 'Binary',
    hex: 'Hexadecimal'
  },
  technical_details: 'Technical Details',
  ip_classes: {
    private: 'Private IP',
    public: 'Public IP',
    loopback: 'Loopback Address',
    link_local: 'Link-local Address'
  },
  errors: {
    invalid_ip: 'Invalid IP address',
    query_failed: 'Query failed, please try again later',
    copy_failed: 'Copy failed'
  },
  api_sources: {
    pconline: 'PConline',
    ipcn: 'IP.CN',
    ipapi: 'ip-api.com',
    baidu: 'Baidu IP',
    meitu: 'Meitu IP'
  },
  console_errors: {
    pconline: 'PConline data parsing error',
    ipcn: 'IP.CN data parsing error',
    ipapi: 'ip-api.com data parsing error',
    meitu: 'Meitu IP data parsing error'
  }
};

export default ipLookupEn; 