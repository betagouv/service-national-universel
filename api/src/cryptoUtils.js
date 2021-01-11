const crypto = require('crypto');

const { FILE_ENCRYPTION_SECRET } = require("./config");

const ALGO = 'aes-256-ctr';
const KEY = crypto.createHash("sha256").update(FILE_ENCRYPTION_SECRET).digest("base64").substr(0, 32);

const encrypt = (buffer) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
  return result;
};

const decrypt = (encrypted) => {
  const iv = encrypted.slice(0, 16);
  encrypted = encrypted.slice(16);
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  const result = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return result;
};

module.exports = { encrypt, decrypt };

