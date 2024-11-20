import { Test, TestingModule } from "@nestjs/testing";

import { YOUNG_STATUS_PHASE1 } from "snu-lib";

import { JeuneAffectationModel, SimulationAffectationHTSService } from "./SimulationAffectationHTS.service";
import { JeuneModel } from "../../jeune/Jeune.model";
import { SejourModel } from "../sejour/Sejour.model";
import { LigneDeBusModel } from "../ligneDeBus/LigneDeBus.model";
import { CentreModel } from "../centre/Centre.model";
import { PointDeRassemblementModel } from "../pointDeRassemblement/PointDeRassemblement.model";

describe("SimulationAffectationHTSService", () => {
    let simulationAffectationHTSService: SimulationAffectationHTSService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SimulationAffectationHTSService],
        }).compile();

        simulationAffectationHTSService = module.get<SimulationAffectationHTSService>(SimulationAffectationHTSService);
    });

    describe("computeRatioRepartition", () => {
        it("should compute the ratio of repartition correctly", () => {
            const jeunes = [
                { genre: "male", qpv: "oui", handicap: "non" },
                { genre: "female", qpv: "non", handicap: "oui" },
                { genre: "male", qpv: "oui", handicap: "oui" },
                { genre: "female", qpv: "non", handicap: "non" },
                { genre: "female", qpv: "", handicap: "" },
            ] as JeuneModel[];

            const result = simulationAffectationHTSService.computeRatioRepartition(jeunes);

            expect(result).toEqual([0.4, 0.4, 0.4]);
        });

        it("should use default ratios if no young people are provided", () => {
            const result = simulationAffectationHTSService.computeRatioRepartition([]);

            expect(result).toEqual([0.5, 0.3, 0.1]);
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
                { centreId: "1", statusPhase1: "AFFECTED", genre: "male", qpv: "oui", handicap: "non" },
                { centreId: "1", statusPhase1: "AFFECTED", genre: "female", qpv: "non", handicap: "oui" },
                { centreId: "2", statusPhase1: "AFFECTED", genre: "male", qpv: "oui", handicap: "oui" },
                { centreId: "3", statusPhase1: "AFFECTED", genre: "female", qpv: "non", handicap: "non" },
            ] as JeuneModel[];

            const result = simulationAffectationHTSService.calculTauxRepartitionParCentre(sejourList, jeunesList);

            expect(result).toEqual([
                [0.5, 0.5, 0.5],
                [1.0, 1.0, 1.0],
                [0.0, 0.0, 0.0],
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
    });

    describe("randomAffectation", () => {
        it("should return random affected youngs, sejourList, and lignebuses", () => {
            const distributionJeunes = {
                idJeunes: [["1", "2"], ["3"]],
                Department: ["dep1", "dep2"],
                Lignes: [["ligne1", "ligne2"], ["ligne3"]],
                idCentres: [["center1", "center2"], ["center3"]],
                PlacesParLignes: [[10, 5], [7]],
            };
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
                { id: "ligne1", placesOccupeesJeunes: 0, centreId: "center1" },
                { id: "ligne2", placesOccupeesJeunes: 0, centreId: "center2" },
                { id: "ligne3", placesOccupeesJeunes: 0, centreId: "center3" },
            ] as LigneDeBusModel[];
            const indexes = {
                meeting_points_index: { ligne1: ["meeting1"], ligne2: ["meeting2"], ligne3: ["meeting3"] },
            };

            const { randomJeuneList, randomSejourList, randomLigneDeBusList } =
                simulationAffectationHTSService.randomAffectation(
                    distributionJeunes,
                    jeuneList,
                    sejourList,
                    ligneDeBusList,
                    indexes,
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
                jeunesList as any,
                pdrList as any,
                ligneDeBusList as any,
            );

            expect(result).toEqual({
                Department: ["75", "92"],
                idCentres: [["center1"], ["center2"]],
                Lignes: [["ligne1"], ["ligne2"]],
                PlacesParLignes: [[40], [40]],
                idJeunes: [["1"], ["2"]],
            });
        });
    });

    describe("getAffectationNombreSurLigne", () => {
        it("should return the same array if the sum of placesLignes equals nbPlacesAAffecter", () => {
            const placesLignes = [10, 20, 30];
            const nbPlacesAAffecter = 60;

            expect(
                simulationAffectationHTSService.getAffectationNombreSurLigne(placesLignes, nbPlacesAAffecter),
            ).toEqual(placesLignes);
        });

        it("should return an array with the correct sum if the sum of placesLignes is greater than nbPlacesAAffecter", () => {
            const placesLignes = [10, 20, 30];
            const nbPlacesAAffecter = 50;
            const result = simulationAffectationHTSService.getAffectationNombreSurLigne(
                placesLignes,
                nbPlacesAAffecter,
            );

            expect(result.reduce((a, b) => a + b, 0)).toEqual(nbPlacesAAffecter);
        });

        it("should return an array with the correct sum if the sum of placesLignes is less than nbPlacesAAffecter", () => {
            const placesLignes = [10, 20, 30];
            const nbPlacesAAffecter = 70;
            const result = simulationAffectationHTSService.getAffectationNombreSurLigne(
                placesLignes,
                nbPlacesAAffecter,
            );
            const somme = result.reduce((a, b) => a + b, 0);
            expect(somme).toEqual(60);
        });
    });

    describe("verificationCentres", () => {
        it("should return an array with modified values based on placesLeft and placesLigne", () => {
            const nbAleatoireJeunesSurLignes = [20, 30, 40];
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
                nbAleatoireJeunesSurLignes,
                placesLignes,
                ligneDep,
                ligneDeBusList,
                sejourList,
            );

            expect(result).toHaveLength(3);
            expect(result[0]).toBeLessThanOrEqual(placesLignes[0]);
            expect(result[1]).toBeLessThanOrEqual(placesLignes[1]);
            expect(result[2]).toBeLessThanOrEqual(placesLignes[2]);
        });
    });

    describe("computeCost", () => {
        it("should return a number", () => {
            const result = simulationAffectationHTSService.computeCost([], [], []);
            expect(result).toBe(NaN);
        });

        it("should return 0 with specific input values", () => {
            const result = simulationAffectationHTSService.computeCost([[0.5, 0.5]], [0.8, 0.8], [0.7, 0.7]);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThan(1);
        });
    });

    describe("isRemainingSeatSafe", () => {
        it("should return false if there are lines with negative remaining seats", () => {
            const ligneDeBusList = [
                { capaciteJeunes: 50, placesOccupeesJeunes: 51 },
                { capaciteJeunes: 30, placesOccupeesJeunes: 30 },
            ] as LigneDeBusModel[];
            const sejourList = [];

            expect(simulationAffectationHTSService.isRemainingSeatSafe(ligneDeBusList, sejourList)).toBe(false);
        });

        it("should return false if there are centers with negative remaining places", () => {
            const ligneDeBusList = [];
            const sejourList = [
                { placesRestantes: 100 },
                { placesRestantes: -50 },
                { placesRestantes: 150 },
            ] as SejourModel[];

            expect(simulationAffectationHTSService.isRemainingSeatSafe(ligneDeBusList, sejourList)).toBe(false);
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

            expect(simulationAffectationHTSService.isRemainingSeatSafe(ligneDeBusList, sejourList)).toBe(true);
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

            const result = simulationAffectationHTSService.computeRapport(
                jeunesList,
                sejourList,
                ligneDeBusList,
                centreList,
                pdrList,
                jeunesAvantAffectationList,
                jeuneIntraDepartementList,
                {
                    selectedCost: [],
                    tauxRepartitionCentreList: [],
                    centreIdList: [],
                    tauxRemplissageCentreList: [],
                    tauxOccupationLignesParCentreList: [],
                    iterationCostList: [],
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
