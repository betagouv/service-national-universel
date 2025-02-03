import { Test, TestingModule } from "@nestjs/testing";
import { PlanDeTransportService } from "./PlanDeTransport.service";
import { PlanDeTransportGateway } from "./PlanDeTransport.gateway";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";

describe("PlanDeTransportService", () => {
    let planDeTransportService: PlanDeTransportService;
    let planDeTransportGateway: PlanDeTransportGateway;
    let jeuneGateway: JeuneGateway;
    let ligneDeBusGateway: LigneDeBusGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlanDeTransportService,
                {
                    provide: PlanDeTransportGateway,
                    useValue: {
                        findById: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: JeuneGateway,
                    useValue: {
                        findInBus: jest.fn(),
                    },
                },
                {
                    provide: LigneDeBusGateway,
                    useValue: {
                        findById: jest.fn(),
                        update: jest.fn(),
                    },
                },
            ],
        }).compile();

        planDeTransportService = module.get<PlanDeTransportService>(PlanDeTransportService);
        planDeTransportGateway = module.get<PlanDeTransportGateway>(PlanDeTransportGateway);
        jeuneGateway = module.get<JeuneGateway>(JeuneGateway);
        ligneDeBusGateway = module.get<LigneDeBusGateway>(LigneDeBusGateway);
    });

    it("should correctly update placesOccupeesJeunes if changed", async () => {
        const mockBusLine = { id: "bus1", placesOccupeesJeunes: 5 };
        const mockJeunes = [{ id: "1" }, { id: "2" }, { id: "3" }]; // 3 jeunes in bus
        const mockPlanTransport = { id: "bus1", capaciteJeunes: 10, placesOccupeesJeunes: 5 };

        (ligneDeBusGateway.findById as jest.Mock).mockResolvedValue(mockBusLine);
        (jeuneGateway.findInBus as jest.Mock).mockResolvedValue(mockJeunes);
        (planDeTransportGateway.findById as jest.Mock).mockResolvedValue(mockPlanTransport);

        await planDeTransportService.updateSeatsTakenInBusLine("bus1");

        expect(ligneDeBusGateway.update).toHaveBeenCalledWith({ ...mockBusLine, placesOccupeesJeunes: 3 });
        expect(planDeTransportGateway.update).toHaveBeenCalledWith({
            ...mockPlanTransport,
            placesOccupeesJeunes: 3,
            lineFillingRate: 30,
        });
    });

    it("should not update if placesOccupeesJeunes remains the same", async () => {
        const mockBusLine = { id: "bus1", placesOccupeesJeunes: 3 };
        const mockJeunes = [{ id: "1" }, { id: "2" }, { id: "3" }]; // 3 jeunes in bus
        const mockPlanTransport = { id: "bus1", capaciteJeunes: 10, placesOccupeesJeunes: 3 };

        (ligneDeBusGateway.findById as jest.Mock).mockResolvedValue(mockBusLine);
        (jeuneGateway.findInBus as jest.Mock).mockResolvedValue(mockJeunes);
        (planDeTransportGateway.findById as jest.Mock).mockResolvedValue(mockPlanTransport);

        await planDeTransportService.updateSeatsTakenInBusLine("bus1");

        expect(ligneDeBusGateway.update).not.toHaveBeenCalled();
        expect(planDeTransportGateway.update).not.toHaveBeenCalled();
    });

    it("should correctly set lineFillingRate to 100 if bus is full", async () => {
        const mockBusLine = { id: "bus1", placesOccupeesJeunes: 5 };
        const mockJeunes = new Array(10).fill({ id: "x" }); // 10 jeunes in bus
        const mockPlanTransport = { id: "bus1", capaciteJeunes: 10, placesOccupeesJeunes: 5 };

        (ligneDeBusGateway.findById as jest.Mock).mockResolvedValue(mockBusLine);
        (jeuneGateway.findInBus as jest.Mock).mockResolvedValue(mockJeunes);
        (planDeTransportGateway.findById as jest.Mock).mockResolvedValue(mockPlanTransport);

        await planDeTransportService.updateSeatsTakenInBusLine("bus1");

        expect(planDeTransportGateway.update).toHaveBeenCalledWith({
            ...mockPlanTransport,
            placesOccupeesJeunes: 10,
            lineFillingRate: 100,
        });
    });

    it("should correctly handle division by zero when calculating lineFillingRate", async () => {
        const mockBusLine = { id: "bus1", placesOccupeesJeunes: 2 };
        const mockJeunes = [{ id: "1" }, { id: "2" }, { id: "3" }]; // 3 jeunes in bus
        const mockPlanTransport = { id: "bus1", capaciteJeunes: 0, placesOccupeesJeunes: 2 };

        (ligneDeBusGateway.findById as jest.Mock).mockResolvedValue(mockBusLine);
        (jeuneGateway.findInBus as jest.Mock).mockResolvedValue(mockJeunes);
        (planDeTransportGateway.findById as jest.Mock).mockResolvedValue(mockPlanTransport);

        await planDeTransportService.updateSeatsTakenInBusLine("bus1");

        expect(planDeTransportGateway.update).toHaveBeenCalledWith({
            ...mockPlanTransport,
            placesOccupeesJeunes: 3,
            lineFillingRate: 0, // Avoid division by zero
        });
    });
});
