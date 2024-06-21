import { getClassesAndEtablissementsFromAppelAProjets } from "../../providers/demarcheSimplifiee/demarcheSimplifieeProvider";
import { IReferent } from "../../models/referentType";
import { IEtablissement } from "../../models/cle/etablissementType";
import { IClasse } from "../../models/cle/classeType";
import { CleEtablissementModel } from "../../models";
import { apiEducation } from "../../services/gouv.fr/api-education";
import { etablissementMapper } from "../etablissement/etablissementMapper";
import { buildUniqueClasseId, createClasse, findClasseByUniqueKeyAndUniqueId } from "../classe/classeService";
import { ClasseDto } from "snu-lib/src/dto";
import { IAppelAprojetClasse } from "./appelAProjetType";

export const syncAppelAProjet = async () => {
  const appelAProjets = await getClassesAndEtablissementsFromAppelAProjets();
  const referentsToCreate: IReferent[] = [];
  const referentsToLog: IReferent[] = [];
  const etablissementsToCreate: IEtablissement[] = [];
  const etablissementsToUpdate: IEtablissement[] = [];
  const etablissementsErrors: { error: string; uai?: string | null; email?: string | null }[] = [];
  const classesToCreate: Partial<IClasse>[] = [];
  const classesToLog: Record<string, string | undefined>[] = [];

  const uais = [...new Set(appelAProjets.map((AAP) => AAP.etablissement?.uai).filter(Boolean))];

  const etablissements = await apiEducation({
    filters: [{ key: "uai", value: uais }],
    page: 0,
    size: -1,
  });

  for (const appelAProjet of appelAProjets) {
    // if referent exists, update it
    // if not, create referent
    //---------------
    const uai = appelAProjet.etablissement?.uai;
    if (!uai) {
      etablissementsErrors.push({
        error: "No UAI provided",
        uai: null,
        email: appelAProjet.etablissement.email,
      });
      continue;
    }

    if ([...etablissementsToCreate, ...etablissementsToUpdate].map((etablissement) => etablissement.uai).includes(uai)) {
      etablissementsErrors.push({
        error: "UAI already processed",
        uai: appelAProjet.etablissement.uai,
        email: appelAProjet.etablissement.email,
      });
      continue;
    }

    const etablissement = etablissements.find((etablissement) => etablissement.identifiant_de_l_etablissement === uai);

    if (!etablissement) {
      etablissementsErrors.push({
        error: "Etablissement not found",
        uai: appelAProjet.etablissement.uai,
        email: appelAProjet.etablissement.email,
      });
      continue;
    }

    const formattedEtablissement = etablissementMapper(etablissement, referentsToCreate);

    // TODO: handle schoolYears array

    if (await CleEtablissementModel.exists({ uai })) {
      etablissementsToUpdate.push(formattedEtablissement);
    } else {
      etablissementsToCreate.push(formattedEtablissement);
    }
    //---------------
    // if classe exists do nothing
    // if not, create classe
    const uniqueClasseId = buildUniqueClasseId(formattedEtablissement, {
      name: appelAProjet.classe.nom || "",
      coloration: appelAProjet.classe.coloration,
    });
    const classeFound = findClasseByUniqueKeyAndUniqueId(appelAProjet.etablissement?.uai, uniqueClasseId);
    if (classeFound) {
      classesToLog.push({
        "nom de la classe": classeFound?.name,
        "cle de la classe": classeFound?.uniqueKey,
        "id de la classe": classeFound?.uniqueId,
        "id technique de la classe existante": classeFound?._id,
        "raison ": "classe existe",
      });
    } else {
      const formattedClasse = mapAppelAProjetToClasse(appelAProjet.classe, formattedEtablissement, uniqueClasseId);
      // const createdClasse = createClasse(formattedClasse);
      classesToCreate.push(formattedClasse);
    }
  }

  return [
    { name: "etablissementsToCreate", data: etablissementsToCreate },
    { name: "etablissementsToUpdate", data: etablissementsToUpdate },
    { name: "etablissementsErrors", data: etablissementsErrors },
  ];
};

const mapAppelAProjetToClasse = (classeFromAppelAProjet: IAppelAprojetClasse, etablissement: IEtablissement, uniqueClasseId: string): Partial<IClasse> => {
  return {
    name: classeFromAppelAProjet.nom,
    coloration: classeFromAppelAProjet.coloration,
    uniqueId: uniqueClasseId,
    uniqueKey: etablissement.uai,
  };
};
