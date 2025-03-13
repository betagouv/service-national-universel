import { ClsModule, ClsService } from "nestjs-cls";
import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";

import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";

import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";
import { PointDeRassemblementGateway } from "../pointDeRassemblement/PointDeRassemblement.gateway";
import { SejourGateway } from "../sejour/Sejour.gateway";

import { ValiderAffectationCLE } from "./ValiderAffectationCLE";

import { CentreGateway } from "../centre/Centre.gateway";

import { SessionGateway } from "../session/Session.gateway";

import * as mockLignesBus from "./__tests__/lignebuses.json";
import * as mockPdr from "./__tests__/pdr.json";
import * as mockSejours from "./__tests__/sejours.json";
import * as mockCentres from "./__tests__/centres.json";
import { AffectationService } from "./Affectation.service";
import { PlanDeTransportGateway } from "../PlanDeTransport/PlanDeTransport.gateway";
import { YOUNG_STATUS } from "snu-lib";
import { ValiderAffectationCLEDromCom } from "./ValiderAffectationCLEDromCom";
import { ValiderAffectationCLEService } from "./ValiderAffectationCLE.service";
import { ClockGateway } from "@shared/core/Clock.gateway";

const sessionNom = "2025 CLE 03 Fevrier";

jest.mock("@nestjs-cls/transactional", () => ({
    Transactional: () => jest.fn(),
}));

describe("ValiderAffectationCLEDromcom", () => {
    let validerAffectationCLEDromCom: ValiderAffectationCLEDromCom;
    let cls: ClsService;

    beforeEach(async () => {
        const mockSession = { id: "mockedSessionId", name: "mockedSessionName" };

        const module: TestingModule = await Test.createTestingModule({
            imports: [ClsModule],
            providers: [
                AffectationService,
                ValiderAffectationCLEService,
                ValiderAffectationCLEDromCom,
                Logger,
                {
                    provide: FileGateway,
                    useValue: {
                        generateExcel: jest.fn(),
                        uploadFile: jest.fn(),
                        downloadFile: jest.fn().mockResolvedValue({ Body: null }),
                        parseXLS: jest.fn().mockResolvedValue([
                            {
                                "id du volontaire": "jeune1",
                                sejourId: "6597e6acb86afb08146e8f86",
                                classeCenterId: "609bebb00c1cc9a888ae8fa8",
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
                                statut: YOUNG_STATUS.VALIDATED,
                                sessionNom: sessionNom,
                                classeId: "classe1",
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
                    provide: LigneDeBusGateway,
                    useValue: {
                        findBySessionId: jest.fn().mockResolvedValue(mockLignesBus),
                        findBySessionNom: jest.fn().mockResolvedValue(mockLignesBus),
                        bulkUpdate: jest.fn().mockResolvedValue(1),
                    },
                },
                {
                    provide: PointDeRassemblementGateway,
                    useValue: {
                        findBySessionId: jest.fn().mockResolvedValue(mockPdr),
                        findByMatricules: jest.fn(),
                        findByIds: jest.fn().mockResolvedValue(mockPdr),
                    },
                },
                {
                    provide: SejourGateway,
                    useValue: {
                        findBySessionId: jest
                            .fn()
                            .mockResolvedValue(mockSejours.map((sejour) => ({ ...sejour, sessionNom: sessionNom }))),
                        countPlaceOccupeesBySejourIds: jest.fn().mockResolvedValue(
                            mockSejours.map((sejour) => ({
                                id: sejour.id,
                                placesOccupeesJeunes: sejour.placesTotal,
                            })),
                        ),
                        bulkUpdate: jest.fn().mockResolvedValue(1),
                    },
                },
                {
                    provide: CentreGateway,
                    useValue: {
                        findBySessionId: jest.fn().mockResolvedValue(mockCentres),
                    },
                },
                {
                    provide: PlanDeTransportGateway,
                    useValue: {
                        findById: jest.fn().mockResolvedValue({ id: "pdt1" }),
                        findByIds: jest.fn().mockResolvedValue(mockLignesBus.map((ligne) => ({ id: ligne.id }))),
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
        cls = module.get<ClsService>(ClsService);
        validerAffectationCLEDromCom = module.get<ValiderAffectationCLEDromCom>(ValiderAffectationCLEDromCom);
    });

    it("should simulate young affectation", async () => {
        const result = await cls.runWith(
            // @ts-ignore
            { user: null },
            () =>
                validerAffectationCLEDromCom.execute({
                    sessionId: sessionNom,
                    simulationTaskId: "simulationTaskId",
                    dateAffectation: new Date(),
                }),
        );

        expect(result.analytics.errors).toEqual(0);
        expect(result.analytics.jeunesAffected).toEqual(1);
        expect(result.rapportData[0]).toEqual({
            centreId: "657334e06e801c0816d4550c",
            centreNom: "",
            classeId: "classe1",
            dateNaissance: undefined,
            departement: undefined,
            email: undefined,
            erreur: "",
            genre: "garçon",
            id: "jeune1",
            nom: undefined,
            parent1Email: undefined,
            parent1Nom: undefined,
            parent1Prenom: undefined,
            parent1Telephone: undefined,
            parent2Email: undefined,
            parent2Nom: undefined,
            parent2Prenom: undefined,
            parent2Telephone: undefined,
            "places restantes après l'inscription (centre)": 99,
            "places totale (centre)": 126,
            prenom: undefined,
            psh: "non",
            qpv: "non",
            region: undefined,
            sessionId: "6597e6acb86afb08146e8f86",
            sessionNom: sessionNom,
            statut: "VALIDATED",
            statutPhase1: "AFFECTED",
            telephone: undefined,
        });
    });
});
