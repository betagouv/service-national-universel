import { promises as fs } from "fs";
import * as path from "path";
// TODO: remove
import { parse, ParserOptionsArgs } from "@fast-csv/parse";

import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";

import { department2region, departmentList, ERRORS, GRADES, RegionsHorsMetropole } from "snu-lib";

import { FunctionalExceptionCode } from "@shared/core/FunctionalException";

// TODO: remove
import { SejourMapper } from "@admin/infra/sejours/phase1/sejour/repository/Sejour.mapper";
import { LigneDeBusMapper } from "@admin/infra/sejours/phase1/ligneDeBus/repository/LigneDeBus.mapper";
import { PointDeRassemblementMapper } from "@admin/infra/sejours/phase1/pointDeRassemblement/repository/PointDeRassemblement.mapper";
import { JeuneMapper } from "@admin/infra/sejours/jeune/repository/Jeune.mapper";
import { CentreMapper } from "@admin/infra/sejours/phase1/centre/repository/Centre.mapper";
import { FileGateway } from "@shared/core/File.gateway";

import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";
import { PointDeRassemblementGateway } from "../pointDeRassemblement/PointDeRassemblement.gateway";
import { SejourGateway } from "../sejour/Sejour.gateway";
import { SimulationAffectationHTS } from "./SimulationAffectationHTS";
import { SimulationAffectationHTSService } from "./SimulationAffectationHTS.service";

import { CentreGateway } from "../centre/Centre.gateway";

import { SessionGateway } from "../session/Session.gateway";

const cohortName = "Avril 2024 - C";

// TODO: déplacer dans fileService
function readCSVBuffer<T>(buffer: Buffer, options: ParserOptionsArgs = { headers: true }): Promise<T[]> {
    return new Promise((resolve, reject) => {
        const content: T[] = [];

        const stream = parse(options)
            .on("error", (error) => {
                console.log(error);
                reject(new Error(ERRORS.CANNOT_PARSE_CSV));
            })
            .on("data", (row) => {
                content.push(row);
            })
            .on("end", () => {
                resolve(content);
            });
        stream.write(buffer);
        stream.end();
    });
}

describe("SimulationAffectationHTS", () => {
    let simulationAffectationHTS: SimulationAffectationHTS;
    let simulationAffectationHTSService: SimulationAffectationHTSService;

    beforeEach(async () => {
        const mockSession = { id: "mockedSessionId", name: "mockedSessionName" };

        // on mock en utilisant les fichiers CSV issues de l'ancien algo affectation en python
        const mockJeunes = (await readCSVBuffer(await fs.readFile(path.dirname(__filename) + "/__tests__/youngs.csv")))
            .filter(
                (item: any) =>
                    item.cohort === cohortName &&
                    item.status === "VALIDATED" &&
                    !RegionsHorsMetropole.includes(item.departement),
            )
            .map((jeune: any) =>
                JeuneMapper.toModel({
                    ...jeune,
                    qvp: jeune.qvp === "oui" ? "true" : "false",
                    handicap: jeune.handicap === "oui" ? "true" : "false",
                    handicapInSameDepartment: jeune.handicapInSameDepartment === "oui" ? "true" : "false",
                } as any),
            );
        const mockLignesBus = (
            await readCSVBuffer(await fs.readFile(path.dirname(__filename) + "/__tests__/lignebuses.csv"))
        )
            .filter((item: any) => item.cohort === cohortName)
            .map((ligne: any) =>
                LigneDeBusMapper.toModel({
                    ...ligne,
                    meetingPointsIds: JSON.parse(ligne.meetingPointsIds.replaceAll("'", '"')),
                    youngSeatsTaken: Number(ligne.youngSeatsTaken),
                    youngCapacity: Number(ligne.youngCapacity),
                }),
            );
        const mockPdr = (await readCSVBuffer(await fs.readFile(path.dirname(__filename) + "/__tests__/pdr.csv")))
            .filter((item: any) => item.cohorts.includes(cohortName))
            .map((pdr) => PointDeRassemblementMapper.toModel(pdr as any));
        const mockSejours = (
            await readCSVBuffer(await fs.readFile(path.dirname(__filename) + "/__tests__/sessionphase1.csv"))
        )
            .filter((item: any) => item.cohort === cohortName)
            .map((sejour: any) =>
                SejourMapper.toModel({
                    ...sejour,
                    placesLeft: Number(sejour.placesLeft),
                    placesTotal: Number(sejour.placesTotal),
                }),
            );
        const mockCentres = (await readCSVBuffer(await fs.readFile(path.dirname(__filename) + "/__tests__/center.csv")))
            .filter((item: any) => item.cohorts.includes(cohortName))
            .map((centre) => CentreMapper.toModel(centre as any));

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SimulationAffectationHTS,
                SimulationAffectationHTSService,
                Logger,
                { provide: FileGateway, useValue: { generateExcel: jest.fn() } },
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
                    },
                },
                {
                    provide: PointDeRassemblementGateway,
                    useValue: {
                        findBySessionId: jest.fn().mockResolvedValue(mockPdr),
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
            ],
        }).compile();

        simulationAffectationHTS = module.get<SimulationAffectationHTS>(SimulationAffectationHTS);
        simulationAffectationHTSService = module.get<SimulationAffectationHTSService>(SimulationAffectationHTSService);
    });

    it("should not simulate for departement not in metropole", async () => {
        await expect(
            simulationAffectationHTS.execute({
                sessionId: cohortName,
                departements: departmentList,
                niveauScolaires: Object.values(GRADES),
                changementDepartements: [],
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
            changementDepartements: [],
        });

        // sauvegarde du resultat pour debug : TODO: à supprimer
        // await fs.writeFile(
        //     path.join(`affectation_simulation_${cohortName}_${new Date().toISOString()}.xlsx`),
        //     await simulationAffectationHTSService.generateRapportExcel(result.rapportData),
        // );

        // simulationAffectationHTSService.savePdfFile(
        //     result.rapportData,
        //     `affectation_simulation_${cohortName}_${new Date().toISOString()}.pdf`,
        // );

        // fixed data
        expect(result.rapportData.sejourList.length).toEqual(15);
        expect(result.rapportData.ligneDeBusList.length).toEqual(37);
        expect(result.rapportData.pdrList.length).toEqual(23);
        expect(result.rapportData.centreList.length).toEqual(15);

        // affectation result
        expect(result.rapportData.jeuneIntraDepartementList.length).toEqual(4);
        expect(result.rapportData.jeuneAttenteAffectationList.length).toBeGreaterThan(1000);
        expect(result.rapportData.jeunesDejaAffectedList.length).toEqual(179);
        expect(result.rapportData.jeunesNouvellementAffectedList.length).toBeGreaterThan(400);
        expect(result.rapportData.jeuneAttenteAffectationList[0]["Ligne Theorique"]).toBeDefined();
    });
});
