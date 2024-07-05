import { IAppelAProjet } from "./appelAProjetType";
import { ReferentModel } from "../../models";
import { InvitationType, IReferent, ReferentMetadata } from "../../models/referentType";
import { ReferentCreatedBy, ROLES, SUB_ROLES } from "snu-lib";

export class AppelAProjetReferentService {
  referents: Partial<IReferent & { operation: "create" | "none"; uai?: string }>[] = [];

  async processReferentEtablissement(appelAProjet: IAppelAProjet, save: boolean): Promise<string> {
    const referentEtablissement = await ReferentModel.findOne({ email: appelAProjet.referentEtablissement.email });
    const hasAlreadyBeenProcessed = this.referents.some((referent) => referent.email === appelAProjet.referentEtablissement.email);
    const referentMetadata: ReferentMetadata = { createdBy: ReferentCreatedBy.SYNC_APPEL_A_PROJET_2024_2025, isFirstInvitationPending: true };

    if (referentEtablissement) {
      if (!hasAlreadyBeenProcessed) {
        this.referents.push({
          _id: referentEtablissement.id,
          email: referentEtablissement.email,
          role: referentEtablissement.role,
          subRole: referentEtablissement.subRole,
          operation: "none",
          uai: appelAProjet.etablissement?.uai,
        });
      }

      if (save) {
        if (!referentEtablissement.metadata.createdBy === ReferentCreatedBy.SYNC_APPEL_A_PROJET_2024_2025) {
          referentEtablissement.set({ metadata: { ...referentMetadata, invitationType: InvitationType.CONFIRMATION } });
        }
        await referentEtablissement.save({ fromUser: ReferentCreatedBy.SYNC_APPEL_A_PROJET_2024_2025 });
      }
      if (!hasAlreadyBeenProcessed) {
        this.referents.push({ ...referentEtablissement, _id: referentEtablissement?._id, operation: "none", error: "", uai: appelAProjet.etablissement?.uai });
      }
      return referentEtablissement.id;
    }

    let newReferent = {
      ...appelAProjet.referentEtablissement,
      role: ROLES.ADMINISTRATEUR_CLE,
      subRole: SUB_ROLES.referent_etablissement,
      metadata: { ...referentMetadata, invitationType: InvitationType.INSCRIPTION },
    };
    let createdReferent;

    if (save) {
      createdReferent = await ReferentModel.create(newReferent);
      console.log("AppelAProjetReferentService - processReferentEtablissement() - created referentEtablissement : ", createdReferent?._id);
    }

    if (!hasAlreadyBeenProcessed) {
      this.referents.push({ ...newReferent, _id: createdReferent?._id, operation: "create", uai: appelAProjet.etablissement?.uai });
    }

    return createdReferent?.id;
  }

  async processReferentClasse(appelAProjet: IAppelAProjet, save: boolean): Promise<string> {
    const existingReferentClasse = await ReferentModel.findOne({ email: appelAProjet.referentClasse.email });
    const hasAlreadyBeenProcessed = this.referents.some((referent) => referent.email === appelAProjet.referentClasse.email);
    const referentMetadata: ReferentMetadata = { createdBy: ReferentCreatedBy.SYNC_APPEL_A_PROJET_2024_2025, isFirstInvitationPending: true };

    if (existingReferentClasse) {
      if (!hasAlreadyBeenProcessed) {
        this.referents.push({
          _id: existingReferentClasse._id,
          email: existingReferentClasse.email,
          role: existingReferentClasse.role,
          operation: "none",
          uai: appelAProjet.etablissement?.uai,
        });
      }
      if (save) {
        if (!existingReferentClasse.metadata.createdBy === ReferentCreatedBy.SYNC_APPEL_A_PROJET_2024_2025) {
          existingReferentClasse.set({ metadata: { ...referentMetadata, invitationType: InvitationType.CONFIRMATION } });
        }
        await existingReferentClasse.save({ fromUser: ReferentCreatedBy.SYNC_APPEL_A_PROJET_2024_2025 });
      }
      return existingReferentClasse._id;
    }

    const newClasseReferent = { ...appelAProjet.referentClasse, role: ROLES.REFERENT_CLASSE, metadata: { ...referentMetadata, invitationType: InvitationType.INSCRIPTION } };
    let createdReferent;
    if (save) {
      createdReferent = await ReferentModel.create(newClasseReferent);
      console.log("AppelAProjetReferentService - processReferentClasse() - created referentClasse : ", createdReferent?._id);
    }
    if (!hasAlreadyBeenProcessed) {
      this.referents.push({ ...newClasseReferent, _id: createdReferent?._id, operation: "create", uai: appelAProjet.etablissement?.uai });
    }

    return createdReferent?._id;
  }
}
