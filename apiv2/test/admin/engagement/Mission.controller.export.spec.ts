import * as request from "supertest";

import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { ROLES, TaskName, TaskStatus } from "snu-lib";

import { MissionController } from "@admin/infra/engagement/mission/api/Mission.controller";
import { TaskGateway } from "@task/core/Task.gateway";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { ReferentRegionalGuard } from "@admin/infra/iam/guard/ReferentRegional.guard";
import { ReferentDepartementalGuard } from "@admin/infra/iam/guard/ReferentDepartemental.guard";
import { ResponsableGuard } from "@admin/infra/iam/guard/Responsable.guard";
import { SupervisorGuard } from "@admin/infra/iam/guard/Superviseur.guard";
import { pipesGlobaux } from "@shared/infra/ObjectIdParams.pipe";

// L39 : le nombre d'exports missions / candidatures non terminés est borné par utilisateur.
describe("MissionController - exports en attente", () => {
    let app: INestApplication;
    const taskGateway = {
        findByNames: jest.fn(),
        create: jest
            .fn()
            .mockImplementation((task) =>
                Promise.resolve({ ...task, id: "task-1", createdAt: new Date(), updatedAt: new Date() }),
            ),
    };
    const payload = { filters: { status: ["VALIDATED"] }, fields: ["name"] };
    const tache = (status: TaskStatus, createdAt = new Date()) => ({
        id: `t-${Math.random()}`,
        name: TaskName.MISSION_EXPORT,
        status,
        createdAt,
    });

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            controllers: [MissionController],
            providers: [
                { provide: TaskGateway, useValue: taskGateway },
                AdminGuard,
                ReferentRegionalGuard,
                ReferentDepartementalGuard,
                ResponsableGuard,
                SupervisorGuard,
            ],
        }).compile();

        app = module.createNestApplication();
        app.useGlobalPipes(...pipesGlobaux());
        app.use((req, _res, next) => {
            req.user = { id: "ref-1", role: ROLES.ADMIN };
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

    it("accepte un export quand peu d'exports sont en cours", async () => {
        taskGateway.findByNames.mockResolvedValueOnce([tache(TaskStatus.PENDING), tache(TaskStatus.COMPLETED)]);

        const response = await request(app.getHttpServer()).post("/mission/export").send(payload);

        expect(response.status).toBe(201);
        expect(taskGateway.findByNames).toHaveBeenCalledWith(
            [TaskName.MISSION_EXPORT, TaskName.MISSION_EXPORT_CANDIDATURES],
            { "metadata.parameters.auteur.id": "ref-1" },
            "DESC",
            20,
        );
        expect(taskGateway.create).toHaveBeenCalled();
    });

    it("refuse un nouvel export au-delà de la limite", async () => {
        taskGateway.findByNames.mockResolvedValueOnce([
            tache(TaskStatus.PENDING),
            tache(TaskStatus.IN_PROGRESS),
            tache(TaskStatus.PENDING),
        ]);

        const response = await request(app.getHttpServer()).post("/mission/candidatures/export").send(payload);

        expect(response.status).toBe(422);
        expect(response.body.message).toBe("TOO_MANY_PENDING_EXPORTS");
        expect(taskGateway.create).not.toHaveBeenCalled();
    });

    it("refuse une clé de filtre inconnue ou une valeur non textuelle", async () => {
        taskGateway.findByNames.mockResolvedValue([]);
        const payloads = [
            { ...payload, filters: { "tutor.email.keyword": ["x@y.fr"] } },
            { ...payload, filters: { status: [{ $ne: "x" }] } },
            { ...payload, filters: { status: { script: "x" } } },
        ];
        for (const body of payloads) {
            const response = await request(app.getHttpServer()).post("/mission/candidatures/export").send(body);
            expect(response.status).toBe(400);
        }
        expect(taskGateway.create).not.toHaveBeenCalled();
    });

    it("accepte les filtres envoyés par la liste des missions", async () => {
        taskGateway.findByNames.mockResolvedValueOnce([]);
        const response = await request(app.getHttpServer())
            .post("/mission/export")
            .send({
                ...payload,
                filters: { region: [], department: ["75"], applicationStatus: ["WAITING_VALIDATION"], fromDate: [] },
            });
        expect(response.status).toBe(201);
    });

    it("ignore les tâches restées bloquées depuis plus de 24 h", async () => {
        const avantHier = new Date(Date.now() - 48 * 60 * 60 * 1000);
        taskGateway.findByNames.mockResolvedValueOnce([
            tache(TaskStatus.PENDING, avantHier),
            tache(TaskStatus.PENDING, avantHier),
            tache(TaskStatus.PENDING, avantHier),
        ]);

        const response = await request(app.getHttpServer()).post("/mission/export").send(payload);

        expect(response.status).toBe(201);
    });
});
