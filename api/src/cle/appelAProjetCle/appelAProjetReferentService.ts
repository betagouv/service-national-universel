import { ReferentCreatedBy, ROLES, SUB_ROLES, InvitationType, EtablissementType, ReferentType } from "snu-lib";
import { ReferentModel } from "../../models";
import { IAppelAProjet } from "./appelAProjetType";
import { logger } from "../../logger";

export class AppelAProjetReferentService {
  referents: Partial<ReferentType & { operation: "create" | "none"; uai?: string }>[] = [];
  etablissements: Partial<EtablissementType>[] = [];

  async processReferentEtablissement(appelAProjet: IAppelAProjet, save: boolean): Promise<string> {
    const referentEtablissement = await ReferentModel.findOne({ email: appelAProjet.referentEtablissement.email });
    const hasAlreadyBeenProcessed = this.referents.some((referent) => referent.email === appelAProjet.referentEtablissement.email);
    const alreadyProcessedEtablissement = this.etablissements.find((etablissement) => etablissement.uai === appelAProjet.etablissement.uai);
    const referentMetadata: ReferentType["metadata"] = { createdBy: ReferentCreatedBy.SYNC_APPEL_A_PROJET_2024_2025, isFirstInvitationPending: true };

    if (alreadyProcessedEtablissement) {
      logger.debug(
        `AppelAProjetReferentService - processReferentEtablissement() - alreadyProcessedEtablissement: ${appelAProjet.referentEtablissement.email} ${
          alreadyProcessedEtablissement.referentEtablissementIds![0]
        } ${alreadyProcessedEtablissement.uai}`,
      );
      return alreadyProcessedEtablissement.referentEtablissementIds![0];
    }

    if (referentEtablissement) {
      if (referentEtablissement.role !== ROLES.ADMINISTRATEUR_CLE || referentEtablissement.subRole !== SUB_ROLES.referent_etablissement) {
        throw new Error(`Le référent ${referentEtablissement.email} n'a pas le role de chef établissement`);
      }
      if (save && referentEtablissement.metadata.createdBy !== ReferentCreatedBy.SYNC_APPEL_A_PROJET_2024_2025) {
        referentEtablissement.set({ metadata: { ...referentMetadata, invitationType: InvitationType.CONFIRMATION } });
        await referentEtablissement.save({ fromUser: { firstName: ReferentCreatedBy.SYNC_APPEL_A_PROJET_2024_2025 } });
      }
      if (!hasAlreadyBeenProcessed) {
        this.referents.push({
          _id: referentEtablissement.id,
          email: referentEtablissement.email,
          role: referentEtablissement.role,
          subRole: referentEtablissement.subRole,
          operation: "none",
          uai: appelAProjet.etablissement?.uai,
        });
        this.etablissements.push({ uai: appelAProjet.etablissement?.uai, referentEtablissementIds: [referentEtablissement.id] });
      }
      return referentEtablissement.id;
    }

    let newReferent = {
      ...appelAProjet.referentEtablissement,
      role: ROLES.ADMINISTRATEUR_CLE,
      subRole: SUB_ROLES.referent_etablissement,
      roles: [ROLES.ADMINISTRATEUR_CLE, SUB_ROLES.referent_etablissement],
      metadata: { ...referentMetadata, invitationType: InvitationType.INSCRIPTION },
    };
    let createdReferent;

    if (save) {
      createdReferent = await ReferentModel.create(newReferent);
      logger.debug(`AppelAProjetReferentService - processReferentEtablissement() - created referentEtablissement : ${createdReferent?._id}`);
    }

    if (!hasAlreadyBeenProcessed) {
      this.referents.push({ ...newReferent, _id: createdReferent?._id, operation: "create", uai: appelAProjet.etablissement?.uai });
      this.etablissements.push({ uai: appelAProjet.etablissement?.uai, referentEtablissementIds: [createdReferent?.id] });
    }

    return createdReferent?.id;
  }

  async processReferentClasse(appelAProjet: IAppelAProjet, save: boolean): Promise<string> {
    const existingReferentClasse = await ReferentModel.findOne({ email: appelAProjet.referentClasse?.email });
    const hasAlreadyBeenProcessed = this.referents.some((referent) => referent.email === appelAProjet.referentClasse?.email);
    const referentMetadata: ReferentType["metadata"] = { createdBy: ReferentCreatedBy.SYNC_APPEL_A_PROJET_2024_2025, isFirstInvitationPending: true };

    if (existingReferentClasse) {
      if (existingReferentClasse.role !== ROLES.REFERENT_CLASSE || !!existingReferentClasse.subRole) {
        throw new Error(`Le référent ${existingReferentClasse.email} n'a pas le role referent de classe`);
      }
      if (!hasAlreadyBeenProcessed) {
        this.referents.push({
          _id: existingReferentClasse._id,
          email: existingReferentClasse.email,
          role: existingReferentClasse.role,
          subRole: existingReferentClasse.subRole,
          operation: "none",
          uai: appelAProjet.etablissement?.uai,
        });
      }
      if (save) {
        // @ts-expect-error enum type ?
        if (!existingReferentClasse.metadata.createdBy === ReferentCreatedBy.SYNC_APPEL_A_PROJET_2024_2025) {
          existingReferentClasse.set({ metadata: { ...referentMetadata, invitationType: InvitationType.CONFIRMATION } });
        }
        await existingReferentClasse.save({ fromUser: { firstName: ReferentCreatedBy.SYNC_APPEL_A_PROJET_2024_2025 } });
      }
      return existingReferentClasse._id;
    }

    const newClasseReferent = { ...appelAProjet.referentClasse, role: ROLES.REFERENT_CLASSE, metadata: { ...referentMetadata, invitationType: InvitationType.INSCRIPTION } };
    let createdReferent;
    if (save) {
      createdReferent = await ReferentModel.create(newClasseReferent);
      logger.debug(`AppelAProjetReferentService - processReferentClasse() - created referentClasse : ${createdReferent?._id}`);
    }
    if (!hasAlreadyBeenProcessed) {
      this.referents.push({ ...newClasseReferent, _id: createdReferent?._id, operation: "create", uai: appelAProjet.etablissement?.uai });
    }

    return createdReferent?._id;
  }
}
