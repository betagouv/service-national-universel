import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { ReferentModel } from "@admin/core/iam/Referent.model";
import { ReferentService } from "@admin/core/iam/service/Referent.service";
import { Inject, Injectable } from "@nestjs/common";
import {
    EmailTemplate,
    NouvelleClasseEngageeParams,
    SupprimerClasseEngageeParams,
} from "@notification/core/Notification";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { UseCase } from "@shared/core/UseCase";
import { InvitationType, ROLES } from "snu-lib";
import { InviterReferentClasse } from "../../../referent/useCase/InviteReferentClasse";
import { ClasseGateway } from "../../Classe.gateway";
import { ClasseModel } from "../../Classe.model";
import { ConfigService } from "@nestjs/config";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

export type ModifierReferentClasseModel = Pick<ReferentModel, "email" | "prenom" | "nom">;

@Injectable()
export class ModifierReferentClasse implements UseCase<ReferentModel> {
    constructor(
        @Inject(ReferentGateway) private readonly referentGateway: ReferentGateway,
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        @Inject(NotificationGateway) private readonly notificationGateway: NotificationGateway,
        private inviterReferentClasse: InviterReferentClasse,
        private referentService: ReferentService,
        private readonly config: ConfigService,
    ) {}

    async execute(classeId: string, modifierReferent: ModifierReferentClasseModel): Promise<ReferentModel> {
        const classe = await this.classeGateway.findById(classeId);
        const referentBeforeAssignement = await this.referentGateway.findById(classe.referentClasseIds[0]);

        // Update du nom et prénom
        if (referentBeforeAssignement.email === modifierReferent.email) {
            return this.referentGateway.update({
                ...referentBeforeAssignement,
                nom: modifierReferent.nom,
                prenom: modifierReferent.prenom,
            });
        }

        const existingReferentToBeAssigned = await this.findExistingReferentByEmail(modifierReferent.email);

        if (existingReferentToBeAssigned) {
            if (existingReferentToBeAssigned.role !== ROLES.REFERENT_CLASSE) {
                throw new FunctionalException(FunctionalExceptionCode.ROLE_NOT_REFERENT_CLASSE);
            }
            const nextReferent = {
                ...existingReferentToBeAssigned,
                prenom: modifierReferent.prenom,
                nom: modifierReferent.nom,
            };
            // Mise à jour du lien entre la classe et le référent
            classe.referentClasseIds = [nextReferent.id];
            await this.classeGateway.update(classe);

            await this.handlePreviousReferent(referentBeforeAssignement, classe);
            return await this.handleExistingReferentAfterAssignement(nextReferent, classe);
        }
        const newReferent = await this.referentService.createNewReferentAndAssignToClasse(modifierReferent, classe);
        await this.handlePreviousReferent(referentBeforeAssignement, classe);
        return newReferent;
    }

    private async findExistingReferentByEmail(email: string): Promise<ReferentModel | null> {
        try {
            return await this.referentGateway.findByEmail(email);
        } catch (e) {
            return null;
        }
    }

    private async handlePreviousReferent(previousReferent: ReferentModel, classe: ClasseModel): Promise<void> {
        const previousReferentClasses = await this.classeGateway.findByReferentId(previousReferent.id);
        if (previousReferent.role !== ROLES.REFERENT_CLASSE) {
            return;
        }
        if (previousReferentClasses.length === 0) {
            await this.referentService.deleteReferentAndSendEmail(previousReferent);
        } else {
            await this.sendClasseRemovalNotification(previousReferent, classe);
        }
    }

    private async handleExistingReferentAfterAssignement(
        newReferent: ReferentModel,
        classe: ClasseModel,
    ): Promise<ReferentModel> {
        const referentClasses = await this.classeGateway.findByReferentId(newReferent.id);

        if (referentClasses.length <= 1) {
            await this.inviterReferentClasse.execute(newReferent.id, classe.id, InvitationType.INSCRIPTION);
        } else {
            await this.sendNewClasseNotification(newReferent, classe);
        }

        return await this.referentGateway.update(newReferent);
    }

    private async sendClasseRemovalNotification(referent: ReferentModel, classe: ClasseModel): Promise<void> {
        await this.notificationGateway.sendEmail<SupprimerClasseEngageeParams>(
            {
                to: [
                    {
                        email: referent.email,
                        name: `${referent.prenom} ${referent.nom}`,
                    },
                ],
                classeCode: classe.uniqueKeyAndId,
                classeNom: classe.nom,
                compteUrl: this.config.getOrThrow("urls.admin"),
            },
            EmailTemplate.SUPPRIMER_CLASSE_ENGAGEE,
        );
    }

    private async sendNewClasseNotification(referent: ReferentModel, classe: ClasseModel): Promise<void> {
        await this.notificationGateway.sendEmail<NouvelleClasseEngageeParams>(
            {
                to: [
                    {
                        email: referent.email,
                        name: `${referent.prenom} ${referent.nom}`,
                    },
                ],
                classeCode: classe.uniqueKeyAndId,
                classeNom: classe.nom,
                compteUrl: this.config.getOrThrow("urls.admin"),
            },
            EmailTemplate.NOUVELLE_CLASSE_ENGAGEE,
        );
    }
}
