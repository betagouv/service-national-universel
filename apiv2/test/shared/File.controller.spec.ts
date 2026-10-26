/**
 * Clé S3 arbitraire sur /v2/file (H79).
 *
 * La permission EXPORT:READ (accordée sans policy aux responsables, superviseurs,
 * administrateurs CLE et référents territoriaux) suffisait à télécharger n'importe quel objet
 * du bucket applicatif, ou à en obtenir une URL signée utilisable hors API. Le garde de
 * permission est ici volontairement ouvert : on vérifie le rattachement de la clé, pas la permission.
 */
import { INestApplication, Logger } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { ROLES } from "snu-lib";

import { PermissionGuard } from "@auth/infra/guard/Permissions.guard";
import { FileGateway } from "@shared/core/File.gateway";
import { AllExceptionsFilter } from "@shared/infra/AllExceptions.filter";
import { CorrelationIdMiddleware } from "@shared/infra/CorrelationId.middleware";
import { FileAccessService } from "@shared/infra/FileAccess.service";
import { FileController } from "@shared/infra/File.controller";
import { TaskGateway } from "@task/core/Task.gateway";

const CLE_AUTRE_PERIMETRE =
    "file/admin/sejours/phase1/affectation/6600000000000000000000ff/affectation-hts/affectation_2026-01-01T10-00-00.xlsx";

describe("FileController - rattachement de la clé", () => {
    let app: INestApplication;
    let utilisateurCourant: { id: string; role: string };

    const fileGateway = {
        downloadFile: jest.fn().mockResolvedValue({
            ContentType: "application/vnd.ms-excel",
            ContentLength: 10,
            FileName: "rapport.xlsx",
            Body: Buffer.from("xxxx"),
        }),
        remoteFileExists: jest.fn().mockResolvedValue(true),
        getFileSignedUrlFromKey: jest.fn().mockResolvedValue("https://cellar.example.org/signee"),
    };
    const taskGateway = { findByMetadata: jest.fn() };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [FileController],
            providers: [
                Logger,
                FileAccessService,
                { provide: FileGateway, useValue: fileGateway },
                { provide: TaskGateway, useValue: taskGateway },
            ],
        })
            .overrideGuard(PermissionGuard)
            .useValue({ canActivate: () => true })
            .compile();

        app = moduleFixture.createNestApplication({ logger: false });
        app.use((req, res, next) => new CorrelationIdMiddleware().use(req, res, next));
        app.use((req, _res, next) => {
            req.user = utilisateurCourant;
            next();
        });
        app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost), app.get(Logger)));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        utilisateurCourant = { id: "responsable-1", role: ROLES.RESPONSIBLE };
    });

    const tacheDe = (auteurId?: string) =>
        taskGateway.findByMetadata.mockImplementation(async (critere: Record<string, string>) =>
            Object.values(critere)[0] === CLE_AUTRE_PERIMETRE
                ? [{ id: "tache-1", metadata: { parameters: { auteur: { id: auteurId } } } }]
                : [],
        );

    it("refuse le téléchargement d'une clé qu'aucune tâche ne référence", async () => {
        taskGateway.findByMetadata.mockResolvedValue([]);

        await request(app.getHttpServer())
            .get("/file")
            .query({ key: "file/appelAProjet/2026-01-01-send-invitation-chef-etablissement.csv" })
            .expect(403);

        expect(fileGateway.downloadFile).not.toHaveBeenCalled();
    });

    it("refuse le rapport d'une tâche demandée par un autre référent", async () => {
        tacheDe("un-autre-referent");

        await request(app.getHttpServer()).get("/file").query({ key: CLE_AUTRE_PERIMETRE }).expect(403);

        expect(fileGateway.downloadFile).not.toHaveBeenCalled();
    });

    it("refuse l'URL signée d'une tâche demandée par un autre référent", async () => {
        tacheDe("un-autre-referent");

        await request(app.getHttpServer()).get("/file/signed-url").query({ key: CLE_AUTRE_PERIMETRE }).expect(403);

        expect(fileGateway.getFileSignedUrlFromKey).not.toHaveBeenCalled();
    });

    it("sert le rapport à l'auteur de l'export", async () => {
        tacheDe("responsable-1");

        await request(app.getHttpServer()).get("/file").query({ key: CLE_AUTRE_PERIMETRE }).expect(200);

        expect(fileGateway.downloadFile).toHaveBeenCalledWith(CLE_AUTRE_PERIMETRE);
    });

    it("sert l'URL signée à l'auteur de l'export", async () => {
        tacheDe("responsable-1");

        const reponse = await request(app.getHttpServer())
            .get("/file/signed-url")
            .query({ key: CLE_AUTRE_PERIMETRE })
            .expect(200);

        expect(reponse.body.url).toBe("https://cellar.example.org/signee");
    });

    it("laisse les fichiers publics accessibles", async () => {
        await request(app.getHttpServer())
            .get("/file/public")
            .query({ key: "public/snu-cle-model-import-liste-eleves.xlsx" })
            .expect(200);

        expect(fileGateway.downloadFile).toHaveBeenCalledWith("public/snu-cle-model-import-liste-eleves.xlsx");
    });

    it("refuse toujours une clé non publique sur la route publique", async () => {
        await request(app.getHttpServer()).get("/file/public").query({ key: CLE_AUTRE_PERIMETRE }).expect(403);

        expect(fileGateway.downloadFile).not.toHaveBeenCalled();
    });
});
