import { IAppelAProjet } from "./appelAProjetType";
import { ReferentModel } from "../../models";
import { IReferent, ReferentMetadata } from "../../models/referentType";
import { ReferentCreatedBy, ROLES, SUB_ROLES } from "snu-lib";

export class AppelAProjetReferentService {
  referents: Partial<IReferent & { operation: "create" | "none" }>[] = [];

  async processReferentEtablissement(appelAProjet: IAppelAProjet, save: boolean): Promise<string> {
    const referentEtablissement = await ReferentModel.findOne({ email: appelAProjet.referentEtablissement.email });

    if (referentEtablissement) {
      const hasAlreadyBeenProcessed = this.referents.some((referent) => referent.email === appelAProjet.referentEtablissement.email);
      if (!hasAlreadyBeenProcessed) {
        this.referents.push({
          _id: referentEtablissement.id,
          email: referentEtablissement.email,
          role: referentEtablissement.role,
          subRole: referentEtablissement.subRole,
          operation: "none",
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
      console.log("AppelAProjetReferentService - processReferentEtablissement() - created referentEtablissement : ", createdReferent?._id);
    }
    this.referents.push({ ...newReferent, _id: createdReferent?._id, operation: "create" });

    return createdReferent?.id;
  }

  async processReferentClasse(appelAProjet: IAppelAProjet, save: boolean): Promise<string> {
    const existingReferentClasse = await ReferentModel.findOne({ email: appelAProjet.referentClasse.email });

    if (existingReferentClasse) {
      const hasAlreadyBeenProcessed = this.referents.some((referent) => referent.email === appelAProjet.referentClasse.email);
      if (!hasAlreadyBeenProcessed) {
        this.referents.push({ _id: existingReferentClasse._id, email: existingReferentClasse.email, role: existingReferentClasse.role, operation: "none" });
      }
      return existingReferentClasse._id;
    }
    const referentMetadata: ReferentMetadata = { createdBy: ReferentCreatedBy.SYNC_APPEL_A_PROJET_2024_2025 };

    const newClasseReferent = { ...appelAProjet.referentClasse, role: ROLES.REFERENT_CLASSE, metadata: referentMetadata };
    let createdReferent;
    if (save) {
      createdReferent = await ReferentModel.create(newClasseReferent);
      console.log("AppelAProjetReferentService - processReferentClasse() - created referentClasse : ", createdReferent?._id);
    }
    this.referents.push({ ...newClasseReferent, _id: createdReferent?._id, operation: "create" });

    return createdReferent?._id;
  }
}
