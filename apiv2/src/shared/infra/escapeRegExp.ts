/**
 * Neutralise les métacaractères d'une chaîne destinée à un `$regex` Mongo.
 *
 * Sans cet échappement, un paramètre de recherche fourni par le client est une expression
 * régulière arbitraire : recherche par motif (ancres, alternations, classes) sur des champs
 * qui ne devraient supporter qu'un « contient », et risque de backtracking catastrophique.
 */
export function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
