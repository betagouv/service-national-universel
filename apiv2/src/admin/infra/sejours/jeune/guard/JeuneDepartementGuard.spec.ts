import { ExecutionContext, Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { JeuneDepartementGuard } from "./JeuneDepartement.guard";
import { JeuneGuardService } from "./JeuneGuard.service";
import { ROLES } from "snu-lib";

describe("JeuneDepartement.guard", () => {
    let guard: JeuneDepartementGuard;
    let jeuneGuardService: JeuneGuardService;
    let logger: Logger;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JeuneDepartementGuard,
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

        guard = module.get<JeuneDepartementGuard>(JeuneDepartementGuard);
        jeuneGuardService = module.get<JeuneGuardService>(JeuneGuardService);
        logger = module.get<Logger>(Logger);
    });

    it("should be defined", () => {
        expect(guard).toBeDefined();
    });

    describe("canActivate", () => {
        it("should return true if user departement matches jeune departement and role is referent_department", async () => {
            const request = {
                user: { departement: "testDepartement", role: ROLES.REFERENT_DEPARTMENT },
            };
            const jeune = { departement: "testDepartement" };
            jest.spyOn(jeuneGuardService, "findJeune").mockResolvedValue(jeune as any);
            const context = {
                switchToHttp: () => ({
                    getRequest: () => request,
                }),
            } as ExecutionContext;

            expect(await guard.canActivate(context)).toBe(true);
        });

        it("should return false if user departement does not match jeune departement", async () => {
            const request = {
                user: { departement: "testDepartement", role: ROLES.REFERENT_DEPARTMENT },
            };
            const jeune = { departement: "differentDepartement" };
            jest.spyOn(jeuneGuardService, "findJeune").mockResolvedValue(jeune as any);
            const context = {
                switchToHttp: () => ({
                    getRequest: () => request,
                }),
            } as ExecutionContext;

            expect(await guard.canActivate(context)).toBe(false);
        });

        it("should return false if user departement matches jeune departement but is wrong role", async () => {
            const request = {
                user: { departement: "testDepartement", role: "wrongRole" },
            };
            const jeune = { departement: "testDepartement" };
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
                user: { departement: "testDepartement" },
                params: { id: "testId" },
            } as any;
            const jeune = { id: "testId", departement: "testDepartement" };
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
