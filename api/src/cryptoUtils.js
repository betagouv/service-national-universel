const crypto = require("crypto");

const config = require("config");

const ALGO = "aes-256-ctr";

const getKey = (secret) => {
  const SECRET = secret || config.FILE_ENCRYPTION_SECRET;
  return crypto.createHash("sha256").update(SECRET).digest("base64").substr(0, 32);
};

const encrypt = (buffer, secret) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, getKey(secret), iv);
  const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
  return result;
};

const decrypt = (encrypted, secret) => {
  const iv = encrypted.slice(0, 16);
  encrypted = encrypted.slice(16);
  const decipher = crypto.createDecipheriv(ALGO, getKey(secret), iv);
  const result = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return result;
};

module.exports = { encrypt, decrypt };
