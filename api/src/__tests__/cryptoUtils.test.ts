/**
 * PM23 : `encrypt`/`decrypt` (api/src/cryptoUtils.ts) chiffraient en AES-256-CTR sans code
 * d'authentification (MAC) — un objet S3 altéré se déchiffre silencieusement en données corrompues,
 * sans qu'aucun appelant ne puisse le détecter. Le format est maintenant versionné : AES-256-GCM
 * (authentifié) derrière le flag ENABLE_FILE_ENCRYPTION_V1, avec lecture rétrocompatible des objets
 * déjà chiffrés dans l'ancien format (CTR, non versionné) quel que soit l'état du flag.
 */
import { config } from "../config";
import { encrypt, decrypt } from "../cryptoUtils";

const SECRET = "test-secret-pm23-0123456789abcdef";

describe("cryptoUtils (GOO-159 : PM23)", () => {
  const originalFlag = config.ENABLE_FILE_ENCRYPTION_V1;
  afterEach(() => {
    config.ENABLE_FILE_ENCRYPTION_V1 = originalFlag;
  });

  it("chiffre puis déchiffre un buffer sans perte, flag désactivé (format legacy)", () => {
    config.ENABLE_FILE_ENCRYPTION_V1 = false;
    const plaintext = Buffer.from("contenu de pièce jointe sensible");
    const encrypted = encrypt(plaintext, SECRET);
    expect(decrypt(encrypted, SECRET)).toEqual(plaintext);
  });

  it("chiffre puis déchiffre un buffer sans perte, flag activé (format GCM versionné)", () => {
    config.ENABLE_FILE_ENCRYPTION_V1 = true;
    const plaintext = Buffer.from("contenu de pièce jointe sensible");
    const encrypted = encrypt(plaintext, SECRET);
    // Prouve que ce test exerce bien le format versionné, pas seulement un aller-retour générique.
    expect(encrypted.subarray(0, 4).toString("utf-8")).toEqual("SNU1");
    expect(decrypt(encrypted, SECRET)).toEqual(plaintext);
  });

  it("détecte un objet altéré quand le flag est activé (authentification GCM) — constat PM23", () => {
    config.ENABLE_FILE_ENCRYPTION_V1 = true;
    const plaintext = Buffer.from("contenu de pièce jointe sensible");
    const encrypted = encrypt(plaintext, SECRET);
    const tampered = Buffer.from(encrypted);
    // Un octet du corps chiffré (après l'en-tête versionné) est modifié, simulant un objet S3 altéré.
    tampered[tampered.length - 1] = tampered[tampered.length - 1] ^ 0xff;
    expect(() => decrypt(tampered, SECRET)).toThrow();
  });

  it("lit toujours les objets déjà chiffrés dans l'ancien format (CTR), flag activé — non-régression migration", () => {
    config.ENABLE_FILE_ENCRYPTION_V1 = false;
    const plaintext = Buffer.from("objet S3 chiffré avant la migration PM23");
    const legacyEncrypted = encrypt(plaintext, SECRET);

    config.ENABLE_FILE_ENCRYPTION_V1 = true;
    expect(decrypt(legacyEncrypted, SECRET)).toEqual(plaintext);
  });

  it("accepte un secret explicite (appel SNUpport.ts avec FILE_ENCRYPTION_SECRET_SUPPORT)", () => {
    config.ENABLE_FILE_ENCRYPTION_V1 = true;
    const plaintext = Buffer.from("pièce jointe support");
    const otherSecret = "autre-secret-support-0123456789";
    const encrypted = encrypt(plaintext, otherSecret);
    expect(decrypt(encrypted, otherSecret)).toEqual(plaintext);
  });

  it("garde le format legacy pour FILE_ENCRYPTION_SECRET_SUPPORT même flag activé — snupport-api ne sait lire que le CTR", () => {
    const originalSupportSecret = config.FILE_ENCRYPTION_SECRET_SUPPORT;
    config.FILE_ENCRYPTION_SECRET_SUPPORT = "secret-support-0123456789abcdef";
    config.ENABLE_FILE_ENCRYPTION_V1 = true;
    try {
      const plaintext = Buffer.from("pièce jointe support");
      const encrypted = encrypt(plaintext, config.FILE_ENCRYPTION_SECRET_SUPPORT);
      // Format legacy : 16 octets d'IV puis directement le texte chiffré (même longueur que le clair, AES-CTR).
      expect(encrypted.length).toEqual(16 + plaintext.length);
      expect(decrypt(encrypted, config.FILE_ENCRYPTION_SECRET_SUPPORT)).toEqual(plaintext);
    } finally {
      config.FILE_ENCRYPTION_SECRET_SUPPORT = originalSupportSecret;
    }
  });

  describe("ENABLE_FILE_ENCRYPTION_LEGACY_READ (coupe-circuit de lecture du format legacy)", () => {
    const originalLegacyRead = config.ENABLE_FILE_ENCRYPTION_LEGACY_READ;
    afterEach(() => {
      config.ENABLE_FILE_ENCRYPTION_LEGACY_READ = originalLegacyRead;
    });

    it("refuse un objet non versionné quand le coupe-circuit est désactivé", () => {
      config.ENABLE_FILE_ENCRYPTION_V1 = false;
      const legacyEncrypted = encrypt(Buffer.from("objet jamais migré"), SECRET);
      config.ENABLE_FILE_ENCRYPTION_LEGACY_READ = false;
      expect(() => decrypt(legacyEncrypted, SECRET)).toThrow();
    });

    it("continue de lire un objet V1 même coupe-circuit désactivé (seul le format non versionné est rejeté)", () => {
      config.ENABLE_FILE_ENCRYPTION_V1 = true;
      const plaintext = Buffer.from("objet déjà migré en GCM");
      const v1Encrypted = encrypt(plaintext, SECRET);
      config.ENABLE_FILE_ENCRYPTION_LEGACY_READ = false;
      expect(decrypt(v1Encrypted, SECRET)).toEqual(plaintext);
    });

    it("sans le coupe-circuit, un objet V1 dont l'en-tête a été retiré (simulation d'une substitution complète de l'objet S3) se déchiffre sans authentification — résidu documenté du constat PM23", () => {
      config.ENABLE_FILE_ENCRYPTION_V1 = true;
      config.ENABLE_FILE_ENCRYPTION_LEGACY_READ = true;
      const plaintext = Buffer.from("objet migré, en-tête ensuite retiré par l'attaquant");
      const v1Encrypted = encrypt(plaintext, SECRET);
      const withoutHeader = v1Encrypted.subarray(5); // retire les 4 octets "SNU1" + 1 octet de version
      // Ne lève pas : relu comme un objet legacy, sans détecter l'altération. C'est précisément le
      // résidu que ENABLE_FILE_ENCRYPTION_LEGACY_READ=false permet de fermer (test précédent).
      expect(() => decrypt(withoutHeader, SECRET)).not.toThrow();
    });
  });
});
