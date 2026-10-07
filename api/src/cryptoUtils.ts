import * as crypto from "crypto";
import { config } from "./config";

// Format legacy (non versionné, toujours lu) : AES-256-CTR, IV 16 octets, aucune authentification.
const LEGACY_ALGO = "aes-256-ctr";
const LEGACY_IV_LENGTH = 16;

// Format versionné (écrit quand ENABLE_FILE_ENCRYPTION_V1 est actif) : AES-256-GCM, authentifié.
// En-tête : 4 octets magiques + 1 octet de version, puis IV (12) + tag d'authentification (16).
const V1_MAGIC = Buffer.from("SNU1", "utf-8");
const V1_VERSION = 1;
const V1_ALGO = "aes-256-gcm";
const V1_IV_LENGTH = 12;
const V1_AUTH_TAG_LENGTH = 16;
const V1_HEADER_LENGTH = V1_MAGIC.length + 1;
const V1_KDF_INFO = "snu-file-encryption-v1";

const getLegacyKey = (secret) => {
  const SECRET = secret || config.FILE_ENCRYPTION_SECRET;
  return crypto.createHash("sha256").update(SECRET).digest("base64").substr(0, 32);
};

const getV1Key = (secret) => {
  const SECRET = secret || config.FILE_ENCRYPTION_SECRET;
  return Buffer.from(crypto.hkdfSync("sha256", SECRET, Buffer.alloc(0), V1_KDF_INFO, 32));
};

const isV1Format = (encrypted) => encrypted.length >= V1_HEADER_LENGTH && encrypted.subarray(0, V1_MAGIC.length).equals(V1_MAGIC) && encrypted[V1_MAGIC.length] === V1_VERSION;

const encryptLegacy = (buffer, secret?: string) => {
  const iv = crypto.randomBytes(LEGACY_IV_LENGTH);
  const cipher = crypto.createCipheriv(LEGACY_ALGO, getLegacyKey(secret), iv);
  return Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
};

const decryptLegacy = (encrypted, secret?: string) => {
  const iv = encrypted.subarray(0, LEGACY_IV_LENGTH);
  const ciphertext = encrypted.subarray(LEGACY_IV_LENGTH);
  const decipher = crypto.createDecipheriv(LEGACY_ALGO, getLegacyKey(secret), iv);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
};

const encryptV1 = (buffer, secret?: string) => {
  const iv = crypto.randomBytes(V1_IV_LENGTH);
  const cipher = crypto.createCipheriv(V1_ALGO, getV1Key(secret), iv);
  const ciphertext = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([V1_MAGIC, Buffer.from([V1_VERSION]), iv, authTag, ciphertext]);
};

const decryptV1 = (encrypted, secret?: string) => {
  let offset = V1_HEADER_LENGTH;
  const iv = encrypted.subarray(offset, offset + V1_IV_LENGTH);
  offset += V1_IV_LENGTH;
  const authTag = encrypted.subarray(offset, offset + V1_AUTH_TAG_LENGTH);
  offset += V1_AUTH_TAG_LENGTH;
  const ciphertext = encrypted.subarray(offset);
  const decipher = crypto.createDecipheriv(V1_ALGO, getV1Key(secret), iv, { authTagLength: V1_AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
};

// `snupport-api` partage le même bucket S3 (préfixe `message/`) pour les pièces jointes du support
// et ne sait lire que l'ancien format (CTR, snupport-api/src/utils/crypto.js) — tant qu'il ne lit pas
// le format versionné, les objets chiffrés avec FILE_ENCRYPTION_SECRET_SUPPORT doivent rester en
// legacy, même quand ENABLE_FILE_ENCRYPTION_V1 est actif pour le reste de l'application (relecture A).
const isSupportSecret = (secret?: string) => !!secret && secret === config.FILE_ENCRYPTION_SECRET_SUPPORT;

export const encrypt = (buffer, secret?: string) => {
  return config.ENABLE_FILE_ENCRYPTION_V1 && !isSupportSecret(secret) ? encryptV1(buffer, secret) : encryptLegacy(buffer, secret);
};

export const decrypt = (encrypted, secret?: string): any => {
  // FIXME: retrun type
  return isV1Format(encrypted) ? decryptV1(encrypted, secret) : decryptLegacy(encrypted, secret);
};
