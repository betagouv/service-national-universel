import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { ConfigModule } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import { HealthCheckController } from "../../src/infra/HealthCheck.controller";

describe("HealthCheckController", () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [() => ({ release: "test-version" })],
                }),
            ],
            controllers: [HealthCheckController],
            providers: [Logger],
        }).compile();

        app = moduleFixture.createNestApplication({ logger: false });
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe("GET /health", () => {
        it("should return 200 when application is live", async () => {
            const response = await request(app.getHttpServer()).get("/health").expect(200);

            expect(response.body).toBeDefined();
            expect(response.body).toEqual({
                status: "healthy",
                timestamp: expect.any(String),
            });
        });
    });

    describe("GET /testsentry", () => {
        it("n'existe plus : levait une 500 et un événement Sentry à la demande, sans authentification", async () => {
            await request(app.getHttpServer()).get("/testsentry").expect(404);
        });
    });
});
