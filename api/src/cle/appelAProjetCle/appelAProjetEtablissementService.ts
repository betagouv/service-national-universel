import { IAppelAProjet } from "./appelAProjetType";
import { EtablissementProviderDto } from "../../services/gouv.fr/etablissementType";
import { mapEtablissementFromAnnuaireToEtablissement } from "../etablissement/etablissementMapper";
import { IEtablissement } from "../../models/cle/etablissementType";
import { CleEtablissementModel } from "../../models";
import { ReferentCreatedBy } from "snu-lib";

export class AppelAProjetEtablissementService {
  etablissements: (IEtablissement & { operation: "create" | "update" })[] = [];

  getEtablissementFromAnnuaire(appelAProjet: IAppelAProjet, etablissements: EtablissementProviderDto[]) {
    const uai = appelAProjet.etablissement?.uai;
    return etablissements.find((etablissement) => etablissement.identifiant_de_l_etablissement === uai);
  }

  async processEtablissement(appelAProjet: IAppelAProjet, etablissements: EtablissementProviderDto[], referentEtablissementId, save: boolean): Promise<IEtablissement | undefined> {
    const uai = appelAProjet.etablissement?.uai;
    const etablissementFromAnnuaire = this.getEtablissementFromAnnuaire(appelAProjet, etablissements);
    if (!etablissementFromAnnuaire) {
      console.log(`Etablissement not found for UAI ${uai}`);
      return;
    }

    const formattedEtablissement = mapEtablissementFromAnnuaireToEtablissement(etablissementFromAnnuaire, [referentEtablissementId]);

    const existingEtablissement = await CleEtablissementModel.findOne({ uai });
    const hasAlreadyBeenProcessed = this.etablissements.some((etablissement) => etablissement.uai === appelAProjet.etablissement.uai);

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
        console.log("AppelAProjetEtablissementService - processEtablissement() - updated etablissement : ", existingEtablissement?._id);
        this.etablissements.push({ ...existingEtablissement.toObject(), schoolYears: schoolYears, operation: "update" });
        return existingEtablissement;
      }
      this.etablissements.push({ ...formattedEtablissement, schoolYears: schoolYears, coordinateurIds: existingEtablissement.coordinateurIds, operation: "update" });
      return { ...formattedEtablissement, coordinateurIds: existingEtablissement.coordinateurIds };
    }

    let createdEtablissement;
    if (save) {
      createdEtablissement = await CleEtablissementModel.create(formattedEtablissement);
      console.log("AppelAProjetEtablissementService - processEtablissement() - created etablissement : ", createdEtablissement?._id);
    }
    if (!hasAlreadyBeenProcessed) {
      this.etablissements.push({ ...formattedEtablissement, _id: createdEtablissement?.id, coordinateurIds: [], operation: "create" });
    }
    if (save) {
      return createdEtablissement;
    }
    return { ...formattedEtablissement, coordinateurIds: [] };
  }
}
