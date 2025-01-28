import { ExecutionContext } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { JeuneReferentGuard } from "./JeuneReferent.guard";
import { JeuneDepartementGuard } from "./JeuneDepartement.guard";
import { JeuneGuardService } from "./JeuneGuard.service";
import { JeuneRegionGuard } from "./JeuneRegion.guard";
import { ROLES } from "snu-lib";
import { JeuneModel } from "@admin/core/sejours/jeune/Jeune.model";

describe("JeuneReferentGuard", () => {
    let guard: JeuneReferentGuard;
    let jeuneDepartementGuard: JeuneDepartementGuard;
    let jeuneRegionGuard: JeuneRegionGuard;
    let jeuneGuardService: JeuneGuardService;

    const mockJeuneDepartementGuard = {
        canActivate: jest.fn(),
    };

    const mockJeuneRegionGuard = {
        canActivate: jest.fn(),
    };

    const mockJeuneGuardService = {
        findJeune: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JeuneReferentGuard,
                { provide: JeuneDepartementGuard, useValue: mockJeuneDepartementGuard },
                { provide: JeuneRegionGuard, useValue: mockJeuneRegionGuard },
                { provide: JeuneGuardService, useValue: mockJeuneGuardService },
            ],
        }).compile();

        guard = module.get<JeuneReferentGuard>(JeuneReferentGuard);
        jeuneDepartementGuard = module.get<JeuneDepartementGuard>(JeuneDepartementGuard);
        jeuneRegionGuard = module.get<JeuneRegionGuard>(JeuneRegionGuard);
        jeuneGuardService = module.get<JeuneGuardService>(JeuneGuardService);
    });

    it("should be defined", () => {
        expect(guard).toBeDefined();
    });

    it("should return true if user is admin", async () => {
        const mockRequest = {
            user: { role: ROLES.ADMIN },
        } as CustomRequest;
        const mockContext = {
            switchToHttp: () => ({
                getRequest: () => mockRequest,
            }),
        } as ExecutionContext;

        jest.spyOn(jeuneGuardService, "findJeune").mockResolvedValue({} as JeuneModel);

        const result = await guard.canActivate(mockContext);

        expect(result).toBe(true);
    });

    it("should return true if jeuneDepartementGuard or jeuneRegionGuard can activate", async () => {
        const mockRequest = {
            user: { role: ROLES.VISITOR },
        } as CustomRequest;
        const mockContext = {
            switchToHttp: () => ({
                getRequest: () => mockRequest,
            }),
        } as ExecutionContext;

        jest.spyOn(jeuneGuardService, "findJeune").mockResolvedValue({} as JeuneModel);

        // Test if jeuneDepartementGuard returns true
        jest.spyOn(jeuneDepartementGuard, "canActivate").mockResolvedValue(true);
        let result = await guard.canActivate(mockContext);
        expect(result).toBe(true);

        // Test if jeuneRegionGuard returns true
        jest.spyOn(jeuneDepartementGuard, "canActivate").mockResolvedValue(false);
        jest.spyOn(jeuneRegionGuard, "canActivate").mockResolvedValue(true);
        result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
    });

    it("should return false if neither jeuneDepartementGuard nor jeuneRegionGuard can activate", async () => {
        const mockRequest = {
            user: { role: ROLES.VISITOR },
        } as CustomRequest;
        const mockContext = {
            switchToHttp: () => ({
                getRequest: () => mockRequest,
            }),
        } as ExecutionContext;

        jest.spyOn(jeuneGuardService, "findJeune").mockResolvedValue({} as JeuneModel);
        jest.spyOn(jeuneDepartementGuard, "canActivate").mockResolvedValue(false);
        jest.spyOn(jeuneRegionGuard, "canActivate").mockResolvedValue(false);

        const result = await guard.canActivate(mockContext);

        expect(result).toBe(false);
    });
});
