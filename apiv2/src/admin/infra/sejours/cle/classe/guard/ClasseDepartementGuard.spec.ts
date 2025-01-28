import { ExecutionContext, Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ClasseDepartementGuard } from "./ClasseDepartement.guard";
import { ClasseGuardService } from "./ClasseGuard.service";
import { ROLES } from "snu-lib";

describe("ClasseDepartement.guard", () => {
    let guard: ClasseDepartementGuard;
    let classeGuardService: ClasseGuardService;
    let logger: Logger;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClasseDepartementGuard,
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

        guard = module.get<ClasseDepartementGuard>(ClasseDepartementGuard);
        classeGuardService = module.get<ClasseGuardService>(ClasseGuardService);
        logger = module.get<Logger>(Logger);
    });

    it("should be defined", () => {
        expect(guard).toBeDefined();
    });

    describe("canActivate", () => {
        it("should return true if user departement matches classe departement && role is referent_departement", async () => {
            const request = {
                user: { departement: "testDepartement", role: ROLES.REFERENT_DEPARTMENT },
            };
            const classe = { departement: "testDepartement" };
            jest.spyOn(classeGuardService, "findClasse").mockResolvedValue(classe as any);
            const context = {
                switchToHttp: () => ({
                    getRequest: () => request,
                }),
            } as ExecutionContext;

            expect(await guard.canActivate(context)).toBe(true);
        });

        it("should return false if user departement matches classe departement but wrong role", async () => {
            const request = {
                user: { departement: "testDepartement", role: "wrongRole" },
            };
            const classe = { departement: "testDepartement" };
            jest.spyOn(classeGuardService, "findClasse").mockResolvedValue(classe as any);
            const context = {
                switchToHttp: () => ({
                    getRequest: () => request,
                }),
            } as ExecutionContext;

            expect(await guard.canActivate(context)).toBe(true);
        });

        it("should return false if user departement does not match classe departement", async () => {
            const request = {
                user: { departement: "testDepartement", role: ROLES.REFERENT_DEPARTMENT },
            };
            const classe = { departement: "differentDepartement" };
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
                user: { departement: "testDepartement" },
                params: { id: "testId" },
            } as any;
            const classe = { id: "testId", departement: "testDepartement" };
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
