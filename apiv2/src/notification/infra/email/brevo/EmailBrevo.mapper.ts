import {
    BasculeJeuneParams,
    EmailParams,
    EmailWithMessage,
    EmailTemplate,
    InviterReferentClasseParams,
    SupprimerClasseEngageeParams,
    VerifierClasseEmailAdminCleParams,
    VerifierClasseEmailReferentDepRegParams,
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

            case EmailTemplate.BASCULE_SEJOUR_AVENIR:
            case EmailTemplate.BASCULE_SEJOUR_ELIGIBLE:
                return this.mapBasculeJeune(template, emailParams as BasculeJeuneParams);

            case EmailTemplate.DESISTEMENT_PAR_TIERS:
                return this.mapEmailWithMessageToBrevo(template, emailParams as EmailWithMessage);

            default:
                throw new Error(`Template ${template} not supported`);
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

    static mapEmailWithMessageToBrevo(template: EmailTemplate, emailParams: EmailWithMessage): EmailProviderParams {
        return {
            to: emailParams.to,
            params: {
                toName: emailParams.to[0].name,
                message: emailParams.message,
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

    static mapBasculeJeune(template: EmailTemplate, params: BasculeJeuneParams): BasculeJeune {
        return {
            to: params.to,
            params: {
                firstName: params.prenom,
                lastName: params.nom,
                oldcohortdate: params.ancienneSessionNom,
                newcohortdate: params.nouvelleSessionNom,
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

export interface BasculeJeune extends EmailProviderParams {
    params: {
        firstName: string;
        lastName: string;
        oldcohortdate: string;
        newcohortdate?: string;
    };
}
