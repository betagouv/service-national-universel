import { SessionGateway } from "@admin/core/sejours/phase1/session/Session.gateway";
import { Inject, Injectable, Logger } from "@nestjs/common";
import {
    CampagneModel,
    CreateCampagneModel,
    CampagneComplete,
    CampagneModelWithNomSession,
    CreateCampagneSpecifiqueModelWithRef,
    CreateCampagneSpecifiqueModelWithoutRef,
} from "@plan-marketing/core/Campagne.model";
import { DatesSession } from "@plan-marketing/core/Programmation.model";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { isCampagneGenerique, isCampagneWithRef, TypeEvenement } from "snu-lib";
import { CampagneGateway } from "../gateway/Campagne.gateway";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";
import { ProgrammationService } from "./Programmation.service";
import { SessionModel } from "@admin/core/sejours/phase1/session/Session.model";
import { ClockGateway } from "@shared/core/Clock.gateway";
@Injectable()
export class CampagneService {
    private readonly logger: Logger = new Logger(CampagneService.name);

    constructor(
        @Inject(CampagneGateway) private readonly campagneGateway: CampagneGateway,
        @Inject(PlanMarketingGateway) private readonly PlanMarketingGateway: PlanMarketingGateway,
        private readonly programmationService: ProgrammationService,
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
    ) {}

    async findById(id: string) {
        const campagne = await this.campagneGateway.findById(id);
        if (!campagne) {
            throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND);
        }

