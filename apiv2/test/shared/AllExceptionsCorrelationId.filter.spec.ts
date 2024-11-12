// test/all-exceptions-filter.e2e-spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, Controller, Get, UseFilters } from "@nestjs/common";
import * as request from "supertest";
import { AllExceptionsFilter } from "../../src/shared/infra/AllExceptions.filter";
import { HttpAdapterHost } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { CorrelationIdMiddleware } from "@shared/infra/CorrelationId.middleware";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

@Controller("test")
@UseFilters(AllExceptionsFilter)
class TestController {
    @Get("error")
    throwError() {
        throw new Error("Test error");
    }

    @Get("error422")
    throwError422() {
        throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
    }

    @Get("ok")
    ok() {
        return;
    }
}

describe("AllExceptionsFilter", () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [TestController],
            providers: [Logger, CorrelationIdMiddleware],
        }).compile();

        app = moduleFixture.createNestApplication({ logger: false });
        const httpAdapterHost = app.get(HttpAdapterHost);
        const logger = app.get(Logger);

        app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, logger));
        app.use((req, res, next) => {
            new CorrelationIdMiddleware().use(req, res, next);
        });
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it("should return a custom error response", async () => {
        const response = await request(app.getHttpServer()).get("/test/error").send().expect(500);

        expect(response.body).toBeDefined();
        expect(response.body).toEqual({
            message: "Internal Server Error",
            statusCode: 500,
            correlationId: expect.any(String),
        });
    });

    it("should return a custom error response", async () => {
        const response = await request(app.getHttpServer()).get("/test/error422").send().expect(422);

        expect(response.body).toBeDefined();
        expect(response.body).toEqual({
            message: FunctionalExceptionCode.NOT_FOUND,
            statusCode: 422,
            correlationId: expect.any(String),
        });
    });

    it("should return 200 OK for /test/ok", async () => {
        const response = await request(app.getHttpServer()).get("/test/ok").send().expect(200);

        expect(response.body).toBeDefined();
        expect(response.body).toEqual({});
    });
});
