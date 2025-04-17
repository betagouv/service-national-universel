import { SessionGateway } from "@admin/core/sejours/phase1/session/Session.gateway";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { CampagneModel, CreateCampagneModel, CampagneComplete } from "@plan-marketing/core/Campagne.model";
import { DatesSession } from "@plan-marketing/core/Programmation.model";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { isCampagneGenerique, isCampagneWithRef } from "snu-lib";
import { CampagneGateway } from "../gateway/Campagne.gateway";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";
import { ProgrammationService } from "./Programmation.service";

@Injectable()
export class CampagneService {
    private readonly logger: Logger = new Logger(CampagneService.name);

    constructor(
        @Inject(CampagneGateway) private readonly campagneGateway: CampagneGateway,
        @Inject(PlanMarketingGateway) private readonly PlanMarketingGateway: PlanMarketingGateway,
        private readonly programmationService: ProgrammationService,
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
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

    async findCampagnesWithProgrammationBetweenDates(startDate: Date, endDate: Date): Promise<CampagneComplete[]> {
        const campagnes = await this.campagneGateway.search({ generic: false });

        const sessionIds = new Set<string>();
        campagnes.forEach((campagne) => {
            if ("cohortId" in campagne) {
                sessionIds.add(campagne.cohortId);
            }
        });

        const filteredCampagnes: CampagneComplete[] = [];
        for (const sessionId of sessionIds) {
            const sessionSpecificCampagnes = await this.findCampagnesWithProgrammationBetweenDatesBySessionId(
                startDate,
                endDate,
                sessionId,
            );
            filteredCampagnes.push(...sessionSpecificCampagnes);
        }

        return filteredCampagnes;
    }

    async findCampagnesWithProgrammationBetweenDatesBySessionId(
        startDate: Date,
        endDate: Date,
        sessionId: string,
    ): Promise<CampagneComplete[]> {
        this.logger.log(`Recherche des campagnes avec programmation pour la session ${sessionId}`);
        const [campagnes, session] = await Promise.all([
            this.campagneGateway.search({ generic: false, cohortId: sessionId }),
            this.sessionGateway.findById(sessionId),
        ]);
        if (!session) {
            return [];
        }

        const datesSession: DatesSession = {
            dateStart: session.dateStart,
            dateEnd: session.dateEnd,
            inscriptionStartDate: session.inscriptionStartDate,
            inscriptionEndDate: session.inscriptionEndDate,
            inscriptionModificationEndDate: session.inscriptionModificationEndDate,
            instructionEndDate: session.instructionEndDate,
            validationDate: session.validationDate,
        };

        const campagnesWithProgrammation: CampagneComplete[] = [];

        for (const campagne of campagnes) {
            if (!("programmations" in campagne) || isCampagneGenerique(campagne)) {
                continue;
            }

            let campagneWithComputedEnvoiDate = this.programmationService.computeDateEnvoi(campagne, datesSession);

            const hasMatchingDate = campagneWithComputedEnvoiDate.programmations?.some(
                (prog) => prog.envoiDate && prog.envoiDate >= startDate && prog.envoiDate <= endDate,
            );

            if (hasMatchingDate) {
                campagnesWithProgrammation.push(campagneWithComputedEnvoiDate);
            }
        }

        return campagnesWithProgrammation;
    }

    async updateProgrammationSentDate(
        campagneId: string,
        programmationId,
        sentDate: Date,
    ): Promise<CampagneModel | null> {
        this.logger.log(`Mise à jour de la date d'envoi pour la campagne ${campagneId}`);
        return this.campagneGateway.updateProgrammationSentDate(campagneId, programmationId, sentDate);
    }
}
