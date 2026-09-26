/**
 * Périmètre des listes de diffusion marketing (H76).
 *
 * `ListeDiffusionController` était monté sans aucun garde : tout compte référent authentifié
 * (RESPONSIBLE, VISITOR, REFERENT_CLASSE…) pouvait lire, modifier, archiver ou supprimer les
 * listes qui définissent le ciblage des campagnes emailing. Le contrôleur doit être réservé
 * aux super-administrateurs, comme `CampagneController`.
 */
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { ROLES, SUB_ROLE_GOD, SUB_ROLES } from "snu-lib";

import { ListeDiffusionController } from "@plan-marketing/infra/api/ListeDiffusion.controller";
import { ListeDiffusionService } from "@plan-marketing/core/service/ListeDiffusion.service";
import { BasculerArchivageListeDiffusion } from "@plan-marketing/core/useCase/BasculerArchivageListeDiffusion";
import { pipesGlobaux } from "@shared/infra/ObjectIdParams.pipe";

describe("ListeDiffusionController - habilitation", () => {
    let app: INestApplication;
    let utilisateurCourant: { role: string; sousRole?: string };

    const listeDiffusionService = {
        creerListeDiffusion: jest.fn().mockResolvedValue({ id: "liste-1" }),
        getListeDiffusionById: jest.fn().mockResolvedValue({ id: "liste-1" }),
        searchListesDiffusion: jest.fn().mockResolvedValue([]),
        updateListeDiffusion: jest.fn().mockResolvedValue({ id: "liste-1" }),
        deleteListeDiffusion: jest.fn().mockResolvedValue(undefined),
    };
    const basculerArchivage = { execute: jest.fn().mockResolvedValue({ id: "liste-1" }) };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [ListeDiffusionController],
            providers: [
                { provide: ListeDiffusionService, useValue: listeDiffusionService },
                { provide: BasculerArchivageListeDiffusion, useValue: basculerArchivage },
            ],
        }).compile();

        app = moduleFixture.createNestApplication({ logger: false });
        app.use((req, _res, next) => {
            req.user = utilisateurCourant;
            next();
        });
        app.useGlobalPipes(...pipesGlobaux());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe.each([
        [ROLES.RESPONSIBLE, undefined],
        [ROLES.VISITOR, undefined],
        [ROLES.REFERENT_CLASSE, undefined],
        [ROLES.REFERENT_DEPARTMENT, undefined],
        [ROLES.ADMIN, SUB_ROLES.manager_department],
    ])("un compte %s (sousRole %s) n'est pas super-administrateur", (role, sousRole) => {
        beforeEach(() => {
            utilisateurCourant = { role, sousRole };
        });

        it("ne peut pas lister les listes de diffusion", async () => {
            await request(app.getHttpServer()).get("/liste-diffusion").expect(403);
            expect(listeDiffusionService.searchListesDiffusion).not.toHaveBeenCalled();
        });

        it("ne peut pas modifier le ciblage d'une liste de diffusion", async () => {
            await request(app.getHttpServer())
                .put("/liste-diffusion/liste-1")
                .send({ nom: "detournee", filters: {} })
                .expect(403);
            expect(listeDiffusionService.updateListeDiffusion).not.toHaveBeenCalled();
        });

        it("ne peut pas supprimer une liste de diffusion", async () => {
            await request(app.getHttpServer()).delete("/liste-diffusion/liste-1").expect(403);
            expect(listeDiffusionService.deleteListeDiffusion).not.toHaveBeenCalled();
        });

        it("ne peut pas archiver une liste de diffusion", async () => {
            await request(app.getHttpServer()).post("/liste-diffusion/liste-1/toggle-archivage").expect(403);
            expect(basculerArchivage.execute).not.toHaveBeenCalled();
        });

        it("ne peut pas créer une liste de diffusion", async () => {
            await request(app.getHttpServer()).post("/liste-diffusion").send({ nom: "x" }).expect(403);
            expect(listeDiffusionService.creerListeDiffusion).not.toHaveBeenCalled();
        });
    });

    describe("un super-administrateur", () => {
        beforeEach(() => {
            utilisateurCourant = { role: ROLES.ADMIN, sousRole: SUB_ROLE_GOD };
        });

        it("garde l'accès aux listes de diffusion", async () => {
            await request(app.getHttpServer()).get("/liste-diffusion").expect(200);
            expect(listeDiffusionService.searchListesDiffusion).toHaveBeenCalled();
        });
    });

    /**
     * M81 : les filtres sont relus tels quels au moment de l'envoi des campagnes programmées
     * (requête ES sur l'index young). Seules les clés proposées par l'admin sont acceptées.
     */
    describe("validation des filtres de ciblage", () => {
        beforeEach(() => {
            utilisateurCourant = { role: ROLES.ADMIN, sousRole: SUB_ROLE_GOD };
        });

        const listeValide = { nom: "Liste", type: "Volontaires" };

        it("accepte les filtres proposés par l'admin", async () => {
            await request(app.getHttpServer())
                .post("/liste-diffusion")
                .send({
                    ...listeValide,
                    filters: { region: ["Bretagne"], status: ["VALIDATED"], isRegionRural: ["N/A"] },
                })
                .expect(201);
            expect(listeDiffusionService.creerListeDiffusion).toHaveBeenCalled();
        });

        it.each([
            ["une clé inconnue", { password: ["x"] }],
            ["un champ ES arbitraire", { "email.keyword": ["cible@example.com"] }],
            ["une valeur qui n'est pas une liste", { region: "Bretagne" }],
            ["une valeur non textuelle", { region: [{ $ne: null }] }],
            ["un tableau à la place d'un objet", [["region", "Bretagne"]]],
        ])("refuse %s à la création", async (_label, filters) => {
            await request(app.getHttpServer())
                .post("/liste-diffusion")
                .send({ ...listeValide, filters })
                .expect(400);
            expect(listeDiffusionService.creerListeDiffusion).not.toHaveBeenCalled();
        });

        it("refuse une clé inconnue à la modification", async () => {
            await request(app.getHttpServer())
                .put("/liste-diffusion/liste-1")
                .send({ id: "liste-1", nom: "Liste", filters: { password: ["x"] } })
                .expect(400);
            expect(listeDiffusionService.updateListeDiffusion).not.toHaveBeenCalled();
        });

        it("refuse un champ non déclaré à la création (mass assignment, GOO-90)", async () => {
            await request(app.getHttpServer())
                .post("/liste-diffusion")
                .send({ ...listeValide, filters: { region: ["Bretagne"] }, role: "admin" })
                .expect(400);
            expect(listeDiffusionService.creerListeDiffusion).not.toHaveBeenCalled();
        });

        it("refuse un champ non déclaré à la modification (mass assignment, GOO-90)", async () => {
            await request(app.getHttpServer())
                .put("/liste-diffusion/bbbbbbbbbbbbbbbbbbbbbbbb")
                .send({ id: "bbbbbbbbbbbbbbbbbbbbbbbb", nom: "Liste", filters: { region: ["Bretagne"] }, role: "admin" })
                .expect(400);
            expect(listeDiffusionService.updateListeDiffusion).not.toHaveBeenCalled();
        });
    });
});
