import { ClasseType } from "snu-lib";
import { Types } from "mongoose";
const { ObjectId } = Types;

export function createFixtureClasse(fields: Partial<ClasseType> = {}): Partial<ClasseType> {
  const classe: Partial<ClasseType> = {
    referentClasseIds: [],
    seatsTaken: 4,
    cohort: "CLE mai 2024",
    uniqueId: "1212",
    uniqueKey: "0720033V",
    etablissementId: "657994fb3562859787f6ff7b",
    status: "VERIFIED",
    statusPhase1: "WAITING_AFFECTATION",
    uniqueKeyAndId: "0720033V_1212",
    coloration: "SPORT",
    filiere: "Générale et technologique",
    grades: ["4eme"],
    name: "Douze",
    totalSeats: 4,
    department: "Sarthe",
    region: "Pays de la Loire",
    academy: "Nantes",
    schoolYear: "2023-2024",
    type: "FULL",
    estimatedSeats: 20,
    trimester: "T1",
    cohortId: new ObjectId().toString(),
    ...fields,
  };
  return classe;
}
