import { IAppelAProjet } from "./appelAProjetType";
import { EtablissementProviderDto } from "../../services/gouv.fr/etablissementType";
import { mapEtablissementFromAnnuaireToEtablissement } from "../etablissement/etablissementMapper";
import { EtablissementDocument, IEtablissement } from "../../models/cle/etablissementType";
import { CleEtablissementModel } from "../../models";

export class AppelAProjetEtablissementService {
  etablissementsToCreate: IEtablissement[] = [];
  etablissementsToUpdate: IEtablissement[] = [];
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

    const existingEtablissement: EtablissementDocument = await CleEtablissementModel.findOne({ uai });
    if (existingEtablissement) {
      const hasAlreadyBeenProcessed =
        this.etablissementsToCreate.some((etablissement) => etablissement.uai === appelAProjet.etablissement.uai) ||
        this.etablissementsToUpdate.some((etablissement) => etablissement.uai === appelAProjet.etablissement.uai);
      if (hasAlreadyBeenProcessed) {
        return existingEtablissement;
      }
      if (save) {
        const referentEtablissementIds = [...new Set([...existingEtablissement.referentEtablissementIds, referentEtablissementId])];
        existingEtablissement.set({ ...existingEtablissement, ...formattedEtablissement, referentEtablissementIds: referentEtablissementIds });
        await existingEtablissement.save();
        this.etablissementsToUpdate.push(existingEtablissement.toObject());
        return existingEtablissement;
      }
      this.etablissementsToUpdate.push(formattedEtablissement);
      return formattedEtablissement;
    }

    let createdEtablissement;
    if (save) {
      createdEtablissement = await CleEtablissementModel.create(formattedEtablissement);
    }
    this.etablissementsToCreate.push({ ...formattedEtablissement, _id: createdEtablissement?.id });

    return createdEtablissement;
  }
}
