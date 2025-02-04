import { Test, TestingModule } from "@nestjs/testing";
import { SejourService } from "./Sejour.Service";
import { SejourGateway } from "./Sejour.gateway";
import { JeuneGateway } from "../../jeune/Jeune.gateway";

describe("SejourService", () => {
    let sejourService: SejourService;
    let sejourGateway: SejourGateway;
    let jeuneGateway: JeuneGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SejourService,
                {
                    provide: SejourGateway,
                    useValue: {
                        findById: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: JeuneGateway,
                    useValue: {
                        findBySejourId: jest.fn(),
                    },
                },
            ],
        }).compile();

        sejourService = module.get<SejourService>(SejourService);
        sejourGateway = module.get<SejourGateway>(SejourGateway);
        jeuneGateway = module.get<JeuneGateway>(JeuneGateway);
    });

    it("should correctly calculate placesRestantes and update if changed", async () => {
        const mockSejour = { id: "sejourId", placesTotal: 10, placesRestantes: 5 };
        const mockJeunes = [
            { statutPhase1: "AFFECTED", cohesionStayPresence: "true", statut: "VALIDATED" },
            { statutPhase1: "DONE", cohesionStayPresence: "true", statut: "VALIDATED" },
            { statutPhase1: "AFFECTED", cohesionStayPresence: "false", statut: "VALIDATED" },
            { statutPhase1: "DONE", cohesionStayPresence: "true", statut: "REJECTED" },
        ]; // Only 2 count as 'places taken'

        (sejourGateway.findById as jest.Mock).mockResolvedValue(mockSejour);
        (jeuneGateway.findBySejourId as jest.Mock).mockResolvedValue(mockJeunes);

        await sejourService.updatePlacesSejour("sejourId");

        expect(sejourGateway.update).toHaveBeenCalledWith({ ...mockSejour, placesRestantes: 8 });
    });

    it("should not update sejour if placesRestantes remains the same", async () => {
        const mockSejour = { id: "sejourId", placesTotal: 10, placesRestantes: 8 };
        const mockJeunes = [
            { statutPhase1: "AFFECTED", cohesionStayPresence: "true", statut: "VALIDATED" },
            { statutPhase1: "DONE", cohesionStayPresence: "true", statut: "VALIDATED" },
        ]; // 2 places taken -> placesRestantes = 8

        (sejourGateway.findById as jest.Mock).mockResolvedValue(mockSejour);
        (jeuneGateway.findBySejourId as jest.Mock).mockResolvedValue(mockJeunes);

        await sejourService.updatePlacesSejour("sejourId");

        expect(sejourGateway.update).not.toHaveBeenCalled();
    });

    it("should set placesRestantes to 0 if all seats are taken", async () => {
        const mockSejour = { id: "sejourId", placesTotal: 2, placesRestantes: 1 };
        const mockJeunes = [
            { statutPhase1: "AFFECTED", cohesionStayPresence: "true", statut: "VALIDATED" },
            { statutPhase1: "DONE", cohesionStayPresence: "true", statut: "VALIDATED" },
        ]; // 2 places taken -> 0 remaining

        (sejourGateway.findById as jest.Mock).mockResolvedValue(mockSejour);
        (jeuneGateway.findBySejourId as jest.Mock).mockResolvedValue(mockJeunes);

        await sejourService.updatePlacesSejour("sejourId");

        expect(sejourGateway.update).toHaveBeenCalledWith({ ...mockSejour, placesRestantes: 0 });
    });

    it("should not have negative placesRestantes", async () => {
        const mockSejour = { id: "sejourId", placesTotal: 1, placesRestantes: 1 };
        const mockJeunes = [
            { statutPhase1: "AFFECTED", cohesionStayPresence: "true", statut: "VALIDATED" },
            { statutPhase1: "DONE", cohesionStayPresence: "true", statut: "VALIDATED" },
        ]; // 2 places taken but only 1 total

        (sejourGateway.findById as jest.Mock).mockResolvedValue(mockSejour);
        (jeuneGateway.findBySejourId as jest.Mock).mockResolvedValue(mockJeunes);

        await sejourService.updatePlacesSejour("sejourId");

        expect(sejourGateway.update).toHaveBeenCalledWith({ ...mockSejour, placesRestantes: 0 });
    });
});
