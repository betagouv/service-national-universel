import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { ReferentGateway } from "../Referent.gateway";
import { CreateReferentModel, ReferentModel, ReferentModelLight } from "../Referent.model";
import { EmailTemplate, SupprimerReferentClasseParams } from "@notification/core/Notification";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { ClasseModel } from "../../sejours/cle/classe/Classe.model";
import { InvitationType, ROLES, isAdmin, isAdminCle, isReferentDep, isReferentReg } from "snu-lib";
import { ClasseGateway } from "../../sejours/cle/classe/Classe.gateway";
import { EtablissementGateway } from "../../sejours/cle/etablissement/Etablissement.gateway";
import { InviterReferentClasse } from "../../sejours/cle/referent/useCase/InviteReferentClasse";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { Role } from "@shared/core/Role";

@Injectable()
export class ReferentService {
    constructor(
        @Inject(ReferentGateway) private readonly referentGateway: ReferentGateway,
        @Inject(NotificationGateway) private readonly notificationGateway: NotificationGateway,
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        @Inject(EtablissementGateway) private readonly etablissementGateway: EtablissementGateway,
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

    async createNewReferentAndAssignToClasse(
        referent: Pick<CreateReferentModel, "email" | "prenom" | "nom">,
        classe: ClasseModel,
    ): Promise<ReferentModel> {
        const newReferent = await this.referentGateway.create({
            metadata: {},
            region: classe.region,
            invitationToken: "",
            role: ROLES.REFERENT_CLASSE,
            ...referent,
        });
        classe.referentClasseIds = [newReferent.id];
        await this.classeGateway.update(classe);
        await this.inviterReferentClasse.execute(newReferent.id, classe.id, InvitationType.INSCRIPTION);
        return newReferent;
    }

    /**
     * Liste les référents d'un établissement.
     *
     * L'établissement est obligatoire et doit appartenir au périmètre de l'appelant : sans cela
     * la route devient un annuaire national des référents (identité + email), accessible au rôle
     * le plus faible qui passe le guard (administrateur CLE d'un seul établissement).
     */
    async findByRoleAndEtablissement(
        auteur: Partial<Pick<ReferentModel, "id" | "role" | "departement" | "region">>,
        role: Role,
        etablissementId: string,
        search?: string,
    ): Promise<ReferentModelLight[]> {
        if (!etablissementId) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_ENOUGH_DATA, "etablissementId is required");
        }
        await this.assertEtablissementDansPerimetre(auteur, etablissementId);
        return this.referentGateway.findByRoleAndEtablissement(role, etablissementId, search);
    }

    private async assertEtablissementDansPerimetre(
        auteur: Partial<Pick<ReferentModel, "id" | "role" | "departement" | "region">>,
        etablissementId: string,
    ): Promise<void> {
        if (isAdmin(auteur)) {
            return;
        }
        const etablissement = await this.etablissementGateway.findById(etablissementId);

        if (isAdminCle(auteur)) {
            const rattache =
                !!auteur.id &&
                (etablissement.referentEtablissementIds.includes(auteur.id) ||
                    etablissement.coordinateurIds.includes(auteur.id));
            if (rattache) {
                return;
            }
        }
        if (isReferentDep(auteur) && auteur.departement?.includes(etablissement.departement)) {
            return;
        }
        if (isReferentReg(auteur) && auteur.region === etablissement.region) {
            return;
        }

        throw new ForbiddenException("Etablissement hors du périmètre de l'utilisateur");
    }

    async isReferentClasseInEtablissement(referentId: string, etablissementId: string): Promise<boolean> {
        // Usage interne : le périmètre est déjà vérifié par l'appelant.
        const referentsClasseInEtablissement = await this.referentGateway.findByRoleAndEtablissement(
            ROLES.REFERENT_CLASSE,
            etablissementId,
        );

        return referentsClasseInEtablissement.some((referent) => referent.id === referentId);
    }
}
