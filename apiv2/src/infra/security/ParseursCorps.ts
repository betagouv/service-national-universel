import { NestExpressApplication } from "@nestjs/platform-express";

/**
 * Parseurs de corps de requête sans décompression (CVE-2026-111497).
 *
 * La faille a été constatée sur le décodeur Brotli embarqué par Node 20 (1.2.0), un dépassement de
 * tampon exploitable par un flux compressé piégé. La parade ne dépend pas de la version de Node
 * et reste en place après la montée vers Node 24 : les parseurs par défaut de Nest (body-parser
 * 2.x) décompressent tout corps `Content-Encoding: br|gzip|deflate`, avant toute authentification,
 * alors qu'aucun de nos clients n'envoie de corps compressé. `inflate: false` les refuse en 415
 * sans jamais les décompresser.
 *
 * Remplace les parseurs par défaut : créer l'application avec `bodyParser: false`. Mêmes options
 * que Nest sinon (JSON, urlencoded `extended`).
 */
export function parseursSansDecompression(app: NestExpressApplication) {
    app.useBodyParser("json", { inflate: false });
    app.useBodyParser("urlencoded", { extended: true, inflate: false });
}
