import { ClasseSchoolYear, ReferentCreatedBy, STATUS_CLASSE, STATUS_PHASE1_CLASSE } from "snu-lib";

import { ClasseModel, ClasseType, EtablissementType } from "../../models";

import { buildUniqueClasseId, buildUniqueClasseKey, findClasseByUniqueKeyAndUniqueId } from "../classe/classeService";

import { IAppelAProjet } from "./appelAProjetType";

import { logger } from "../../logger";

export class AppelAProjetClasseService {
  classes: Partial<ClasseType & { numberDS: number; uai: string; operation: "create" | "none" }>[] = [];

  async processClasse(appelAProjet: IAppelAProjet, savedEtablissement: EtablissementType, referentClasseId, save: boolean) {
    const uniqueClasseId = buildUniqueClasseId(
      savedEtablissement,
      {
        name: appelAProjet.classe.name || "",
        coloration: appelAProjet.classe.coloration,
        estimatedSeats: appelAProjet.classe.estimatedSeats,
      },
      String(appelAProjet.numberDS),
    );
    const uniqueClasseKey = buildUniqueClasseKey(savedEtablissement);
    let formattedClasse: Partial<ClasseType>;
    const classeFound = await findClasseByUniqueKeyAndUniqueId(uniqueClasseKey, uniqueClasseId);
    if (classeFound) {
      logger.debug(`AppelAProjetClasseService - processClasse() - classe found : ${classeFound?._id}`);

      this.classes.push({ ...classeFound.toObject({ virtuals: false }), uai: appelAProjet.etablissement?.uai, numberDS: appelAProjet.numberDS, operation: "none" });
    } else {
      formattedClasse = this.mapAppelAProjetToClasse(appelAProjet.classe, savedEtablissement, uniqueClasseId, uniqueClasseKey, [referentClasseId]);
      let createdClasse;
      if (save) {
        createdClasse = await ClasseModel.create({
          ...formattedClasse,
          metadata: { createdBy: ReferentCreatedBy.SYNC_APPEL_A_PROJET_2024_2025, numeroDossierDS: appelAProjet.numberDS },
        });
        logger.debug(`AppelAProjetClasseService - processClasse() - created classe : ${createdClasse?._id}`);
      }
      this.classes.push({ ...formattedClasse, _id: createdClasse?._id, uai: appelAProjet.etablissement?.uai, numberDS: appelAProjet.numberDS, operation: "create" });
    }
  }

  private mapAppelAProjetToClasse = (
    classeFromAppelAProjet: IAppelAProjet["classe"],
    etablissement: EtablissementType,
    uniqueClasseId: string,
    uniqueClasseKey: string,
    referentClasseIds: string[],
  ): Partial<ClasseType> => {
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
      metadata: {},
    };
  };
}
