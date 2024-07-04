import { IAppelAProjet } from "./appelAProjetType";
import { EtablissementProviderDto } from "../../services/gouv.fr/etablissementType";
import { mapEtablissementFromAnnuaireToEtablissement } from "../etablissement/etablissementMapper";
import { IEtablissement } from "../../models/cle/etablissementType";
import { CleEtablissementModel } from "../../models";
import { ReferentCreatedBy } from "snu-lib";

export class AppelAProjetEtablissementService {
  etablissements: (IEtablissement & { operation: "create" | "update" })[] = [];
  etablissementsErrors: { error: string; uai?: string | null; email?: string | null; nameAndCommune: string | undefined }[] = [];

  async processEtablissement(appelAProjet: IAppelAProjet, etablissements: EtablissementProviderDto[], referentEtablissementId, save: boolean): Promise<IEtablissement | undefined> {
    const uai = appelAProjet.etablissement?.uai;
    if (!uai) {
      this.etablissementsErrors.push({
        error: "No UAI provided",
        uai: null,
        nameAndCommune: appelAProjet?.etablissement.nameAndCommune,
        email: appelAProjet.referentEtablissement.email,
      });
      return;
    }

    const etablissementFromAnnuaire = etablissements.find((etablissement) => etablissement.identifiant_de_l_etablissement === uai);

    if (!etablissementFromAnnuaire) {
      this.etablissementsErrors.push({
        error: "Etablissement not found",
        uai: appelAProjet.etablissement.uai,
        nameAndCommune: appelAProjet?.etablissement.nameAndCommune,
        email: appelAProjet.referentEtablissement.email,
      });
      return;
    }

    const formattedEtablissement = mapEtablissementFromAnnuaireToEtablissement(etablissementFromAnnuaire, [referentEtablissementId]);

    const existingEtablissement = await CleEtablissementModel.findOne({ uai });
    const hasAlreadyBeenProcessed = this.etablissements.some((etablissement) => etablissement.uai === appelAProjet.etablissement.uai);

    if (existingEtablissement) {
      if (hasAlreadyBeenProcessed) {
        return existingEtablissement;
      }
      if (save) {
        const referentEtablissementIds = [...new Set([...existingEtablissement.referentEtablissementIds, referentEtablissementId])];
        existingEtablissement.set({
          ...existingEtablissement,
          ...formattedEtablissement,
          referentEtablissementIds: referentEtablissementIds,
          schoolYears: [...new Set([...existingEtablissement.schoolYears, ...formattedEtablissement.schoolYears])],
        });

        await existingEtablissement.save({ fromUser: { firstName: ReferentCreatedBy.SYNC_APPEL_A_PROJET_2024_2025 } });
        console.log("AppelAProjetEtablissementService - processEtablissement() - updated etablissement : ", existingEtablissement?._id);
        this.etablissements.push({ ...existingEtablissement.toObject(), operation: "update" });
        return existingEtablissement;
      }
      this.etablissements.push({ ...formattedEtablissement, operation: "update" });
      return formattedEtablissement;
    }

    let createdEtablissement;
    if (save) {
      createdEtablissement = await CleEtablissementModel.create(formattedEtablissement);
      console.log("AppelAProjetEtablissementService - processEtablissement() - created etablissement : ", createdEtablissement?._id);
    }
    if (!hasAlreadyBeenProcessed) {
      this.etablissements.push({ ...formattedEtablissement, _id: createdEtablissement?.id, operation: "create" });
    }
    if (save) {
      return createdEtablissement;
    }
    return formattedEtablissement;
  }
}
