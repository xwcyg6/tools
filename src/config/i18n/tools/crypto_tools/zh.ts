export const cryptoToolsZh = {
  title: '加密解密工具',
  description: 'MD5/SHA/AES/DES等常用哈希和加密算法',
  // 算法名称和描述
  algorithms: {
    md5: {
      name: 'MD5',
      description: '一种广泛使用的哈希函数，产生128位（16字节）哈希值。不可逆，不适用于安全场景。',
      additional_info: 'MD5可以用于文件校验，但因已被证明存在碰撞攻击，不应用于安全场景。'
    },
    sha1: {
      name: 'SHA-1',
      description: '产生160位（20字节）哈希值。不可逆，安全性比MD5高，但不推荐用于安全敏感应用。',
      additional_info: 'SHA-1虽比MD5更安全，但也已被证明存在碰撞风险，建议用于非安全场景。'
    },
    sha256: {
      name: 'SHA-256',
      description: 'SHA-2家族的成员，产生256位（32字节）哈希值。不可逆，安全性较高。',
      additional_info: 'SHA-256是SHA-2家族的一员，被广泛用于密码存储和数字签名。'
    },
    sha512: {
      name: 'SHA-512',
      description: 'SHA-2家族的成员，产生512位（64字节）哈希值。不可逆，安全性很高。',
      additional_info: 'SHA-512提供更高安全性，适用于对安全性要求极高的场景。'
    },
    aes: {
      name: 'AES',
      description: '对称加密算法，需要密钥，可用于加密和解密数据。',
      additional_info: 'AES是目前最流行的对称加密算法，本工具使用的是AES-256-CBC模式。加密和解密都需要相同的密钥。'
    },
    base64: {
      name: 'Base64',
      description: '一种编码方式，可用于在不兼容的系统之间传输二进制数据。可编码解码。',
      additional_info: 'Base64不是加密算法，而是一种编码方式，常用于在文本协议中传输二进制数据。'
    }
  },
  // 界面元素
  input_text: '原始文本',
  encrypted_text: '加密文本',
  base64_encoded: 'Base64编码',
  secret_key: '密钥',
  result: '结果',
  hash_result: '哈希结果',
  encrypted_result: '加密结果',
  decoded_result: '解码结果',
  // 按钮和操作
  encode: '编码',
  decode: '解码',
  encrypt: '加密',
  decrypt: '解密',
  calculate: '计算',
  copy_result: '复制结果',
  copied: '已复制',
  clear: '清空',
  load_example: '加载示例',
  // 占位符
  input_placeholder: '请输入需要处理的文本...',
  decrypt_placeholder: '请输入需要解密的密文...',
  base64_decode_placeholder: '请输入需要解码的Base64编码...',
  key_placeholder: '请输入密钥...',
  result_placeholder: '结果将显示在这里...',
  // 状态消息
  operation_success: '操作成功完成',
  encryption_success: '加密操作成功完成',
  decryption_success: '解密操作成功完成',
  copy_failed: '复制到剪贴板失败',
  input_required: '请输入需要处理的文本',
  key_required: '请输入密钥',
  decryption_failed: '解密失败，请检查密文和密钥是否正确',
  base64_decode_failed: 'Base64解码失败，请检查输入格式是否正确',
  // 算法说明
  algorithm_info: '算法说明'
};

export default cryptoToolsZh; 