/**
 * Redaction des secrets et des PII avant écriture dans les logs.
 *
 * L'implémentation vit désormais dans `@snu/log-redaction` (packages/log-redaction), partagée avec
 * `snupport-api`. Ce fichier ne subsiste que pour garder les imports `./utils/logRedaction` existants
 * valides ; il peut être supprimé en remplaçant ces imports par `@snu/log-redaction`.
 */
export * from "@snu/log-redaction";
