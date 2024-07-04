import { IAppelAProjet } from "./appelAProjetType";
import { IEtablissement } from "../../models/cle/etablissementType";
import { buildUniqueClasseId, buildUniqueClasseKey, findClasseByUniqueKeyAndUniqueId } from "../classe/classeService";
import { IClasse } from "../../models/cle/classeType";
import { CleClasseModel } from "../../models";
import { ClasseSchoolYear, STATUS_CLASSE, STATUS_PHASE1_CLASSE } from "snu-lib";

export class AppelAProjetClasseService {
  classes: Partial<IClasse & { operation: "create" | "none" }>[] = [];

  async processClasse(appelAProjet: IAppelAProjet, savedEtablissement: IEtablissement, referentClasseId, save: boolean) {
    const uniqueClasseId = buildUniqueClasseId({
      name: appelAProjet.classe.name || "",
      coloration: appelAProjet.classe.coloration,
    });
    const uniqueClasseKey = buildUniqueClasseKey(savedEtablissement);
    let formattedClasse: Partial<IClasse>;
    const classeFound = await findClasseByUniqueKeyAndUniqueId(appelAProjet.etablissement?.uai, uniqueClasseId);
    if (classeFound) {
      console.log("AppelAProjetClasseService - processClasse() - classe found : ", classeFound?._id);

      this.classes.push({ ...classeFound.toObject({ virtuals: false }), operation: "none" });
    } else {
      formattedClasse = this.mapAppelAProjetToClasse(appelAProjet.classe, savedEtablissement, uniqueClasseId, uniqueClasseKey, [referentClasseId]);
      let createdClasse;
      if (save) {
        createdClasse = await CleClasseModel.create(formattedClasse);
        console.log("AppelAProjetClasseService - processClasse() - created classe : ", createdClasse?._id);
      }
      this.classes.push({ ...formattedClasse, _id: createdClasse?._id, operation: "create" });
    }
  }

  private mapAppelAProjetToClasse = (
    classeFromAppelAProjet: IAppelAProjet["classe"],
    etablissement: IEtablissement,
    uniqueClasseId: string,
    uniqueClasseKey: string,
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
      uniqueKey: uniqueClasseKey,
      uniqueKeyAndId: `${uniqueClasseKey}-${uniqueClasseId}`,
      schoolYear: ClasseSchoolYear.YEAR_2024_2025,
      referentClasseIds: referentClasseIds,
      etablissementId: etablissement._id!,
      estimatedSeats: classeFromAppelAProjet.estimatedSeats,
    };
  };
}
