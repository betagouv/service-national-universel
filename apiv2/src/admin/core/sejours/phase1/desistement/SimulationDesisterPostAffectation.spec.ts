import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";

import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { NotificationGateway } from "@notification/core/Notification.gateway";

import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";
import { PointDeRassemblementGateway } from "../pointDeRassemblement/PointDeRassemblement.gateway";
import { SejourGateway } from "../sejour/Sejour.gateway";
import { SessionGateway } from "../session/Session.gateway";

import { SimulationDesisterPostAffectation } from "./SimulationDesisterPostAffectation";

import * as mockJeunes from "../affectation/__tests__/youngs.json";
import { DesistementService } from "./Desistement.service";
import { AffectationService } from "../affectation/Affectation.service";
import { PlanDeTransportGateway } from "../PlanDeTransport/PlanDeTransport.gateway";

const sessionNom = "mockedSessionName";
const mockSession = { id: sessionNom, name: sessionNom };

jest.mock("@nestjs-cls/transactional", () => ({
    Transactional: () => jest.fn(),
}));

describe("SimulationDesisterPostAffectation", () => {
    let simulationDesisterPostAffectation: SimulationDesisterPostAffectation;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DesistementService,
                AffectationService,
                SimulationDesisterPostAffectation,
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
                    },
                },
                {
                    provide: NotificationGateway,
                    useValue: {},
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
                    useValue: {},
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

        simulationDesisterPostAffectation = module.get<SimulationDesisterPostAffectation>(
            SimulationDesisterPostAffectation,
        );
    });

    it("should simulate young desistement simulation", async () => {
        const result = await simulationDesisterPostAffectation.execute({
            sessionId: sessionNom,
            affectationTaskId: "mockedTaskId",
        });

        expect(result.rapportData.jeunesDesistes.length).toEqual(0);
        expect(result.rapportData.jeunesAutreSession.length).toEqual(1);
        expect(result.rapportData.jeunesNonConfirmes.length).toEqual(100);
        expect(result.rapportData.jeunesConfirmes.length).toEqual(1);
    });
});
