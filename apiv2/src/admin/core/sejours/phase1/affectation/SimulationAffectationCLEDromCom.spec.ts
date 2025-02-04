import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";

import { department2region, departmentList, RegionsDromComEtCorse } from "snu-lib";

import { FunctionalExceptionCode } from "@shared/core/FunctionalException";

import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";

import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";
import { PointDeRassemblementGateway } from "../pointDeRassemblement/PointDeRassemblement.gateway";
import { SejourGateway } from "../sejour/Sejour.gateway";
import { SimulationAffectationCLEService } from "./SimulationAffectationCLE.service";

import { CentreGateway } from "../centre/Centre.gateway";

import { SessionGateway } from "../session/Session.gateway";

import * as mockJeunes from "./__tests__/youngs.json";
import * as mockLignesBus from "./__tests__/lignebuses.json";
import * as mockPdr from "./__tests__/pdr.json";
import * as mockSejours from "./__tests__/sejours.json";
import * as mockCentres from "./__tests__/centres.json";
import { PlanDeTransportGateway } from "../PlanDeTransport/PlanDeTransport.gateway";
import { ClasseGateway } from "../../cle/classe/Classe.gateway";
import { EtablissementGateway } from "../../cle/etablissement/Etablissement.gateway";
import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { SimulationAffectationCLEDromCom } from "./SimulationAffectationCLEDromCom";

const sessionName = "2025 CLE 03 Fevrier";

describe("SimulationAffectationCLEDromCom", () => {
    let simulationAffectationCLEDromCom: SimulationAffectationCLEDromCom;

    beforeEach(async () => {
        const mockSession = { id: "mockedSessionId", name: "mockedSessionName" };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SimulationAffectationCLEDromCom,
                SimulationAffectationCLEService,
                Logger,
                {
                    provide: FileGateway,
                    useValue: {
                        generateExcel: jest.fn(),
                        uploadFile: jest.fn(),
                        downloadFile: jest.fn().mockResolvedValue({ Body: null }),
                        parseXLS: jest.fn().mockResolvedValue([]),
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
                    useValue: {
                        findById: jest.fn().mockResolvedValue(mockSession),
                    },
                },
                {
                    provide: JeuneGateway,
                    useValue: {
                        findBySessionIdClasseIdAndStatus: jest
                            .fn()
                            .mockResolvedValue(mockJeunes.slice(0, 20).map((j) => ({ ...j, classeId: "classe1" }))),
                    },
                },
                {
                    provide: LigneDeBusGateway,
                    useValue: {
                        findBySessionIdAndClasseId: jest.fn().mockResolvedValue({
                            ...mockLignesBus[0],
                            pointDeRassemblementIds: [mockPdr[0].id],
                        }),
                    },
                },
                {
                    provide: PointDeRassemblementGateway,
                    useValue: {
                        findById: jest.fn().mockResolvedValue(mockPdr[0]),
                    },
                },
                {
                    provide: SejourGateway,
                    useValue: {
                        findById: jest.fn().mockResolvedValue({ ...mockSejours[0], sessionId: sessionName }),
                    },
                },
                {
                    provide: CentreGateway,
                    useValue: {
                        findBySessionId: jest.fn().mockResolvedValue(mockCentres),
                    },
                },
                {
                    provide: ClasseGateway,
                    useValue: {
                        findBySessionIdAndDepartmentNotWithdrawn: jest.fn().mockResolvedValue([
                            {
                                id: "classe1",
                                sessionId: sessionName,
                                sejourId: mockSejours[0].id,
                                etablissementId: "etablissement1",
                                pointDeRassemblementId: mockPdr[0].id,
                            },
                            {
                                id: "classe2",
                                sessionId: sessionName,
                                sejourId: mockSejours[0],
                                etablissementId: "etablissement1",
                                pointDeRassemblementId: mockPdr[0].id,
                            },
                            {
                                id: "classe3",
                                sessionId: sessionName,
                                sejourId: mockSejours[0],
                                etablissementId: "etablissement2",
                                pointDeRassemblementId: mockPdr[0].id,
                            },
                            {
                                id: "classe4",
                                sessionId: null,
                                sejourId: mockSejours[0],
                                etablissementId: "etablissement2",
                                pointDeRassemblementId: mockPdr[0].id,
                            },
                        ]),
                    },
                },
                {
                    provide: EtablissementGateway,
                    useValue: {
                        findByIds: jest.fn().mockResolvedValue([
                            {
                                id: "etablissement1",
                                nom: "etablissement1",
                                departement: "depEtab1",
                                region: "regionEtab1",
                            },
                            {
                                id: "etablissement2",
                                nom: "etablissement2",
                                departement: "depEtab2",
                                region: "regionEtab2",
                            },
                        ]),
                    },
                },
                {
                    provide: ReferentGateway,
                    useValue: {
                        findByIds: jest.fn().mockResolvedValue([]),
                    },
                },
                {
                    provide: PlanDeTransportGateway,
                    useValue: {},
                },
            ],
        }).compile();

        simulationAffectationCLEDromCom = module.get<SimulationAffectationCLEDromCom>(SimulationAffectationCLEDromCom);
    });

    it("should not simulate for departement not in metropole", async () => {
        await expect(
            simulationAffectationCLEDromCom.execute({
                sessionId: sessionName,
                departements: departmentList,
            }),
        ).rejects.toThrow(FunctionalExceptionCode.AFFECTATION_DEPARTEMENT_HORS_METROPOLE);
    });

    it("should simulate young affectation", async () => {
        const result = await simulationAffectationCLEDromCom.execute({
            sessionId: sessionName,
            departements: departmentList.filter((departement) =>
                RegionsDromComEtCorse.includes(department2region[departement]),
            ),
            etranger: true,
        });

        // affectation result
        expect(result.analytics.erreurs).toEqual(1);
        expect(result.analytics.erreurs).toEqual(result.rapportData.erreurList.length);
        expect(result.rapportData.jeunesNouvellementAffectedList.length).toEqual(60);
        expect(result.analytics.jeunesAffected).toEqual(result.rapportData.jeunesNouvellementAffectedList.length);
        expect(result.rapportData.ligneDeBusList.length).toEqual(0);
        expect(result.rapportData.centreList.length).toEqual(1);
    });
});
