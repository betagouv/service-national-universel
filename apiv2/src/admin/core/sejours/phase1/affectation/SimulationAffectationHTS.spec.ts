import { promises as fs } from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import { Test, TestingModule } from "@nestjs/testing";

import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";
import { PointDeRassemblementGateway } from "../pointDeRassemblement/PointDeRassemblement.gateway";
import { SejourGateway } from "../sejour/Sejour.gateway";
import { SimulationAffectationHTS } from "./SimulationAffectationHTS";
import { SimulationAffectationHTSService } from "./SimulationAffectationHTS.service";

import { readCSVBuffer } from "snu-lib";
import { CentreGateway } from "../centre/Centre.gateway";
import { SejourMapper } from "src/admin/infra/sejours/phase1/sejour/repository/Sejour.mapper";
import { LigneDeBusMapper } from "src/admin/infra/sejours/phase1/ligneDeBus/repository/LigneDeBus.mapper";
import { PointDeRassemblementMapper } from "src/admin/infra/sejours/phase1/pointDeRassemblement/repository/PointDeRassemblement.mapper";
import { JeuneMapper } from "src/admin/infra/sejours/jeune/repository/Jeune.mapper";
import { CentreMapper } from "src/admin/infra/sejours/phase1/centre/repository/Centre.mapper";

const cohortName = "Avril 2024 - C";

describe("SimulationAffectationHTS", () => {
    let simulationAffectationHTS: SimulationAffectationHTS;
    let simulationAffectationHTSService: SimulationAffectationHTSService;
    let jeuneGateway: JeuneGateway;
    let ligneDeBusGateway: LigneDeBusGateway;
    let pointDeRassemblementGateway: PointDeRassemblementGateway;
    let sejourGateway: SejourGateway;

    beforeEach(async () => {
        const mockJeunes = (await readCSVBuffer(await fs.readFile(path.dirname(__filename) + "/__tests__/youngs.csv")))
            .filter(
                (item: any) =>
                    item.cohort === cohortName &&
                    item.status === "VALIDATED" &&
                    ![
                        "Mayotte",
                        "Wallis-et-Futuna",
                        "Saint-Martin",
                        "Polynésie française",
                        "La Réunion",
                        "Saint-Pierre-et-Miquelon",
                        "Guyane",
                        "Nouvelle-Calédonie",
                        "Guadeloupe",
                        "Martinique",
                        "Corse",
                        "Haute-Corse",
                        "Corse-du-Sud",
                    ].includes(item.departement),
            )
            .map((jeune) => JeuneMapper.toModel(jeune as any));
        const mockLignesBus = (
            await readCSVBuffer(await fs.readFile(path.dirname(__filename) + "/__tests__/lignebuses.csv"))
        )
            .filter((item: any) => item.cohort === cohortName)
            .map((ligne: any) =>
                LigneDeBusMapper.toModel({
                    ...ligne,
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
                {
                    provide: JeuneGateway,
                    useValue: {
                        findBySessionIdAndStatusForDepartementMetropole: jest.fn().mockResolvedValue(mockJeunes),
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
        jeuneGateway = module.get<JeuneGateway>(JeuneGateway);
        ligneDeBusGateway = module.get<LigneDeBusGateway>(LigneDeBusGateway);
        pointDeRassemblementGateway = module.get<PointDeRassemblementGateway>(PointDeRassemblementGateway);
        sejourGateway = module.get<SejourGateway>(SejourGateway);
    });

    it("should simulate young affectation", async () => {
        const reportData = await simulationAffectationHTS.execute({
            sessionId: cohortName,
        });

        // sauvegarde du resultat pour debug : TODO supprimer
        simulationAffectationHTSService.saveExcelFile(
            reportData,
            `affectation_simulation_${cohortName}_${new Date().toISOString()}.xlsx`,
        );

        simulationAffectationHTSService.savePdfFile(
            reportData,
            `affectation_simulation_${cohortName}_${new Date().toISOString()}.pdf`,
        );

        // fixed data
        expect(reportData.SessionPhase1.length).toEqual(15);
        expect(reportData.lignebuses.length).toEqual(37);
        expect(reportData.pdr.length).toEqual(23);

        // affectation result
        expect(reportData["intradep à affecter"].length).toEqual(4);
        expect(reportData.Attente.length).toBeGreaterThan(1000);
        expect(reportData["Affectes en amont"].length).toEqual(179);
        expect(reportData.Affectes.length).toBeGreaterThan(400);
        expect(reportData.Attente[0]["Ligne Theorique"]).toBeDefined();
    });
});
