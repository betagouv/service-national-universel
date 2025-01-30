import {
    EmailParams,
    EmailTemplate,
    InviterReferentClasseParams,
    SupprimerClasseEngageeParams,
    VerifierClasseEmailAdminCleParams,
    VerifierClasseEmailReferentDepRegParams,
    jeuneBasculeCLEParams,
    jeuneBasculeParentNotifParams,
    jeuneBasculeNotifToJeune,
} from "@notification/core/Notification";
import { EmailProviderParams } from "./EmailBrevo.provider";

export class EmailBrevoMapper {
    static mapEmailParamsToBrevoByTemplate(template: EmailTemplate, emailParams: EmailParams): EmailProviderParams {
        switch (template) {
            case EmailTemplate.VERIFIER_CLASSE_EMAIL_ADMIN_CLE: {
                return this.mapVerifierClasseAdminCleToBrevo(
                    template,
                    emailParams as VerifierClasseEmailAdminCleParams,
                );
            }
            case EmailTemplate.VERIFIER_CLASSE_EMAIL_REFERENT_DEP_REG: {
                return this.mapVerifierClasseReferentDepRegToBrevo(
                    template,
                    emailParams as VerifierClasseEmailAdminCleParams,
                );
            }
            case EmailTemplate.INVITER_REFERENT_CLASSE_TO_INSCRIPTION:
            case EmailTemplate.INVITER_REFERENT_CLASSE_TO_CONFIRMATION: {
                return this.mapInviterReferentClasse(template, emailParams as InviterReferentClasseParams);
            }
            case EmailTemplate.SUPPRIMER_REFERENT_CLASSE:
            case EmailTemplate.IMPORT_REFERENTIEL_GENERIQUE:
                return this.mapGenericEmailToBrevo(template, emailParams);
            case EmailTemplate.SUPPRIMER_CLASSE_ENGAGEE:
            case EmailTemplate.NOUVELLE_CLASSE_ENGAGEE:
                return this.mapSupprimerClasseEngagee(template, emailParams as SupprimerClasseEngageeParams);
            case EmailTemplate.JEUNE_CHANGE_SESSION_TO_CLE:
            case EmailTemplate.JEUNE_CHANGE_SESSION_CLE_TO_HTS:
                return this.mapJeuneBasculeCLE(template, emailParams as jeuneBasculeCLEParams);
            case EmailTemplate.PARENT_JEUNE_SESSION_CHANGE:
                return this.mapJeuneBasculeParentNotif(template, emailParams as jeuneBasculeParentNotifParams);
            case EmailTemplate.CHANGE_SESSION:
                return this.mapJeuneBasculeNotifToJeune(template, emailParams as jeuneBasculeNotifToJeune);
        }
    }

    static mapGenericEmailToBrevo(template: EmailTemplate, emailParams: EmailParams): EmailProviderParams {
        return {
            to: emailParams.to,
            params: {
                toName: emailParams.to[0].name,
            },
            templateId: Number(template),
        };
    }

    //
    static mapVerifierClasseAdminCleToBrevo(
        template: EmailTemplate,
        verifierClasseParams: VerifierClasseEmailAdminCleParams,
    ): EmailProviderVerifierClasseAdminCle {
        return {
            to: verifierClasseParams.to,
            params: {
                toName: verifierClasseParams.to[0].name,
                class_code: verifierClasseParams.classeCode,
                class_name: verifierClasseParams.classeNom,
                classUrl: verifierClasseParams.classeUrl,
            },
            templateId: Number(template),
        };
    }

    static mapVerifierClasseReferentDepRegToBrevo(
        template: EmailTemplate,
        verifierClasseParams: VerifierClasseEmailReferentDepRegParams,
    ): EmailProviderVerifierClasseReferentDepReg {
        return {
            to: verifierClasseParams.to,
            params: {
                toName: verifierClasseParams.to[0].name,
                class_code: verifierClasseParams.classeCode,
                class_name: verifierClasseParams.classeNom,
                cta: verifierClasseParams.classeUrl,
            },
            templateId: Number(template),
        };
    }

