import * as request from "supertest";

import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { TaskName, TaskStatus } from "snu-lib";

import { Phase1Controller } from "@admin/infra/sejours/phase1/api/Phase1.controller";
import { SupprimerPlanDeTransport } from "@admin/core/sejours/phase1/affectation/SupprimerPlanDeTransport";
import { SupprimerLigneDeBus } from "@admin/core/sejours/phase1/affectation/SupprimerLigneDeBus";
import { TaskGateway } from "@task/core/Task.gateway";

// M77 : les listings de tâches bornent le nom et le statut, et refusent toute clé hors DTO.
describe("Phase1Controller - validation de la query des listings de tâches", () => {
    let app: INestApplication;
    const taskGateway = { findByNames: jest.fn().mockResolvedValue([]), findById: jest.fn() };
    const sessionId = "6512a4b7c2f0e8a1b2c3d4e5";

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            controllers: [Phase1Controller],
            providers: [
                { provide: SupprimerPlanDeTransport, useValue: {} },
                { provide: SupprimerLigneDeBus, useValue: {} },
                { provide: TaskGateway, useValue: taskGateway },
            ],
        }).compile();

        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        app.use((req, _res, next) => {
            req.user = { role: "admin", sousRole: "god" };
            next();
        });
        await app.init();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await app.close();
    });

    it("accepte la requête du front, filtre vide compris", async () => {
        const response = await request(app.getHttpServer())
            .get(`/phase1/${sessionId}/simulations`)
            .query({ name: "", sort: "DESC" });

        expect(response.status).toBe(200);
        const [names, filter, sort] = taskGateway.findByNames.mock.calls[0];
        expect(names).toContain(TaskName.AFFECTATION_HTS_SIMULATION);
        expect(filter).toEqual({ "metadata.parameters.sessionId": sessionId });
        expect(sort).toBe("DESC");
    });

    it("accepte un nom de simulation et un statut connus", async () => {
        const response = await request(app.getHttpServer())
            .get(`/phase1/${sessionId}/simulations`)
            .query({ name: TaskName.AFFECTATION_HTS_SIMULATION, status: TaskStatus.COMPLETED });

        expect(response.status).toBe(200);
        expect(taskGateway.findByNames).toHaveBeenCalledWith(
            [TaskName.AFFECTATION_HTS_SIMULATION],
            { "metadata.parameters.sessionId": sessionId, status: TaskStatus.COMPLETED },
            undefined,
        );
    });

    it("refuse un nom de tâche hors des simulations", async () => {
        const response = await request(app.getHttpServer())
            .get(`/phase1/${sessionId}/simulations`)
            .query({ name: TaskName.JEUNE_EXPORT });

        expect(response.status).toBe(400);
        expect(taskGateway.findByNames).not.toHaveBeenCalled();
    });

    it("refuse un nom de simulation sur la liste des traitements", async () => {
        const response = await request(app.getHttpServer())
            .get(`/phase1/${sessionId}/traitements`)
            .query({ name: TaskName.AFFECTATION_HTS_SIMULATION });

        expect(response.status).toBe(400);
    });

    it("refuse un opérateur Mongo, une valeur multiple et un statut inconnu", async () => {
        for (const query of ["status[$ne]=x", "status=PENDING&status=COMPLETED", "status=NIMPORTE"]) {
            const response = await request(app.getHttpServer()).get(`/phase1/${sessionId}/traitements?${query}`);
            expect(response.status).toBe(400);
        }
        expect(taskGateway.findByNames).not.toHaveBeenCalled();
    });
});
