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
import { SimulationAffectationHTS } from "./SimulationAffectationHTS";
import { SimulationAffectationHTSService } from "./SimulationAffectationHTS.service";

import { CentreGateway } from "../centre/Centre.gateway";

import { SessionGateway } from "../session/Session.gateway";

import * as mockJeunes from "./__tests__/youngs.json";
import * as mockLignesBus from "./__tests__/lignebuses.json";
import * as mockPdr from "./__tests__/pdr.json";
import * as mockSejours from "./__tests__/sejours.json";
import * as mockCentres from "./__tests__/centres.json";
import { AffectationService } from "./Affectation.service";
import { PlanDeTransportGateway } from "../PlanDeTransport/PlanDeTransport.gateway";

const cohortName = "Avril 2024 - C";

describe("SimulationAffectationHTS", () => {
    let simulationAffectationHTS: SimulationAffectationHTS;

    beforeEach(async () => {
        const mockSession = { id: "mockedSessionId", name: "mockedSessionName" };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AffectationService,
                SimulationAffectationHTS,
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
                        findBySessionIdStatusNiveauScolairesAndDepartements: jest.fn().mockResolvedValue(mockJeunes),
                    },
                },
                {
                    provide: LigneDeBusGateway,
                    useValue: {
                        findBySessionId: jest.fn().mockResolvedValue(mockLignesBus),
                        findBySessionNom: jest.fn().mockResolvedValue(mockLignesBus),
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

        simulationAffectationHTS = module.get<SimulationAffectationHTS>(SimulationAffectationHTS);
    });

    it("should not simulate for departement not in metropole", async () => {
        await expect(
            simulationAffectationHTS.execute({
                sessionId: cohortName,
                departements: departmentList,
                niveauScolaires: Object.values(GRADES),
                sdrImportId: "sdrImportId",
            }),
        ).rejects.toThrow(FunctionalExceptionCode.AFFECTATION_DEPARTEMENT_HORS_METROPOLE);
    });

    it("should simulate young affectation", async () => {
        const result = await simulationAffectationHTS.execute({
            sessionId: cohortName,
            departements: departmentList.filter(
                (departement) => !RegionsHorsMetropole.includes(department2region[departement]),
            ),
            niveauScolaires: Object.values(GRADES),
            sdrImportId: "sdrImportId",
            etranger: true,
        });

        // fixed data
        expect(result.rapportData.sejourList.length).toEqual(15);
        expect(result.rapportData.ligneDeBusList.length).toEqual(37);
        expect(result.rapportData.pdrList.length).toEqual(23);
        expect(result.rapportData.centreList.length).toEqual(15);

        // affectation result
        expect(result.rapportData.jeuneIntraDepartementList.length).toEqual(1);
        expect(result.rapportData.jeuneAttenteAffectationList.length).toBeGreaterThan(3);
        expect(result.rapportData.jeunesDejaAffectedList.length).toEqual(14);
        expect(result.rapportData.jeunesNouvellementAffectedList.length).toBeGreaterThan(74);
        expect(result.rapportData.jeuneAttenteAffectationList[0]["Ligne Theorique"]).toBeDefined();
    });
});
