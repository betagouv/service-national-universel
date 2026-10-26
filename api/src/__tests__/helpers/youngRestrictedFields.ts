/**
 * Fixtures et assertions partagées pour les tests GOO-11 (notes, santé, pièces d'identité selon le
 * rôle) : `young-restricted-fields.test.ts`, `young-security.test.ts`, `application-security.test.ts`.
 */
import { ROLES } from "snu-lib";

/** Dossier portant chaque catégorie de donnée restreinte, pour rendre une fuite visible. */
export const restrictedData = {
  notes: [{ phase: "PHASE_2", note: "note interne", referent: { firstName: "Réf", role: ROLES.REFERENT_DEPARTMENT } }],
  handicap: "true",
  allergies: "true",
  ppsBeneficiary: "true",
  paiBeneficiary: "true",
  medicosocialStructure: "true",
  medicosocialStructureName: "CMP",
  specificAmenagment: "true",
  specificAmenagmentType: "fauteuil",
  reducedMobilityAccess: "true",
  latestCNIFileExpirationDate: new Date("2030-01-01"),
  latestCNIFileCategory: "cniNew",
  files: { cniFiles: [{ name: "cni.pdf", category: "cniNew" }], imageRightFiles: [{ name: "droit-image.pdf" }] },
};

const HEALTH_SAMPLE = ["handicap", "allergies", "ppsBeneficiary", "paiBeneficiary", "medicosocialStructure", "medicosocialStructureName", "specificAmenagmentType"];

export function expectNoHealth(payload: any) {
  expect(HEALTH_SAMPLE.filter((field) => payload?.[field] !== undefined)).toEqual([]);
}

export function expectNoIdentityFiles(payload: any) {
  expect(payload?.files?.cniFiles).toBeUndefined();
  expect(payload?.latestCNIFileExpirationDate).toBeUndefined();
  expect(payload?.latestCNIFileCategory).toBeUndefined();
}
