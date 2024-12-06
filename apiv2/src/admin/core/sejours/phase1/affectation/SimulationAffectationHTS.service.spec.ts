import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";

import { YOUNG_STATUS_PHASE1 } from "snu-lib";

import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";
import {
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

describe("SimulationAffectationHTSService", () => {
    let simulationAffectationHTSService: SimulationAffectationHTSService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SimulationAffectationHTSService,
                Logger,
                {
                    provide: FileGateway,
                    useValue: {
                        generateExcel: jest.fn(),
                        uploadFile: jest.fn(),
                        downloadFile: jest.fn().mockResolvedValue({ Body: null }),
                        parseXLS: jest.fn().mockResolvedValue([
                            {
                                "Commentaire interne sur l'enregistrement": "DEPARTEMENT 93",
                                "Code point de rassemblement initial": "Matricule",
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
            const result = await simulationAffectationHTSService.getChangementsDepartements("test-sdr-import-id");
            expect(result).toEqual([{ origine: "Seine-Saint-Denis", destination: "Paris" }]);
        });
    });

    describe("getJeuneAffectationDepartement", () => {
        it("should return the destination department if the jeune.departement is in the changementDepartements array", () => {
            const jeune = {
                departement: "origine",
            } as JeuneModel;
            const changementDepartements = [{ origine: "origine", destination: "destination" }];

            const result = simulationAffectationHTSService.getJeuneAffectationDepartement(
                jeune,
                changementDepartements,
            );

            expect(result).toEqual("destination");
        });

        it("should return the jeune.departement if the jeune.departement is not in the changementDepartements array", () => {
            const jeune = {
                departement: "origine",
            } as JeuneModel;
            const changementDepartements = [{ origine: "autre", destination: "destination" }];

            const result = simulationAffectationHTSService.getJeuneAffectationDepartement(
                jeune,
                changementDepartements,
            );

            expect(result).toEqual("origine");
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
                { centreId: "1", statusPhase1: "AFFECTED", genre: "male", qpv: "oui", psh: "non" },
                { centreId: "1", statusPhase1: "AFFECTED", genre: "female", qpv: "non", psh: "oui" },
                { centreId: "2", statusPhase1: "AFFECTED", genre: "male", qpv: "oui", psh: "oui" },
                { centreId: "3", statusPhase1: "AFFECTED", genre: "female", qpv: "non", psh: "non" },
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
                { id: "1", statusPhase1: "NOT_AFFECTED", departement: "dep1" },
                { id: "2", statusPhase1: "NOT_AFFECTED", departement: "dep1" },
                { id: "3", statusPhase1: "NOT_AFFECTED", departement: "dep1" },
                { id: "4", statusPhase1: "NOT_AFFECTED", departement: "dep2" },
                { id: "5", statusPhase1: "NOT_AFFECTED", departement: "dep2" },
            ] as JeuneModel[];
            const sejourList = [
                { centreId: "center1", placesRestantes: 10 },
                { centreId: "center2", placesRestantes: 8 },
                { centreId: "center3", placesRestantes: 5 },
            ] as SejourModel[];
            const ligneDeBusList = [
                { id: "ligne1", placesOccupeesJeunes: 0, centreId: "center1", pointDeRassemblementIds: ["meeting1"] },
                { id: "ligne2", placesOccupeesJeunes: 0, centreId: "center2", pointDeRassemblementIds: ["meeting2"] },
                { id: "ligne3", placesOccupeesJeunes: 0, centreId: "center3", pointDeRassemblementIds: ["meeting3"] },
            ] as LigneDeBusModel[];

            const { randomJeuneList, randomSejourList, randomLigneDeBusList } =
                simulationAffectationHTSService.affectationAleatoireDesJeunes(
                    distributionJeunesDepartement,
                    jeuneList,
                    sejourList,
                    ligneDeBusList,
                    [],
                );

            expect(randomJeuneList.filter((young) => young.statusPhase1 === "AFFECTED").length).toBeLessThanOrEqual(7);
            expect(
                randomSejourList.find((center) => center.centreId === "center1")?.placesRestantes,
            ).toBeGreaterThanOrEqual(0);
            expect(
                randomSejourList.find((center) => center.centreId === "center2")?.placesRestantes,
            ).toBeGreaterThanOrEqual(0);
            expect(
                randomSejourList.find((center) => center.centreId === "center3")?.placesRestantes,
            ).toBeGreaterThanOrEqual(0);
            expect(
                randomLigneDeBusList.find((ligne) => ligne.id === "ligne1")?.placesOccupeesJeunes,
            ).toBeLessThanOrEqual(10);
            expect(
                randomLigneDeBusList.find((ligne) => ligne.id === "ligne2")?.placesOccupeesJeunes,
            ).toBeLessThanOrEqual(5);
            expect(
                randomLigneDeBusList.find((ligne) => ligne.id === "ligne3")?.placesOccupeesJeunes,
            ).toBeLessThanOrEqual(7);
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
                handicapMemeDepartment: "true",
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
            );

            expect(result).toEqual({
                departementList: ["75", "92"],
                centreIdListParLigne: [["center1"], ["center2"]],
                ligneIdListParDepartement: [["ligne1"], ["ligne2"]],
                placesDisponiblesParLigne: [[40], [40]],
                jeuneIdListParDepartement: [["1"], ["2"]],
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
            const ligneDep = ["id1", "id2", "id3"];
            const ligneDeBusList = [
                { id: "id1", centreId: "centerId1" },
                { id: "id2", centreId: "centerId2" },
                { id: "id3", centreId: "centerId3" },
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
                    statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
                    department: "dep1",
                    region: "reg1",
                    cohesionCenterId: "center1",
                },
                {
                    id: "2",
                    statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
                    department: "dep1",
                    region: "reg1",
                    cohesionCenterId: "center1",
                },
                {
                    id: "3",
                    statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
                    department: "dep2",
                    region: "reg1",
                    cohesionCenterId: "center2",
                },
                {
                    id: "4",
                    statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
                    departement: "dep2",
                    region: "reg2",
                    centreId: "center3",
                },
                {
                    id: "5",
                    statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
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

    it("should correctly format the percentage", () => {
        expect(simulationAffectationHTSService.formatPourcent(0.5)).toBe("50.00%");
        expect(simulationAffectationHTSService.formatPourcent(0.1234)).toBe("12.34%");
        expect(simulationAffectationHTSService.formatPourcent(0)).toBe("0.00%");
        expect(simulationAffectationHTSService.formatPourcent(1)).toBe("100.00%");
        expect(simulationAffectationHTSService.formatPourcent(null as any)).toBe("");
        expect(simulationAffectationHTSService.formatPourcent(undefined as any)).toBe("");
        expect(simulationAffectationHTSService.formatPourcent(NaN)).toBe("");
    });
});
