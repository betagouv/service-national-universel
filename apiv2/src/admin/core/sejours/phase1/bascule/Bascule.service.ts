import { Injectable, Inject } from "@nestjs/common";
import { NoteType } from "@admin/core/sejours/jeune/Jeune.model";
import { JeuneModel } from "@admin/core/sejours/jeune/Jeune.model";
import { SessionModel } from "../session/Session.model";
import { ClasseModel } from "@admin/core/sejours/cle/classe/Classe.model";
import { EtablissementModel } from "@admin/core/sejours/cle/etablissement/Etablissement.model";
import { ReferentModel } from "@admin/core/iam/Referent.model";
import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { YOUNG_SOURCE, getCohortPeriod, CLE_FILIERE, YOUNG_SITUATIONS } from "snu-lib";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import {
    EmailTemplate,
    jeuneBasculeCLEParams,
    jeuneBasculeParentNotifParams,
    jeuneBasculeNotifToJeune,
} from "@notification/core/Notification";
import configuration from "@config/configuration";

interface generateYoungNoteForBaculeProps {
    jeune: JeuneModel;
    session: SessionModel;
    sessionChangeReason: string | null;
    previousEtablissement: EtablissementModel | null;
    previousClasse: ClasseModel | null;
    newSource: keyof typeof YOUNG_SOURCE;
    user: Partial<ReferentModel>;
}

interface generateNotificationForBasculeProsp {
    jeune: JeuneModel;
    originaleSource: keyof typeof YOUNG_SOURCE;
    session: SessionModel;
    sessionChangeReason: string;
    message: string;
    classe: ClasseModel;
}

@Injectable()
export class BasculeService {
    constructor(
        @Inject(ReferentGateway) private readonly referentGateway: ReferentGateway,
        @Inject(NotificationGateway) private readonly notificationGateway: NotificationGateway,
    ) {}
    static generateYoungNoteForBascule({
        jeune,
        session,
        sessionChangeReason,
        previousClasse,
        previousEtablissement,
        newSource,
        user,
    }: generateYoungNoteForBaculeProps): NoteType {
        const date = new Date();
        const newNote = {
            note: `
        Changement de cohorte de ${jeune.sessionNom} (${jeune.source || YOUNG_SOURCE.VOLONTAIRE}) à ${
            session.nom
        } (${newSource})${sessionChangeReason && ` pour la raison suivante : ${sessionChangeReason}`}.\n${
            previousEtablissement ? `Etablissement précédent : ${previousEtablissement.nom}.` : ""
        }\n${previousClasse ? `Classe précédente : ${previousClasse.uniqueKeyAndId} ${previousClasse.nom}.` : ""}\n${
            jeune.centreId ? `Centre précédent : ${jeune.centreId}.` : ""
        }\n${jeune.sejourId ? `Session précédente : ${jeune.sejourId}.` : ""}\n${
            jeune.pointDeRassemblementId ? `Point de rendez-vous précédent : ${jeune.pointDeRassemblementId}.` : ""
        }\n${
            Object.prototype.hasOwnProperty.call(jeune, "presenceJDM")
                ? `Présence JDM précédente : ${jeune.presenceJDM}.`
                : ""
        }
        `.trim(),
            phase: "PHASE_1",
            createdAt: date,
            updatedAt: date,
            referent: {
                _id: user.id,
                firstName: user.prenom,
                lastName: user.nom,
                role: user.role,
            },
        };
        return newNote;
    }

    async generateNotificationForBascule({
        jeune,
        originaleSource,
        session,
        sessionChangeReason,
        message,
        classe,
    }: generateNotificationForBasculeProsp) {
        const config = configuration();

        if (jeune.source === YOUNG_SOURCE.CLE || originaleSource === YOUNG_SOURCE.CLE) {
            const referentsClasse = await this.referentGateway.findByIds(classe.referentClasseIds);
            const emailTo = referentsClasse.map((r) => ({ name: `${r.prenom} ${r.nom}`, email: r.email }));

            const params = {
                to: emailTo,
                firstname: jeune.prenom || "",
                name: jeune.nom || "",
                class_name: classe.nom || "",
                class_code: classe.uniqueKeyAndId,
                cta: `${config.urls.admin}/classes/${classe.id?.toString()}`,
            };

            // Bascule vers CLE
            if (jeune.source === YOUNG_SOURCE.CLE) {
                await this.notificationGateway.sendEmail<jeuneBasculeCLEParams>(
                    params,
                    EmailTemplate.JEUNE_CHANGE_SESSION_TO_CLE,
                );
            }

            // Bascule CLE > HTS
            if (jeune.source === YOUNG_SOURCE.VOLONTAIRE && originaleSource === YOUNG_SOURCE.CLE) {
                await this.notificationGateway.sendEmail<jeuneBasculeCLEParams>(
                    params,
                    EmailTemplate.JEUNE_CHANGE_SESSION_CLE_TO_HTS,
                );
            }
        }

        const emailsTo: { name: string; email: string }[] = [];
        if (jeune.autorisationSNUParent1 === "true")
            emailsTo.push({ name: `${jeune.parent1Prenom} ${jeune.parent1Nom}`, email: jeune.parent1Email || "" });
        if (jeune.autorisationSNUParent2 === "true")
            emailsTo.push({ name: `${jeune.parent2Prenom} ${jeune.parent2Nom}`, email: jeune.parent2Email || "" });
        if (emailsTo.length !== 0) {
            const params = {
                to: emailsTo,
                cohort: session.nom,
                youngFirstName: jeune.prenom || "",
                youngName: jeune.nom || "",
                cta: config.urls.app || "",
            };
            await this.notificationGateway.sendEmail<jeuneBasculeParentNotifParams>(
                params,
                EmailTemplate.JEUNE_CHANGE_SESSION_CLE_TO_HTS,
            );
        }

        const sessionPeriod = getCohortPeriod({
            name: session.nom,
            dateStart: session.dateStart,
            dateEnd: session.dateEnd,
        });
        const programs = {
            [YOUNG_SOURCE.VOLONTAIRE]: "Volontaire hors temps scolaire (HTS)",
            [YOUNG_SOURCE.CLE]: "Classe engagée (CLE)",
        };

        const params = {
            to: [{ name: `${jeune.prenom} ${jeune.nom}`, email: jeune.email }],
            motif: sessionChangeReason,
            message,
            newcohortdate: sessionPeriod,
            oldprogram: programs[originaleSource],
            newprogram: jeune.source !== originaleSource ? programs[jeune.source] : "",
            cta: config.urls.app || "",
        };

        await this.notificationGateway.sendEmail<jeuneBasculeNotifToJeune>(
            params,
            EmailTemplate.JEUNE_CHANGE_SESSION_CLE_TO_HTS,
        );
    }

    static getYoungSituationIfCLE(filiere: string): string {
        if (filiere === CLE_FILIERE.GENERAL_AND_TECHNOLOGIC) {
            return YOUNG_SITUATIONS.GENERAL_SCHOOL;
        }
        if (filiere === CLE_FILIERE.PROFESSIONAL) {
            return YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL;
        }
        if (filiere === CLE_FILIERE.APPRENTICESHIP) {
            return YOUNG_SITUATIONS.APPRENTICESHIP;
        }
        if (filiere === CLE_FILIERE.ADAPTED) {
            return YOUNG_SITUATIONS.SPECIALIZED_SCHOOL;
        }
        if (filiere === CLE_FILIERE.MIXED) {
            return YOUNG_SITUATIONS.GENERAL_SCHOOL;
        }
        return filiere;
    }
}
