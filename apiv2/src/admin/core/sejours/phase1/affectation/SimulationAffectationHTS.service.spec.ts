import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";

import { YOUNG_STATUS_PHASE1 } from "snu-lib";

import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";
import {
    ChangementDepartement,
    DistributionJeunesParDepartement,
    JeuneAffectationModel,
    SimulationAffectationHTSService,
} from "./SimulationAffectationHTS.service";
import { JeuneModel } from "../../jeune/Jeune.model";
import { SejourModel } from "../sejour/Sejour.model";
import { LigneDeBusModel } from "../ligneDeBus/LigneDeBus.model";
import { CentreModel } from "../centre/Centre.model";
import { PointDeRassemblementModel } from "../pointDeRassemblement/PointDeRassemblement.model";
import { PointDeRassemblementGateway } from "../pointDeRassemblement/PointDeRassemblement.gateway";
import { AffectationService } from "./Affectation.service";

describe("SimulationAffectationHTSService", () => {
    let simulationAffectationHTSService: SimulationAffectationHTSService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SimulationAffectationHTSService,
                Logger,
                {
                    provide: AffectationService,
                    useValue: {
                        formatPourcent: jest.fn().mockReturnValue("50.00%"),
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
                                "Commentaire interne sur l'enregistrement": "DEPARTEMENT 93",
                                "Code point de rassemblement initial": "matricule1",
                                "Désignation du centre": "matricule1",
                            },
                        ]),
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
                    provide: PointDeRassemblementGateway,
                    useValue: {
                        findByMatricules: jest.fn().mockResolvedValue([
                            {
                                departement: "Paris",
                            },
                        ]),
                    },
                },
            ],
        }).compile();

        simulationAffectationHTSService = module.get<SimulationAffectationHTSService>(SimulationAffectationHTSService);
    });

    describe("getChangementsDepartements", () => {
        it("should return changementDepartement array", async () => {
            // mock: 93 vers pdr1 et center1
            const ligneDeBusList = [
                { id: "ligne1", centreId: "center1", pointDeRassemblementIds: ["pdr1"] },
                { id: "ligne2", centreId: "center2", pointDeRassemblementIds: ["pdr2"] },
                { id: "ligne3", centreId: "center3", pointDeRassemblementIds: ["pdr3"] },
            ] as LigneDeBusModel[];
            const centreList = [
                { id: "center1", matricule: "matricule1" },
                { id: "center2", matricule: "matricule2" },
                { id: "center3", matricule: "matricule3" },
            ] as CentreModel[];
            const pdrList = [
                { id: "pdr1", matricule: "matricule1", departement: "Paris" },
                { id: "pdr2", matricule: "matricule2", departement: "Seine" },
            ] as PointDeRassemblementModel[];
            const result = await simulationAffectationHTSService.getChangementsDepartements(
                "test-sdr-import-id",
                centreList,
                pdrList,
                ligneDeBusList,
            );
            expect(result).toEqual([
                {
                    origine: "Seine-Saint-Denis",
                    destination: [
                        {
                            centreId: "center1",
                            pdrId: "pdr1",
                            departement: "Paris",
                            ligneIdList: ["ligne1"],
                        },
                    ],
                },
            ]);
        });
    });

    describe("computeRatioRepartition", () => {
        it("should compute the ratio of repartition correctly", () => {
            const jeunes = [
                { genre: "male", qpv: "oui", psh: "non" },
                { genre: "female", qpv: "non", psh: "oui" },
                { genre: "male", qpv: "oui", psh: "oui" },
                { genre: "female", qpv: "non", psh: "non" },
                { genre: "female", qpv: "", psh: "" },
            ] as JeuneModel[];

            const result = simulationAffectationHTSService.computeRatioRepartition(jeunes);

            expect(result).toEqual({ male: 0.4, qvp: 0.4, psh: 0.4 });
        });

        it("should use default ratios if no young people are provided", () => {
            const result = simulationAffectationHTSService.computeRatioRepartition([]);

            expect(result).toEqual({ male: 0.5, qvp: 0.3, psh: 0.1 });
        });
    });

    describe("calculTauxRepartitionParCentre", () => {
        it("should calculate the ratio of repartition per center correctly", () => {
            const sejourList = [
                { centreId: "1", placesRestantes: 5, placesTotal: 10 },
                { centreId: "2", placesRestantes: 3, placesTotal: 10 },
                { centreId: "3", placesRestantes: 2, placesTotal: 10 },
            ] as SejourModel[];

            const jeunesList = [
                { centreId: "1", statutPhase1: "AFFECTED", genre: "male", qpv: "oui", psh: "non" },
                { centreId: "1", statutPhase1: "AFFECTED", genre: "female", qpv: "non", psh: "oui" },
                { centreId: "2", statutPhase1: "AFFECTED", genre: "male", qpv: "oui", psh: "oui" },
                { centreId: "3", statutPhase1: "AFFECTED", genre: "female", qpv: "non", psh: "non" },
            ] as JeuneModel[];

            const result = simulationAffectationHTSService.calculTauxRepartitionParCentre(sejourList, jeunesList);

            expect(result).toEqual([
                { male: 0.5, qvp: 0.5, psh: 0.5 },
                { male: 1.0, qvp: 1.0, psh: 1.0 },
                { male: 0.0, qvp: 0.0, psh: 0.0 },
            ]);
        });
    });

    describe("calculTauxRemplissageParCentre", () => {
        it("should calculate the filling rate per center correctly", () => {
            const sejourList = [
                { centreId: "1", placesRestantes: 5, placesTotal: 10 },
                { centreId: "2", placesRestantes: 3, placesTotal: 10 },
                { centreId: "3", placesRestantes: 2, placesTotal: 10 },
            ] as SejourModel[];

            const lignesList = [
                { centreId: "1", placesOccupeesJeunes: 2, capaciteJeunes: 10 },
                { centreId: "1", placesOccupeesJeunes: 3, capaciteJeunes: 10 },
                { centreId: "2", placesOccupeesJeunes: 5, capaciteJeunes: 10 },
            ] as LigneDeBusModel[];

            const result = simulationAffectationHTSService.calculTauxRemplissageParCentre(sejourList, lignesList);

            expect(result).toEqual({
                centreIdList: ["1", "2", "3"],
                tauxOccupationLignesParCentreList: [[0.2, 0.3], [0.5], []],
                tauxRemplissageCentres: [0.5, 0.7, 0.8],
            });
        });

        it("should calculate the filling rate per center correctly (0%)", () => {
            const sejourList = [{ centreId: "1", placesRestantes: 10, placesTotal: 10 }] as SejourModel[];

            const lignesList = [{ centreId: "1", placesOccupeesJeunes: 10, capaciteJeunes: 10 }] as LigneDeBusModel[];

            const result = simulationAffectationHTSService.calculTauxRemplissageParCentre(sejourList, lignesList);

            expect(result).toEqual({
                centreIdList: ["1"],
                tauxOccupationLignesParCentreList: [[1]],
                tauxRemplissageCentres: [0],
            });
        });
    });

    describe("affectationAleatoireDesJeunes", () => {
        it("should return random affected youngs, sejourList, and lignebuses", () => {
            const distributionJeunesDepartement = {
                departementList: ["dep1", "dep2"],
                jeuneIdListParDepartement: [["1", "2"], ["3"]],
                ligneIdListParDepartement: [["ligne1", "ligne2"], ["ligne3"]],
                centreIdListParLigne: [["center1", "center2"], ["center3"]],
                placesDisponiblesParLigne: [[10, 5], [7]],
            } as DistributionJeunesParDepartement;
            const jeuneList = [
                { id: "1", statutPhase1: "NOT_AFFECTED", departement: "dep1" },
                { id: "2", statutPhase1: "NOT_AFFECTED", departement: "dep1" },
                { id: "3", statutPhase1: "NOT_AFFECTED", departement: "dep1" },
                { id: "4", statutPhase1: "NOT_AFFECTED", departement: "dep2" },
                { id: "5", statutPhase1: "NOT_AFFECTED", departement: "dep2" },
            ] as JeuneModel[];
            const sejourList = [
                { centreId: "center1", placesRestantes: 10 },
                { centreId: "center2", placesRestantes: 8 },
                { centreId: "center3", placesRestantes: 5 },
            ] as SejourModel[];
            const ligneDeBusList = [
                {
                    id: "ligne1",
                    placesOccupeesJeunes: 0,
                    capaciteJeunes: 10,
                    centreId: "center1",
                    pointDeRassemblementIds: ["meeting1"],
                },
                {
                    id: "ligne2",
                    placesOccupeesJeunes: 0,
                    capaciteJeunes: 8,
                    centreId: "center2",
                    pointDeRassemblementIds: ["meeting2"],
                },
                {
                    id: "ligne3",
                    placesOccupeesJeunes: 0,
                    capaciteJeunes: 5,
                    centreId: "center3",
                    pointDeRassemblementIds: ["meeting3"],
                },
            ] as LigneDeBusModel[];

            const { randomJeuneList, randomSejourList, randomLigneDeBusList } =
                simulationAffectationHTSService.affectationAleatoireDesJeunes(
                    distributionJeunesDepartement,
                    jeuneList,
                    sejourList,
                    ligneDeBusList,
                    [],
                );

            expect(randomJeuneList.filter((young) => young.statutPhase1 === "AFFECTED").length).toBeLessThanOrEqual(7);

            expect(
                randomSejourList.find((center) => center.centreId === "center1")?.placesRestantes,
            ).toBeGreaterThanOrEqual(0);
            expect(
                randomSejourList.find((center) => center.centreId === "center2")?.placesRestantes,
            ).toBeGreaterThanOrEqual(0);
            expect(
                randomSejourList.find((center) => center.centreId === "center3")?.placesRestantes,
            ).toBeGreaterThanOrEqual(0);

            const ligne1 = randomLigneDeBusList.find((ligne) => ligne.id === "ligne1");
            expect(ligne1!.capaciteJeunes - ligne1!.placesOccupeesJeunes).toBeGreaterThanOrEqual(0);
            expect(ligne1?.placesOccupeesJeunes).toBeLessThanOrEqual(10);

            const ligne2 = randomLigneDeBusList.find((ligne) => ligne.id === "ligne2");
            expect(ligne2!.capaciteJeunes - ligne2!.placesOccupeesJeunes).toBeGreaterThanOrEqual(0);
            expect(ligne2?.placesOccupeesJeunes).toBeLessThanOrEqual(5);

            const ligne3 = randomLigneDeBusList.find((ligne) => ligne.id === "ligne3");
            expect(ligne3!.capaciteJeunes - ligne3!.placesOccupeesJeunes).toBeGreaterThanOrEqual(0);
            expect(ligne3?.placesOccupeesJeunes).toBeLessThanOrEqual(7);
        });

        it.skip("should return random affected youngs, sejourList, and lignebuses with changement departement (simple)", () => {
            // TODO: optimisé l'algo pour que ce test passe
            const distributionJeunesDepartement = {
                departementList: ["dep1", "dep2", "dep3", "dep4", "dep5"],
                jeuneIdListParDepartement: [
                    ["1", "2", "3", "4", "5"],
                    ["6", "7", "8", "9", "10", "11", "12", "13", "14", "15"],
                    ["16", "17"],
                    ["18", "19"],
                    ["20", "21"],
                ],
                // ligne1 est dans les deux département (changement de departement)
                ligneIdListParDepartement: [["ligne1"], ["ligne2"], ["ligne3"], ["ligne1"], ["ligne1"]],
                // centre1 est dans les deux département (changement de departement)
                centreIdListParLigne: [["center1"], ["center2"], ["center3"], ["center1"], ["center1"]],
                // 5 places au total pour la ligne1 mais disponible dans 2 departements
                placesDisponiblesParLigne: [[5], [5], [5], [5], [5]],
            } as DistributionJeunesParDepartement;
            const jeuneList = [
                { id: "1", statutPhase1: "NOT_AFFECTED", departement: "dep1" },
                { id: "2", statutPhase1: "NOT_AFFECTED", departement: "dep1" },
                { id: "3", statutPhase1: "NOT_AFFECTED", departement: "dep1" },
                { id: "4", statutPhase1: "NOT_AFFECTED", departement: "dep1" },
                { id: "5", statutPhase1: "NOT_AFFECTED", departement: "dep1" },
                { id: "6", statutPhase1: "NOT_AFFECTED", departement: "dep2" },
                { id: "7", statutPhase1: "NOT_AFFECTED", departement: "dep2" },
                { id: "8", statutPhase1: "NOT_AFFECTED", departement: "dep2" },
                { id: "9", statutPhase1: "NOT_AFFECTED", departement: "dep2" },
                { id: "10", statutPhase1: "NOT_AFFECTED", departement: "dep2" },
                { id: "11", statutPhase1: "NOT_AFFECTED", departement: "dep2" },
                { id: "12", statutPhase1: "NOT_AFFECTED", departement: "dep2" },
                { id: "13", statutPhase1: "NOT_AFFECTED", departement: "dep2" },
                { id: "14", statutPhase1: "NOT_AFFECTED", departement: "dep2" },
                { id: "15", statutPhase1: "NOT_AFFECTED", departement: "dep2" },
                { id: "16", statutPhase1: "NOT_AFFECTED", departement: "dep3" },
                { id: "17", statutPhase1: "NOT_AFFECTED", departement: "dep3" },
                { id: "18", statutPhase1: "NOT_AFFECTED", departement: "dep4" },
                { id: "19", statutPhase1: "NOT_AFFECTED", departement: "dep4" },
                { id: "20", statutPhase1: "NOT_AFFECTED", departement: "dep5" },
                { id: "21", statutPhase1: "NOT_AFFECTED", departement: "dep5" },
            ] as JeuneModel[];
            const sejourList = [
                // jeunes du departement 1, 4 et 5
                { centreId: "center1", placesRestantes: 5 },
                // jeunes du departement 2
                { centreId: "center2", placesRestantes: 5 },
                // jeunes du departement 3
                { centreId: "center3", placesRestantes: 5 },
                // auncun jeune
                { centreId: "center4", placesRestantes: 5 },
            ] as SejourModel[];
            const ligneDeBusList = [
                {
                    id: "ligne1",
                    placesOccupeesJeunes: 0,
                    capaciteJeunes: 20,
                    centreId: "center1",
                    pointDeRassemblementIds: ["meeting1"],
                },
                {
                    id: "ligne2",
                    placesOccupeesJeunes: 0,
                    capaciteJeunes: 3,
                    centreId: "center2",
                    pointDeRassemblementIds: ["meeting2"],
                },
                {
                    id: "ligne3",
                    placesOccupeesJeunes: 0,
                    capaciteJeunes: 6,
                    centreId: "center3",
                    pointDeRassemblementIds: ["meeting3"],
                },
                {
                    id: "ligne4",
                    placesOccupeesJeunes: 0,
                    capaciteJeunes: 3,
                    centreId: "center4",
                    pointDeRassemblementIds: ["meeting1"],
                },
            ] as LigneDeBusModel[];

            const { randomJeuneList, randomSejourList, randomLigneDeBusList } =
                simulationAffectationHTSService.affectationAleatoireDesJeunes(
                    distributionJeunesDepartement,
                    jeuneList,
                    sejourList,
                    ligneDeBusList,
                    [],
                );

            expect(randomJeuneList.filter((young) => young.statutPhase1 === "AFFECTED").length).toBeGreaterThanOrEqual(
                10,
            );
            expect(randomJeuneList.filter((young) => young.statutPhase1 !== "AFFECTED").length).toBeLessThanOrEqual(11);
            // centre 1
            expect(
                randomSejourList.find((center) => center.centreId === "center1")?.placesRestantes,
            ).toBeGreaterThanOrEqual(0); // 5 places
            expect(randomSejourList.find((center) => center.centreId === "center1")?.placesRestantes).toBeLessThan(5); // 5 places
            // centre 2
            expect(
                randomSejourList.find((center) => center.centreId === "center2")?.placesRestantes,
            ).toBeGreaterThanOrEqual(0); // 5 places
            expect(
                randomSejourList.find((center) => center.centreId === "center2")?.placesRestantes,
            ).toBeLessThanOrEqual(5); // 5 places
            // centre 3
            expect(
                randomSejourList.find((center) => center.centreId === "center3")?.placesRestantes,
            ).toBeGreaterThanOrEqual(0); // 5 places
            expect(
                randomSejourList.find((center) => center.centreId === "center3")?.placesRestantes,
            ).toBeLessThanOrEqual(5); // 5 places
            // centre 4
            expect(
                randomSejourList.find((center) => center.centreId === "center4")?.placesRestantes,
            ).toBeGreaterThanOrEqual(1); // 5 places
            expect(
                randomSejourList.find((center) => center.centreId === "center4")?.placesRestantes,
            ).toBeLessThanOrEqual(5); // 5 places

            const ligne1 = randomLigneDeBusList.find((ligne) => ligne.id === "ligne1");
            expect(ligne1!.capaciteJeunes - ligne1!.placesOccupeesJeunes).toBeGreaterThanOrEqual(0);
            expect(ligne1?.placesOccupeesJeunes).toBeLessThanOrEqual(20); // 20 places
            expect(ligne1?.placesOccupeesJeunes).toBeGreaterThan(0);

            const ligne2 = randomLigneDeBusList.find((ligne) => ligne.id === "ligne2");
            expect(ligne2!.capaciteJeunes - ligne2!.placesOccupeesJeunes).toBeGreaterThanOrEqual(0);
            expect(ligne2?.placesOccupeesJeunes).toBeLessThanOrEqual(4);
            expect(ligne2?.placesOccupeesJeunes).toBeGreaterThan(0);

            const ligne3 = randomLigneDeBusList.find((ligne) => ligne.id === "ligne3");
            expect(ligne3!.capaciteJeunes - ligne3!.placesOccupeesJeunes).toBeGreaterThanOrEqual(0);
            expect(ligne3?.placesOccupeesJeunes).toBeLessThanOrEqual(6);
            expect(ligne3?.placesOccupeesJeunes).toBeGreaterThan(0);

            const ligne4 = randomLigneDeBusList.find((ligne) => ligne.id === "ligne4");
            expect(ligne4!.capaciteJeunes - ligne4!.placesOccupeesJeunes).toBeGreaterThanOrEqual(0);
            expect(ligne4?.placesOccupeesJeunes).toBeLessThanOrEqual(6);
            expect(ligne4?.placesOccupeesJeunes).toBeGreaterThan(0);
        });
        it("should return random affected youngs, sejourList, and lignebuses with changement departement (multi-centre)", () => {
            const distributionJeunesDepartement = {
                departementList: ["dep1", "dep2", "dep3", "dep4", "dep5"],
                jeuneIdListParDepartement: [
                    ["1", "2", "3", "4", "5"],
                    ["6", "7", "8", "9", "10", "11", "12", "13", "14", "15"],
                    ["16", "17"],
                    ["18", "19"],
                    ["20", "21"],
                ],
                // ligne1 est dans les deux département (changement de departement)
                ligneIdListParDepartement: [
                    ["ligne1", "ligne2"],
                    ["ligne3", "ligne1"],
                    ["ligne1"],
                    ["ligne1"],
                    ["ligne4"],
                ],
                // centre1 est dans les deux département (changement de departement)
                centreIdListParLigne: [
                    ["center1", "center2"],
                    ["center3", "center1"],
                    ["center1"],
                    ["center1"],
                    ["center4"],
                ],
                // 5 places au total pour la ligne1 mais disponible dans 2 departements
                placesDisponiblesParLigne: [[20, 4], [6, 20], [5], [5], [3]],
            } as DistributionJeunesParDepartement;
            const jeuneList = [
                { id: "1", statutPhase1: "NOT_AFFECTED", departement: "dep1" },
                { id: "2", statutPhase1: "NOT_AFFECTED", departement: "dep1" },
                { id: "3", statutPhase1: "NOT_AFFECTED", departement: "dep1" },
                { id: "4", statutPhase1: "NOT_AFFECTED", departement: "dep1" },
                { id: "5", statutPhase1: "NOT_AFFECTED", departement: "dep1" },
                { id: "6", statutPhase1: "NOT_AFFECTED", departement: "dep2" },
                { id: "7", statutPhase1: "NOT_AFFECTED", departement: "dep2" },
                { id: "8", statutPhase1: "NOT_AFFECTED", departement: "dep2" },
                { id: "9", statutPhase1: "NOT_AFFECTED", departement: "dep2" },
                { id: "10", statutPhase1: "NOT_AFFECTED", departement: "dep2" },
                { id: "11", statutPhase1: "NOT_AFFECTED", departement: "dep2" },
                { id: "12", statutPhase1: "NOT_AFFECTED", departement: "dep2" },
                { id: "13", statutPhase1: "NOT_AFFECTED", departement: "dep2" },
                { id: "14", statutPhase1: "NOT_AFFECTED", departement: "dep2" },
                { id: "15", statutPhase1: "NOT_AFFECTED", departement: "dep2" },
                { id: "16", statutPhase1: "NOT_AFFECTED", departement: "dep3" },
                { id: "17", statutPhase1: "NOT_AFFECTED", departement: "dep3" },
                { id: "18", statutPhase1: "NOT_AFFECTED", departement: "dep4" },
                { id: "19", statutPhase1: "NOT_AFFECTED", departement: "dep4" },
                { id: "20", statutPhase1: "NOT_AFFECTED", departement: "dep5" },
                { id: "21", statutPhase1: "NOT_AFFECTED", departement: "dep5" },
            ] as JeuneModel[];
            const sejourList = [
                // jeunes du departement 1,2,3 ou 4
                { centreId: "center1", placesRestantes: 10 },
                // jeunes du departement 1 (si pas déjà affectés)
                { centreId: "center2", placesRestantes: 8 },
                // jeunes du departement 2 (si pas déjà affectés)
                { centreId: "center3", placesRestantes: 5 },
                // jeune du departement 5
                { centreId: "center4", placesRestantes: 3 },
            ] as SejourModel[];
            const ligneDeBusList = [
                {
                    id: "ligne1",
                    placesOccupeesJeunes: 0,
                    // plus de place dans le bus que dans le centre
                    capaciteJeunes: 20,
                    centreId: "center1",
                    pointDeRassemblementIds: ["meeting1"],
                },
                {
                    id: "ligne2",
                    placesOccupeesJeunes: 0,
                    capaciteJeunes: 4,
                    centreId: "center2",
                    pointDeRassemblementIds: ["meeting2"],
                },
                {
                    id: "ligne3",
                    placesOccupeesJeunes: 0,
                    capaciteJeunes: 6,
                    centreId: "center3",
                    pointDeRassemblementIds: ["meeting3"],
                },
                {
                    id: "ligne4",
                    placesOccupeesJeunes: 0,
                    capaciteJeunes: 3,
                    centreId: "center4",
                    pointDeRassemblementIds: ["meeting1"],
                },
            ] as LigneDeBusModel[];

            const { randomJeuneList, randomSejourList, randomLigneDeBusList } =
                simulationAffectationHTSService.affectationAleatoireDesJeunes(
                    distributionJeunesDepartement,
                    jeuneList,
                    sejourList,
                    ligneDeBusList,
                    [],
                );

            expect(randomJeuneList.filter((young) => young.statutPhase1 === "AFFECTED").length).toBeGreaterThanOrEqual(
                10,
            );
            expect(randomJeuneList.filter((young) => young.statutPhase1 !== "AFFECTED").length).toBeLessThanOrEqual(11);
            // centre 1
            expect(
                randomSejourList.find((center) => center.centreId === "center1")?.placesRestantes,
            ).toBeGreaterThanOrEqual(0); // 10 places
            expect(randomSejourList.find((center) => center.centreId === "center1")?.placesRestantes).toBeLessThan(10); // 10 places
            // centre 2
            expect(
                randomSejourList.find((center) => center.centreId === "center2")?.placesRestantes,
            ).toBeGreaterThanOrEqual(4); // 8 places
            expect(
                randomSejourList.find((center) => center.centreId === "center2")?.placesRestantes,
            ).toBeLessThanOrEqual(8); // 8 places
            // centre 3
            expect(
                randomSejourList.find((center) => center.centreId === "center3")?.placesRestantes,
            ).toBeGreaterThanOrEqual(0); // 5 places
            expect(
                randomSejourList.find((center) => center.centreId === "center3")?.placesRestantes,
            ).toBeLessThanOrEqual(5); // 5 places
            // centre 4
            expect(
                randomSejourList.find((center) => center.centreId === "center4")?.placesRestantes,
            ).toBeGreaterThanOrEqual(1); // 3 places
            expect(randomSejourList.find((center) => center.centreId === "center4")?.placesRestantes).toBeLessThan(3); // 3 places

            const ligne1 = randomLigneDeBusList.find((ligne) => ligne.id === "ligne1");
            expect(ligne1!.capaciteJeunes - ligne1!.placesOccupeesJeunes).toBeGreaterThanOrEqual(0);
            expect(ligne1?.placesOccupeesJeunes).toBeLessThanOrEqual(20); // 20 places
            expect(ligne1?.placesOccupeesJeunes).toBeGreaterThan(0);

            const ligne2 = randomLigneDeBusList.find((ligne) => ligne.id === "ligne2");
            expect(ligne2!.capaciteJeunes - ligne2!.placesOccupeesJeunes).toBeGreaterThanOrEqual(0);
            expect(ligne2?.placesOccupeesJeunes).toBeLessThanOrEqual(3);
            expect(ligne2?.placesOccupeesJeunes).toBeGreaterThanOrEqual(0);

            const ligne3 = randomLigneDeBusList.find((ligne) => ligne.id === "ligne3");
            expect(ligne3!.capaciteJeunes - ligne3!.placesOccupeesJeunes).toBeGreaterThanOrEqual(0);
            expect(ligne3?.placesOccupeesJeunes).toBeLessThanOrEqual(6);
            expect(ligne3?.placesOccupeesJeunes).toBeGreaterThanOrEqual(0);

            const ligne4 = randomLigneDeBusList.find((ligne) => ligne.id === "ligne4");
            expect(ligne4!.capaciteJeunes - ligne4!.placesOccupeesJeunes).toBeGreaterThanOrEqual(0);
            expect(ligne4?.placesOccupeesJeunes).toBeLessThanOrEqual(6);
            expect(ligne4?.placesOccupeesJeunes).toBeGreaterThan(0);
        });
    });

    describe("affecterPdrJeune", () => {
        it("should return undefined if no point de rassemblement ids", () => {
            const jeune = {
                pointDeRassemblementIds: [],
            } as any;
            const pdrList: PointDeRassemblementModel[] = [];

            expect(simulationAffectationHTSService.affecterPdrJeune(jeune, pdrList)).toBeUndefined();
        });

        it("should return undefined if handicap is in the same department", () => {
            const jeune = {
                pointDeRassemblementIds: ["1"],
                handicapMemeDepartement: "true",
            } as JeuneAffectationModel;
            const pdrList: PointDeRassemblementModel[] = [];

            expect(simulationAffectationHTSService.affecterPdrJeune(jeune, pdrList)).toBeUndefined();
        });

        it("should return undefined if deplacementPhase1Autonomous is true", () => {
            const jeune = {
                pointDeRassemblementIds: ["1"],
                deplacementPhase1Autonomous: "true",
            } as JeuneAffectationModel;
            const pdrList: PointDeRassemblementModel[] = [];

            expect(simulationAffectationHTSService.affecterPdrJeune(jeune, pdrList)).toBeUndefined();
        });

        it("should return undefined if transportInfoGivenByLocal is true", () => {
            const jeune = {
                pointDeRassemblementIds: ["1"],
                transportInfoGivenByLocal: "true",
            } as JeuneAffectationModel;
            const pdrList: PointDeRassemblementModel[] = [];

            expect(simulationAffectationHTSService.affecterPdrJeune(jeune, pdrList)).toBeUndefined();
        });

        it("should return the closest PDR id", () => {
            const jeune = {
                pointDeRassemblementIds: ["1", "2"],
                localisation: { lat: 1, lon: 1 },
            } as JeuneAffectationModel;
            const pdrList = [
                { id: "1", localisation: { lat: 2, lon: 2 } },
                { id: "2", localisation: { lat: 3, lon: 3 } },
            ] as PointDeRassemblementModel[];

            expect(simulationAffectationHTSService.affecterPdrJeune(jeune, pdrList)).toBe("1");
        });

        it("should return a random PDR id if no location data", () => {
            const jeune = {
                pointDeRassemblementIds: ["1", "2"],
                localisation: undefined,
            } as JeuneAffectationModel;
            const pdrList = [
                { id: "1", localisation: { lat: 2, lon: 2 } },
                { id: "2", localisation: { lat: 3, lon: 3 } },
            ] as PointDeRassemblementModel[];

            const mockMath = Object.create(global.Math);
            mockMath.random = () => 0.5;
            global.Math = mockMath;

            expect(simulationAffectationHTSService.affecterPdrJeune(jeune, pdrList)).toBe("2");
        });
    });

    describe("randomizeArray", () => {
        it("should return an array of the same length", () => {
            const input = [1, 2, 3, 4, 5];
            const result = simulationAffectationHTSService.randomizeArray(input);
            expect(result.length).toEqual(input.length);
        });

        it("should return an array with the same elements", () => {
            const input = [1, 2, 3, 4, 5];
            const result = simulationAffectationHTSService.randomizeArray(input);
            expect(result.sort()).toEqual(input.sort());
        });

        it("should return a different array", () => {
            const input = [1, 2, 3, 4, 5];
            const result = simulationAffectationHTSService.randomizeArray(input);
            expect(result).not.toEqual(input);
        });

        it("should return a different array index", () => {
            const input = ["a", "b", "c", "d", "e"];
            const result = simulationAffectationHTSService.randomizeArray(input, true);
            expect(result).not.toEqual([0, 1, 2, 3, 4]);
            expect(result.sort()).toEqual([0, 1, 2, 3, 4]);
            expect(result.sort()).not.toEqual(input.sort());
        });
    });

    describe("getPositionJeuneAleatoireParDepartement", () => {
        it("should return an array of shuffled indexes for each department", () => {
            const jeuneIdList = [
                ["1", "2", "3", "4", "5"],
                ["6", "7", "8", "9", "10"],
                ["11", "12", "13", "14", "15"],
            ];
            const result = simulationAffectationHTSService.getPositionJeuneAleatoireParDepartement(jeuneIdList);

            // expect the result to be an array
            expect(Array.isArray(result)).toBe(true);

            // expect the result to have the same length as the input
            expect(result.length).toEqual(jeuneIdList.length);

            // check that each sub-array in the result has the same length as the corresponding sub-array in the input
            result.forEach((subArray, index) => {
                expect(subArray.length).toEqual(jeuneIdList[index].length);
            });

            // check that each sub-array in the result contains the same elements as the corresponding sub-array in the input, but in a different order
            result.forEach((subArray) => {
                const indexArray = Array.from({ length: subArray.length }, (_, i) => i);
                expect(subArray).not.toEqual(indexArray);
                expect(subArray.sort()).toEqual(indexArray);
            });
        });
    });

    describe("calculDistributionAffectations", () => {
        it("should calculate affectations correctly", () => {
            const jeunesList = [
                { id: "1", departement: "75" },
                { id: "2", departement: "92" },
            ] as JeuneModel[];

            const pdrList = [
                { id: "pdr1", departement: "75" },
                { id: "pdr2", departement: "92" },
            ] as PointDeRassemblementModel[];

            const ligneDeBusList = [
                {
                    id: "ligne1",
                    pointDeRassemblementIds: ["pdr1"],
                    capaciteJeunes: 50,
                    placesOccupeesJeunes: 10,
                    centreId: "center1",
                },
                {
                    id: "ligne2",
                    pointDeRassemblementIds: ["pdr2"],
                    capaciteJeunes: 60,
                    placesOccupeesJeunes: 20,
                    centreId: "center2",
                },
            ] as LigneDeBusModel[];

            const result = simulationAffectationHTSService.calculDistributionAffectations(
                jeunesList,
                pdrList,
                ligneDeBusList,
                [],
            );

            expect(result).toEqual({
                departementList: ["75", "92"],
                centreIdListParLigne: [["center1"], ["center2"]],
                ligneIdListParDepartement: [["ligne1"], ["ligne2"]],
                placesDisponiblesParLigne: [[40], [40]],
                jeuneIdListParDepartement: [["1"], ["2"]],
            } as DistributionJeunesParDepartement);
        });

        it("should calculate affectations correctly with new department from sdr", () => {
            const jeunesList = [
                { id: "1", departement: "Paris" },
                { id: "2", departement: "Paris" },
                { id: "3", departement: "Paris" },
                { id: "4", departement: "Seine-Saint-Denis" },
                { id: "5", departement: "Seine-Saint-Denis" },
            ] as JeuneModel[];

            const pdrList = [
                { id: "pdr1", departement: "Paris" },
                { id: "pdr2", departement: "Paris" },
                { id: "pdr3", departement: "Seine-Saint-Denis" },
            ] as PointDeRassemblementModel[];

            const ligneDeBusList = [
                {
                    id: "ligne1",
                    pointDeRassemblementIds: ["pdr1"],
                    capaciteJeunes: 50,
                    placesOccupeesJeunes: 10,
                    centreId: "center1",
                },
                {
                    id: "ligne2",
                    pointDeRassemblementIds: ["pdr1"],
                    capaciteJeunes: 50,
                    placesOccupeesJeunes: 10,
                    centreId: "center1",
                },
                {
                    id: "ligne3",
                    pointDeRassemblementIds: ["pdr1"],
                    capaciteJeunes: 50,
                    placesOccupeesJeunes: 10,
                    centreId: "center1",
                },
                {
                    id: "ligne4",
                    pointDeRassemblementIds: ["pdr2"],
                    capaciteJeunes: 50,
                    placesOccupeesJeunes: 10,
                    centreId: "center1",
                },
                {
                    id: "ligne5",
                    pointDeRassemblementIds: ["pdr3"],
                    capaciteJeunes: 60,
                    placesOccupeesJeunes: 20,
                    centreId: "center2",
                },
            ] as LigneDeBusModel[];

            // sans changement de département
            expect(
                simulationAffectationHTSService.calculDistributionAffectations(jeunesList, pdrList, ligneDeBusList, []),
            ).toEqual({
                departementList: ["Paris", "Seine-Saint-Denis"],
                centreIdListParLigne: [["center1", "center1", "center1", "center1"], ["center2"]],
                ligneIdListParDepartement: [["ligne1", "ligne2", "ligne3", "ligne4"], ["ligne5"]],
                placesDisponiblesParLigne: [[40, 40, 40, 40], [40]],
                jeuneIdListParDepartement: [
                    ["1", "2", "3"],
                    ["4", "5"],
                ],
            } as DistributionJeunesParDepartement);

            let changementsDepartement = [
                {
                    origine: "Seine-Saint-Denis",
                    destination: [
                        {
                            pdrId: "pdr1",
                            departement: "Paris",
                            centreId: "center1",
                            ligneIdList: ["ligne1"],
                        },
                    ],
                },
            ] as ChangementDepartement[];

            // avec changement de département (ligne1 dédiée au 93)
            expect(
                simulationAffectationHTSService.calculDistributionAffectations(
                    jeunesList,
                    pdrList,
                    ligneDeBusList,
                    changementsDepartement,
                ),
            ).toEqual({
                departementList: ["Paris", "Seine-Saint-Denis"],
                centreIdListParLigne: [
                    ["center1", "center1", "center1"],
                    ["center1", "center2"],
                ],
                ligneIdListParDepartement: [
                    ["ligne2", "ligne3", "ligne4"],
                    ["ligne1", "ligne5"],
                ],
                placesDisponiblesParLigne: [
                    [40, 40, 40],
                    [40, 40],
                ],
                jeuneIdListParDepartement: [
                    ["1", "2", "3"],
                    ["4", "5"],
                ],
            } as DistributionJeunesParDepartement);

            // avec changement de département (sans ligne dédiée)
            changementsDepartement = [
                {
                    origine: "Seine-Saint-Denis",
                    destination: [
                        {
                            pdrId: "pdr1",
                            departement: "Paris",
                            centreId: "center1",
                            ligneIdList: ["ligne1"],
                        },
                    ],
                },
                {
                    origine: "Paris",
                    destination: [
                        {
                            pdrId: "pdr1",
                            departement: "Paris",
                            centreId: "center1",
                            ligneIdList: ["ligne1"],
                        },
                    ],
                },
            ] as ChangementDepartement[];
            expect(
                simulationAffectationHTSService.calculDistributionAffectations(
                    jeunesList,
                    pdrList,
                    ligneDeBusList,
                    changementsDepartement,
                ),
            ).toEqual({
                departementList: ["Paris", "Seine-Saint-Denis"],
                centreIdListParLigne: [
                    ["center1", "center1", "center1", "center1"],
                    ["center1", "center2"],
                ],
                ligneIdListParDepartement: [
                    ["ligne1", "ligne2", "ligne3", "ligne4"],
                    ["ligne1", "ligne5"],
                ],
                placesDisponiblesParLigne: [
                    [40, 40, 40, 40],
                    [40, 40],
                ],
                jeuneIdListParDepartement: [
                    ["1", "2", "3"],
                    ["4", "5"],
                ],
            } as DistributionJeunesParDepartement);
        });
    });

    describe("getNombreSurLigneApresAffectation", () => {
        it("should return the same array if the sum of placesLignes equals nbPlacesAAffecter", () => {
            const placesLignes = [10, 20, 30];
            const nbPlacesAAffecter = 60;

            expect(
                simulationAffectationHTSService.getNombreSurLigneApresAffectation(placesLignes, nbPlacesAAffecter),
            ).toEqual(placesLignes);
        });

        it("should return the same array if the sum of placesLignes is less than nbPlacesAAffecter", () => {
            const placesLignes = [10, 20, 30];
            const nbPlacesAAffecter = 70;
            const result = simulationAffectationHTSService.getNombreSurLigneApresAffectation(
                placesLignes,
                nbPlacesAAffecter,
            );
            expect(result).toEqual(placesLignes);
        });

        it("should return an array with the correct sum if the sum of placesLignes is greater than nbPlacesAAffecter", () => {
            const placesLignes = [10, 20, 30];
            const nbPlacesAAffecter = 50;
            const result = simulationAffectationHTSService.getNombreSurLigneApresAffectation(
                placesLignes,
                nbPlacesAAffecter,
            );
            expect(result[0]).toBeGreaterThanOrEqual(0);
            expect(result[1]).toBeGreaterThanOrEqual(0);
            expect(result[2]).toBeGreaterThanOrEqual(0);
            expect(result.reduce((a, b) => a + b, 0)).toEqual(nbPlacesAAffecter);
        });

        it("should return an array with positive placesLignes when a ligne doesn't have enough place", () => {
            const placesLignes = [3, 17];
            const nbPlacesAAffecter = 4;
            const result = simulationAffectationHTSService.getNombreSurLigneApresAffectation(
                placesLignes,
                nbPlacesAAffecter,
            );
            expect(result[0]).toBeGreaterThanOrEqual(0);
            expect(result[1]).toBeGreaterThanOrEqual(0);
            const somme = result.reduce((a, b) => a + b, 0);
            expect(somme).toEqual(4);
        });
    });

    describe("verificationCentres", () => {
        it("should return an array with modified values based on placesLeft and placesLigne", () => {
            const nbPlacesDisponibleSurLignesApresAffectation = [20, 30, 40];
            const placesLignes = [12, 18, 25];
            const ligneDep = ["ligne1", "ligne2", "ligne3"];
            const ligneDeBusList = [
                { id: "ligne1", centreId: "centerId1" },
                { id: "ligne2", centreId: "centerId2" },
                { id: "ligne3", centreId: "centerId3" },
                { id: "ligne4", centreId: "centerId4" },
                { id: "ligne5", centreId: "centerId5" },
                { id: "ligne6", centreId: "centerId6" },
            ] as LigneDeBusModel[];
            const sejourList = [
                { centreId: "centerId1", placesRestantes: 20 },
                { centreId: "centerId2", placesRestantes: 25 },
                { centreId: "centerId3", placesRestantes: 30 },
            ] as SejourModel[];

            const result = simulationAffectationHTSService.verificationCentres(
                nbPlacesDisponibleSurLignesApresAffectation,
                placesLignes,
                ligneDep,
                ligneDeBusList,
                sejourList,
            );

            expect(result).toHaveLength(3);
            expect(result[0]).toBeGreaterThan(0);
            expect(result[0]).toBeLessThanOrEqual(placesLignes[0]);
            expect(result[1]).toBeGreaterThan(0);
            expect(result[1]).toBeLessThanOrEqual(placesLignes[1]);
            expect(result[2]).toBeGreaterThan(0);
            expect(result[2]).toBeLessThanOrEqual(placesLignes[2]);
        });

        it("should return an array with modified values based on placesLeft and placesLigne", () => {
            const nbPlacesDisponibleSurLignesApresAffectation = [2, 3, 4];
            const placesLignes = [12, 18, 25];
            const ligneDep = ["id1", "id2", "id3"];
            const ligneDeBusList = [
                { id: "id1", centreId: "centerId1" },
                { id: "id2", centreId: "centerId2" },
                { id: "id3", centreId: "centerId3" },
                { id: "id4", centreId: "centerId3" },
            ] as LigneDeBusModel[];
            const sejourList = [
                { centreId: "centerId1", placesRestantes: 2 },
                { centreId: "centerId2", placesRestantes: 2 },
                { centreId: "centerId3", placesRestantes: 3 },
            ] as SejourModel[];

            const result = simulationAffectationHTSService.verificationCentres(
                nbPlacesDisponibleSurLignesApresAffectation,
                placesLignes,
                ligneDep,
                ligneDeBusList,
                sejourList,
            );

            expect(result).toHaveLength(3);
            expect(result[0]).toBeGreaterThan(0);
            expect(result[0]).toBeLessThanOrEqual(placesLignes[0]);
            expect(result[1]).toBeGreaterThan(0);
            expect(result[1]).toBeLessThanOrEqual(placesLignes[1]);
            expect(result[2]).toBeGreaterThan(0);
            expect(result[2]).toBeLessThanOrEqual(placesLignes[2]);
        });
    });

    describe("calculCoutSimulation", () => {
        it("should return a number", () => {
            const result = simulationAffectationHTSService.calculCoutSimulation([], [], { male: 0, qvp: 0, psh: 0 });
            expect(result).toBe(NaN);
        });

        it("should return 0 with specific input values", () => {
            const result = simulationAffectationHTSService.calculCoutSimulation(
                [{ male: 0.5, qvp: 0.5, psh: 0 }],
                [0.8, 0.8],
                {
                    male: 0.7,
                    qvp: 0.7,
                    psh: 0,
                },
            );
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThan(1);
        });
    });

    describe("isPlacesRestantesCoherentes", () => {
        it("should return false if there are lines with negative remaining seats", () => {
            const ligneDeBusList = [
                { capaciteJeunes: 50, placesOccupeesJeunes: 51 },
                { capaciteJeunes: 30, placesOccupeesJeunes: 30 },
            ] as LigneDeBusModel[];
            const sejourList = [];

            expect(simulationAffectationHTSService.isPlacesRestantesCoherentes(ligneDeBusList, sejourList)).toBe(false);
        });

        it("should return false if there are centers with negative remaining places", () => {
            const ligneDeBusList = [];
            const sejourList = [
                { placesRestantes: 100 },
                { placesRestantes: -50 },
                { placesRestantes: 150 },
            ] as SejourModel[];

            expect(simulationAffectationHTSService.isPlacesRestantesCoherentes(ligneDeBusList, sejourList)).toBe(false);
        });

        it("should return true if there are no lines or centers with negative remaining seats/places", () => {
            const ligneDeBusList = [
                { capaciteJeunes: 50, placesOccupeesJeunes: 49 },
                { capaciteJeunes: 30, placesOccupeesJeunes: 29 },
            ] as LigneDeBusModel[];
            const sejourList = [
                { placesRestantes: 100 },
                { placesRestantes: 50 },
                { placesRestantes: 150 },
            ] as SejourModel[];

            expect(simulationAffectationHTSService.isPlacesRestantesCoherentes(ligneDeBusList, sejourList)).toBe(true);
        });
    });

    describe("SimulationAffectationHTSService", () => {
        it("should compute rapport correctly", () => {
            const jeunesList = [
                {
                    id: "1",
                    statutPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
                    department: "dep1",
                    region: "reg1",
                    cohesionCenterId: "center1",
                },
                {
                    id: "2",
                    statutPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
                    department: "dep1",
                    region: "reg1",
                    cohesionCenterId: "center1",
                },
                {
                    id: "3",
                    statutPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
                    department: "dep2",
                    region: "reg1",
                    cohesionCenterId: "center2",
                },
                {
                    id: "4",
                    statutPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
                    departement: "dep2",
                    region: "reg2",
                    centreId: "center3",
                },
                {
                    id: "5",
                    statutPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
                    departement: "dep2",
                    region: "reg2",
                    centreId: "center3",
                },
            ] as JeuneAffectationModel[];
            const centreList = [{ id: "center1" }, { id: "center2" }, { id: "center3" }] as CentreModel[];
            const sejourList = [
                { centreId: "center1", placesRestantes: 10 },
                { centreId: "center2", placesRestantes: 8 },
                { centreId: "center3", placesRestantes: 5 },
            ] as SejourModel[];
            const ligneDeBusList = [
                { id: "ligne1", placesOccupeesJeunes: 0, centreId: "center1", pointDeRassemblementIds: ["pdr1"] },
                { id: "ligne2", placesOccupeesJeunes: 0, centreId: "center2", pointDeRassemblementIds: ["pdr2"] },
                { id: "ligne3", placesOccupeesJeunes: 0, centreId: "center3", pointDeRassemblementIds: ["pdr3"] },
            ] as LigneDeBusModel[];
            const pdrList = [
                {
                    id: "pdr1",
                    region: "reg1",
                    departement: "dep1",
                },
                {
                    id: "pdr2",
                    region: "reg2",
                    department: "dep2",
                },
                {
                    id: "pdr3",
                    region: "reg2",
                    department: "dep3",
                },
            ] as PointDeRassemblementModel[];
            // const indexes = {
            //     meeting_points_index: { ligne1: ["meeting1"], ligne2: ["meeting2"], ligne3: ["meeting3"] },
            // };

            const jeunesAvantAffectationList = jeunesList.slice(1);
            const jeuneIntraDepartementList = jeunesList.slice(0, 1);

            const result = simulationAffectationHTSService.calculRapportAffectation(
                jeunesList,
                sejourList,
                ligneDeBusList,
                centreList,
                pdrList,
                jeunesAvantAffectationList,
                jeuneIntraDepartementList,
                [],
                {
                    selectedCost: 1e3,
                    tauxRepartitionCentreList: [],
                    centreIdList: [],
                    tauxRemplissageCentreList: [],
                    tauxOccupationLignesParCentreList: [],
                    iterationCostList: [],
                    jeuneAttenteAffectation: 0,
                    jeunesDejaAffected: 0,
                    jeunesNouvellementAffected: 0,
                },
            );

            // assertions
            expect(result.jeunesNouvellementAffectedList).toBeInstanceOf(Array);
            expect(result.jeunesDejaAffectedList).toBeInstanceOf(Array);
            expect(result.jeuneAttenteAffectationList).toBeInstanceOf(Array);
            expect(result.sejourList).toBeInstanceOf(Array);
            expect(result.ligneDeBusList).toBeInstanceOf(Array);
            expect(result.pdrList).toBeInstanceOf(Array);
            expect(result.centreList).toBeInstanceOf(Array);
            expect(result.jeuneIntraDepartementList).toBeInstanceOf(Array);
        });
    });
});
