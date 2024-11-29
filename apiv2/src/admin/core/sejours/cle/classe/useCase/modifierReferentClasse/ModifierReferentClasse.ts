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
import { InvitationType } from "snu-lib";
import { InviterReferentClasse } from "../../../referent/useCase/InviteReferentClasse";
import { ClasseGateway } from "../../Classe.gateway";
import { ClasseModel } from "../../Classe.model";

export type ModifierReferentClasseModel = Pick<ReferentModel, "email" | "prenom" | "nom">;

@Injectable()
export class ModifierReferentClasse implements UseCase<ReferentModel> {
    constructor(
        @Inject(ReferentGateway) private readonly referentGateway: ReferentGateway,
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        @Inject(NotificationGateway) private readonly notificationGateway: NotificationGateway,
        private inviterReferentClasse: InviterReferentClasse,
        private referentService: ReferentService,
    ) {}
    async execute(classeId: string, modifierReferentClasseModel: ModifierReferentClasseModel): Promise<ReferentModel> {
        const classe = await this.classeGateway.findById(classeId);
        const previousReferent = await this.referentGateway.findById(classe.referentClasseIds[0]);
        // Mise à jour du nom et prénom du référent
        if (previousReferent.email === modifierReferentClasseModel.email) {
            return await this.referentGateway.update({
                ...previousReferent,
                nom: modifierReferentClasseModel.nom,
                prenom: modifierReferentClasseModel.prenom,
            });
        }

        try {
            const newReferentOfClasse = await this.referentGateway.findByEmail(modifierReferentClasseModel.email);
            await this.handlePreviousReferent(previousReferent, classe);
            const updatedReferent = await this.handleNewReferent(
                {
                    ...newReferentOfClasse,
                    nom: modifierReferentClasseModel.nom,
                    prenom: modifierReferentClasseModel.prenom,
                },
                classe,
            );
            classe.referentClasseIds = [newReferentOfClasse.id];
            await this.classeGateway.update(classe);
            return updatedReferent;
        } catch {
            return await this.referentService.createNewReferentAndAddToClasse(modifierReferentClasseModel, classe);
        }
    }

    private async handlePreviousReferent(previousReferent: ReferentModel, classe: ClasseModel) {
        // const currentReferent = await this.referentGateway.findById(classe.referentClasseIds[0]);
        const hasCurrentReferentOtherClasses = await this.classeGateway.findByReferentId(previousReferent.id);
        if (hasCurrentReferentOtherClasses.length === 0) {
            await this.referentService.deleteReferentAndSendEmail(previousReferent);
        } else {
            await this.notificationGateway.sendEmail<SupprimerClasseEngageeParams>(
                {
                    to: [{ email: previousReferent.email, name: `${previousReferent.prenom} ${previousReferent.nom}` }],
                    classeCode: classe.uniqueKeyAndId,
                    classeNom: classe.nom,
                    compteUrl: "", // TODO : vérifier qu'il faut envoyer l'URL du compte
                },
                EmailTemplate.SUPPRIMER_CLASSE_ENGAGEE,
            );
        }
    }

    private async handleNewReferent(newReferentOfClasse: ReferentModel, classe: ClasseModel) {
        const classesOfNewReferent = await this.classeGateway.findByReferentId(newReferentOfClasse.id);
        if (classesOfNewReferent.length > 1) {
            // TODO : envoyer le template 2350
            await this.notificationGateway.sendEmail<NouvelleClasseEngageeParams>(
                {
                    to: [
                        {
                            email: newReferentOfClasse.email,
                            name: `${newReferentOfClasse.prenom} ${newReferentOfClasse.nom}`,
                        },
                    ],
                    classeCode: classe.uniqueKeyAndId,
                    classeNom: classe.nom,
                    compteUrl: "", // TODO : vériifier qu'il faut envoyer l'URL du compte
                },
                EmailTemplate.NOUVELLE_CLASSE_ENGAGEE,
            );
        } else {
            await this.inviterReferentClasse.execute(newReferentOfClasse.id, classe.id, InvitationType.INSCRIPTION); //template 1391
        }
        return await this.referentGateway.update(newReferentOfClasse);
    }
}
