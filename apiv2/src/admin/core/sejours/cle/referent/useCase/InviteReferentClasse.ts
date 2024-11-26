import { Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EmailTemplate, InviterReferentClasseParams } from "@notification/core/Notification";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { UseCase } from "@shared/core/UseCase";
import { InvitationType } from "snu-lib";
import { ReferentGateway } from "src/admin/core/iam/Referent.gateway";
import { ClasseGateway } from "../../classe/Classe.gateway";
import { EtablissementGateway } from "../../etablissement/Etablissement.gateway";

export interface InviteReferentClasseParam {
    referentId: string;
    classeId: string;
    invitationType: InvitationType;
}

export class InviterReferentClasse implements UseCase<void> {
    constructor(
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        @Inject(EtablissementGateway)
        private etablissementGateway: EtablissementGateway,
        @Inject(NotificationGateway) private readonly notificationGateway: NotificationGateway,
        @Inject(ReferentGateway) private readonly referentGateway: ReferentGateway,
        private readonly config: ConfigService,
    ) {}
    async execute(referentId: string, classeId: string, invitationType?: InvitationType): Promise<void> {
        const referent = await this.referentGateway.generateInvitationTokenById(referentId);

        const classe = await this.classeGateway.findById(classeId);
        const etablissement = await this.etablissementGateway.findById(classe.etablissementId);
        const chefEtab = await this.referentGateway.findById(etablissement.referentEtablissementIds[0]);

        let inscriptionUrl = `${this.config.get("urls.admin")}/creer-mon-compte?token=${referent.invitationToken}`;
        let template = EmailTemplate.INVITER_REFERENT_CLASSE_TO_INSCRIPTION;
        if (invitationType === InvitationType.CONFIRMATION) {
            inscriptionUrl = `${this.config.get("urls.admin")}/verifier-mon-compte?token=${referent.invitationToken}`;
            template = EmailTemplate.INVITER_REFERENT_CLASSE_TO_CONFIRMATION;
        }

        return await this.notificationGateway.sendEmail<InviterReferentClasseParams>(
            {
                from: `${chefEtab.prenom} ${chefEtab.nom}`,
                to: [{ email: referent.email, name: `${referent.prenom} ${referent.nom}` }],
                classeNom: classe.nom,
                classeCode: classe.uniqueKeyAndId,
                invitationUrl: inscriptionUrl,
                etablissementEmail: referent.email,
                etablissementNom: etablissement.nom,
            },
            template,
        );
    }
}
