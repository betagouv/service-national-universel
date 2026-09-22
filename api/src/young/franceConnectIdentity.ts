import crypto from "crypto";

import { getRedisClient } from "../redis";

/**
 * Identité vérifiée par FranceConnect, conservée côté serveur entre l'échange de jeton
 * (`POST /young/france-connect/user-info`) et son enregistrement sur le volontaire
 * (`PUT /representants-legaux/representant-fromFranceConnect/:id`).
 *
 * Sans ce relais, le client renvoyait lui-même l'identité et le drapeau
 * `parentXFromFranceConnect: "true"` : n'importe quel porteur d'un jeton parent pouvait déclarer une
 * identité arbitraire comme « vérifiée FranceConnect » (constat M29).
 */
export type FranceConnectIdentity = {
  firstName: string;
  lastName: string;
  email: string;
};

const TICKET_TTL_SECONDS = 30 * 60;
const keyOf = (ticket: string) => `franceConnectIdentity:${ticket}`;

/** Stocke l'identité vérifiée et renvoie le ticket à usage unique remis au client. */
export async function storeFranceConnectIdentity(identity: FranceConnectIdentity): Promise<string> {
  const ticket = crypto.randomBytes(20).toString("hex");
  await getRedisClient().setEx(keyOf(ticket), TICKET_TTL_SECONDS, JSON.stringify(identity));
  return ticket;
}

/** Relit et invalide le ticket. Renvoie `null` si le ticket est inconnu, expiré ou déjà consommé. */
export async function consumeFranceConnectIdentity(ticket: string): Promise<FranceConnectIdentity | null> {
  const client = getRedisClient();
  const raw = await client.get(keyOf(ticket));
  if (!raw) return null;
  await client.del(keyOf(ticket));
  try {
    const identity = JSON.parse(raw);
    if (!identity?.firstName || !identity?.lastName || !identity?.email) return null;
    return identity;
  } catch (e) {
    return null;
  }
}
