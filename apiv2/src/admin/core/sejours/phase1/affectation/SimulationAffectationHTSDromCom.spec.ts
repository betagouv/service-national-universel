import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";

import { department2region, departmentList, GRADES, RegionsDromComEtCorse } from "snu-lib";

import { FunctionalExceptionCode } from "@shared/core/FunctionalException";

import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";

import { PlanDeTransportGateway } from "../PlanDeTransport/PlanDeTransport.gateway";
import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { SimulationAffectationHTSDromCom } from "./SimulationAffectationHTSDromCom";

import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";
import { PointDeRassemblementGateway } from "../pointDeRassemblement/PointDeRassemblement.gateway";
import { SejourGateway } from "../sejour/Sejour.gateway";
import { CentreGateway } from "../centre/Centre.gateway";
import { SessionGateway } from "../session/Session.gateway";

import { AffectationService } from "./Affectation.service";
import { SimulationAffectationHTSService } from "./SimulationAffectationHTS.service";

import * as mockJeunes from "./__tests__/youngs.json";
import * as mockSejours from "./__tests__/sejours.json";
import * as mockCentres from "./__tests__/centres.json";

const sessionNom = "2025 HTS 02 - Mai La Réunion";

describe("SimulationAffectationHTSDromCom", () => {
    let simulationAffectationHTSDromCom: SimulationAffectationHTSDromCom;

    beforeEach(async () => {
        const mockSession = { id: "mockedSessionId", name: "mockedSessionName" };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AffectationService,
                SimulationAffectationHTSDromCom,
                SimulationAffectationHTSService,
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
                        findBySessionIdStatutNiveauScolairesAndDepartementsCible: jest
                            .fn()
                            .mockResolvedValue(mockJeunes.map((jeune) => ({ ...jeune, sessionNom }))),
                    },
                },
                {
                    provide: LigneDeBusGateway,
                    useValue: {},
                },
                {
                    provide: PointDeRassemblementGateway,
                    useValue: {},
                },
                {
                    provide: SejourGateway,
                    useValue: {
                        findBySessionId: jest.fn().mockResolvedValue([{ ...mockSejours[0], sessionId: sessionNom }]),
                        findById: jest.fn().mockResolvedValue({ ...mockSejours[0], sessionId: sessionNom }),
                    },
                },
                {
                    provide: CentreGateway,
                    useValue: {
                        findBySessionId: jest.fn().mockResolvedValue(mockCentres.slice(0, 1)),
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

        simulationAffectationHTSDromCom = module.get<SimulationAffectationHTSDromCom>(SimulationAffectationHTSDromCom);
    });

    it("should not simulate for departement not in metropole", async () => {
        await expect(
            simulationAffectationHTSDromCom.execute({
                sessionId: sessionNom,
                departements: departmentList,
                niveauScolaires: Object.values(GRADES),
            }),
        ).rejects.toThrow(FunctionalExceptionCode.AFFECTATION_DEPARTEMENT_HORS_METROPOLE);
    });

    it("should simulate young affectation", async () => {
        const result = await simulationAffectationHTSDromCom.execute({
            sessionId: sessionNom,
            departements: departmentList.filter((departement) =>
                RegionsDromComEtCorse.includes(department2region[departement]),
            ),
            etranger: true,
            niveauScolaires: Object.values(GRADES),
        });

        // fixed data
        expect(result.rapportData.sejourList.length).toEqual(1);
        expect(result.rapportData.ligneDeBusList.length).toEqual(0);
        expect(result.rapportData.pdrList.length).toEqual(0);
        expect(result.rapportData.centreList.length).toEqual(1);

        // affectation result
        expect(result.rapportData.jeunesNouvellementAffectedList.length).toEqual(0);
        expect(result.rapportData.jeuneIntraDepartementList.length).toBeGreaterThanOrEqual(0);
        expect(result.rapportData.jeuneAttenteAffectationList.length).toBeGreaterThanOrEqual(1);
        expect(result.rapportData.jeunesDejaAffectedList.length).toEqual(14);
    });
});
