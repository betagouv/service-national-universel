import * as crypto from "crypto";
import * as config from "config";

const ALGO = "aes-256-ctr";

const getKey = (secret) => {
  const SECRET = secret || config.FILE_ENCRYPTION_SECRET;
  return crypto.createHash("sha256").update(SECRET).digest("base64").substr(0, 32);
};

export const encrypt = (buffer, secret?: string) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, getKey(secret), iv);
  const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
  return result;
};

export const decrypt = (encrypted, secret?: string): any => {
  // FIXME: retrun type
  const iv = encrypted.slice(0, 16);
  encrypted = encrypted.slice(16);
  const decipher = crypto.createDecipheriv(ALGO, getKey(secret), iv);
  const result = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return result;
};
