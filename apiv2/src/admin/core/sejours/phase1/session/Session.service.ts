import { Inject, Injectable } from "@nestjs/common";
import { SessionGateway } from "../session/Session.gateway";
import { SessionModel } from "../session/Session.model";
import { COHORT_STATUS, COHORT_TYPE } from "snu-lib";

@Injectable()
export class SessionService {
    constructor(
        @Inject(SessionGateway)
        private readonly sessionGateway: SessionGateway,
    ) {}

    async getFilteredSessionsForCLE(): Promise<SessionModel[]> {
        const sessionsCLE = await this.sessionGateway.findByElligibility(COHORT_TYPE.CLE, COHORT_STATUS.PUBLISHED);
        let now = new Date();
        const sessions = sessionsCLE.filter(
            (session) =>
                !!session.inscriptionStartDate &&
                session.inscriptionStartDate <= now &&
                ((session.inscriptionEndDate && session.inscriptionEndDate > now) ||
                    (session.instructionEndDate && session.instructionEndDate > now)),
        );
        return sessions;
    }

    static isCohortInscriptionOpen(session: SessionModel): boolean {
        const now = new Date();
        const inscriptionStartDate = session.inscriptionStartDate;
        const inscriptionEndDate = session.inscriptionEndDate;
        const isInscriptionOpen = now >= inscriptionStartDate && now <= inscriptionEndDate;
        return isInscriptionOpen;
    }
}
