/**
 * Garde départemental des classes (H75).
 *
 * `request.user.departement` est un tableau (`department: [String]` au schéma) : la comparaison
 * d'égalité stricte avec la chaîne `classe.departement` était toujours fausse, si bien que seule
 * la voie régionale — beaucoup plus large — laissait passer les référents départementaux.
 */
import { ExecutionContext, Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ClasseModel } from "@admin/core/sejours/cle/classe/Classe.model";
import { ClasseDepartementGuard } from "./ClasseDepartement.guard";
import { ClasseGuardService } from "./ClasseGuard.service";

describe("ClasseDepartementGuard", () => {
    let guard: ClasseDepartementGuard;

    const classeGuardService = { findClasse: jest.fn() };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClasseDepartementGuard,
                { provide: ClasseGuardService, useValue: classeGuardService },
                { provide: Logger, useValue: { log: jest.fn() } },
            ],
        }).compile();

        guard = module.get<ClasseDepartementGuard>(ClasseDepartementGuard);
    });

    const contextePour = (departementsUtilisateur: string[] | undefined, departementClasse: string) => {
        const classe = { id: "classe-1", departement: departementClasse } as ClasseModel;
        classeGuardService.findClasse.mockResolvedValue(classe);
        return {
            switchToHttp: () => ({
                getRequest: () => ({ user: { id: "referent", departement: departementsUtilisateur }, classe }),
            }),
        } as ExecutionContext;
    };

    it("autorise un référent dont le département couvre la classe", async () => {
        expect(await guard.canActivate(contextePour(["Finistère"], "Finistère"))).toBe(true);
    });

    it("autorise un référent multi-départements sur l'un de ses départements", async () => {
        expect(await guard.canActivate(contextePour(["Morbihan", "Finistère"], "Finistère"))).toBe(true);
    });

    it("refuse un département hors du périmètre du référent", async () => {
        expect(await guard.canActivate(contextePour(["Morbihan"], "Finistère"))).toBe(false);
    });

    it("refuse un référent sans département", async () => {
        expect(await guard.canActivate(contextePour(undefined, "Finistère"))).toBe(false);
    });
});
