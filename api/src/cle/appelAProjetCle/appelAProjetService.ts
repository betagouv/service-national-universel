import { getClassesAndEtablissementsFromAppelAProjets } from "../../providers/demarcheSimplifiee/demarcheSimplifieeProvider";
import { IReferent } from "../../models/referentType";
import { IEtablissement } from "../../models/cle/etablissementType";
import { IClasse } from "../../models/cle/classeType";
import { CleEtablissementModel, ReferentModel } from "../../models";
import { apiEducation } from "../../services/gouv.fr/api-education";
import { etablissementMapper } from "../etablissement/etablissementMapper";
import { buildUniqueClasseId, findClasseByUniqueKeyAndUniqueId } from "../classe/classeService";
import { IAppelAProjet } from "./appelAProjetType";
import { ClasseSchoolYear } from "snu-lib/src/constants/cle/classeConstants";

export const syncAppelAProjet = async (save: boolean = false) => {
  const appelAProjets = await getClassesAndEtablissementsFromAppelAProjets();
  const referentsToCreate: Partial<IReferent>[] = [];
  const referentsAlreadyExisting: IReferent[] = [];
  const etablissementsToCreate: IEtablissement[] = [];
  const etablissementsToUpdate: IEtablissement[] = [];
  const etablissementsErrors: { error: string; uai?: string | null; email?: string | null }[] = [];
  const classesToCreate: Partial<IClasse>[] = [];
  const classesAlreadyExisting: Record<string, string | undefined>[] = [];

  const uais = [...new Set(appelAProjets.map((AAP) => AAP.etablissement?.uai).filter(Boolean))];
  const etablissements = await apiEducation({
    filters: [{ key: "uai", value: uais }],
    page: 0,
    size: -1,
  });

  for (const appelAProjet of appelAProjets) {
    // Process referents etablissement
    const referentEtablissement = await ReferentModel.exists({ email: appelAProjet.referentEtablissement.email });
    if (referentEtablissement) {
      referentsAlreadyExisting.push(referentEtablissement);
    } else {
      referentsToCreate.push(appelAProjet.referentClasse);
    }
    // Process etablissement
    const uai = appelAProjet.etablissement?.uai;
    if (!uai) {
      etablissementsErrors.push({
        error: "No UAI provided",
        uai: null,
        email: appelAProjet.referentEtablissement.email,
      });
      continue;
    }

    if ([...etablissementsToCreate, ...etablissementsToUpdate].map((etablissement) => etablissement.uai).includes(uai)) {
      etablissementsErrors.push({
        error: "UAI already processed",
        uai: appelAProjet.etablissement.uai,
        email: appelAProjet.referentEtablissement.email,
      });
      continue;
    }

    const etablissementFromAnnuaire = etablissements.find((etablissement) => etablissement.identifiant_de_l_etablissement === uai);

    if (!etablissementFromAnnuaire) {
      etablissementsErrors.push({
        error: "Etablissement not found",
        uai: appelAProjet.etablissement.uai,
        email: appelAProjet.referentEtablissement.email,
      });
      continue;
    }

    const formattedEtablissement = etablissementMapper(etablissementFromAnnuaire, [appelAProjet.referentClasse]);

    // TODO: handle schoolYears array

    if (await CleEtablissementModel.exists({ uai })) {
      etablissementsToUpdate.push(formattedEtablissement);
    } else {
      etablissementsToCreate.push(formattedEtablissement);
    }

    // Process referents classes
    const referent = await ReferentModel.exists({ email: appelAProjet.referentClasse.email });
    if (referent) {
      referentsAlreadyExisting.push(referent);
    } else {
      referentsToCreate.push(appelAProjet.referentClasse);
    }

    // Process classes
    const uniqueClasseId = buildUniqueClasseId(appelAProjet.etablissement, {
      name: appelAProjet.classe.name || "",
      coloration: appelAProjet.classe.coloration,
    });
    let formattedClasse: Partial<IClasse>;
    const classeFound = await findClasseByUniqueKeyAndUniqueId(appelAProjet.etablissement?.uai, uniqueClasseId);
    if (classeFound) {
      classesAlreadyExisting.push({
        "nom de la classe": classeFound?.name,
        "cle de la classe": classeFound?.uniqueKey,
        "id de la classe": classeFound?.uniqueId,
        "id technique de la classe existante": classeFound?._id,
        "raison ": "classe existe",
      });
    } else {
      formattedClasse = mapAppelAProjetToClasse(appelAProjet.classe, formattedEtablissement, uniqueClasseId);
      classesToCreate.push(formattedClasse);
    }

    if (save) {
      // await saveData(formattedEtablissement, referent, formattedClasse);
    }
  }

  return [
    { name: "etablissementsToCreate", data: etablissementsToCreate },
    { name: "etablissementsToUpdate", data: etablissementsToUpdate },
    { name: "etablissementsErrors", data: etablissementsErrors },
    { name: "classesAlreadyExisting", data: classesAlreadyExisting },
    { name: "classesToCreate", data: classesToCreate },
    { name: "referentsToCreate", data: referentsToCreate },
    { name: "referentsAlreadyExisting", data: referentsAlreadyExisting },
  ];
};

const mapAppelAProjetToClasse = (classeFromAppelAProjet: IAppelAProjet["classe"], etablissement: IEtablissement, uniqueClasseId: string): Partial<IClasse> => {
  return {
    name: classeFromAppelAProjet.name,
    coloration: classeFromAppelAProjet.coloration,
    uniqueId: uniqueClasseId,
    uniqueKey: etablissement.uai,
    schoolYear: ClasseSchoolYear.YEAR_2024_2025,
  };
};

// const mapReferentAppelAProjetToReferent = (referentFromAppelAProjet: IAppelAProjetReferent | undefined): Partial<IReferent> => {
//   return {
//     firstName: referentFromAppelAProjet?.prenom,
//     lastName: referentFromAppelAProjet?.nom,
//     email: referentFromAppelAProjet?.email,
//   };
// };

const saveData = async (etablissement: IEtablissement, referent: IReferent, classe: Partial<IClasse>) => {
  const savedEtablissement = await CleEtablissementModel.save(etablissement);
  const createdReferent = await ReferentModel.save(referent);
  const classeToCreate: Partial<IClasse> = {
    ...classe,
    etablissementId: savedEtablissement._id,
    referentClasseIds: [createdReferent._id],
  };
  await CleEtablissementModel.save(classeToCreate);
};
