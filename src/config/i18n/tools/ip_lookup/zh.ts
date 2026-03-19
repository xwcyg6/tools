export const ipLookupZh = {
  title: 'IP地址查询',
  description: '查询IP地址的详细信息，包括地理位置、运营商等信息',
  input_placeholder: '请输入要查询的IP地址',
  my_ip: '我的IP',
  search: '查询',
  copy: '复制',
  copied: '已复制',
  unknown: '未知',
  result_title: '查询结果',
  input_label: '输入IP地址:',
  input_placeholder_example: '例如: 8.8.8.8',
  search_button: '查询',
  my_ip_button: '查询我的IP地址',
  instruction_title: '使用说明:',
  instructions: {
    line1: '输入IP地址后点击"查询"按钮',
    line2: '支持IPv4和IPv6地址查询',
    line3: '点击"查询我的IP地址"获取您当前的IP信息',
    line4: '查询结果包含地理位置、运营商等信息'
  },
  results: {
    title: '查询结果',
    empty_state: '输入IP地址并点击查询按钮获取详细信息',
    ip_address: 'IP地址'
  },
  ip_info: {
    ip: 'IP地址',
    country: '国家/地区',
    region: '省份',
    city: '城市',
    isp: '运营商',
    timezone: '时区',
    coordinates: '经纬度',
    source: '数据来源',
    ip_type: 'IP类型',
    ip_class: 'IP类别',
    binary: '二进制',
    hex: '十六进制'
  },
  technical_details: '技术详情',
  ip_classes: {
    private: '私有IP',
    public: '公网IP',
    loopback: '回环地址',
    link_local: '链路本地地址'
  },
  errors: {
    invalid_ip: '无效的IP地址',
    query_failed: '查询失败，请稍后重试',
    copy_failed: '复制失败'
  },
  api_sources: {
    pconline: '太平洋电脑网',
    ipcn: 'IP.CN',
    ipapi: 'ip-api.com',
    baidu: '百度IP',
    meitu: '美图IP'
  },
  console_errors: {
    pconline: '太平洋电脑网数据解析错误',
    ipcn: 'IP.CN数据解析错误',
    ipapi: 'ip-api.com数据解析错误',
    meitu: '美图IP数据解析错误'
  }
};

export default ipLookupZh; 