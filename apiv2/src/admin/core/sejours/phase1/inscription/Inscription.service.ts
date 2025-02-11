import { Inject, Injectable, Logger } from "@nestjs/common";

import { COHORT_STATUS, departmentLookUp, getDepartmentByZip, TaskName, TaskStatus, YOUNG_STATUS } from "snu-lib";
import { TaskGateway } from "@task/core/Task.gateway";
import { JeuneModel } from "../../jeune/Jeune.model";
import { SessionModel } from "../session/Session.model";
import { SessionGateway } from "../session/Session.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { ClockGateway } from "@shared/core/Clock.gateway";

@Injectable()
export class InscriptionService {
    constructor(
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
        private readonly logger: Logger,
    ) {}

    async getStatusSimulation(sessionId: string, taskName: TaskName) {
        const simulations = await this.taskGateway.findByNames(
            [taskName],
            {
                "metadata.parameters.sessionId": sessionId,
            },
            "DESC",
            1,
        );
        return {
            status: simulations?.[0]?.status || "NONE",
        };
    }

    async getStatusValidation(sessionId: string, taskName: TaskName) {
        const lastTraitement = (
            await this.taskGateway.findByNames(
                [taskName],
                {
                    "metadata.parameters.sessionId": sessionId,
                },
                "DESC",
                1,
            )
        )?.[0];
        const lastTraitementCompleted = (
            await this.taskGateway.findByNames(
                [taskName],
                {
                    status: TaskStatus.COMPLETED,
                    "metadata.parameters.sessionId": sessionId,
                },
                "DESC",
                1,
            )
        )?.[0];
        return {
            status: lastTraitement?.status || "NONE",
            lastCompletedAt: lastTraitementCompleted?.updatedAt,
        };
    }

    isInstructionOpen(session: SessionModel) {
        const now = this.clockGateway.now();
        const end = session.instructionEndDate;
        if (!end || this.clockGateway.isAfter(now, end)) return false;
        return true;
    }

    isInscriptionOpen(session: SessionModel) {
        const now = this.clockGateway.now();
        const start = session.inscriptionStartDate;
        const end = session.inscriptionEndDate;
        if (!start || !end || this.clockGateway.isAfter(start, end)) return false;
        return this.clockGateway.isWithinInterval(now, { start, end });
    }

    // portage de snu-lib:getDepartmentForEligibility
    getDepartementEligibilite(jeune: JeuneModel) {
        let departement;
        const schoolDepartment =
            !jeune.paysScolarite ||
            jeune.paysScolarite?.toUpperCase() === "FRANCE" ||
            jeune.departementScolarite === "France"
                ? jeune.departementScolarite
                : null;
        if (jeune.id && jeune.scolarise === "true") departement = schoolDepartment;
        if (jeune.id && jeune.scolarise === "false") departement = jeune.departement;

        if (!departement) departement = schoolDepartment || jeune.departement || getDepartmentByZip(jeune.codePostal);
        if (departement && (!isNaN(departement) || ["2A", "2B", "02A", "02B"].includes(departement))) {
            if (departement.substring(0, 1) === "0" && departement.length === 3)
                departement = departmentLookUp[departement.substring(1)];
            else departement = departmentLookUp[departement];
        }
        if (!departement) departement = "Etranger";
        return departement;
    }

    // portage de api:getFilteredSessionsForChangementSejour
    async getSessionsEligible(jeune: JeuneModel): Promise<SessionModel[]> {
        if (!jeune.sessionId) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, "jeune sans sessionId");
        }
        const oldSessionJeune = await this.sessionGateway.findById(jeune.sessionId);
        if (!oldSessionJeune.cohortGroupId) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, "session sans cohortGroupId");
        }
        const departement = this.getDepartementEligibilite(jeune);
        if (!departement) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, "jeune sans departement eligible");
        }

        const sessions = await this.sessionGateway.findByGroupIdStatusAndEligibility(
            COHORT_STATUS.PUBLISHED,
            oldSessionJeune.cohortGroupId,
            { dateNaissance: jeune.dateNaissance!, niveauScolaire: jeune.niveauScolaire!, departement },
        );

        const sessionsEligibles = sessions.filter((session) => {
            if (session.id === oldSessionJeune.id) return false;
            if (jeune.statut === YOUNG_STATUS.WAITING_VALIDATION || jeune.statut === YOUNG_STATUS.WAITING_CORRECTION) {
                return this.isInstructionOpen(session);
            }
            if (this.isInscriptionOpen(session)) return true;
            return false;
        });

        return sessionsEligibles;
    }
}
