import { Test, TestingModule } from "@nestjs/testing";
import { FeatureFlagService } from "./FeatureFlag.service";
import { FeatureFlagGateway } from "./FeatureFlag.gateway";
import { ClockGateway } from "../Clock.gateway";
import { FeatureFlagName } from "snu-lib";
import { FeatureFlagModel } from "./FeatureFlag.model";

describe("FeatureFlagService", () => {
    let service: FeatureFlagService;
    let featureFlagGateway: Partial<FeatureFlagGateway>;
    let clockGateway: Partial<ClockGateway>;

    const fixedDate = new Date("2023-01-15T12:00:00Z");
    const pastDate = new Date("2023-01-01T12:00:00Z");
    const futureDate = new Date("2023-01-30T12:00:00Z");

    beforeEach(async () => {
        featureFlagGateway = {
            findByName: jest.fn(),
        };

        clockGateway = {
            now: jest.fn().mockReturnValue(fixedDate),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FeatureFlagService,
                { provide: FeatureFlagGateway, useValue: featureFlagGateway },
                { provide: ClockGateway, useValue: clockGateway },
            ],
        }).compile();

        service = module.get<FeatureFlagService>(FeatureFlagService);
    });

    it("should return true when feature flag is enabled", async () => {
        const featureFlag: FeatureFlagModel = {
            name: FeatureFlagName.CLE_BEFORE_JULY_15,
            description: "Test feature",
            enabled: true,
        };

        jest.spyOn(featureFlagGateway, "findByName").mockResolvedValue(featureFlag);

        const result = await service.isFeatureFlagEnabled(FeatureFlagName.CLE_BEFORE_JULY_15);

        expect(result).toBe(true);
        expect(featureFlagGateway.findByName).toHaveBeenCalledWith(FeatureFlagName.CLE_BEFORE_JULY_15);
    });

    it("should return false when feature flag is disabled", async () => {
        const featureFlag: FeatureFlagModel = {
            name: FeatureFlagName.CLE_BEFORE_JULY_15,
            description: "Test feature",
            enabled: false,
        };

        jest.spyOn(featureFlagGateway, "findByName").mockResolvedValue(featureFlag);

        const result = await service.isFeatureFlagEnabled(FeatureFlagName.CLE_BEFORE_JULY_15);

        expect(result).toBe(false);
        expect(featureFlagGateway.findByName).toHaveBeenCalledWith(FeatureFlagName.CLE_BEFORE_JULY_15);
    });

    it("should return true when feature flag is enabled by date range (current date within range)", async () => {
        const featureFlag: FeatureFlagModel = {
            name: FeatureFlagName.CLE_BEFORE_JULY_15,
            description: "Test feature",
            enabled: false,
            date: {
                from: pastDate,
                to: futureDate,
            },
        };

        jest.spyOn(featureFlagGateway, "findByName").mockResolvedValue(featureFlag);

        const result = await service.isFeatureFlagEnabled(FeatureFlagName.CLE_BEFORE_JULY_15);

        expect(result).toBe(true);
        expect(featureFlagGateway.findByName).toHaveBeenCalledWith(FeatureFlagName.CLE_BEFORE_JULY_15);
        expect(clockGateway.now).toHaveBeenCalled();
    });

    it("should return false when feature flag is outside date range (current date after range)", async () => {
        const featureFlag: FeatureFlagModel = {
            name: FeatureFlagName.CLE_BEFORE_JULY_15,
            description: "Test feature",
            enabled: false,
            date: {
                from: pastDate,
                to: pastDate, // End date is in the past
            },
        };

        jest.spyOn(featureFlagGateway, "findByName").mockResolvedValue(featureFlag);

        const result = await service.isFeatureFlagEnabled(FeatureFlagName.CLE_BEFORE_JULY_15);

        expect(result).toBe(false);
        expect(featureFlagGateway.findByName).toHaveBeenCalledWith(FeatureFlagName.CLE_BEFORE_JULY_15);
        expect(clockGateway.now).toHaveBeenCalled();
    });

    it("should return false when feature flag is outside date range (current date before range)", async () => {
        const featureFlag: FeatureFlagModel = {
            name: FeatureFlagName.CLE_BEFORE_JULY_15,
            description: "Test feature",
            enabled: false,
            date: {
                from: futureDate, // Start date is in the future
                to: futureDate,
            },
        };

        jest.spyOn(featureFlagGateway, "findByName").mockResolvedValue(featureFlag);

        const result = await service.isFeatureFlagEnabled(FeatureFlagName.CLE_BEFORE_JULY_15);

        expect(result).toBe(false);
        expect(featureFlagGateway.findByName).toHaveBeenCalledWith(FeatureFlagName.CLE_BEFORE_JULY_15);
        expect(clockGateway.now).toHaveBeenCalled();
    });

    it("should return false when feature flag is missing date range parameters", async () => {
        const featureFlag: FeatureFlagModel = {
            name: FeatureFlagName.CLE_BEFORE_JULY_15,
            description: "Test feature",
            enabled: false,
            date: {}, // Missing from and to
        };

        jest.spyOn(featureFlagGateway, "findByName").mockResolvedValue(featureFlag);

        const result = await service.isFeatureFlagEnabled(FeatureFlagName.CLE_BEFORE_JULY_15);

        expect(result).toBe(false);
        expect(featureFlagGateway.findByName).toHaveBeenCalledWith(FeatureFlagName.CLE_BEFORE_JULY_15);
    });

    it("should return false when feature flag is not found", async () => {
        jest.spyOn(featureFlagGateway, "findByName").mockResolvedValue(null);

        const result = await service.isFeatureFlagEnabled(FeatureFlagName.CLE_BEFORE_JULY_15);

        expect(result).toBe(false);
        expect(featureFlagGateway.findByName).toHaveBeenCalledWith(FeatureFlagName.CLE_BEFORE_JULY_15);
    });
});
