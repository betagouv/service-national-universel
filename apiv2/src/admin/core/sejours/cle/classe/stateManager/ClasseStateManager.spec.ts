import { Test, TestingModule } from "@nestjs/testing";
import { ClasseStateManager } from "./Classe.stateManager";
import { ClasseGateway } from "../Classe.gateway";
import { JeuneGateway } from "../../../jeune/Jeune.gateway";
import { SessionGateway } from "../../../phase1/session/Session.gateway";
import { SessionService } from "../../../phase1/session/Session.service";
import { STATUS_CLASSE, YOUNG_STATUS } from "snu-lib";

describe("ClasseStateManager", () => {
    let classeStateManager: ClasseStateManager;
    let classeGateway: ClasseGateway;
    let jeuneGateway: JeuneGateway;
    let sessionGateway: SessionGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClasseStateManager,
                {
                    provide: ClasseGateway,
                    useValue: {
                        findById: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: JeuneGateway,
                    useValue: {
                        findByClasseId: jest.fn(),
                    },
                },
                {
                    provide: SessionGateway,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
            ],
        }).compile();

        classeStateManager = module.get<ClasseStateManager>(ClasseStateManager);
        classeGateway = module.get<ClasseGateway>(ClasseGateway);
        jeuneGateway = module.get<JeuneGateway>(JeuneGateway);
        sessionGateway = module.get<SessionGateway>(SessionGateway);
    });

    it("should throw an error if classe does not have a session", async () => {
        const mockClasse = { id: "1", sessionId: null };
        (classeGateway.findById as jest.Mock).mockResolvedValue(mockClasse);

        await expect(classeStateManager.compute("classeId")).rejects.toThrow("Classe has no session");
    });

    it("should return the classe if it has status WITHDRAWN", async () => {
        const mockClasse = { id: "1", sessionId: "session1", statut: STATUS_CLASSE.WITHDRAWN };
        (classeGateway.findById as jest.Mock).mockResolvedValue(mockClasse);

        const result = await classeStateManager.compute("classeId");
        expect(result).toEqual(mockClasse);
        expect(classeGateway.update).not.toHaveBeenCalled();
    });

    it("should update placesPrises based on validated jeunes", async () => {
        const mockClasse = { id: "1", sessionId: "session1", placesPrises: 0 };
        const mockSession = {
            inscriptionStartDate: new Date("2024-01-01"),
            inscriptionEndDate: new Date("2024-12-31"),
        };
        const mockJeunes = [
            { statut: YOUNG_STATUS.VALIDATED },
            { statut: YOUNG_STATUS.VALIDATED },
            { statut: YOUNG_STATUS.IN_PROGRESS },
        ];

        (classeGateway.findById as jest.Mock).mockResolvedValue(mockClasse);
        (sessionGateway.findById as jest.Mock).mockResolvedValue(mockSession);
        (jeuneGateway.findByClasseId as jest.Mock).mockResolvedValue(mockJeunes);
        jest.spyOn(SessionService, "isCohortInscriptionOpen").mockReturnValue(true);

        const result = await classeStateManager.compute("classeId");

        expect(result.placesPrises).toBe(2);
        expect(classeGateway.update).toHaveBeenCalledWith(result);
    });

    it("should open the class if session inscription is open", async () => {
        const mockClasse = {
            id: "1",
            sessionId: "session1",
            placesPrises: 0,
            placesTotal: 5,
            statut: STATUS_CLASSE.ASSIGNED,
        };
        const mockSession = {
            inscriptionStartDate: new Date("2024-01-01"),
            inscriptionEndDate: new Date("2024-12-31"),
        };
        const mockJeunes = new Array(5).fill({ statut: YOUNG_STATUS.VALIDATED });

        (classeGateway.findById as jest.Mock).mockResolvedValue(mockClasse);
        (sessionGateway.findById as jest.Mock).mockResolvedValue(mockSession);
        (jeuneGateway.findByClasseId as jest.Mock).mockResolvedValue(mockJeunes);
        jest.spyOn(SessionService, "isCohortInscriptionOpen").mockReturnValue(true);

        const result = await classeStateManager.compute("classeId");

        expect(result.statut).toBe(STATUS_CLASSE.OPEN);
        expect(classeGateway.update).toHaveBeenCalledWith(result);
    });

    it("should close classe if inscription is closed", async () => {
        const mockClasse = { id: "1", sessionId: "session1", statut: STATUS_CLASSE.OPEN, placesTotal: 5 };
        const mockSession = {
            inscriptionStartDate: new Date("2024-01-01"),
            inscriptionEndDate: new Date("2024-02-01"),
        };
        const mockJeunes = new Array(5).fill({ statut: YOUNG_STATUS.VALIDATED });

        (classeGateway.findById as jest.Mock).mockResolvedValue(mockClasse);
        (sessionGateway.findById as jest.Mock).mockResolvedValue(mockSession);
        (jeuneGateway.findByClasseId as jest.Mock).mockResolvedValue(mockJeunes);
        jest.spyOn(SessionService, "isCohortInscriptionOpen").mockReturnValue(false);

        const result = await classeStateManager.compute("classeId");

        expect(result.statut).toBe(STATUS_CLASSE.CLOSED);
        expect(classeGateway.update).toHaveBeenCalledWith(result);
    });

    it("should close classe if it is full", async () => {
        const mockClasse = {
            id: "1",
            sessionId: "session1",
            statut: STATUS_CLASSE.OPEN,
            placesTotal: 5,
        };
        const mockSession = {
            inscriptionStartDate: new Date("2024-01-01"),
            inscriptionEndDate: new Date("2024-12-31"),
        };
        const mockJeunes = new Array(5).fill({ statut: YOUNG_STATUS.VALIDATED });

        (classeGateway.findById as jest.Mock).mockResolvedValue(mockClasse);
        (sessionGateway.findById as jest.Mock).mockResolvedValue(mockSession);
        (jeuneGateway.findByClasseId as jest.Mock).mockResolvedValue(mockJeunes);
        jest.spyOn(SessionService, "isCohortInscriptionOpen").mockReturnValue(true);

        const result = await classeStateManager.compute("classeId");

        expect(result.statut).toBe(STATUS_CLASSE.CLOSED);
        expect(result.placesPrises).toBe(5);
        expect(classeGateway.update).toHaveBeenCalledWith(result);
    });
});
