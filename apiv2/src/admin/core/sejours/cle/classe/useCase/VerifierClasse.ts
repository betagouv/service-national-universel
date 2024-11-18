import { Inject, Injectable } from "@nestjs/common";
import {
    EmailTemplate,
    VerifierClasseEmailAdminCleParams,
    VerifierClasseEmailReferentDepRegParams,
} from "@notification/core/Notification";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { UseCase } from "@shared/core/UseCase";
import { STATUS_CLASSE } from "snu-lib";
import { ReferentGateway } from "../../../../iam/Referent.gateway";
import { EtablissementGateway } from "../../etablissement/Etablissement.gateway";
import { GetReferentDepToBeNotified } from "../../referent/useCase/GetReferentDepToBeNotified";
import { InviterReferentClasse } from "../../referent/useCase/InviteReferentClasse";
import { ClasseGateway } from "../Classe.gateway";
import { ClasseModel } from "../Classe.model";

@Injectable()
export class VerifierClasse implements UseCase<ClasseModel> {
    constructor(
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        @Inject(EtablissementGateway)
        private etablissementGateway: EtablissementGateway,
        @Inject(NotificationGateway) private readonly notificationGateway: NotificationGateway,
        @Inject(ReferentGateway) private readonly referentGateway: ReferentGateway,
        private readonly getReferentDepToBeNotified: GetReferentDepToBeNotified,
        private readonly inviterReferentClasse: InviterReferentClasse,
    ) {}
    async execute(classeId: string): Promise<ClasseModel> {
        const classe = await this.classeGateway.findById(classeId);
        if (classe.statut !== STATUS_CLASSE.CREATED) {
            throw new FunctionalException(FunctionalExceptionCode.CLASSE_STATUT_INVALIDE);
        }

        //Email
        const etablissement = await this.etablissementGateway.findById(classe.etablissementId);

        const referentIds = [...etablissement.referentEtablissementIds, ...etablissement.coordinateurIds];
        const uniqueReferentIds = [...new Set(referentIds)];
        const referents = await this.referentGateway.findByIds(uniqueReferentIds);
        if (!referents || referents.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        const params: VerifierClasseEmailAdminCleParams = {
            to: referents.map((referent) => ({ email: referent.email, name: `${referent.prenom} ${referent.nom}` })),
            classeNom: classe.nom,
            classeCode: classe.uniqueKeyAndId,
            // TODO : add right URL when config is available
            classeUrl: `${"config.ADMIN_URL"}/classes/${classe.id?.toString()}`,
        };

        await this.notificationGateway.sendEmail<VerifierClasseEmailAdminCleParams>(
            params,
            EmailTemplate.VERIFIER_CLASSE_EMAIL_ADMIN_CLE,
        );

        const referentsDepartemantauxToNofity = await this.getReferentDepToBeNotified.execute(
            etablissement.departement,
        );
        if (referentsDepartemantauxToNofity.length > 0) {
            const paramsReferentDepReg: VerifierClasseEmailReferentDepRegParams = {
                to: referentsDepartemantauxToNofity.map((referent) => ({
                    email: referent.email,
                    name: `${referent.prenom} ${referent.nom}`,
                })),
                classeNom: classe.nom,
                classeCode: classe.uniqueKeyAndId,
                // TODO : add right URL when config is available
                classeUrl: `${"config.ADMIN_URL"}/classes/${classe.id?.toString()}`,
            };

            await this.notificationGateway.sendEmail<VerifierClasseEmailReferentDepRegParams>(
                paramsReferentDepReg,
                EmailTemplate.VERIFIER_CLASSE_EMAIL_REFERENT_DEP_REG,
            );
        }

        const referentsClasse = await this.referentGateway.findByIds(classe.referentClasseIds);
        if (referentsClasse.length > 0) {
            for (const referent of referentsClasse) {
                await this.inviterReferentClasse.execute(referent.id, classe.id, referent.metadata?.invitationType);
            }
        }

        const updatedClasse = await this.classeGateway.update({ ...classe, statut: STATUS_CLASSE.VERIFIED });

        return updatedClasse;
    }
}
