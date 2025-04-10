import { Test } from "@nestjs/testing";
import { EnvoyerCampagneProgrammee } from "./EnvoyerCampagneProgrammee";
import { PreparerEnvoiCampagne } from "../PreparerEnvoiCampagne";
import { CampagneGateway } from "../../gateway/Campagne.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { CampagneModel } from "../../Campagne.model";

describe("EnvoyerCampagneProgrammee", () => {
    let useCase: EnvoyerCampagneProgrammee;
    let preparerEnvoiCampagne: jest.Mocked<PreparerEnvoiCampagne>;
    let campagneGateway: jest.Mocked<CampagneGateway>;
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
                    provide: CampagneGateway,
                    useValue: {
                        findCampagnesWithProgrammationBetweenDates: jest.fn(),
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
        campagneGateway = module.get(CampagneGateway);
        clockGateway = module.get(ClockGateway);
    });

    it("should find campaigns with programmation and prepare their sending", async () => {
        const now = new Date("2023-01-02T12:00:00Z");
        const yesterday = new Date("2023-01-01T12:00:00Z");

        clockGateway.now.mockReturnValue(now);
        clockGateway.addDays.mockReturnValue(yesterday);

        const mockCampagnes: CampagneModel[] = [
            { id: "campaign-1" } as CampagneModel,
            { id: "campaign-2" } as CampagneModel,
        ];

        campagneGateway.findCampagnesWithProgrammationBetweenDates.mockResolvedValue(mockCampagnes);
        preparerEnvoiCampagne.execute.mockResolvedValue(undefined);

        await useCase.execute();

        expect(clockGateway.now).toHaveBeenCalled();
        expect(clockGateway.addDays).toHaveBeenCalledWith(now, -1);
        expect(campagneGateway.findCampagnesWithProgrammationBetweenDates).toHaveBeenCalledWith(yesterday, now);
        expect(preparerEnvoiCampagne.execute).toHaveBeenCalledTimes(2);
        expect(preparerEnvoiCampagne.execute).toHaveBeenCalledWith("campaign-1");
        expect(preparerEnvoiCampagne.execute).toHaveBeenCalledWith("campaign-2");
    });

    it("should do nothing if no campaigns are found", async () => {
        const now = new Date("2023-01-02T12:00:00Z");
        const yesterday = new Date("2023-01-01T12:00:00Z");

        clockGateway.now.mockReturnValue(now);
        clockGateway.addDays.mockReturnValue(yesterday);

        campagneGateway.findCampagnesWithProgrammationBetweenDates.mockResolvedValue([]);

        await useCase.execute();

        expect(campagneGateway.findCampagnesWithProgrammationBetweenDates).toHaveBeenCalledWith(yesterday, now);
        expect(preparerEnvoiCampagne.execute).not.toHaveBeenCalled();
    });

    it("should throw error if preparerEnvoiCampagne fails", async () => {
        const now = new Date("2023-01-02T12:00:00Z");
        const yesterday = new Date("2023-01-01T12:00:00Z");

        clockGateway.now.mockReturnValue(now);
        clockGateway.addDays.mockReturnValue(yesterday);

        const mockCampagnes: CampagneModel[] = [
            { id: "campaign-1" } as CampagneModel,
            { id: "campaign-2" } as CampagneModel,
        ];

        campagneGateway.findCampagnesWithProgrammationBetweenDates.mockResolvedValue(mockCampagnes);

        const expectedError = new Error("Test error");
        preparerEnvoiCampagne.execute.mockRejectedValueOnce(expectedError);

        await expect(useCase.execute()).rejects.toThrow(expectedError);

        expect(preparerEnvoiCampagne.execute).toHaveBeenCalledTimes(1);
        expect(preparerEnvoiCampagne.execute).toHaveBeenCalledWith("campaign-1");
    });
});
