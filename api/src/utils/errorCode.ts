import { ERRORS } from "snu-lib";

// Un code d'erreur métier est une constante en majuscules (ERRORS, FUNCTIONAL_ERRORS, PDT_IMPORT_ERRORS…).
const ERROR_CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/;

/**
 * Code renvoyable au client pour une erreur attrapée.
 *
 * Les services lèvent `new Error(ERRORS.X)` : ce code-là est conservé. Tout autre message (erreur
 * Mongo, Joi, réseau…) décrit l'implémentation, parfois avec des valeurs saisies : il est remplacé
 * par `fallback` et reste dans Sentry et les logs (L7, audit du 21/09/2026).
 */
export function toErrorCode(error: unknown, fallback: string = ERRORS.SERVER_ERROR): string {
  const message = (error as { message?: unknown } | null | undefined)?.message;
  return typeof message === "string" && ERROR_CODE_PATTERN.test(message) ? message : fallback;
}

/** Code stable renvoyé par le gestionnaire d'erreurs global d'Express, selon le statut HTTP. */
export function errorCodeForStatus(status: number): string {
  switch (status) {
    case 400:
      return ERRORS.BAD_REQUEST;
    case 401:
      return ERRORS.OPERATION_UNAUTHORIZED;
    case 403:
      return ERRORS.OPERATION_NOT_ALLOWED;
    case 404:
      return ERRORS.NOT_FOUND;
    case 413:
      return "PAYLOAD_TOO_LARGE";
    case 415:
      return ERRORS.UNSUPPORTED_TYPE;
    case 429:
      return ERRORS.TOO_MANY_REQUESTS;
    default:
      return status >= 400 && status < 500 ? ERRORS.BAD_REQUEST : ERRORS.SERVER_ERROR;
  }
}
