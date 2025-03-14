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
        if (isCampagneWithRef(campagne)) {
            return this.campagneGateway.update(campagne);
        }

        const template = await this.PlanMarketingGateway.findTemplateById(campagne.templateId);
        if (!template) {
            throw new FunctionalException(FunctionalExceptionCode.TEMPLATE_NOT_FOUND);
        }
        return this.campagneGateway.update(campagne);
    }
}
