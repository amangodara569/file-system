const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate encryption key and IV
const generateKeyAndIV = () => {
  const key = crypto.randomBytes(32).toString('hex');
  const iv = crypto.randomBytes(16).toString('hex');
  return { key, iv };
};

// Encrypt file
const encryptFile = (inputPath, outputPath, encryptionKey, encryptionIV) => {
  return new Promise((resolve, reject) => {
    const key = Buffer.from(encryptionKey, 'hex');
    const iv = Buffer.from(encryptionIV, 'hex');
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);

    input.on('error', reject);
    output.on('error', reject);

    input.pipe(cipher).pipe(output);
    output.on('finish', () => resolve(outputPath));
  });
};

// Decrypt file
const decryptFile = (encryptedPath, outputPath, encryptionKey, encryptionIV) => {
  return new Promise((resolve, reject) => {
    const key = Buffer.from(encryptionKey, 'hex');
    const iv = Buffer.from(encryptionIV, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const input = fs.createReadStream(encryptedPath);
    const output = fs.createWriteStream(outputPath);

    input.on('error', reject);
    output.on('error', reject);

    input.pipe(decipher).pipe(output);
    output.on('finish', () => resolve(outputPath));
  });
};

// Hash string
const hashString = (str) => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

module.exports = {
  generateKeyAndIV,
  encryptFile,
  decryptFile,
  hashString
};
