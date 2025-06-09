import { Inject, Injectable } from "@nestjs/common";
import { CampagneModel, CreateCampagneModel } from "@plan-marketing/core/Campagne.model";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { CampagneGateway } from "../gateway/Campagne.gateway";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";
import { isCampagneWithRef } from "snu-lib";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { EmailTestParams, EmailTemplate } from "@notification/core/Notification";
import { ReferentModelLight } from "@admin/core/iam/Referent.model";

@Injectable()
export class CampagneService {
    constructor(
        @Inject(CampagneGateway) private readonly campagneGateway: CampagneGateway,
        @Inject(PlanMarketingGateway) private readonly PlanMarketingGateway: PlanMarketingGateway,
        @Inject(NotificationGateway) private readonly notificationGateway: NotificationGateway,
    ) {}

    async findById(id: string) {
        const campagne = await this.campagneGateway.findById(id);
        if (!campagne) {
            throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND);
        }

        return campagne;
    }

    async creerCampagne(campagne: CreateCampagneModel) {
        if (isCampagneWithRef(campagne)) {
            return this.campagneGateway.save(campagne);
        }

        const template = await this.PlanMarketingGateway.findTemplateById(campagne.templateId);
        if (!template) {
            throw new FunctionalException(FunctionalExceptionCode.TEMPLATE_NOT_FOUND);
        }
        return this.campagneGateway.save(campagne);
    }

    async updateCampagne(campagne: CampagneModel) {
        if (!("templateId" in campagne)) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_ENOUGH_DATA);
        }

        const template = await this.PlanMarketingGateway.findTemplateById(campagne.templateId);
        if (!template) {
            throw new FunctionalException(FunctionalExceptionCode.TEMPLATE_NOT_FOUND);
        }
        return this.campagneGateway.update(campagne);
    }

    async updateAndRemoveRef(campagne: CampagneModel) {
        if ("templateId" in campagne) {
            const template = await this.PlanMarketingGateway.findTemplateById(campagne.templateId);
            if (!template) {
                throw new FunctionalException(FunctionalExceptionCode.TEMPLATE_NOT_FOUND);
            }
        }
        return this.campagneGateway.updateAndRemoveRef(campagne);
    }

    async sendMailTest(id: string, auteur: ReferentModelLight) {
        const campagne = await this.campagneGateway.findById(id);
        if (!campagne) {
            throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND);
        }
        let templateId: number;
        if ("templateId" in campagne) {
            templateId = campagne.templateId;
        } else {
            const genericCampagne = await this.campagneGateway.findSpecifiqueWithRefById(campagne.id);
            if (!genericCampagne) {
                throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND);
            }
            templateId = genericCampagne.templateId;
        }
        await this.notificationGateway.sendEmail<EmailTestParams>(
            {
                to: [
                    {
                        email: auteur.email,
                        name: auteur.prenom + " " + auteur.nom,
                    },
                ],
                templateId: templateId.toString(),
            },
            EmailTemplate.ENVOYER_MAIL_TEST,
        );
    }
}
