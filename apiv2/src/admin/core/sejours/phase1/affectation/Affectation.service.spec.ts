import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";

import { TaskGateway } from "@task/core/Task.gateway";

import { PointDeRassemblementGateway } from "../pointDeRassemblement/PointDeRassemblement.gateway";
import { AffectationService } from "./Affectation.service";
import { SessionGateway } from "../session/Session.gateway";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";
import { SejourGateway } from "../sejour/Sejour.gateway";
import { CentreGateway } from "../centre/Centre.gateway";
import { PlanDeTransportGateway } from "../PlanDeTransport/PlanDeTransport.gateway";
import { LigneDeBusModel } from "../ligneDeBus/LigneDeBus.model";
import { PlanDeTransportModel } from "../PlanDeTransport/PlanDeTransport.model";
import { SejourModel } from "../sejour/Sejour.model";

describe("AffectationService", () => {
    let affectationService: AffectationService;
    let ligneDeBusGateway: LigneDeBusGateway;
    let sejourGateway: SejourGateway;
    let planDeTransportGateway: PlanDeTransportGateway;
    let jeuneGateway: JeuneGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AffectationService,
                Logger,
                {
                    provide: TaskGateway,
                    useValue: {},
                },
                {
                    provide: SessionGateway,
                    useValue: {},
                },
                {
                    provide: JeuneGateway,
                    useValue: {},
                },
                {
                    provide: LigneDeBusGateway,
                    useValue: {
                        bulkUpdate: jest.fn(),
                        countPlaceOccupeesByLigneDeBusIds: jest.fn(),
                    },
                },
                {
                    provide: PointDeRassemblementGateway,
                    useValue: {},
                },
                {
                    provide: SejourGateway,
                    useValue: {
                        bulkUpdate: jest.fn(),
                        countPlaceOccupeesBySejourIds: jest.fn(),
                    },
                },
                {
                    provide: CentreGateway,
                    useValue: {},
                },
                {
                    provide: PlanDeTransportGateway,
                    useValue: {
                        findByIds: jest.fn(),
                        bulkUpdate: jest.fn(),
                    },
                },
            ],
        }).compile();

        affectationService = module.get<AffectationService>(AffectationService);
        ligneDeBusGateway = module.get<LigneDeBusGateway>(LigneDeBusGateway);
        sejourGateway = module.get<SejourGateway>(SejourGateway);
        planDeTransportGateway = module.get<PlanDeTransportGateway>(PlanDeTransportGateway);
        jeuneGateway = module.get<JeuneGateway>(JeuneGateway);
    });

    it("should correctly format the percentage", () => {
        expect(affectationService.formatPourcent(0.5)).toBe("50.00%");
        expect(affectationService.formatPourcent(0.1234)).toBe("12.34%");
        expect(affectationService.formatPourcent(0)).toBe("0.00%");
        expect(affectationService.formatPourcent(1)).toBe("100.00%");
        expect(affectationService.formatPourcent(null as any)).toBe("");
        expect(affectationService.formatPourcent(undefined as any)).toBe("");
        expect(affectationService.formatPourcent(NaN)).toBe("");
    });

    it("should sync places disponibles lignes de bus", async () => {
        const ligneDeBusList = [
            { id: "1", placesOccupeesJeunes: 0 },
            { id: "2", placesOccupeesJeunes: 0 },
        ] as LigneDeBusModel[];

        const pdtList = [
            { id: "1", placesOccupeesJeunes: 0, capaciteJeunes: 10, tauxRemplissageLigne: 0 },
            { id: "2", placesOccupeesJeunes: 0, capaciteJeunes: 20, tauxRemplissageLigne: 0 },
        ] as PlanDeTransportModel[];

        jest.spyOn(planDeTransportGateway, "findByIds").mockResolvedValue(pdtList);
        jest.spyOn(ligneDeBusGateway, "countPlaceOccupeesByLigneDeBusIds").mockResolvedValue([
            {
                id: "1",
                placesOccupeesJeunes: 5,
            },
            {
                id: "2",
                placesOccupeesJeunes: 10,
            },
        ]);

        await affectationService.syncPlacesDisponiblesLignesDeBus(ligneDeBusList);

        expect(ligneDeBusGateway.countPlaceOccupeesByLigneDeBusIds).toHaveBeenCalledTimes(1);

        expect(ligneDeBusGateway.bulkUpdate).toHaveBeenCalledWith([
            { id: "1", placesOccupeesJeunes: 5 },
            { id: "2", placesOccupeesJeunes: 10 },
        ]);

        expect(planDeTransportGateway.bulkUpdate).toHaveBeenCalledWith([
            { id: "1", placesOccupeesJeunes: 5, capaciteJeunes: 10, tauxRemplissageLigne: 50 },
            { id: "2", placesOccupeesJeunes: 10, capaciteJeunes: 20, tauxRemplissageLigne: 50 },
        ]);
    });

    it("should sync places disponibles sejours", async () => {
        const sejourList = [
            { id: "1", centreNom: "Centre A", placesTotal: 10, placesRestantes: 5 },
            { id: "2", centreNom: "Centre B", placesTotal: 20, placesRestantes: 10 },
        ] as SejourModel[];

        jest.spyOn(sejourGateway, "countPlaceOccupeesBySejourIds").mockResolvedValue([
            { id: "1", placesOccupeesJeunes: 8 },
            { id: "2", placesOccupeesJeunes: 15 },
        ]);

        await affectationService.syncPlacesDisponiblesSejours(sejourList);

        expect(sejourGateway.countPlaceOccupeesBySejourIds).toHaveBeenCalledTimes(1);

        expect(sejourGateway.bulkUpdate).toHaveBeenCalledWith([
            {
                centreNom: "Centre A",
                id: "1",
                placesRestantes: 2,
                placesTotal: 10,
            },
            {
                centreNom: "Centre B",
                id: "2",
                placesRestantes: 5,
                placesTotal: 20,
            },
        ]);
    });
});
