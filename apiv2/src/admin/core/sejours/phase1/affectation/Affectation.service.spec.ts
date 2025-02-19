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

describe("AffectationService", () => {
    let affectationService: AffectationService;
    let ligneDeBusGateway: LigneDeBusGateway;
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
                    useValue: {
                        countAffectedByLigneDeBus: jest.fn(),
                    },
                },
                {
                    provide: LigneDeBusGateway,
                    useValue: {
                        bulkUpdate: jest.fn(),
                    },
                },
                {
                    provide: PointDeRassemblementGateway,
                    useValue: {},
                },
                {
                    provide: SejourGateway,
                    useValue: {},
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

    it("should sync places disponibles ligne de bus", async () => {
        const ligneDeBusList = [
            { id: "1", placesOccupeesJeunes: 0 },
            { id: "2", placesOccupeesJeunes: 0 },
        ] as LigneDeBusModel[];

        const pdtList = [
            { id: "1", placesOccupeesJeunes: 0, capaciteJeunes: 10, tauxRemplissageLigne: 0 },
            { id: "2", placesOccupeesJeunes: 0, capaciteJeunes: 20, tauxRemplissageLigne: 0 },
        ] as PlanDeTransportModel[];

        jest.spyOn(planDeTransportGateway, "findByIds").mockResolvedValue(pdtList);
        jest.spyOn(jeuneGateway, "countAffectedByLigneDeBus").mockImplementation((id) => {
            if (id === "1") return Promise.resolve(5);
            if (id === "2") return Promise.resolve(10);
            return Promise.resolve(0);
        });

        await affectationService.syncPlaceDisponiblesLigneDeBus(ligneDeBusList);

        expect(jeuneGateway.countAffectedByLigneDeBus).toHaveBeenCalledTimes(2);
        expect(jeuneGateway.countAffectedByLigneDeBus).toHaveBeenCalledWith("1");
        expect(jeuneGateway.countAffectedByLigneDeBus).toHaveBeenCalledWith("2");

        expect(ligneDeBusGateway.bulkUpdate).toHaveBeenCalledWith([
            { id: "1", placesOccupeesJeunes: 5 },
            { id: "2", placesOccupeesJeunes: 10 },
        ]);

        expect(planDeTransportGateway.bulkUpdate).toHaveBeenCalledWith([
            { id: "1", placesOccupeesJeunes: 5, capaciteJeunes: 10, tauxRemplissageLigne: 50 },
            { id: "2", placesOccupeesJeunes: 10, capaciteJeunes: 20, tauxRemplissageLigne: 50 },
        ]);
    });
});
