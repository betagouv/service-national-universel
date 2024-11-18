import {
    EmailParams,
    EmailTemplate,
    InviterReferentClasseParams,
    VerifierClasseEmailAdminCleParams,
    VerifierClasseEmailReferentDepRegParams,
} from "@notification/core/Notification";
import { EmailProviderParams } from "./EmailBrevo.provider";

export class EmailBrevoMapper {
    static mapEmailParamsToBrevoByTemplate(template: EmailTemplate, emailParams: EmailParams): EmailProviderParams {
        switch (template) {
            case EmailTemplate.VERIFIER_CLASSE_EMAIL_ADMIN_CLE: {
                return this.mapVerifierClasseAdminCleToBrevo(emailParams as VerifierClasseEmailAdminCleParams);
            }
            case EmailTemplate.VERIFIER_CLASSE_EMAIL_REFERENT_DEP_REG: {
                return this.mapVerifierClasseReferentDepRegToBrevo(emailParams as VerifierClasseEmailAdminCleParams);
            }
            case EmailTemplate.INVITER_REFERENT_CLASSE_TO_INSCRIPTION:
            case EmailTemplate.INVITER_REFERENT_CLASSE_TO_CONFIRMATION: {
                return this.mapInviterReferentClasse(template, emailParams as InviterReferentClasseParams);
            }
            default:
                throw new Error("Template non pris en charge");
        }
    }

    //
    static mapVerifierClasseAdminCleToBrevo(
        verifierClasseParams: VerifierClasseEmailAdminCleParams,
    ): EmailProviderVerifierClasseAdminCle {
        return {
            to: verifierClasseParams.to,
            params: {
                class_code: verifierClasseParams.classeCode,
                class_name: verifierClasseParams.classeNom,
                classUrl: verifierClasseParams.classeUrl,
            },
            templateId: this.mapTemplateTypeToBrevoId(EmailTemplate.VERIFIER_CLASSE_EMAIL_ADMIN_CLE),
        };
    }

    static mapVerifierClasseReferentDepRegToBrevo(
        verifierClasseParams: VerifierClasseEmailReferentDepRegParams,
    ): EmailProviderVerifierClasseReferentDepReg {
        return {
            to: verifierClasseParams.to,
            params: {
                class_code: verifierClasseParams.classeCode,
                class_name: verifierClasseParams.classeNom,
                cta: verifierClasseParams.classeUrl,
            },
            templateId: this.mapTemplateTypeToBrevoId(EmailTemplate.VERIFIER_CLASSE_EMAIL_REFERENT_DEP_REG),
        };
    }

    static mapInviterReferentClasse(
        template: EmailTemplate,
        inviterReferent: InviterReferentClasseParams,
    ): EmailProviderInviterReferentClasse {
        return {
            to: inviterReferent.to,
            params: {
                class_code: inviterReferent.classeCode,
                class_name: inviterReferent.classeNom,
                cta: inviterReferent.invitationUrl,
                name_school: inviterReferent.etablissementNom,
                emailEtablissement: inviterReferent.etablissementEmail,
            },
            templateId: this.mapTemplateTypeToBrevoId(template),
        };
    }

    static mapInviterClasse;
    // TODO : Mettre en base le mapping
    static mapTemplateTypeToBrevoId(templateType: EmailTemplate): number {
        switch (templateType) {
            case EmailTemplate.VERIFIER_CLASSE_EMAIL_ADMIN_CLE:
                return 2084;
            case EmailTemplate.VERIFIER_CLASSE_EMAIL_REFERENT_DEP_REG:
                return 2085;
            case EmailTemplate.INVITER_REFERENT_CLASSE_TO_INSCRIPTION:
                return 1391;
            case EmailTemplate.INVITER_REFERENT_CLASSE_TO_CONFIRMATION:
                return 1427;
            default:
                return 1;
        }
    }
}

export interface EmailProviderVerifierClasseAdminCle extends EmailProviderParams {
    params: {
        class_name?: string;
        class_code: string;
        classUrl: string;
    };
}

export interface EmailProviderVerifierClasseReferentDepReg extends EmailProviderParams {
    params: {
        class_name?: string;
        class_code: string;
        cta: string;
    };
}

export interface EmailProviderInviterReferentClasse extends EmailProviderParams {
    params: {
        class_name?: string;
        class_code: string;
        cta: string;
        name_school: string;
        emailEtablissement: string;
    };
}
