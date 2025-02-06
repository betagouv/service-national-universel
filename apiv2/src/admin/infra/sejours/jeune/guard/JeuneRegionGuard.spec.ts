import { ExecutionContext, Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { JeuneRegionGuard } from "./JeuneRegion.guard";
import { JeuneGuardService } from "./JeuneGuard.service";
import { ROLES } from "snu-lib";
import { Role } from "@shared/core/Role";

describe("JeuneRegion.guard", () => {
    let guard: JeuneRegionGuard;
    let jeuneGuardService: JeuneGuardService;
    let logger: Logger;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JeuneRegionGuard,
                {
                    provide: JeuneGuardService,
                    useValue: {
                        findJeune: jest.fn(),
                    },
                },
                {
                    provide: Logger,
                    useValue: {
                        log: jest.fn(),
                    },
                },
            ],
        }).compile();

        guard = module.get<JeuneRegionGuard>(JeuneRegionGuard);
        jeuneGuardService = module.get<JeuneGuardService>(JeuneGuardService);
        logger = module.get<Logger>(Logger);
    });

    it("should be defined", () => {
        expect(guard).toBeDefined();
    });

    describe("canActivate", () => {
        it("should return true if user region matches jeune region and role is referent_region", async () => {
            const request = {
                user: { region: "testRegion", role: ROLES.REFERENT_REGION },
            };
            const jeune = { region: "testRegion" };
            jest.spyOn(jeuneGuardService, "findJeune").mockResolvedValue(jeune as any);
            const context = {
                switchToHttp: () => ({
                    getRequest: () => request,
                }),
            } as ExecutionContext;

            expect(await guard.canActivate(context)).toBe(true);
        });

        it("should return false if user region does not match jeune region", async () => {
            const request = {
                user: { region: "testRegion", role: ROLES.REFERENT_REGION },
            };
            const jeune = { region: "differentRegion" };
            jest.spyOn(jeuneGuardService, "findJeune").mockResolvedValue(jeune as any);
            const context = {
                switchToHttp: () => ({
                    getRequest: () => request,
                }),
            } as ExecutionContext;

            expect(await guard.canActivate(context)).toBe(false);
        });

        it("should return false if user region matches jeune region but is a wrong role", async () => {
            const request = {
                user: { region: "testRegion", role: ROLES.VISITOR },
            };
            const jeune = { region: "testRegion" };
            jest.spyOn(jeuneGuardService, "findJeune").mockResolvedValue(jeune as any);
            const context = {
                switchToHttp: () => ({
                    getRequest: () => request,
                }),
            } as ExecutionContext;

            expect(await guard.canActivate(context)).toBe(false);
        });

        it("should add jeune to request object", async () => {
            const request = {
                user: { region: "testRegion" },
                params: { id: "testId" },
            } as any;
            const jeune = { id: "testId", region: "testRegion" };
            jest.spyOn(jeuneGuardService, "findJeune").mockResolvedValue(jeune as any);
            const context = {
                switchToHttp: () => ({
                    getRequest: () => request,
                }),
            } as ExecutionContext;

            expect(request.jeune).toBe(undefined);
            await guard.canActivate(context);
            expect(jeuneGuardService.findJeune).toHaveBeenCalledTimes(1);
            expect(request.jeune).toBe(jeune);
        });
    });
});
