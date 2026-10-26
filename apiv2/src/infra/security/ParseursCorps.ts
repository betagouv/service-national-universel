import { NestExpressApplication } from "@nestjs/platform-express";

/**
 * Parseurs de corps de requête sans décompression (CVE-2026-111497).
 *
 * Le décodeur Brotli embarqué par Node 20 (1.2.0) a un dépassement de tampon exploitable par un
 * flux compressé piégé, et Node 20, en fin de vie, ne sera pas corrigé. Les parseurs par défaut
 * de Nest (body-parser 2.x) décompressent tout corps `Content-Encoding: br|gzip|deflate`, avant
 * toute authentification. Aucun de nos clients n'envoie de corps compressé : `inflate: false`
 * les refuse en 415 sans jamais les décompresser.
 *
 * Remplace les parseurs par défaut : créer l'application avec `bodyParser: false`. Mêmes options
 * que Nest sinon (JSON, urlencoded `extended`).
 */
export function parseursSansDecompression(app: NestExpressApplication) {
    app.useBodyParser("json", { inflate: false });
    app.useBodyParser("urlencoded", { extended: true, inflate: false });
}
