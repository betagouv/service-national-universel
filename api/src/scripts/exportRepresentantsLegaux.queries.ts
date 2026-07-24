import { YoungModel } from "../models";
import { normalizeEmail } from "./exportOptoutVolontaires.helpers";

/**
 * Pour une liste d'emails de représentants légaux (RL), retourne une Map
 * email(normalisé) -> prénom. Les RL n'ont pas de collection dédiée : ils sont
 * stockés en parent1/parent2 sur les documents `young`. Lecture seule.
 *
 * ⚠ parent1Email / parent2Email ne sont pas indexés : on fait UNE seule passe
 * (`$or` avec les deux `$in`) plutôt que du chunking, qui multiplierait les scans
 * de collection. Le résultat est projeté aux 4 champs parent (léger).
 *
 * En cas de conflit (même email trouvé sur plusieurs jeunes avec des prénoms
 * différents), on garde le premier prénom non vide rencontré.
 */
export async function findRepresentantFirstNames(emails: string[]): Promise<Map<string, string>> {
  const wanted = new Set(emails); // emails déjà normalisés (minuscule/trim) par l'appelant
  const map = new Map<string, string>();
  const docs = await YoungModel.find(
    { $or: [{ parent1Email: { $in: emails } }, { parent2Email: { $in: emails } }] },
    { parent1Email: 1, parent1FirstName: 1, parent2Email: 1, parent2FirstName: 1, _id: 0 },
  ).lean(); // lecture seule
  for (const y of docs as any[]) {
    const p1 = normalizeEmail(y.parent1Email);
    if (p1 && wanted.has(p1) && !map.get(p1) && y.parent1FirstName) map.set(p1, String(y.parent1FirstName).trim());
    const p2 = normalizeEmail(y.parent2Email);
    if (p2 && wanted.has(p2) && !map.get(p2) && y.parent2FirstName) map.set(p2, String(y.parent2FirstName).trim());
  }
  return map;
}
