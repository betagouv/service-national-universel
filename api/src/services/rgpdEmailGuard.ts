/**
 * Garde-fous RGPD « email partagé » (cf. docs/review-rgpd-anonymisation-2026-06-11.md, C1).
 *
 * Un email n'identifie pas UN dossier : le même email peut être parent d'un enfant
 * d'une vieille cohorte ET d'un enfant actif (fratrie), ou appartenir à un ancien
 * jeune devenu référent. Purger cet email (désinscription Brevo, export vers la purge
 * support qui hard-delete Contact + tickets) détruirait des données de dossiers ACTIFS.
 *
 * Principe fail-safe : dans le doute, on PROTÈGE (on ne purge pas) — un résidu se
 * rattrape, une suppression à tort non.
 */
import { YOUNG_STATUS } from "snu-lib";

import { YoungModel, ReferentModel } from "../models";

const norm = (email: string) => email.trim().toLowerCase();

/**
 * Ensemble (minuscules) des emails encore rattachés à un dossier actif HORS périmètre :
 * jeunes non supprimés NON ciblés par la sélection (`outOfPerimeter` = complément du
 * sélecteur : `{ cohort: { $nin } }` ou `{ $nor: [core] }`), email + parents, plus tous
 * les référents. Chargé UNE fois (2 requêtes projetées, en cursor).
 * La comparaison se fait en minuscules des deux côtés (documents anciens non normalisés).
 */
export async function getProtectedEmails(outOfPerimeter: Record<string, any>): Promise<Set<string>> {
  const protectedEmails = new Set<string>();

  const youngCursor = YoungModel.find(
    { ...outOfPerimeter, status: { $ne: YOUNG_STATUS.DELETED } },
    { email: 1, parent1Email: 1, parent2Email: 1 },
  )
    .lean()
    .cursor();
  for await (const young of youngCursor) {
    for (const email of [young.email, young.parent1Email, young.parent2Email]) {
      if (email) protectedEmails.add(norm(email));
    }
  }

  const referentCursor = ReferentModel.find({}, { email: 1 }).lean().cursor();
  for await (const referent of referentCursor) {
    if (referent.email) protectedEmails.add(norm(referent.email));
  }

  return protectedEmails;
}

export type BrevoEmails = { email?: string; parent1Email?: string; parent2Email?: string };

/**
 * Variante ciblée (soft-delete au fil de l'eau) : parmi les emails d'UN jeune, ne garde
 * que ceux qui n'appartiennent à aucun AUTRE jeune non supprimé ni à un référent — les
 * seuls qu'on peut désinscrire de Brevo sans couper les communications d'un dossier actif.
 * Collation strength:2 : matching insensible à la casse côté Mongo (documents anciens
 * non garantis en minuscules), au prix d'un scan — acceptable pour une action admin unitaire.
 */
export async function keepOnlyUnsharedEmails(young: { _id: unknown } & BrevoEmails): Promise<BrevoEmails> {
  const emails = [young.email, young.parent1Email, young.parent2Email].filter((e): e is string => Boolean(e));
  if (emails.length === 0) return {};

  const collation = { locale: "en", strength: 2 };
  const [otherYoungs, referents] = await Promise.all([
    YoungModel.find(
      {
        _id: { $ne: young._id },
        status: { $ne: YOUNG_STATUS.DELETED },
        $or: [{ email: { $in: emails } }, { parent1Email: { $in: emails } }, { parent2Email: { $in: emails } }],
      },
      { email: 1, parent1Email: 1, parent2Email: 1 },
    )
      .collation(collation)
      .lean(),
    ReferentModel.find({ email: { $in: emails } }, { email: 1 }).collation(collation).lean(),
  ]);

  const shared = new Set<string>();
  for (const other of otherYoungs) {
    for (const email of [other.email, other.parent1Email, other.parent2Email]) {
      if (email) shared.add(norm(email));
    }
  }
  for (const referent of referents) {
    if (referent.email) shared.add(norm(referent.email));
  }

  const keep = (email?: string) => (email && !shared.has(norm(email)) ? email : undefined);
  return { email: keep(young.email), parent1Email: keep(young.parent1Email), parent2Email: keep(young.parent2Email) };
}
