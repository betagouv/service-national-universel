import { ReferentCreatedBy, ClasseSchoolYear } from "snu-lib";

import { IAppelAProjet, IAppelAProjetOptions } from "./appelAProjetType";
import { EtablissementProviderDto } from "../../services/gouv.fr/etablissementType";
import { mapEtablissementFromAnnuaireToEtablissement } from "../etablissement/etablissementMapper";
import { EtablissementModel, EtablissementType } from "../../models";

import { logger } from "../../logger";

export class AppelAProjetEtablissementService {
  etablissements: (EtablissementType & { operation: "create" | "update" })[] = [];

  getEtablissementFromAnnuaire(appelAProjet: IAppelAProjet, etablissements: EtablissementProviderDto[]) {
    const uai = appelAProjet.etablissement?.uai;
    return etablissements.find((etablissement) => etablissement.identifiant_de_l_etablissement === uai);
  }

  async processEtablissement(
    appelAProjet: IAppelAProjet,
    etablissements: EtablissementProviderDto[],
    referentEtablissementId,
    save: boolean,
    appelAProjetOptions: IAppelAProjetOptions,
  ): Promise<EtablissementType | undefined> {
    const uai = appelAProjet.etablissement?.uai;
    const useExistingEtablissement = appelAProjetOptions.fixes?.find(({ numberDS }) => numberDS === appelAProjet.numberDS)?.useExistingEtablissement;

    const etablissementFromAnnuaire = this.getEtablissementFromAnnuaire(appelAProjet, etablissements);
    if (!useExistingEtablissement && !etablissementFromAnnuaire) {
      logger.debug(`Etablissement not found for UAI ${uai}`);
      return;
    }

    const existingEtablissement = await EtablissementModel.findOne({ uai });
    const hasAlreadyBeenProcessed = this.etablissements.some((etablissement) => etablissement.uai === appelAProjet.etablissement.uai);
    if (useExistingEtablissement && !existingEtablissement) {
      logger.debug(`Cannot use existing etablissement ${uai}: Not Found !`);
      return;
    }

    const formattedEtablissement = etablissementFromAnnuaire
      ? mapEtablissementFromAnnuaireToEtablissement(etablissementFromAnnuaire, [referentEtablissementId])
      : { state: "inactive", schoolYears: [ClasseSchoolYear.YEAR_2024_2025], referentEtablissementIds: [referentEtablissementId] };

    if (existingEtablissement) {
      if (hasAlreadyBeenProcessed) {
        return existingEtablissement;
      }
      const schoolYears = [...new Set([...existingEtablissement.schoolYears, ...formattedEtablissement.schoolYears])];

      if (save) {
        existingEtablissement.set({
          ...existingEtablissement,
          ...formattedEtablissement,
          schoolYears: schoolYears,
        });

        await existingEtablissement.save({ fromUser: { firstName: ReferentCreatedBy.SYNC_APPEL_A_PROJET_2024_2025 } });
        logger.debug(`AppelAProjetEtablissementService - processEtablissement() - updated etablissement : ${existingEtablissement?._id}`);
        this.etablissements.push({ ...existingEtablissement.toObject(), schoolYears: schoolYears, operation: "update" });
        return existingEtablissement;
      }
      this.etablissements.push({
        ...existingEtablissement.toObject(),
        ...formattedEtablissement,
        schoolYears: schoolYears,
        operation: "update",
      } as any);
      return { ...existingEtablissement.toObject(), ...formattedEtablissement, schoolYears: schoolYears } as any;
    }

    let createdEtablissement;
    if (save) {
      createdEtablissement = await EtablissementModel.create(formattedEtablissement);
      logger.debug(`AppelAProjetEtablissementService - processEtablissement() - created etablissement : ${createdEtablissement?._id}`);
    }
    if (!hasAlreadyBeenProcessed) {
      // @ts-expect-error on ne crée pas d'établissemnt si il esxite déjà donc formattedEtablissement est complet ici
      this.etablissements.push({ ...formattedEtablissement, _id: createdEtablissement?.id, coordinateurIds: [], operation: "create" });
    }
    if (save) {
      return createdEtablissement;
    }
    // @ts-expect-error on ne crée pas d'établissemnt si il esxite déjà donc formattedEtablissement est complet ici
    return { ...formattedEtablissement, coordinateurIds: [] };
  }
}
