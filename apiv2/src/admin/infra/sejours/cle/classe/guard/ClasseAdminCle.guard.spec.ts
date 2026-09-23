import { ExecutionContext } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { ClasseModel } from "@admin/core/sejours/cle/classe/Classe.model";
import { EtablissementGateway } from "@admin/core/sejours/cle/etablissement/Etablissement.gateway";
import { EtablissementModel } from "@admin/core/sejours/cle/etablissement/Etablissement.model";
import { ClasseAdminCleGuard } from "./ClasseAdminCle.guard";
import { ClasseDepartementGuard } from "./ClasseDepartement.guard";
import { ClasseGuardService } from "./ClasseGuard.service";
import { ClasseRegionGuard } from "./ClasseRegion.guard";
import { ROLES } from "snu-lib";

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

    it("should return true if user is admin", async () => {
        const mockRequest = {
            user: { role: ROLES.ADMIN },
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

    it("should return true if user is admin_cle (referentEtablissement) and has necessary permissions", async () => {
        const mockEtablissement = {
            referentEtablissementIds: ["referent_id"],
            coordinateurIds: ["coordinator_id"],
        };
        const mockRequest = {
            user: { role: ROLES.ADMINISTRATEUR_CLE, id: "referent_id" },
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

    it("should return true if user is admin_cle (coordinator) and has necessary permissions", async () => {
        const mockEtablissement = {
            referentEtablissementIds: ["referent_id"],
            coordinateurIds: ["coordinator_id"],
        };
        const mockRequest = {
            user: { role: ROLES.ADMINISTRATEUR_CLE, id: "coordinator_id" },
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
            user: { role: ROLES.REFERENT_DEPARTMENT },
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

    it("should return true if classeRegionGuard is true for a referent regional", async () => {
        const mockRequest = {
            user: { role: ROLES.REFERENT_REGION },
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

        expect(result).toBe(true);
    });

    it("should return false if both classeDepartementGuard and classeRegionGuard cannot activate", async () => {
        const mockRequest = {
            user: { role: ROLES.REFERENT_DEPARTMENT },
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

    /**
     * H75 : la voie géographique n'était conditionnée à aucun rôle. Tout compte authentifié
     * partageant la région de la classe (référent d'une autre classe, visiteur régional,
     * chef de centre…) franchissait le garde et pouvait alors remplacer le référent de la
     * classe, la faire passer en VERIFIED ou y inscrire des élèves.
     */
    describe("voie géographique réservée aux référents territoriaux (H75)", () => {
        const contextePour = (user: Record<string, unknown>, classe: Partial<ClasseModel>) => {
            const mockRequest = { user, classe } as unknown as CustomRequest;
            jest.spyOn(classeGuardService, "findClasse").mockResolvedValue(classe as ClasseModel);
            return {
                switchToHttp: () => ({ getRequest: () => mockRequest }),
            } as ExecutionContext;
        };

        beforeEach(() => {
            // Les gardes géographiques sont ici les vrais : on teste qui y a droit, pas leur contenu.
            jest.spyOn(classeDepartementGuard, "canActivate").mockResolvedValue(true);
            jest.spyOn(classeRegionGuard, "canActivate").mockResolvedValue(true);
        });

        it.each([
            [ROLES.REFERENT_CLASSE],
            [ROLES.VISITOR],
            [ROLES.HEAD_CENTER],
            [ROLES.RESPONSIBLE],
            [ROLES.SUPERVISOR],
            [ROLES.TRANSPORTER],
        ])("refuse un compte %s de la même région que la classe", async (role) => {
            const context = contextePour(
                { role, id: "attaquant", region: "Bretagne", departement: ["Finistère"] },
                { id: "classe-cible", region: "Bretagne", departement: "Finistère" },
            );

            expect(await guard.canActivate(context)).toBe(false);
        });

        it("autorise un référent régional sur une classe de sa région", async () => {
            const context = contextePour(
                { role: ROLES.REFERENT_REGION, id: "referent", region: "Bretagne" },
                { id: "classe-cible", region: "Bretagne", departement: "Finistère" },
            );

            expect(await guard.canActivate(context)).toBe(true);
        });

        it("autorise un référent départemental sur une classe de son département", async () => {
            const context = contextePour(
                { role: ROLES.REFERENT_DEPARTMENT, id: "referent", departement: ["Finistère"] },
                { id: "classe-cible", region: "Bretagne", departement: "Finistère" },
            );

            expect(await guard.canActivate(context)).toBe(true);
        });

        it("ne rattrape pas un référent départemental hors de son département par la voie régionale", async () => {
            jest.spyOn(classeDepartementGuard, "canActivate").mockResolvedValue(false);
            const context = contextePour(
                { role: ROLES.REFERENT_DEPARTMENT, id: "referent", region: "Bretagne", departement: ["Gironde"] },
                { id: "classe-cible", region: "Bretagne", departement: "Finistère" },
            );

            expect(await guard.canActivate(context)).toBe(false);
        });
    });
});