        return campagne;
    }

    async search(options: {
        generic?: boolean;
        cohortId?: string;
        isArchived?: boolean;
        isProgrammationActive?: boolean;
        isLinkedToGenericCampaign?: boolean;
    }, sort?: "ASC" | "DESC") {
        const campagnes = await this.campagneGateway.search(
            {
                generic: options.generic,
                cohortId: options.cohortId,
                isArchived: options.isArchived,
                isProgrammationActive: options.isProgrammationActive,
                isLinkedToGenericCampaign: options.isLinkedToGenericCampaign,
            },
            sort,
        );

        if (options.generic === true) {
            return campagnes;
        }

        const sessionIdsInCampagnes = this.extractSessionIds(campagnes);

        const sessionsMap = new Map<string, SessionModel>();
        await Promise.all(
            // sessionIdsInCampagnes length should be 1 most of the time => no performance issue
            Array.from(sessionIdsInCampagnes).map(async (id) => {
                const session = await this.sessionGateway.findById(id);
                if (session) sessionsMap.set(id, session);
            }),
        );

        return campagnes.map((campagne) => {
            if ("cohortId" in campagne && "programmations" in campagne) {
                const session = sessionsMap.get(campagne.cohortId);
                if (session) {
                    const datesSession = this.createDatesSessionFromSession(session);
                    return this.programmationService.computeDateEnvoi(campagne, datesSession);
                }
            }
            return campagne;
        });
    }

    async creerCampagne(campagne: CreateCampagneModel) {
        if (isCampagneWithRef(campagne)) {
            await this.checkCampagneSpecifiqueExists(campagne);
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
        const campagneProgrammationsWithoutEnvoiDate = campagne.programmations?.map((programmation) => ({
            ...programmation,
            envoiDate: programmation.type === TypeEvenement.AUCUN ? programmation.envoiDate : undefined,
        }));
        return this.campagneGateway.update({
            ...campagne,
            programmations: campagneProgrammationsWithoutEnvoiDate,
        });
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

    async findActivesCampagnesWithProgrammationBetweenDates(
        startDate: Date,
        endDate: Date,
    ): Promise<CampagneComplete[]> {
        const campagnes = await this.campagneGateway.search({
            generic: false,
        });
        const campagnesActives = campagnes.filter((campagne) => {
            return (
                (campagne as CampagneComplete).isProgrammationActive === true &&
                (campagne as CampagneComplete).isArchived === false
            );
        });
        this.logger.log(`Campagnes actives non archivées : ${campagnesActives.length}`);
        const sessionIds = this.extractSessionIds(campagnesActives);

        const filteredCampagnes: CampagneComplete[] = [];
        for (const sessionId of sessionIds) {
            const sessionSpecificCampagnes = await this.findActivesCampagnesWithProgrammationBetweenDatesBySessionId(
                startDate,
                endDate,
                sessionId,
                campagnesActives.filter((campagne) => "cohortId" in campagne && campagne.cohortId === sessionId),
            );
            filteredCampagnes.push(...sessionSpecificCampagnes);
        }

        return filteredCampagnes;
    }

    async findActivesCampagnesWithProgrammationBetweenDatesBySessionId(
        startDate: Date,
        endDate: Date,
        sessionId: string,
        campagnes: CampagneModel[],
    ): Promise<CampagneComplete[]> {
        this.logger.log(`Recherche des campagnes avec programmation pour la session ${sessionId}`);
        const session = await this.sessionGateway.findById(sessionId);
        if (!session) {
            return [];
        }

        const datesSession = this.createDatesSessionFromSession(session);
        const campagnesWithProgrammation: CampagneComplete[] = [];

        for (const campagne of campagnes) {
            if (!("programmations" in campagne) || isCampagneGenerique(campagne)) {
                continue;
            }

            const campagneWithComputedEnvoiDate = this.programmationService.computeDateEnvoi(campagne, datesSession);

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

    async findCampagneSpecifiquesByCampagneGeneriqueId(
        campagneGeneriqueId: string,
    ): Promise<CampagneModelWithNomSession[]> {
        const campagnes = await this.campagneGateway.findCampagneSpecifiquesByCampagneGeneriqueId(campagneGeneriqueId);

        if (campagnes.length === 0) {
            return [];
        }

        const sessionIdsInCampagnes = this.extractSessionIds(campagnes);

        const sessionsMap = new Map<string, SessionModel>();
        await Promise.all(
            Array.from(sessionIdsInCampagnes).map(async (id) => {
                const session = await this.sessionGateway.findById(id);
                if (session) sessionsMap.set(id, session);
            }),
        );

        return campagnes.map((campagne) => {
            const session = sessionsMap.get(campagne.cohortId);
            return { ...campagne, nomSession: session?.nom || "" };
        });
    }

    private extractSessionIds(campagnes: CampagneModel[]): Set<string> {
        const sessionIds = new Set<string>();
        campagnes.forEach((campagne) => {
            if ("cohortId" in campagne) {
                sessionIds.add(campagne.cohortId);
            }
        });
        return sessionIds;
    }

    private createDatesSessionFromSession(session: unknown): DatesSession {
        if (!session || typeof session !== "object") {
            throw new Error("Invalid session object");
        }

        const sessionObj = session as Record<string, unknown>;

        // Validation date is optional, if not set, we compute it from the dateStart and daysToValidate
        const validationDate = sessionObj.validationDate ? sessionObj.validationDate as Date : this.clockGateway.addDays(new Date(sessionObj.dateStart as Date), sessionObj.daysToValidate as number);

        return {
            dateStart: sessionObj.dateStart as Date,
            dateEnd: sessionObj.dateEnd as Date,
            inscriptionStartDate: sessionObj.inscriptionStartDate as Date,
            inscriptionEndDate: sessionObj.inscriptionEndDate as Date,
            inscriptionModificationEndDate: sessionObj.inscriptionModificationEndDate as Date,
            instructionEndDate: sessionObj.instructionEndDate as Date,
            validationDate,
        };
    }

    private async checkCampagneSpecifiqueExists(campagneSpecifique: CreateCampagneSpecifiqueModelWithRef | CreateCampagneSpecifiqueModelWithoutRef) {
        if (!campagneSpecifique.campagneGeneriqueId) {
            return;
        }

        const campagnesSpecifiques = await this.campagneGateway.findCampagneSpecifiquesByCampagneGeneriqueId(campagneSpecifique.campagneGeneriqueId);
        const campagneExiste = campagnesSpecifiques.some(
            (campagneSpecifiqueExistante) => campagneSpecifiqueExistante.cohortId === campagneSpecifique.cohortId
        );

        if (campagneExiste) {
            throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_ALREADY_EXISTS_FOR_COHORT);
        }
    }
}
