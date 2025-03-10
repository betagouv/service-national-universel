import { ClsModule, ClsService } from "nestjs-cls";
import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";

import { YOUNG_STATUS } from "snu-lib";

import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { NotificationGateway } from "@notification/core/Notification.gateway";

import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { SessionGateway } from "../session/Session.gateway";
import { ValiderBasculeJeunesNonValides } from "./ValiderBasculeJeunesNonValides";
import { ValiderBasculeJeunesService } from "./ValiderBasculeJeunes.service";

jest.mock("@nestjs-cls/transactional", () => ({
    Transactional: () => jest.fn(),
}));

const mockSession = { id: "mockedSessionId", nom: "mockedSessionName" };

describe("ValiderBasculeJeunesNonValides", () => {
    let validerBasculeJeunesNonValides: ValiderBasculeJeunesNonValides;
    let cls: ClsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ClsModule],
            providers: [
                ValiderBasculeJeunesNonValides,
                ValiderBasculeJeunesService,
                Logger,
                {
                    provide: FileGateway,
                    useValue: {
                        generateExcel: jest.fn(),
                        uploadFile: jest.fn(),
                        downloadFile: jest.fn().mockResolvedValue({ Body: null }),
                        parseXLS: jest.fn().mockResolvedValue([
                            {
                                id: "jeune1",
                                dateNaissance: new Date(),
                                ancienneSessionId: mockSession.id,
                                ancienneSession: mockSession.nom,
                                nouvelleSessionId: "nouvelleSessionId",
                                nouvelleSession: "nouvelleSession",
                            },
                        ]),
                    },
                },
                {
                    provide: JeuneGateway,
                    useValue: {
                        findByIds: jest.fn().mockResolvedValue([
                            {
                                id: "jeune1",
                                statut: YOUNG_STATUS.WAITING_VALIDATION,
                                sessionId: mockSession.id,
                                sessionNom: mockSession.nom,
                            },
                        ]),
                        bulkUpdate: jest.fn().mockResolvedValue(1),
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
                    provide: NotificationGateway,
                    useValue: {
                        sendEmail: jest.fn(),
                    },
                },
                {
                    provide: ClockGateway,
                    useValue: {
                        now: jest.fn(),
                        formatSafeDateTime: jest.fn().mockReturnValue("2023-01-01T00:00:00.000Z"),
                        formatShort: jest.fn().mockReturnValue("DD/MM/YYYY"),
                    },
                },
            ],
        }).compile();
        cls = module.get<ClsService>(ClsService);
        validerBasculeJeunesNonValides = module.get<ValiderBasculeJeunesNonValides>(ValiderBasculeJeunesNonValides);
    });

    it("should bacule young", async () => {
        const result = await cls.runWith(
            // @ts-ignore
            { user: null },
            () =>
                validerBasculeJeunesNonValides.execute({
                    sessionId: mockSession.id,
                    simulationTaskId: "simulationTaskId",
                    dateValidation: new Date(),
                    sendEmail: true,
                }),
        );

        expect(result.analytics.errors).toEqual(0);
        expect(result.analytics.jeunesBascules).toEqual(2);
        expect(result.rapportData[0]).toEqual({
            age: "",
            ancienneSession: "mockedSessionName",
            ancienneSessionId: "mockedSessionId",
            dateNaissance: "",
            departSejourMotif: undefined,
            departementResidence: undefined,
            departementScolarite: undefined,
            email: undefined,
            emailTemplateId: "2407",
            erreur: "",
            id: "jeune1",
            nom: undefined,
            nouvelleSession: "nouvelleSession",
            nouvelleSessionId: "nouvelleSessionId",
            parent1Email: undefined,
            parent1Nom: undefined,
            parent1Prenom: undefined,
            parent1Telephone: undefined,
            parent2Email: undefined,
            parent2Nom: undefined,
            parent2Prenom: undefined,
            parent2Telephone: undefined,
            paysScolarite: undefined,
            prenom: undefined,
            presenceArrivee: undefined,
            regionResidence: undefined,
            regionScolarite: undefined,
            statut: "WAITING_VALIDATION",
            statutPhase1: undefined,
            telephone: undefined,
        });
    });
});
