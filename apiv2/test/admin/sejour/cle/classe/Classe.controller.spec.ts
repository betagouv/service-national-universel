import { INestApplication } from "@nestjs/common";
import { TestingModule } from "@nestjs/testing";
import { EmailTemplate } from "@notification/core/Notification";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { STATUS_CLASSE } from "snu-lib";
import { ReferentGateway } from "src/admin/core/iam/Referent.gateway";
import { ClasseGateway } from "src/admin/core/sejours/cle/classe/Classe.gateway";
import { ClasseController } from "src/admin/infra/sejours/cle/classe/api/Classe.controller";
import * as request from "supertest";
import { createReferent } from "../../../iam/ReferentHelper";
import { setupAdminTest } from "../../../setUpAdminTest";
import { createEtablissement } from "../EtablissementHelper";
import { createClasse } from "./ClasseHelper";
import mongoose from "mongoose";

describe("ClasseController", () => {
    let app: INestApplication;
    let classeController: ClasseController;
    let classeGateway: ClasseGateway;
    let mockedAddUserToRequestMiddleware;
    let module: TestingModule;
    let notificationGateway: NotificationGateway;
    let referentGateway: ReferentGateway;
    beforeAll(async () => {
        const appSetup = await setupAdminTest();
        app = appSetup.app;

        module = appSetup.adminTestModule;
        classeController = module.get<ClasseController>(ClasseController);
        classeGateway = module.get<ClasseGateway>(ClasseGateway);
        mockedAddUserToRequestMiddleware = jest.fn((req, res, next) => {
            req.user = {
                role: "admin",
                sousRole: "god",
            };
            next();
        });
        app.use(mockedAddUserToRequestMiddleware);

        notificationGateway = module.get<NotificationGateway>(NotificationGateway);
        referentGateway = module.get<ReferentGateway>(ReferentGateway);
        await app.init();
    });

    it("should be defined", () => {
        expect(classeController).toBeDefined();
    });

    it("/PUT classe/:id/verify should return 200", async () => {
        const referent = await createReferent({ email: "mon_ref@mail.com" });
        const etablissement = await createEtablissement({ referentEtablissementIds: [referent.id] });

        const createdClasse = await createClasse({
            nom: "Classe Test",
            statut: STATUS_CLASSE.CREATED,
            etablissementId: etablissement.id,
            referentClasseIds: [referent.id],
        });

        jest.spyOn(notificationGateway, "sendEmail").mockImplementation(() => Promise.resolve());

        const response = await request(app.getHttpServer()).put(`/classe/${createdClasse.id}/verify`);
        const updatedClasse = await classeGateway.findById(createdClasse.id);
        expect(updatedClasse.statut).toBe(STATUS_CLASSE.VERIFIED);
        const updatedReferent = await referentGateway.findById(referent.id);
        expect(updatedReferent.invitationToken).toHaveLength(36);
        expect(updatedReferent.invitationExpires).toBeTruthy();
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ statut: STATUS_CLASSE.VERIFIED });
        expect(notificationGateway.sendEmail).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                to: [{ email: "mon_ref@mail.com", name: "prenom nom" }],
                classeCode: expect.any(String),
                classeNom: "Classe Test",
                classeUrl: expect.stringMatching(/config.ADMIN_URL\/classes\/\w+/),
            }),
            EmailTemplate.VERIFIER_CLASSE_EMAIL_ADMIN_CLE,
        );
        expect(notificationGateway.sendEmail).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                to: [{ email: "mon_ref@mail.com", name: "prenom nom" }],
                classeNom: "Classe Test",
                classeCode: expect.any(String),
                etablissementEmail: referent.email,
                etablissementNom: expect.any(String),
                invitationUrl: expect.stringContaining("config.ADMIN_URL/creer-mon-compte?token="),
            }),
            EmailTemplate.INVITER_REFERENT_CLASSE_TO_INSCRIPTION,
        );
    });

    it("/PUT classe/:id/verify should throw an error for wrong statut", async () => {
        const referent = await createReferent();
        const etablissement = await createEtablissement({ referentEtablissementIds: [referent.id] });

        const createdClasse = await createClasse({
            nom: "Classe Test",
            statut: STATUS_CLASSE.ASSIGNED,
            etablissementId: etablissement.id,
        });

        jest.spyOn(notificationGateway, "sendEmail").mockImplementation(() => Promise.resolve());

        const response = await request(app.getHttpServer()).put(`/classe/${createdClasse.id}/verify`);
        const updatedClasse = await classeGateway.findById(createdClasse.id);
        expect(response.status).toBe(422);
        expect(updatedClasse.statut).toBe(STATUS_CLASSE.ASSIGNED);
    });
    it("/PUT classe/:id/verify should throw error for unknown classe", async () => {
        const classe = {
            id: "657b21cc848b66081224d90a",
            nom: "Classe Test",
        };
        const response = await request(app.getHttpServer()).put(`/classe/${classe.id}/verify`);

        expect(response.status).toBe(422);
    });

    it("/PUT classe/:id/verify should throw error for unauthorized user", async () => {
        const referent = await createReferent();
        const etablissement = await createEtablissement({ referentEtablissementIds: [referent.id] });

        const createdClasse = await createClasse({
            nom: "Classe Test",
            statut: STATUS_CLASSE.CREATED,
            etablissementId: etablissement.id,
        });

        mockedAddUserToRequestMiddleware.mockImplementationOnce((req, res, next) => {
            req.user = {
                role: "admin_cle",
            };
            next();
        });

        const response = await request(app.getHttpServer()).put(`/classe/${createdClasse.id}/verify`);

        expect(response.status).toBe(403);
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });
});