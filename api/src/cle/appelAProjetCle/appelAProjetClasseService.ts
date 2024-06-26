import { IAppelAProjet } from "./appelAProjetType";
import { IEtablissement } from "../../models/cle/etablissementType";
import { buildUniqueClasseId, findClasseByUniqueKeyAndUniqueId } from "../classe/classeService";
import { IClasse } from "../../models/cle/classeType";
import { CleClasseModel } from "../../models";
import { ClasseSchoolYear, STATUS_CLASSE, STATUS_PHASE1_CLASSE } from "snu-lib";

export class AppelAProjetClasseService {
  classesToCreate: Partial<IClasse>[] = [];
  classesAlreadyExisting: Record<string, string | undefined>[] = [];

  async processClasse(appelAProjet: IAppelAProjet, savedEtablissement: IEtablissement, referentClasseId, save: boolean) {
    const uniqueClasseId = buildUniqueClasseId(savedEtablissement, {
      name: appelAProjet.classe.name || "",
      coloration: appelAProjet.classe.coloration,
    });
    let formattedClasse: Partial<IClasse>;
    const classeFound = await findClasseByUniqueKeyAndUniqueId(appelAProjet.etablissement?.uai, uniqueClasseId);
    if (classeFound) {
      this.classesAlreadyExisting.push({
        "nom de la classe": classeFound?.name,
        "cle de la classe": classeFound?.uniqueKey,
        "id de la classe": classeFound?.uniqueId,
        "id technique de la classe existante": classeFound?._id,
        "raison ": "classe existe",
      });
    } else {
      formattedClasse = this.mapAppelAProjetToClasse(appelAProjet.classe, savedEtablissement, uniqueClasseId, [referentClasseId]);
      let createdClasse;
      if (save) {
        createdClasse = await CleClasseModel.create(formattedClasse);
      }
      this.classesToCreate.push({ ...formattedClasse, _id: createdClasse?._id });
    }
  }

  private mapAppelAProjetToClasse = (
    classeFromAppelAProjet: IAppelAProjet["classe"],
    etablissement: IEtablissement,
    uniqueClasseId: string,
    referentClasseIds: string[],
  ): IClasse => {
    return {
      academy: etablissement.academy,
      department: etablissement.department,
      region: etablissement.region,
      status: STATUS_CLASSE.CREATED,
      statusPhase1: STATUS_PHASE1_CLASSE.WAITING_AFFECTATION,
      totalSeats: classeFromAppelAProjet.estimatedSeats,
      name: classeFromAppelAProjet.name,
      coloration: classeFromAppelAProjet.coloration,
      uniqueId: uniqueClasseId,
      uniqueKey: etablissement.uai,
      uniqueKeyAndId: `${etablissement.uai}-${uniqueClasseId}`,
      schoolYear: ClasseSchoolYear.YEAR_2024_2025,
      referentClasseIds: referentClasseIds,
      etablissementId: etablissement._id!,
      estimatedSeats: classeFromAppelAProjet.estimatedSeats,
    };
  };
}
