import { Test } from "@nestjs/testing";
import { EnvoyerCampagneProgrammee } from "./EnvoyerCampagneProgrammee";
import { PreparerEnvoiCampagne } from "../PreparerEnvoiCampagne";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { CampagneComplete } from "../../Campagne.model";
import { CampagneService } from "@plan-marketing/core/service/Campagne.service";
import { ProgrammationService } from "@plan-marketing/core/service/Programmation.service";
import { CampagneProgrammation } from "../../Programmation.model";
import { CampagneJeuneType, DestinataireListeDiffusion, TypeEvenement } from "snu-lib";

describe("EnvoyerCampagneProgrammee", () => {
    let useCase: EnvoyerCampagneProgrammee;
    let preparerEnvoiCampagne: jest.Mocked<PreparerEnvoiCampagne>;
    let campagneService: jest.Mocked<CampagneService>;
    let programmationService: jest.Mocked<ProgrammationService>;
    let clockGateway: jest.Mocked<ClockGateway>;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                EnvoyerCampagneProgrammee,
                {
                    provide: PreparerEnvoiCampagne,
                    useValue: {
                        execute: jest.fn(),
                    },
                },
                {
                    provide: CampagneService,
                    useValue: {
                        findActivesCampagnesWithProgrammationBetweenDates: jest.fn(),
                        updateProgrammationSentDate: jest.fn(),
                    },
                },
                {
                    provide: ProgrammationService,
                    useValue: {
                        shouldProgrammationBeSent: jest.fn(),
                    },
                },
                {
                    provide: ClockGateway,
                    useValue: {
                        now: jest.fn(),
                        addDays: jest.fn(),
                    },
                },
            ],
        }).compile();

        useCase = module.get(EnvoyerCampagneProgrammee);
        preparerEnvoiCampagne = module.get(PreparerEnvoiCampagne);
        campagneService = module.get(CampagneService);
        programmationService = module.get(ProgrammationService);
        clockGateway = module.get(ClockGateway);
    });

    it("should find campaigns with programmation and prepare their sending", async () => {
        const now = new Date("2023-01-02T12:00:00Z");
        const yesterday = new Date("2023-01-01T12:00:00Z");

        clockGateway.now.mockReturnValue(now);
        clockGateway.addDays.mockReturnValue(yesterday);

        const prog1: CampagneProgrammation = {
            id: "prog-1",
            joursDecalage: 1,
            type: TypeEvenement.AUCUN,
            createdAt: new Date(),
        };

        const prog2: CampagneProgrammation = {
            id: "prog-2",
            joursDecalage: 2,
            type: TypeEvenement.AUCUN,
            createdAt: new Date(),
        };

        const mockCampagnes: CampagneComplete[] = [
            {
                id: "campaign-1",
                nom: "Campagne 1",
                objet: "Objet campagne 1",
                templateId: 1,
                listeDiffusionId: "liste-1",
                destinataires: [] as DestinataireListeDiffusion[],
                type: CampagneJeuneType.VOLONTAIRE,
                programmations: [prog1],
                isProgrammationActive: true,
            },
            {
                id: "campaign-2",
                nom: "Campagne 2",
                objet: "Objet campagne 2",
                templateId: 2,
                listeDiffusionId: "liste-2",
                destinataires: [] as DestinataireListeDiffusion[],
                type: CampagneJeuneType.VOLONTAIRE,
                programmations: [prog2],
                isProgrammationActive: true,
            },
        ];

        campagneService.findActivesCampagnesWithProgrammationBetweenDates.mockResolvedValue(mockCampagnes);
        programmationService.shouldProgrammationBeSent.mockImplementation((prog) => {
            return prog.id === "prog-1" || prog.id === "prog-2";
        });
        preparerEnvoiCampagne.execute.mockResolvedValue(undefined);
        campagneService.updateProgrammationSentDate.mockResolvedValue({} as any);

        await useCase.execute();

        expect(clockGateway.now).toHaveBeenCalled();
        expect(clockGateway.addDays).toHaveBeenCalledWith(now, -1);
        expect(campagneService.findActivesCampagnesWithProgrammationBetweenDates).toHaveBeenCalledWith(yesterday, now);
        expect(programmationService.shouldProgrammationBeSent).toHaveBeenCalledTimes(2);
        expect(preparerEnvoiCampagne.execute).toHaveBeenCalledTimes(2);
        expect(preparerEnvoiCampagne.execute).toHaveBeenCalledWith("campaign-1");
        expect(preparerEnvoiCampagne.execute).toHaveBeenCalledWith("campaign-2");
        expect(campagneService.updateProgrammationSentDate).toHaveBeenCalledTimes(2);
        expect(campagneService.updateProgrammationSentDate).toHaveBeenCalledWith("campaign-1", "prog-1", now);
        expect(campagneService.updateProgrammationSentDate).toHaveBeenCalledWith("campaign-2", "prog-2", now);
    });

    it("should do nothing if no campaigns are found", async () => {
        const now = new Date("2023-01-02T12:00:00Z");
        const yesterday = new Date("2023-01-01T12:00:00Z");

        clockGateway.now.mockReturnValue(now);
        clockGateway.addDays.mockReturnValue(yesterday);

        campagneService.findActivesCampagnesWithProgrammationBetweenDates.mockResolvedValue([]);

        await useCase.execute();

        expect(campagneService.findActivesCampagnesWithProgrammationBetweenDates).toHaveBeenCalledWith(yesterday, now);
        expect(preparerEnvoiCampagne.execute).not.toHaveBeenCalled();
        expect(campagneService.updateProgrammationSentDate).not.toHaveBeenCalled();
    });

    it("should not send campaign if programmation should not be sent", async () => {
        const now = new Date("2023-01-02T12:00:00Z");
        const yesterday = new Date("2023-01-01T12:00:00Z");

        clockGateway.now.mockReturnValue(now);
        clockGateway.addDays.mockReturnValue(yesterday);

        const prog1: CampagneProgrammation = {
            id: "prog-1",
            joursDecalage: 1,
            type: TypeEvenement.AUCUN,
            createdAt: new Date(),
        };

        const mockCampagnes: CampagneComplete[] = [
            {
                id: "campaign-1",
                nom: "Campagne 1",
                objet: "Objet campagne 1",
                templateId: 1,
                listeDiffusionId: "liste-1",
                destinataires: [] as DestinataireListeDiffusion[],
                type: CampagneJeuneType.VOLONTAIRE,
                programmations: [prog1],
                isProgrammationActive: true,
            },
        ];

        campagneService.findActivesCampagnesWithProgrammationBetweenDates.mockResolvedValue(mockCampagnes);
        programmationService.shouldProgrammationBeSent.mockReturnValue(false);

        await useCase.execute();

        expect(programmationService.shouldProgrammationBeSent).toHaveBeenCalledWith(prog1, yesterday, now);
        expect(preparerEnvoiCampagne.execute).not.toHaveBeenCalled();
        expect(campagneService.updateProgrammationSentDate).not.toHaveBeenCalled();
    });

    it("should throw error if preparerEnvoiCampagne fails", async () => {
        const now = new Date("2023-01-02T12:00:00Z");
        const yesterday = new Date("2023-01-01T12:00:00Z");

        clockGateway.now.mockReturnValue(now);
        clockGateway.addDays.mockReturnValue(yesterday);

        const prog1: CampagneProgrammation = {
            id: "prog-1",
            joursDecalage: 1,
            type: TypeEvenement.AUCUN,
            createdAt: new Date(),
        };

        const mockCampagnes: CampagneComplete[] = [
            {
                id: "campaign-1",
                nom: "Campagne 1",
                objet: "Objet campagne 1",
                templateId: 1,
                listeDiffusionId: "liste-1",
                destinataires: [] as DestinataireListeDiffusion[],
                type: CampagneJeuneType.VOLONTAIRE,
                programmations: [prog1],
                isProgrammationActive: true,
            },
        ];

        campagneService.findActivesCampagnesWithProgrammationBetweenDates.mockResolvedValue(mockCampagnes);
        programmationService.shouldProgrammationBeSent.mockReturnValue(true);

        const expectedError = new Error("Test error");
        preparerEnvoiCampagne.execute.mockRejectedValueOnce(expectedError);

        await expect(useCase.execute()).rejects.toThrow(expectedError);

        expect(preparerEnvoiCampagne.execute).toHaveBeenCalledTimes(1);
        expect(preparerEnvoiCampagne.execute).toHaveBeenCalledWith("campaign-1");
        expect(campagneService.updateProgrammationSentDate).not.toHaveBeenCalled();
    });

    it("should throw error if updateProgrammationSentDate fails", async () => {
        const now = new Date("2023-01-02T12:00:00Z");
        const yesterday = new Date("2023-01-01T12:00:00Z");

        clockGateway.now.mockReturnValue(now);
        clockGateway.addDays.mockReturnValue(yesterday);

        const prog1: CampagneProgrammation = {
            id: "prog-1",
            joursDecalage: 1,
            type: TypeEvenement.AUCUN,
            createdAt: new Date(),
        };

        const mockCampagnes: CampagneComplete[] = [
            {
                id: "campaign-1",
                nom: "Campagne 1",
                objet: "Objet campagne 1",
                templateId: 1,
                listeDiffusionId: "liste-1",
                destinataires: [] as DestinataireListeDiffusion[],
                type: CampagneJeuneType.VOLONTAIRE,
                programmations: [prog1],
                isProgrammationActive: true,
            },
        ];

        campagneService.findActivesCampagnesWithProgrammationBetweenDates.mockResolvedValue(mockCampagnes);
        programmationService.shouldProgrammationBeSent.mockReturnValue(true);
        preparerEnvoiCampagne.execute.mockResolvedValue(undefined);

        const expectedError = new Error("Test error");
        campagneService.updateProgrammationSentDate.mockRejectedValueOnce(expectedError);

        await expect(useCase.execute()).rejects.toThrow(expectedError);

        expect(preparerEnvoiCampagne.execute).toHaveBeenCalledTimes(1);
        expect(preparerEnvoiCampagne.execute).toHaveBeenCalledWith("campaign-1");
        expect(campagneService.updateProgrammationSentDate).toHaveBeenCalledTimes(1);
        expect(campagneService.updateProgrammationSentDate).toHaveBeenCalledWith("campaign-1", "prog-1", now);
    });
});
