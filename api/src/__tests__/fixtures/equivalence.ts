import { MissionEquivalenceType } from "snu-lib";
import { Types } from "mongoose";
const { ObjectId } = Types;

export function createFixtureMissionEquivalence(fields: Partial<MissionEquivalenceType> = {}): Partial<MissionEquivalenceType> {
  return {
    youngId: fields.youngId || new ObjectId().toString(),
    status: fields.status || "WAITING_VERIFICATION",
    type: fields.type || "BAFA",
    desc: fields.desc || "Description par défaut pour le type Autre",
    sousType: fields.sousType || undefined, // Remplacement de null par undefined
    structureName: fields.structureName || "Nom de la structure",
    address: fields.address || "1 rue de la Paix",
    zip: fields.zip || "75001",
    city: fields.city || "Paris",
    startDate: fields.startDate || new Date(),
    endDate: fields.endDate || new Date(),
    missionDuration: fields.missionDuration || 84,
    contactFullName: fields.contactFullName || "John Doe",
    contactEmail: fields.contactEmail || "john.doe@example.com",
    files: fields.files || ["file1.pdf", "file2.pdf"],
    message: fields.message || undefined,
    createdAt: fields.createdAt || new Date(),
    updatedAt: fields.updatedAt || new Date(),
    ...fields,
  };
}

// Exemple de données spécifiques pour des tests
export const missionEquivalenceFixtureValid = createFixtureMissionEquivalence({
  type: "Certification Union Nationale du Sport scolaire (UNSS)",
  sousType: "Arbitrage",
  status: "VALIDATED",
});

export const missionEquivalenceFixtureWaitingVerification = createFixtureMissionEquivalence({
  status: "WAITING_VERIFICATION",
});

export const missionEquivalenceFixtureWithFiles = createFixtureMissionEquivalence({
  files: ["document1.pdf", "document2.pdf"],
});
