import { IAppelAProjet } from "./appelAProjetType";
import { ReferentModel } from "../../models";
import { IReferent, ReferentMetadata } from "../../models/referentType";
import { ReferentCreatedBy, ROLES, SUB_ROLES } from "snu-lib";

export class AppelAProjetReferentService {
  referentsToCreate: Partial<IReferent>[] = [];
  referentsAlreadyExisting: Partial<IReferent>[] = [];

  async processReferentEtablissement(appelAProjet: IAppelAProjet, save: boolean): Promise<string> {
    const referentEtablissement = await ReferentModel.findOne({ email: appelAProjet.referentEtablissement.email });

    if (referentEtablissement) {
      const hasAlreadyBeenProcessed =
        this.referentsToCreate.some((referent) => referent.email === appelAProjet.referentEtablissement.email) ||
        this.referentsAlreadyExisting.some((referent) => referent.email === appelAProjet.referentEtablissement.email);
      if (!hasAlreadyBeenProcessed) {
        this.referentsAlreadyExisting.push({
          _id: referentEtablissement.id,
          email: referentEtablissement.email,
          role: referentEtablissement.role,
          subRole: referentEtablissement.subRole,
        });
      }
      return referentEtablissement.id;
    }

    const referentMetadata: ReferentMetadata = { createdBy: ReferentCreatedBy.SYNC_APPEL_A_PROJET_2024_2025 };
    let newReferent = {
      ...appelAProjet.referentEtablissement,
      role: ROLES.ADMINISTRATEUR_CLE,
      subRole: SUB_ROLES.referent_etablissement,
      metadata: referentMetadata,
    };
    let createdReferent;
    if (save) {
      createdReferent = await ReferentModel.create(newReferent);
    }
    this.referentsToCreate.push({ ...newReferent, _id: createdReferent?._id });

    return createdReferent?.id;
  }

  async processReferentClasse(appelAProjet: IAppelAProjet, save: boolean): Promise<string> {
    const existingReferentClasse = await ReferentModel.findOne({ email: appelAProjet.referentClasse.email });

    if (existingReferentClasse) {
      const hasAlreadyBeenProcessed =
        this.referentsToCreate.some((referent) => referent.email === appelAProjet.referentClasse.email) ||
        this.referentsAlreadyExisting.some((referent) => referent.email === appelAProjet.referentClasse.email);
      if (!hasAlreadyBeenProcessed) {
        this.referentsAlreadyExisting.push({ _id: existingReferentClasse._id, email: existingReferentClasse.email, role: existingReferentClasse.role });
      }
      return existingReferentClasse._id;
    }
    const referentMetadata: ReferentMetadata = { createdBy: ReferentCreatedBy.SYNC_APPEL_A_PROJET_2024_2025 };

    const newClasseReferent = { ...appelAProjet.referentClasse, role: ROLES.REFERENT_CLASSE, metadata: referentMetadata };
    let createdReferent;
    if (save) {
      createdReferent = await ReferentModel.create(newClasseReferent);
    }
    this.referentsToCreate.push({ ...newClasseReferent, _id: createdReferent?._id });

    return createdReferent?._id;
  }
}
