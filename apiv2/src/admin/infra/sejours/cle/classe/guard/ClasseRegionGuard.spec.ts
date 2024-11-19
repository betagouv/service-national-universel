import { ExecutionContext, Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ClasseRegionGuard } from "./ClasseRegion.guard";
import { ClasseGuardService } from "./ClasseGuard.service";

describe("ClasseRegion.guard", () => {
    let guard: ClasseRegionGuard;
    let classeGuardService: ClasseGuardService;
    let logger: Logger;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClasseRegionGuard,
                {
                    provide: ClasseGuardService,
                    useValue: {
                        findClasse: jest.fn(),
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

        guard = module.get<ClasseRegionGuard>(ClasseRegionGuard);
        classeGuardService = module.get<ClasseGuardService>(ClasseGuardService);
        logger = module.get<Logger>(Logger);
    });

    it("should be defined", () => {
        expect(guard).toBeDefined();
    });

    describe("canActivate", () => {
        it("should return true if user region matches classe region", async () => {
            const request = {
                user: { region: "testRegion" },
            };
            const classe = { region: "testRegion" };
            jest.spyOn(classeGuardService, "findClasse").mockResolvedValue(classe as any);
            const context = {
                switchToHttp: () => ({
                    getRequest: () => request,
                }),
            } as ExecutionContext;

            expect(await guard.canActivate(context)).toBe(true);
        });

        it("should return false if user region does not match classe region", async () => {
            const request = {
                user: { region: "testRegion" },
            };
            const classe = { region: "differentRegion" };
            jest.spyOn(classeGuardService, "findClasse").mockResolvedValue(classe as any);
            const context = {
                switchToHttp: () => ({
                    getRequest: () => request,
                }),
            } as ExecutionContext;

            expect(await guard.canActivate(context)).toBe(false);
        });

        it("should add class to request object", async () => {
            const request = {
                user: { region: "testRegion" },
                params: { id: "testId" },
            } as any;
            const classe = { id: "testId", region: "testRegion" };
            jest.spyOn(classeGuardService, "findClasse").mockResolvedValue(classe as any);
            const context = {
                switchToHttp: () => ({
                    getRequest: () => request,
                }),
            } as ExecutionContext;

            expect(request.classe).toBe(undefined);
            await guard.canActivate(context);
            expect(classeGuardService.findClasse).toHaveBeenCalledTimes(1);
            expect(request.classe).toBe(classe);
        });

        it("should call classeGuardService.findClasse once per request", async () => {});
    });
});
