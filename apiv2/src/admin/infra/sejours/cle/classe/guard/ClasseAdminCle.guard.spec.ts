import { ExecutionContext } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { ClasseModel } from "src/admin/core/sejours/cle/classe/Classe.model";
import { EtablissementGateway } from "src/admin/core/sejours/cle/etablissement/Etablissement.gateway";
import { EtablissementModel } from "src/admin/core/sejours/cle/etablissement/Etablissement.model";
import { ClasseAdminCleGuard } from "./ClasseAdminCle.guard";
import { ClasseDepartementGuard } from "./ClasseDepartement.guard";
import { ClasseGuardService } from "./ClasseGuard.service";
import { ClasseRegionGuard } from "./ClasseRegion.guard";

describe("ClasseAdminCleGuard", () => {
    let guard: ClasseAdminCleGuard;
    let etablissementGateway: EtablissementGateway;
    let classeDepartementGuard: ClasseDepartementGuard;
    let classeRegionGuard: ClasseRegionGuard;
    let classeGuardService: ClasseGuardService;

    const mockEtablissementGateway = {
        findById: jest.fn(),
    };

    const mockClasseDepartementGuard = {
        canActivate: jest.fn(),
    };

    const mockClasseRegionGuard = {
        canActivate: jest.fn(),
    };

    const mockClasseGuardService = {
        findClasse: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClasseAdminCleGuard,
                { provide: EtablissementGateway, useValue: mockEtablissementGateway },
                { provide: ClasseDepartementGuard, useValue: mockClasseDepartementGuard },
                { provide: ClasseRegionGuard, useValue: mockClasseRegionGuard },
                { provide: ClasseGuardService, useValue: mockClasseGuardService },
            ],
        }).compile();

        guard = module.get<ClasseAdminCleGuard>(ClasseAdminCleGuard);
        etablissementGateway = module.get<EtablissementGateway>(EtablissementGateway);
        classeDepartementGuard = module.get<ClasseDepartementGuard>(ClasseDepartementGuard);
        classeRegionGuard = module.get<ClasseRegionGuard>(ClasseRegionGuard);
        classeGuardService = module.get<ClasseGuardService>(ClasseGuardService);
    });

    it("should be defined", () => {
        expect(guard).toBeDefined();
    });

    it("should return true if user is super admin", async () => {
        const mockRequest = {
            user: { role: "admin", sousRole: "god" },
        } as CustomRequest;
        const mockContext = {
            switchToHttp: () => ({
                getRequest: () => mockRequest,
            }),
        } as ExecutionContext;

        jest.spyOn(classeGuardService, "findClasse").mockResolvedValue({} as ClasseModel);
        const result = await guard.canActivate(mockContext);

        expect(result).toBe(true);
    });

    it("should return true if user is admin_cle and has necessary permissions", async () => {
        const mockEtablissement = {
            referentEtablissementIds: ["user_id"],
            coordinateurIds: ["user_id"],
        };
        const mockRequest = {
            user: { role: "admin_cle", id: "user_id" },
            classe: { etablissementId: "etablissement_id" },
        } as CustomRequest;
        const mockContext = {
            switchToHttp: () => ({
                getRequest: () => mockRequest,
            }),
        } as ExecutionContext;

        jest.spyOn(etablissementGateway, "findById").mockResolvedValue(mockEtablissement as EtablissementModel);
        jest.spyOn(classeGuardService, "findClasse").mockResolvedValue(mockRequest.classe);

        const result = await guard.canActivate(mockContext);

        expect(result).toBe(true);
    });

    it("should return true if classeDepartementGuard and classeRegionGuard can activate", async () => {
        const mockRequest = {
            user: { role: "other_role" },
            classe: { etablissementId: "etablissement_id" },
        } as CustomRequest;
        const mockContext = {
            switchToHttp: () => ({
                getRequest: () => mockRequest,
            }),
        } as ExecutionContext;

        jest.spyOn(classeGuardService, "findClasse").mockResolvedValue(mockRequest.classe);
        jest.spyOn(classeDepartementGuard, "canActivate").mockResolvedValue(true);
        jest.spyOn(classeRegionGuard, "canActivate").mockResolvedValue(true);

        const result = await guard.canActivate(mockContext);

        expect(result).toBe(true);
    });

    it("should return false if classeDepartementGuard cannot activate", async () => {
        const mockRequest = {
            user: { role: "other_role" },
            classe: { etablissementId: "etablissement_id" },
        } as CustomRequest;
        const mockContext = {
            switchToHttp: () => ({
                getRequest: () => mockRequest,
            }),
        } as ExecutionContext;

        jest.spyOn(classeGuardService, "findClasse").mockResolvedValue(mockRequest.classe);
        jest.spyOn(classeDepartementGuard, "canActivate").mockResolvedValue(false);
        jest.spyOn(classeRegionGuard, "canActivate").mockResolvedValue(true);

        const result = await guard.canActivate(mockContext);

        expect(result).toBe(false);
    });

    it("should return false if both classeDepartementGuard and classeRegionGuard cannot activate", async () => {
        const mockRequest = {
            user: { role: "other_role" },
            classe: { etablissementId: "etablissement_id" },
        } as CustomRequest;
        const mockContext = {
            switchToHttp: () => ({
                getRequest: () => mockRequest,
            }),
        } as ExecutionContext;

        jest.spyOn(classeGuardService, "findClasse").mockResolvedValue(mockRequest.classe);
        jest.spyOn(classeDepartementGuard, "canActivate").mockResolvedValue(false);
        jest.spyOn(classeRegionGuard, "canActivate").mockResolvedValue(false);

        const result = await guard.canActivate(mockContext);

        expect(result).toBe(false);
    });
});