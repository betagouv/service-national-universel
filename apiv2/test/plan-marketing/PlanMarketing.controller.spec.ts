/**
 * Import de liste de diffusion déprécié (M82).
 *
 * `POST /plan-marketing/liste-diffusion` lit le fichier `pathFile` dans le bucket et l'envoie
 * à Brevo. Il était ouvert à tout ADMIN avec un chemin libre : n'importe quel objet du bucket
 * pouvait partir chez Brevo. La route est réservée aux super-administrateurs (comme l'upload
 * api v1 qui dépose le CSV) et le chemin est borné aux CSV de l'import marketing.
 */
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { ROLES, SUB_ROLE_GOD, SUB_ROLES } from "snu-lib";

import { PlanMarketingController } from "@plan-marketing/infra/api/PlanMarketing.controller";
import { ImporterEtCreerListeDiffusion } from "@plan-marketing/core/useCase/ImporterEtCreerListeDiffusion";
import { PlanMarketingActionSelectorService } from "@plan-marketing/core/PlanMarketingActionSelector.service";
import { BrevoWebhookGuard } from "@plan-marketing/infra/guard/BrevoWebhook.guard";

describe("PlanMarketingController - import de liste de diffusion", () => {
    let app: INestApplication;
    let utilisateurCourant: { role: string; sousRole?: string };

    const importer = { execute: jest.fn().mockResolvedValue(undefined) };
    const payloadValide = {
        nom: "Liste",
        campagneId: "12",
        pathFile: "plan-marketing/liste_2026-09-23T10-00-00-000Z.csv",
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [PlanMarketingController],
            providers: [
                { provide: ImporterEtCreerListeDiffusion, useValue: importer },
                { provide: PlanMarketingActionSelectorService, useValue: { selectAction: jest.fn() } },
            ],
        })
            .overrideGuard(BrevoWebhookGuard)
            .useValue({ canActivate: () => false })
            .compile();

        app = moduleFixture.createNestApplication({ logger: false });
        app.use((req, _res, next) => {
            req.user = utilisateurCourant;
            next();
        });
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.each([
        [ROLES.ADMIN, SUB_ROLES.manager_department],
        [ROLES.ADMIN, undefined],
        [ROLES.REFERENT_DEPARTMENT, undefined],
        [ROLES.RESPONSIBLE, undefined],
    ])("refuse un compte %s (sousRole %s) qui n'est pas super-administrateur", async (role, sousRole) => {
        utilisateurCourant = { role, sousRole };
        await request(app.getHttpServer()).post("/plan-marketing/liste-diffusion").send(payloadValide).expect(403);
        expect(importer.execute).not.toHaveBeenCalled();
    });

    describe("un super-administrateur", () => {
        beforeEach(() => {
            utilisateurCourant = { role: ROLES.ADMIN, sousRole: SUB_ROLE_GOD };
        });

        it("importe un CSV déposé par l'import marketing", async () => {
            await request(app.getHttpServer()).post("/plan-marketing/liste-diffusion").send(payloadValide).expect(201);
            expect(importer.execute).toHaveBeenCalledWith(
                payloadValide.nom,
                payloadValide.campagneId,
                payloadValide.pathFile,
            );
        });

        it.each([
            "file/young/123/cniFiles/abc",
            "plan-marketing/../file/young/123/cni.csv",
            "plan-marketing/sous-dossier/liste.csv",
            "plan-marketing/liste.pdf",
            "autre/plan-marketing/liste.csv",
            "plan-marketing/liste.csv\nfile/young/123",
        ])("refuse le chemin %p", async (pathFile) => {
            await request(app.getHttpServer())
                .post("/plan-marketing/liste-diffusion")
                .send({ ...payloadValide, pathFile })
                .expect(400);
            expect(importer.execute).not.toHaveBeenCalled();
        });
    });
});
