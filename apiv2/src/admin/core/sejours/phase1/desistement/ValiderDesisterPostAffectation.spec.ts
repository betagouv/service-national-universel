import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";
import { ClsService } from "nestjs-cls";

import { TaskGateway } from "@task/core/Task.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { FileGateway } from "@shared/core/File.gateway";

import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";
import { PointDeRassemblementGateway } from "../pointDeRassemblement/PointDeRassemblement.gateway";
import { SejourGateway } from "../sejour/Sejour.gateway";
import { SessionGateway } from "../session/Session.gateway";

import { ValiderDesisterPostAffectation } from "./ValiderDesisterPostAffectation";

import * as mockJeunes from "../affectation/__tests__/youngs.json";
import { DesistementService } from "./Desistement.service";
import { AffectationService } from "../affectation/Affectation.service";
import { PlanDeTransportGateway } from "../PlanDeTransport/PlanDeTransport.gateway";

const sessionNom = "mockedSessionName";
const mockSession = { id: sessionNom, name: sessionNom };

const mockSejour = { id: "mockedSejourId" };

jest.mock("@nestjs-cls/transactional", () => ({
    Transactional: () => jest.fn(),
}));

describe("ValiderDesisterPostAffectation", () => {
    let validerDesisterPostAffectation: ValiderDesisterPostAffectation;
    let desistementService: DesistementService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: DesistementService,
                    useValue: {
                        groupJeunesByReponseAuxAffectations: jest.fn().mockReturnValue({
                            jeunesDesistes: Array(25).fill({ id: "young-id" }),
                            jeunesAutreSession: Array(25).fill({ id: "young-id" }),
                            jeunesConfirmes: Array(25).fill({ id: "young-id" }),
                            jeunesNonConfirmes: Array(25).fill({ id: "young-id" }),
                        }),
                        mapJeunes: jest.fn((jeunes) => jeunes),
                        desisterJeunes: jest.fn().mockResolvedValue(25),
                        generateRapportPostDesistement: jest.fn().mockResolvedValue(Buffer.from("mock-excel")),
                        notifierJeunes: jest.fn().mockResolvedValue(undefined),
                    },
                },
                AffectationService,
                ValiderDesisterPostAffectation,
                Logger,
                {
                    provide: FileGateway,
                    useValue: {
                        generateExcel: jest.fn(),
                        uploadFile: jest.fn(),
                        downloadFile: jest.fn().mockResolvedValue({ Body: null }),
                        parseXLS: jest.fn().mockResolvedValue(mockJeunes),
                    },
                },
                {
                    provide: TaskGateway,
                    useValue: {
                        findById: jest.fn().mockResolvedValue({
                            metadata: {
                                results: {
                                    rapportKey: "mockedFileKey",
                                },
                            },
                        }),
                    },
                },
                {
                    provide: ClsService,
                    useValue: {
                        set: jest.fn(),
                    },
                },
                {
                    provide: SessionGateway,
                    useValue: {
                        findById: jest.fn().mockResolvedValue(mockSession),
                    },
                },
                {
                    provide: JeuneGateway,
                    useValue: {
                        findByIds: jest.fn().mockResolvedValue([
                            ...mockJeunes.map((jeune) => ({ ...jeune, sessionId: sessionNom })),
                            {
                                ...mockJeunes[0],
                                sessionId: sessionNom,
                                youngPhase1Agreement: "true",
                            },
                            {
                                ...mockJeunes[0],
                                youngPhase1Agreement: "true",
                            },
                        ]),
                        bulkUpdate: jest.fn().mockResolvedValue({ modifiedCount: 25 }),
                    },
                },
                {
                    provide: NotificationGateway,
                    useValue: {
                        sendEmail: jest.fn(),
                    },
                },
                {
                    provide: LigneDeBusGateway,
                    useValue: {},
                },
                {
                    provide: PlanDeTransportGateway,
                    useValue: {},
                },
                {
                    provide: PointDeRassemblementGateway,
                    useValue: {},
                },
                {
                    provide: SejourGateway,
                    useValue: {
                        findBySessionId: jest.fn().mockResolvedValue([mockSejour]),
                        countPlaceOccupeesBySejourIds: jest
                            .fn()
                            .mockResolvedValue([{ id: mockSejour.id, placesOccupeesJeunes: 0 }]),
                        bulkUpdate: jest.fn().mockResolvedValue(1),
                    },
                },

                {
                    provide: ClockGateway,
                    useValue: {
                        now: jest.fn(),
                        formatSafeDateTime: jest.fn().mockReturnValue("2023-01-01T00:00:00.000Z"),
                    },
                },
            ],
        }).compile();

        validerDesisterPostAffectation = module.get<ValiderDesisterPostAffectation>(ValiderDesisterPostAffectation);
        desistementService = module.get<DesistementService>(DesistementService);
    });

    it("should validate young desistement simulation", async () => {
        const result = await validerDesisterPostAffectation.execute({
            sessionId: sessionNom,
            simulationTaskId: "mockedTaskId",
        });

        expect(result.jeunesDesistes).toEqual(25);
        expect(result.jeunesAutreSession).toEqual(25);
        expect(result.jeunesConfirmes).toEqual(25);
        expect(result.jeunesNonConfirmes).toEqual(25);
        expect(result.jeunesModifies).toEqual(25);
        expect(result.rapportKey).toEqual(
            "file/admin/sejours/phase1/affectation/mockedSessionName/desistement/desistement-post-affectation_mockedSessionName_2023-01-01T00:00:00.000Z.xlsx",
        );
        expect(desistementService.groupJeunesByReponseAuxAffectations).toHaveBeenCalled();
        expect(desistementService.desisterJeunes).toHaveBeenCalledWith(expect.any(Array), sessionNom);
        expect(desistementService.notifierJeunes).toHaveBeenCalledWith(expect.any(Array));
        expect(desistementService.generateRapportTraitementPostDesistement).toHaveBeenCalled();
    });
});
