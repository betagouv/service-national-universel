import { Inject, Injectable } from "@nestjs/common";
import { ReferentGateway } from "../Referent.gateway";
import { CreateReferentModel, ReferentModel } from "../Referent.model";
import { EmailTemplate, SupprimerReferentClasseParams } from "@notification/core/Notification";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { ClasseModel } from "../../sejours/cle/classe/Classe.model";
import { InvitationType, ROLES } from "snu-lib";
import { ClasseGateway } from "../../sejours/cle/classe/Classe.gateway";
import { InviterReferentClasse } from "../../sejours/cle/referent/useCase/InviteReferentClasse";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

Injectable();
export class ReferentService {
    constructor(
        @Inject(ReferentGateway) private readonly referentGateway: ReferentGateway,
        @Inject(NotificationGateway) private readonly notificationGateway: NotificationGateway,
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        private inviterReferentClasse: InviterReferentClasse,
    ) {}

    async findByEmail(email: string): Promise<ReferentModel> {
        const referent = await this.referentGateway.findByEmail(email);
        if (!referent) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return referent;
    }

    async deleteReferentAndSendEmail(referent: ReferentModel) {
        await this.referentGateway.delete(referent.id);
        await this.notificationGateway.sendEmail<SupprimerReferentClasseParams>(
            {
                to: [{ email: referent.email, name: `${referent.prenom} ${referent.nom}` }],
            },
            EmailTemplate.SUPPRIMER_REFERENT_CLASSE,
        );
    }

    async createNewReferentAndAddToClasse(
        referent: Pick<CreateReferentModel, "email" | "prenom" | "nom">,
        classe: ClasseModel,
    ): Promise<ReferentModel> {
        const newReferent = await this.referentGateway.create({
            metadata: {},
            region: "",
            invitationToken: "",
            role: ROLES.REFERENT_CLASSE,
            ...referent,
        });
        classe.referentClasseIds = [newReferent.id];
        await this.classeGateway.update(classe);
        await this.inviterReferentClasse.execute(newReferent.id, classe.id, InvitationType.INSCRIPTION);
        return newReferent;
    }
}
