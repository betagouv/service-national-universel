import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { CampagneJeuneType } from "snu-lib";

import { CampagneController } from "@plan-marketing/infra/api/Campagne.controller";
import { CampagneService } from "@plan-marketing/core/service/Campagne.service";
import { CampagneGateway } from "@plan-marketing/core/gateway/Campagne.gateway";
import { MettreAJourCampagne } from "@plan-marketing/core/useCase/MettreAJourCampagne";
import { PreparerEnvoiCampagne } from "@plan-marketing/core/useCase/PreparerEnvoiCampagne";
import { BasculerArchivageCampagne } from "@plan-marketing/core/useCase/BasculerArchivageCampagne";
import { MettreAJourActivationProgrammationSpecifique } from "@plan-marketing/core/useCase/MettreAJourActivationProgrammationSpecifique";
import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";
import { pipesGlobaux } from "@shared/infra/ObjectIdParams.pipe";

/**
 * PC1 (mass assignment) : `create`/`update` acceptaient `CreateCampagneDto`/`UpdateCampagneDto`,
 * des unions de classes dont le métatype réfléchi est `Object` — le `ValidationPipe` ne les
 * validait jamais. `Campagne.validation.ts` choisit maintenant la classe concrète à la main
 * (GOO-90) : ce test le prouve à travers une vraie requête HTTP.
 */
describe("CampagneController - validation du corps (GOO-90)", () => {
    let app: INestApplication;

    const campagneService = { creerCampagne: jest.fn().mockResolvedValue({ id: "campagne-1" }) };
    const mettreAJourCampagne = { execute: jest.fn().mockResolvedValue({ id: "campagne-1" }) };

    const campagneGeneriqueValide = {
        nom: "Rappel J-7",
        objet: "Objet",
        templateId: 1,
        listeDiffusionId: "liste-1",
        destinataires: [],
        type: CampagneJeuneType.VOLONTAIRE,
        generic: true,
        isProgrammationActive: false,
        programmations: [],
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [CampagneController],
            providers: [
                { provide: CampagneGateway, useValue: {} },
                { provide: CampagneService, useValue: campagneService },
                { provide: MettreAJourCampagne, useValue: mettreAJourCampagne },
                { provide: PreparerEnvoiCampagne, useValue: { execute: jest.fn() } },
                { provide: BasculerArchivageCampagne, useValue: { execute: jest.fn() } },
                { provide: MettreAJourActivationProgrammationSpecifique, useValue: { execute: jest.fn() } },
            ],
        })
            .overrideGuard(SuperAdminGuard)
            .useValue({ canActivate: () => true })
            .compile();

        app = moduleFixture.createNestApplication({ logger: false });
        app.useGlobalPipes(...pipesGlobaux());
        await app.init();
    });

    afterEach(() => jest.clearAllMocks());
    afterAll(async () => await app.close());

    it("refuse un champ non déclaré à la création d'une campagne générique", async () => {
        await request(app.getHttpServer())
            .post("/campagne")
            .send({ ...campagneGeneriqueValide, role: "admin" })
            .expect(400);
        expect(campagneService.creerCampagne).not.toHaveBeenCalled();
    });

    it("accepte une campagne générique légitime à la création", async () => {
        await request(app.getHttpServer()).post("/campagne").send(campagneGeneriqueValide).expect(201);
        expect(campagneService.creerCampagne).toHaveBeenCalled();
    });

    it("refuse un champ non déclaré à la mise à jour", async () => {
        await request(app.getHttpServer())
            .put("/campagne/aaaaaaaaaaaaaaaaaaaaaaaa")
            .send({ id: "aaaaaaaaaaaaaaaaaaaaaaaa", ...campagneGeneriqueValide, role: "admin" })
            .expect(400);
        expect(mettreAJourCampagne.execute).not.toHaveBeenCalled();
    });

    it("accepte une mise à jour légitime", async () => {
        await request(app.getHttpServer())
            .put("/campagne/aaaaaaaaaaaaaaaaaaaaaaaa")
            .send({ id: "aaaaaaaaaaaaaaaaaaaaaaaa", ...campagneGeneriqueValide })
            .expect(200);
        expect(mettreAJourCampagne.execute).toHaveBeenCalled();
    });

    /**
     * Revue finale (GOO-90) — régression 1 : `CampagneSpecifiqueMapper.toUpdatePayload` (admin)
     * renvoie toujours `createdAt`/`updatedAt`/`envois`, absents des DTO de mise à jour. Avec
     * `forbidNonWhitelisted`, toute mise à jour de campagne spécifique 400ait en production.
     */
    it("accepte une mise à jour de campagne spécifique avec les champs réellement envoyés par l'admin (createdAt/updatedAt/envois)", async () => {
        await request(app.getHttpServer())
            .put("/campagne/aaaaaaaaaaaaaaaaaaaaaaaa")
            .send({
                id: "aaaaaaaaaaaaaaaaaaaaaaaa",
                nom: "Rappel J-7",
                type: CampagneJeuneType.VOLONTAIRE,
                listeDiffusionId: "liste-1",
                templateId: 1,
                objet: "Objet",
                destinataires: [],
                contexte: "",
                cohortId: "cohorte-1",
                generic: false,
                envois: [{ date: new Date().toISOString(), statut: "EN_ATTENTE" }],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isProgrammationActive: false,
                programmations: [],
            })
            .expect(200);
        expect(mettreAJourCampagne.execute).toHaveBeenCalled();
    });

    /**
     * Revue finale (GOO-90) — régression 2 : l'import d'une campagne générique dans une session
     * (`toCreatePayload`, branche avec référence) n'envoie jamais `programmations`. Le champ était
     * `@IsNotEmpty()` sans valeur par défaut : cette création 400ait en production.
     */
    it("accepte la création d'une campagne spécifique avec référence sans programmations (import depuis une campagne générique)", async () => {
        await request(app.getHttpServer())
            .post("/campagne")
            .send({ generic: false, cohortId: "cohorte-1", campagneGeneriqueId: "generique-1" })
            .expect(201);
        expect(campagneService.creerCampagne).toHaveBeenCalled();
    });
});
