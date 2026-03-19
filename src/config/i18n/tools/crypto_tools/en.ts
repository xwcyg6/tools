export const cryptoToolsEn = {
  title: 'Encryption Tools',
  description: 'Common hash and encryption algorithms like MD5/SHA/AES/DES',
  // Algorithm names and descriptions
  algorithms: {
    md5: {
      name: 'MD5',
      description: 'A widely used hash function that produces a 128-bit (16-byte) hash value. Irreversible, not suitable for security scenarios.',
      additional_info: 'MD5 can be used for file verification, but should not be used for security purposes as it has been proven vulnerable to collision attacks.'
    },
    sha1: {
      name: 'SHA-1',
      description: 'Produces a 160-bit (20-byte) hash value. Irreversible, more secure than MD5, but not recommended for security-sensitive applications.',
      additional_info: 'Although SHA-1 is more secure than MD5, it has also been proven vulnerable to collisions and is recommended for non-security scenarios.'
    },
    sha256: {
      name: 'SHA-256',
      description: 'A member of the SHA-2 family, produces a 256-bit (32-byte) hash value. Irreversible, relatively high security.',
      additional_info: 'SHA-256 is a member of the SHA-2 family and is widely used for password storage and digital signatures.'
    },
    sha512: {
      name: 'SHA-512',
      description: 'A member of the SHA-2 family, produces a 512-bit (64-byte) hash value. Irreversible, very high security.',
      additional_info: 'SHA-512 provides higher security and is suitable for scenarios with extremely high security requirements.'
    },
    aes: {
      name: 'AES',
      description: 'A symmetric encryption algorithm that requires a key, can be used to encrypt and decrypt data.',
      additional_info: 'AES is currently the most popular symmetric encryption algorithm. This tool uses AES-256-CBC mode. The same key is required for both encryption and decryption.'
    },
    base64: {
      name: 'Base64',
      description: 'An encoding method that can be used to transmit binary data between incompatible systems. Can encode and decode.',
      additional_info: 'Base64 is not an encryption algorithm but an encoding method, commonly used to transmit binary data in text protocols.'
    }
  },
  // UI elements
  input_text: 'Original Text',
  encrypted_text: 'Encrypted Text',
  base64_encoded: 'Base64 Encoded',
  secret_key: 'Secret Key',
  result: 'Result',
  hash_result: 'Hash Result',
  encrypted_result: 'Encryption Result',
  decoded_result: 'Decoded Result',
  // Buttons and operations
  encode: 'Encode',
  decode: 'Decode',
  encrypt: 'Encrypt',
  decrypt: 'Decrypt',
  calculate: 'Calculate',
  copy_result: 'Copy Result',
  copied: 'Copied',
  clear: 'Clear',
  load_example: 'Load Example',
  // Placeholders
  input_placeholder: 'Please enter text to process...',
  decrypt_placeholder: 'Please enter ciphertext to decrypt...',
  base64_decode_placeholder: 'Please enter Base64 encoded text to decode...',
  key_placeholder: 'Please enter secret key...',
  result_placeholder: 'Result will be shown here...',
  // Status messages
  operation_success: 'Operation completed successfully',
  encryption_success: 'Encryption completed successfully',
  decryption_success: 'Decryption completed successfully',
  copy_failed: 'Failed to copy to clipboard',
  input_required: 'Please enter text to process',
  key_required: 'Please enter secret key',
  decryption_failed: 'Decryption failed, please check if the ciphertext and key are correct',
  base64_decode_failed: 'Base64 decoding failed, please check if the input format is correct',
  // Algorithm information
  algorithm_info: 'Algorithm Information'
};

export default cryptoToolsEn; 