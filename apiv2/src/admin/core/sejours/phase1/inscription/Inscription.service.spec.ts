import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";

import { TaskGateway } from "@task/core/Task.gateway";

import { InscriptionService } from "./Inscription.service";
import { SessionGateway } from "../session/Session.gateway";
import { JeuneModel } from "../../jeune/Jeune.model";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { SessionModel } from "../session/Session.model";
import { YOUNG_STATUS } from "snu-lib";
import { addDays, isAfter, isWithinInterval } from "date-fns";

describe("InscriptionService", () => {
    let inscriptionService: InscriptionService;
    const sessionGatewayMock = {
        findById: jest.fn().mockResolvedValue({ sessionId: "sessionId", cohortGroupId: "cohortGroupId" }),
        findByGroupIdStatusAndEligibility: jest.fn().mockResolvedValue([]),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InscriptionService,
                Logger,
                {
                    provide: TaskGateway,
                    useValue: {},
                },
                {
                    provide: SessionGateway,
                    useValue: sessionGatewayMock,
                },
                {
                    provide: ClockGateway,
                    useValue: {
                        now: jest.fn().mockReturnValue(new Date()),
                        isAfter,
                        isWithinInterval,
                    },
                },
            ],
        }).compile();

        inscriptionService = module.get<InscriptionService>(InscriptionService);
    });

    describe("getDepartementEligibilite", () => {
        it("when jeune is scolarise should return the school departement", () => {
            const jeune = { id: "123", scolarise: "true", departementScolarite: "TestDepartment" } as JeuneModel;
            expect(inscriptionService.getDepartementEligibilite(jeune)).toBe("TestDepartment");
        });

        it("when jeune is not scolarise and doesn't have school departement should returns the departement", () => {
            const jeune = { id: "123", scolarise: "false", departement: "TestDepartment" } as JeuneModel;
            expect(inscriptionService.getDepartementEligibilite(jeune)).toBe("TestDepartment");
        });

        it("when the both are available and the jeune is scolarise should returns the school departement", () => {
            const jeune = {
                id: "123",
                scolarise: "true",
                departementScolarite: "SchoolDepartment",
                departement: "Department",
            } as JeuneModel;
            expect(inscriptionService.getDepartementEligibilite(jeune)).toBe("SchoolDepartment");
        });

        it("when the both are available should return the school departement", () => {
            const jeune = {
                id: "123",
                departementScolarite: "SchoolDepartment",
                departement: "Department",
            } as JeuneModel;
            expect(inscriptionService.getDepartementEligibilite(jeune)).toBe("SchoolDepartment");
        });

        it("when school country is not FRANCE should departement", () => {
            const jeune = {
                id: "123",
                departement: "jeuneDepartment",
                paysScolarite: "ESPAGNE",
                departementScolarite: "134",
            } as JeuneModel;
            expect(inscriptionService.getDepartementEligibilite(jeune)).toBe("jeuneDepartment");
        });

        it("when school country is not FRANCE and scolarise should departement", () => {
            const jeune = {
                id: "123",
                departement: "jeuneDepartment",
                scolarise: "true",
                paysScolarite: "ESPAGNE",
                departementScolarite: "134",
            } as JeuneModel;
            expect(inscriptionService.getDepartementEligibilite(jeune)).toBe("jeuneDepartment");
        });

        it('when departement not found should returns "Etranger"', () => {
            const jeune = { id: "123", scolarise: "false" } as JeuneModel;
            expect(inscriptionService.getDepartementEligibilite(jeune)).toBe("Etranger");
        });

        it("when departement prepended with 0 should return good departement", () => {
            const jeune = { id: "123", departement: "044" } as JeuneModel;
            expect(inscriptionService.getDepartementEligibilite(jeune)).toBe("Loire-Atlantique");
        });

        it("when departement corse with return good departement", () => {
            const jeune = { id: "123", departement: "2A" } as JeuneModel;
            expect(inscriptionService.getDepartementEligibilite(jeune)).toBe("Corse-du-Sud");
        });
    });

    describe("getSessionsEligible", () => {
        it("should throw error when jeune.sessionId is not defined", async () => {
            const jeune = { sessionId: null } as any;
            await expect(inscriptionService.getSessionsEligible(jeune)).rejects.toThrow(
                new FunctionalException(FunctionalExceptionCode.NOT_FOUND, ""),
            );
        });

        it("should  throw error when oldSessionJeune.cohortGroupId is not defined", async () => {
            const jeune = { sessionId: "1" } as JeuneModel;
            sessionGatewayMock.findById.mockResolvedValue({ cohortGroupId: null } as any);
            await expect(inscriptionService.getSessionsEligible(jeune)).rejects.toThrow(
                new FunctionalException(FunctionalExceptionCode.NOT_FOUND, "cohort without cohortGroupId"),
            );
        });

        it("should return eligible sessions", async () => {
            const jeune = {
                sessionId: "1",
                dateNaissance: "2000-01-01",
                niveauScolaire: "BAC",
                statut: YOUNG_STATUS.WAITING_VALIDATION,
            } as any;
            const sessionJeune = { id: "1", cohortGroupId: "1" } as SessionModel;
            const sessions = [
                {
                    id: "2",
                    cohortGroupId: "1",
                    // inscription ouvert
                    inscriptionStartDate: addDays(new Date(), -1),
                    inscriptionEndDate: addDays(new Date(), 1),
                    // instruction ouvert
                    instructionEndDate: addDays(new Date(), 1),
                },
                {
                    id: "3",
                    cohortGroupId: "1",
                    // inscription ouvert
                    inscriptionStartDate: addDays(new Date(), -1),
                    inscriptionEndDate: addDays(new Date(), 1),
                    // instruction ouvert
                    instructionEndDate: addDays(new Date(), 1),
                },
                {
                    id: "1",
                    cohortGroupId: "1",
                },
            ] as SessionModel[];

            sessionGatewayMock.findById.mockResolvedValue(sessionJeune);
            sessionGatewayMock.findByGroupIdStatusAndEligibility.mockResolvedValue(sessions);

            const result = await inscriptionService.getSessionsEligible(jeune);
            expect(result).toEqual([sessions[0], sessions[1]]);
        });

        it("should filter out sessions based on inscription open", async () => {
            const jeune = {
                sessionId: "1",
                dateNaissance: "2000-01-01",
                niveauScolaire: "BAC",
                statut: YOUNG_STATUS.IN_PROGRESS,
            } as any;

            const sessionJeune = { id: "1", cohortGroupId: "1" } as SessionModel;
            const sessions = [
                {
                    id: "2",
                    cohortGroupId: "1",
                    // inscription ouvert
                    inscriptionStartDate: addDays(new Date(), -1),
                    inscriptionEndDate: addDays(new Date(), 1),
                    // instruction fermée
                    instructionEndDate: addDays(new Date(), -1),
                },
                {
                    id: "3",
                    cohortGroupId: "1",
                    // inscription fermée
                    inscriptionStartDate: addDays(new Date(), -3),
                    inscriptionEndDate: addDays(new Date(), -2),
                    // instruction fermée
                    instructionEndDate: addDays(new Date(), -1),
                },
                {
                    id: "1",
                    cohortGroupId: "1",
                },
            ] as SessionModel[];
            sessionGatewayMock.findById.mockResolvedValue(sessionJeune);
            sessionGatewayMock.findByGroupIdStatusAndEligibility.mockResolvedValue(sessions);

            const result = await inscriptionService.getSessionsEligible(jeune);
            expect(result).toEqual([sessions[0]]);
        });

        it("should filter out sessions based on instruction open", async () => {
            const jeune = {
                sessionId: "1",
                dateNaissance: "2000-01-01",
                niveauScolaire: "BAC",
                statut: YOUNG_STATUS.WAITING_VALIDATION,
            } as any;

            const sessionJeune = { id: "1", cohortGroupId: "1" } as SessionModel;
            const sessions = [
                {
                    id: "2",
                    cohortGroupId: "1",
                    // inscription fermée
                    inscriptionStartDate: addDays(new Date(), -3),
                    inscriptionEndDate: addDays(new Date(), -2),
                    // instruction fermée
                    instructionEndDate: addDays(new Date(), -1),
                },
                {
                    id: "3",
                    cohortGroupId: "1",
                    // inscription fermée
                    inscriptionStartDate: addDays(new Date(), -3),
                    inscriptionEndDate: addDays(new Date(), -2),
                    // instruction ouvert
                    instructionEndDate: addDays(new Date(), 1),
                },
                {
                    id: "1",
                    cohortGroupId: "1",
                },
            ] as SessionModel[];
            sessionGatewayMock.findById.mockResolvedValue(sessionJeune);
            sessionGatewayMock.findByGroupIdStatusAndEligibility.mockResolvedValue(sessions);

            const result = await inscriptionService.getSessionsEligible(jeune);
            expect(result).toEqual([sessions[1]]);
        });
    });
});
