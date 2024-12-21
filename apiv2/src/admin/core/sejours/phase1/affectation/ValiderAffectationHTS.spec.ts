import { ClsModule, ClsService } from "nestjs-cls";
import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";

import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";

import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";
import { PointDeRassemblementGateway } from "../pointDeRassemblement/PointDeRassemblement.gateway";
import { SejourGateway } from "../sejour/Sejour.gateway";

import { ValiderAffectationHTS } from "./ValiderAffectationHTS";

import { CentreGateway } from "../centre/Centre.gateway";

import { SessionGateway } from "../session/Session.gateway";

import * as mockLignesBus from "./__tests__/lignebuses.json";
import * as mockPdr from "./__tests__/pdr.json";
import * as mockSejours from "./__tests__/sejours.json";
import * as mockCentres from "./__tests__/centres.json";
import { AffectationService } from "./Affectation.service";
import { PlanDeTransportGateway } from "../PlanDeTransport/PlanDeTransport.gateway";

const cohortName = "Avril 2024 - C";

jest.mock("@nestjs-cls/transactional", () => ({
    Transactional: () => jest.fn(),
}));

describe("ValiderAffectationHTS", () => {
    let validerAffectationHTS: ValiderAffectationHTS;
    let cls: ClsService;

    beforeEach(async () => {
        const mockSession = { id: "mockedSessionId", name: "mockedSessionName" };

        const module: TestingModule = await Test.createTestingModule({
            imports: [ClsModule],
            providers: [
                ValiderAffectationHTS,
                AffectationService,
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
                                ligneDeBusId: "65f9c8bb735e0e12a4213c18",
                                sejourId: "6597e6acb86afb08146e8f86",
                                centreId: "609bebb00c1cc9a888ae8fa8",
                                sessionNom: "Avril 2024 - C",
                                "Point de rassemblement calculé": "6398797d3bc18708cc3981f6",
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
                                sessionNom: "Avril 2024 - C",
                            },
                        ]),
                        bulkUpdate: jest.fn().mockResolvedValue(1),
                        countAffectedByLigneDeBus: jest.fn().mockResolvedValue(1),
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
                        update: jest.fn(),
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
                        findBySessionId: jest.fn().mockResolvedValue(mockSejours),
                        update: jest.fn(),
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
                        update: jest.fn(),
                    },
                },
            ],
        }).compile();
        cls = module.get<ClsService>(ClsService);
        validerAffectationHTS = module.get<ValiderAffectationHTS>(ValiderAffectationHTS);
    });

    it("should simulate young affectation", async () => {
        const result = await cls.runWith(
            // @ts-ignore
            { user: null },
            () =>
                validerAffectationHTS.execute({
                    sessionId: cohortName,
                    simulationTaskId: "simulationTaskId",
                    affecterPDR: true,
                    dateAffectation: new Date(),
                }),
        );

        expect(result.analytics.errors).toEqual(0);
        expect(result.analytics.jeunesAffected).toEqual(1);
        expect(result.rapportData[0]).toEqual({
            centreId: "657334e06e801c0816d4550c",
            centreNom: "",
            dateNaissance: undefined,
            departement: undefined,
            email: undefined,
            error: "",
            genre: "garçon",
            id: "jeune1",
            ligneDeBusId: "65f9c8bb735e0e12a4213c18",
            ligneDeBusNumeroLigne: "IDF078036",
            nom: undefined,
            parent1Email: undefined,
            parent1Nom: undefined,
            parent1Prenom: undefined,
            parent1Telephone: undefined,
            parent2Email: undefined,
            parent2Nom: undefined,
            parent2Prenom: undefined,
            parent2Telephone: undefined,
            "places restantes après l'inscription (centre)": 13,
            "places totale (centre)": 126,
            pointDeRassemblementId: "6398797d3bc18708cc3981f6",
            pointDeRassemblementMatricule: "",
            prenom: undefined,
            psh: "non",
            qpv: "non",
            region: undefined,
            sessionId: "6597e6acb86afb08146e8f86",
            sessionNom: "Avril 2024 - C",
            statut: "VALIDATED",
            statutPhase1: "AFFECTED",
            telephone: undefined,
        });
    });
});
