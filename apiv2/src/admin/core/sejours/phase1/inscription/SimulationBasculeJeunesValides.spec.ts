import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";
import { addDays, isAfter, isWithinInterval } from "date-fns";

import { FileGateway } from "@shared/core/File.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { TaskGateway } from "@task/core/Task.gateway";

import { SessionGateway } from "../session/Session.gateway";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { JeuneModel } from "../../jeune/Jeune.model";

import { SimulationBasculeJeunesValides } from "./SimulationBasculeJeunesValides";
import { InscriptionService } from "./Inscription.service";

import * as mockJeunes from "../affectation/__tests__/youngs.json";

const sessionName = "2025 CLE 03 Fevrier";
const mockSession = { id: "mockedSessionId", name: "mockedSessionName", cohortGroupId: "cohortGroupId" };
const mockSessionAvenir = {
    id: "mockSessionAvenirId",
    name: "mockSessionAvenir",
    cohortGroupId: "cohortGroupId",
};

describe("SimulationBasculeJeunesValides", () => {
    let simulationBasculeJeunesValides: SimulationBasculeJeunesValides;
    const sessionGatewayMock = {
        findById: jest.fn().mockResolvedValue(mockSession),
        findByGroupIdStatusAndEligibility: jest.fn().mockResolvedValue([]),
        findByName: jest.fn().mockResolvedValue(mockSessionAvenir),
    };
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InscriptionService,
                SimulationBasculeJeunesValides,
                Logger,
                {
                    provide: JeuneGateway,
                    useValue: {
                        findBySessionIdStatutsStatutsPhase1NiveauScolairesAndDepartements: jest
                            .fn()
                            .mockResolvedValue(mockJeunes.slice(0, 20)),
                    },
                },
                {
                    provide: TaskGateway,
                    useValue: {
                        findById: jest.fn().mockResolvedValue({
                            metadata: {
                                parameters: {
                                    fileKey: "mockedFileKey",
                                },
                            },
                        }),
                    },
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
                {
                    provide: FileGateway,
                    useValue: {
                        generateExcel: jest.fn(),
                        uploadFile: jest.fn(),
                        downloadFile: jest.fn().mockResolvedValue({ Body: null }),
                        parseXLS: jest.fn().mockResolvedValue([]),
                    },
                },
            ],
        }).compile();

        simulationBasculeJeunesValides = module.get<SimulationBasculeJeunesValides>(SimulationBasculeJeunesValides);
    });

    it("should bascule young to avenir", async () => {
        const result = await simulationBasculeJeunesValides.execute({
            sessionId: sessionName,
            status: [],
            statusPhase1: [],
            presenceArrivee: [false, null],
            statusPhase1Motif: [],
            niveauScolaires: [],
            departements: [],
            etranger: true,
            avenir: true,
        });

        expect(result.analytics.jeunesAvenir).toEqual(20);
        expect(result.analytics.jeunesProchainSejour).toEqual(0);
        expect(result.rapportData.jeunesAvenir.length).toEqual(20);
        expect(result.rapportData.jeunesProchainSejour.length).toEqual(0);
    });

    it("should bascule young to next session", async () => {
        sessionGatewayMock.findByGroupIdStatusAndEligibility.mockResolvedValueOnce([
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
                id: mockSession.id,
                cohortGroupId: "mockedSessionId",
            },
        ]);
        const result = await simulationBasculeJeunesValides.execute({
            sessionId: sessionName,
            status: [],
            statusPhase1: [],
            presenceArrivee: [false, null],
            statusPhase1Motif: [],
            niveauScolaires: [],
            departements: [],
            etranger: true,
            avenir: false,
        });
        expect(result.analytics.jeunesAvenir).toEqual(19);
        expect(result.analytics.jeunesProchainSejour).toEqual(result.rapportData.jeunesProchainSejour.length);
        expect(result.rapportData.jeunesProchainSejour.length).toEqual(1);
        expect(result.rapportData.jeunesAvenir.length).toEqual(19);
    });

    describe("filterPresenceJeune", () => {
        it('should return true if jeune.presenceArrivee is "true" and presenceArrivee includes true', () => {
            const jeune = { presenceArrivee: "true" } as JeuneModel;
            const presenceArrivee = [true, false, null];
            expect(simulationBasculeJeunesValides.filterPresenceJeune(jeune, presenceArrivee)).toBe(true);
        });

        it('should return true if jeune.presenceArrivee is "false" and presenceArrivee includes false', () => {
            const jeune = { presenceArrivee: "false" } as JeuneModel;
            const presenceArrivee = [false, true, null];
            expect(simulationBasculeJeunesValides.filterPresenceJeune(jeune, presenceArrivee)).toBe(true);
        });

        it("should return true if jeune.presenceArrivee is undefined and presenceArrivee includes null", () => {
            const jeune = { presenceArrivee: undefined } as JeuneModel;
            const presenceArrivee = [null, true, false];
            expect(simulationBasculeJeunesValides.filterPresenceJeune(jeune, presenceArrivee)).toBe(true);
        });

        it('should return false if jeune.presenceArrivee is "true" and presenceArrivee does not include true', () => {
            const jeune = { presenceArrivee: "true" } as JeuneModel;
            const presenceArrivee = [false, null];
            expect(simulationBasculeJeunesValides.filterPresenceJeune(jeune, presenceArrivee)).toBe(false);
        });

        it('should return false if jeune.presenceArrivee is "false" and presenceArrivee does not include false', () => {
            const jeune = { presenceArrivee: "false" } as JeuneModel;
            const presenceArrivee = [true, null];
            expect(simulationBasculeJeunesValides.filterPresenceJeune(jeune, presenceArrivee)).toBe(false);
        });

        it("should return false if jeune.presenceArrivee is undefined and presenceArrivee does not include null", () => {
            const jeune = { presenceArrivee: undefined } as JeuneModel;
            const presenceArrivee = [true, false];
            expect(simulationBasculeJeunesValides.filterPresenceJeune(jeune, presenceArrivee)).toBe(false);
        });
    });
});