    static mapInviterReferentClasse(
        template: EmailTemplate,
        inviterReferent: InviterReferentClasseParams,
    ): EmailProviderInviterReferentClasse {
        return {
            to: inviterReferent.to,
            params: {
                toName: inviterReferent.to[0].name,
                class_code: inviterReferent.classeCode,
                class_name: inviterReferent.classeNom,
                cta: inviterReferent.invitationUrl,
                name_school: inviterReferent.etablissementNom,
                emailEtablissement: inviterReferent.etablissementEmail,
            },
            templateId: Number(template),
        };
    }

    static mapSupprimerClasseEngagee(
        template: EmailTemplate,
        supprimerClasseEngagee: SupprimerClasseEngageeParams,
    ): EmailProviderSupprimerClasseEngagee {
        return {
            to: supprimerClasseEngagee.to,
            params: {
                toName: supprimerClasseEngagee.to[0].name,
                class_name: supprimerClasseEngagee.classeNom,
                class_code: supprimerClasseEngagee.classeCode,
                cta: supprimerClasseEngagee.compteUrl,
            },
            templateId: Number(template),
        };
    }

    static mapJeuneBasculeCLE(
        template: EmailTemplate,
        jeuneBasculeCLEParams: jeuneBasculeCLEParams,
    ): EmailProviderJeuneBasculeCLE {
        return {
            to: jeuneBasculeCLEParams.to,
            params: {
                firstname: jeuneBasculeCLEParams.firstname,
                name: jeuneBasculeCLEParams.name,
                class_name: jeuneBasculeCLEParams.class_name,
                class_code: jeuneBasculeCLEParams.class_code,
                cta: jeuneBasculeCLEParams.cta,
            },
            templateId: Number(template),
        };
    }

    static mapJeuneBasculeParentNotif(
        template: EmailTemplate,
        jeuneBasculeParentNotifParams: jeuneBasculeParentNotifParams,
    ): EmailProviderJeuneBasculeParentNotif {
        return {
            to: jeuneBasculeParentNotifParams.to,
            params: {
                cohort: jeuneBasculeParentNotifParams.cohort,
                youngFirstName: jeuneBasculeParentNotifParams.youngFirstName,
                youngName: jeuneBasculeParentNotifParams.youngName,
                cta: jeuneBasculeParentNotifParams.cta,
            },
            templateId: Number(template),
        };
    }

    static mapJeuneBasculeNotifToJeune(
        template: EmailTemplate,
        jeuneBasculeNotifToJeune: jeuneBasculeNotifToJeune,
    ): EmailProviderJeuneBasculeNotifToJeune {
        return {
            to: jeuneBasculeNotifToJeune.to,
            params: {
                motif: jeuneBasculeNotifToJeune.motif,
                message: jeuneBasculeNotifToJeune.message,
                newcohortdate: jeuneBasculeNotifToJeune.newcohortdate,
                oldprogram: jeuneBasculeNotifToJeune.oldprogram,
                newprogram: jeuneBasculeNotifToJeune.newprogram,
                cta: jeuneBasculeNotifToJeune.cta,
            },
            templateId: Number(template),
        };
    }
}

export interface EmailProviderVerifierClasseAdminCle extends EmailProviderParams {
    params: {
        toName: string;
        class_name?: string;
        class_code: string;
        classUrl: string;
    };
}

export interface EmailProviderVerifierClasseReferentDepReg extends EmailProviderParams {
    params: {
        toName: string;
        class_name?: string;
        class_code: string;
        cta: string;
    };
}

export interface EmailProviderInviterReferentClasse extends EmailProviderParams {
    params: {
        toName: string;
        class_name?: string;
        class_code: string;
        cta: string;
        name_school: string;
        emailEtablissement: string;
    };
}

export interface EmailProviderSupprimerClasseEngagee extends EmailProviderParams {
    params: {
        toName: string;
        class_name?: string;
        class_code: string;
        cta: string;
    };
}

export interface EmailProviderJeuneBasculeCLE extends EmailProviderParams {
    params: {
        firstname: string;
        name: string;
        class_name: string;
        class_code: string;
        cta: string;
    };
}

export interface EmailProviderJeuneBasculeParentNotif extends EmailProviderParams {
    params: {
        cohort: string;
        youngFirstName: string;
        youngName: string;
        cta: string;
    };
}

export interface EmailProviderJeuneBasculeNotifToJeune extends EmailProviderParams {
    params: {
        motif: string;
        message: string;
        newcohortdate: string;
        oldprogram: string;
        newprogram: string;
        cta: string;
    };
}
