/**
 * PL15 (GOO-158) : `PUT /campagne/:id` avec un `id` de corps qui n'est pas un ObjectId valide
 * levait une CastError mongoose : 500 et événement Sentry à chaque appel. On attend une erreur
 * fonctionnelle (422), sans événement Sentry, et sans interroger la base.
 */
import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";
import { INestApplication, Logger } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import * as Sentry from "@sentry/nestjs";
import * as request from "supertest";
import { CampagneJeuneType } from "snu-lib";

import { CampagneGateway } from "@plan-marketing/core/gateway/Campagne.gateway";
import { CampagneService } from "@plan-marketing/core/service/Campagne.service";
import { BasculerArchivageCampagne } from "@plan-marketing/core/useCase/BasculerArchivageCampagne";
import { MettreAJourActivationProgrammationSpecifique } from "@plan-marketing/core/useCase/MettreAJourActivationProgrammationSpecifique";
import { MettreAJourCampagne } from "@plan-marketing/core/useCase/MettreAJourCampagne";
import { PreparerEnvoiCampagne } from "@plan-marketing/core/useCase/PreparerEnvoiCampagne";
import { CampagneController } from "@plan-marketing/infra/api/Campagne.controller";
import { AllExceptionsFilter } from "@shared/infra/AllExceptions.filter";
import { CorrelationIdMiddleware } from "@shared/infra/CorrelationId.middleware";
import { pipesGlobaux } from "@shared/infra/ObjectIdParams.pipe";

describe("CampagneController - PUT /:id avec un identifiant de corps invalide (GOO-158, PL15)", () => {
    let app: INestApplication;
    let captureMessage: jest.SpyInstance;
    const campagneGateway = { findById: jest.fn(), update: jest.fn() };

    const corpsGenerique = (id: string) => ({
        id,
        nom: "Rappel J-7",
        objet: "Objet",
        templateId: 1,
        listeDiffusionId: "liste-1",
        destinataires: [],
        type: CampagneJeuneType.VOLONTAIRE,
        generic: true,
        isProgrammationActive: false,
        programmations: [],
    });

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [CampagneController],
            providers: [
                Logger,
                { provide: CampagneGateway, useValue: campagneGateway },
                {
                    provide: CampagneService,
                    useFactory: () =>
                        new CampagneService(
                            campagneGateway as any,
                            {} as any,
                            {} as any,
                            {} as any,
                            {} as any,
                            {} as any,
                        ),
                },
                {
                    provide: MettreAJourCampagne,
                    useFactory: (service: CampagneService) => new MettreAJourCampagne(service),
                    inject: [CampagneService],
                },
                { provide: PreparerEnvoiCampagne, useValue: { execute: jest.fn() } },
                { provide: BasculerArchivageCampagne, useValue: { execute: jest.fn() } },
                { provide: MettreAJourActivationProgrammationSpecifique, useValue: { execute: jest.fn() } },
            ],
        })
            .overrideGuard(SuperAdminGuard)
            .useValue({ canActivate: () => true })
            .compile();

        app = moduleFixture.createNestApplication({ logger: false });
        app.use((req, res, next) => new CorrelationIdMiddleware().use(req, res, next));
        app.useGlobalPipes(...pipesGlobaux());
        app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost), app.get(Logger)));
        await app.init();
    });

    beforeEach(() => {
        campagneGateway.findById.mockImplementation(async (id: string) => {
            if (!/^[0-9a-fA-F]{24}$/.test(id)) throw new Error(`Cast to ObjectId failed for value "${id}"`);
            return null;
        });
        captureMessage = jest.spyOn(Sentry, "captureMessage").mockImplementation(() => "event-id");
        jest.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    afterAll(async () => await app.close());

    it("répond une erreur fonctionnelle (422), pas une 500", async () => {
        await request(app.getHttpServer())
            .put("/campagne/aaaaaaaaaaaaaaaaaaaaaaaa")
            .send(corpsGenerique("zzz"))
            .expect(422);
    });

    it("n'envoie aucun événement Sentry", async () => {
        await request(app.getHttpServer())
            .put("/campagne/aaaaaaaaaaaaaaaaaaaaaaaa")
            .send(corpsGenerique("zzz"))
            .expect(422);

        expect(captureMessage).not.toHaveBeenCalled();
    });

    it("ne fait pas de mise à jour", async () => {
        await request(app.getHttpServer())
            .put("/campagne/aaaaaaaaaaaaaaaaaaaaaaaa")
            .send(corpsGenerique("zzz"))
            .expect(422);

        expect(campagneGateway.update).not.toHaveBeenCalled();
    });
});
