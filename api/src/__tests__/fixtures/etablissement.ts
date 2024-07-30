import { Types } from "mongoose";
import { EtablissementType } from "../../models";
const { ObjectId } = Types;

export function createFixtureEtablissement(fields: Partial<EtablissementType> = {}): Partial<EtablissementType> {
  const etablissement: Partial<EtablissementType> = {
    referentEtablissementIds: [new ObjectId().toString()],
    coordinateurIds: [new ObjectId().toString()],
    type: ["Lycée Général et Technologique"],
    sector: ["Statut public"],
    schoolId: "634025469bc0ed3c32912815",
    uai: "0352992M",
    name: "Antenne CFA EN Jean-Jaurès Rennes",
    address: "56 Rue du Général Leclerc",
    department: "Sarthe",
    region: "Pays de la Loire",
    zip: "72300",
    city: "Sablé-sur-Sarthe",
    country: "France",
    academy: "Limoges",
    schoolYears: ["2023-2024"],
    state: "active",
    ...fields,
  };
  return etablissement;
}
