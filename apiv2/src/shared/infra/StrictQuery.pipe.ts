import { ValidationPipe } from "@nestjs/common";

/**
 * Validation d'une query string par DTO, clés inconnues refusées.
 *
 * Le parseur « simple » d'Express 5 transmet `?status[$ne]=x` sous la clé littérale
 * `status[$ne]` : refuser les clés hors DTO ferme aussi ce cas si l'app repasse un jour
 * au parseur « extended » (qs), qui en ferait un opérateur Mongo.
 */
export const StrictQueryPipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });
