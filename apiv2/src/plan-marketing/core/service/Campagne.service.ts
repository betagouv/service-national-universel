import { Inject, Injectable } from "@nestjs/common";
import { CampagneModel, CreateCampagneModel } from "@plan-marketing/core/Campagne.model";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { CampagneGateway } from "../gateway/Campagne.gateway";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";
import { isCampagneWithRef } from "snu-lib";

@Injectable()
export class CampagneService {
    constructor(
        @Inject(CampagneGateway) private readonly campagneGateway: CampagneGateway,
        @Inject(PlanMarketingGateway) private readonly PlanMarketingGateway: PlanMarketingGateway,
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
        if (("templateId" in campagne)) {
            const template = await this.PlanMarketingGateway.findTemplateById(campagne.templateId);
            if (!template) {
                throw new FunctionalException(FunctionalExceptionCode.TEMPLATE_NOT_FOUND);
            }
        }
        return this.campagneGateway.updateAndRemoveRef(campagne);
    }
}
