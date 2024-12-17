import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";

import { department2region, departmentList, GRADES, RegionsHorsMetropole } from "snu-lib";

import { FunctionalExceptionCode } from "@shared/core/FunctionalException";

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
import { DbSessionGateway } from "@shared/core/DbSession.gateway";

const cohortName = "Avril 2024 - C";

describe("SimulationAffectationHTS", () => {
    let validerAffectationHTS: ValiderAffectationHTS;

    beforeEach(async () => {
        const mockSession = { id: "mockedSessionId", name: "mockedSessionName" };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ValiderAffectationHTS,
                AffectationService,
                Logger,
                {
                    provide: DbSessionGateway,
                    useValue: {
                        start: jest.fn(),
                        abort: jest.fn(),
                        commit: jest.fn(),
                        end: jest.fn(),
                    },
                },
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
                        update: jest.fn().mockResolvedValue({
                            id: "jeune1",
                            sessionNom: "Avril 2024 - C",
                            ligneDeBusId: "65f9c8bb735e0e12a4213c18",
                            sejourId: "6597e6acb86afb08146e8f86",
                            pointDeRassemblementId: "6398797d3bc18708cc3981f6",
                            hasPDR: "true",
                        }),
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

        validerAffectationHTS = module.get<ValiderAffectationHTS>(ValiderAffectationHTS);
    });

    it("should simulate young affectation", async () => {
        const result = await validerAffectationHTS.execute({
            sessionId: cohortName,
            simulationTaskId: "simulationTaskId",
            affecterPDR: true,
            dateAffectation: new Date(),
        });

        console.log(result);

        expect(result.analytics.errors).toEqual(0);
        expect(result.analytics.jeunesAffected).toEqual(1);
        expect(result.rapportData[0]).toEqual({
            dateNaissance: undefined,
            departement: undefined,
            email: undefined,
            error: "",
            genre: "garçon",
            id: "jeune1",
            ligneDeBusId: "65f9c8bb735e0e12a4213c18",
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
            prenom: undefined,
            psh: "non",
            qpv: "non",
            region: undefined,
            sessionId: "6597e6acb86afb08146e8f86",
            sessionNom: "Avril 2024 - C",
            statut: undefined,
            statutPhase1: undefined,
            telephone: undefined,
        });
    });
});
