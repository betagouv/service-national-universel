/**
 * Ce que le filtre d'exceptions écrit dans les journaux (GOO-158, PL16 / D-2).
 *
 * L'URL de la requête peut porter un jeton en query string (webhook Brevo du plan marketing) :
 * ni le journal d'erreur ni le message envoyé à Sentry ne doivent le contenir.
 */
import { Controller, Logger, Post } from "@nestjs/common";
import { INestApplication } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import * as Sentry from "@sentry/nestjs";
import * as request from "supertest";

import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { AllExceptionsFilter } from "@shared/infra/AllExceptions.filter";
import { CorrelationIdMiddleware } from "@shared/infra/CorrelationId.middleware";

const JETON_FACTICE = "jeton-factice-0123456789abcdef";

@Controller("plan-marketing")
class TestWebhookController {
    @Post("import/webhook")
    webhook() {
        throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND);
    }

    @Post("import/panne")
    panne() {
        throw new Error("panne inattendue");
    }
}

describe("AllExceptionsFilter - URL journalisée sans jeton", () => {
    let app: INestApplication;
    let loggerError: jest.SpyInstance;
    let captureMessage: jest.SpyInstance;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [TestWebhookController],
            providers: [Logger],
        }).compile();

        app = moduleFixture.createNestApplication({ logger: false });
        app.use((req, res, next) => new CorrelationIdMiddleware().use(req, res, next));
        app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost), app.get(Logger)));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        loggerError = jest.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
        captureMessage = jest.spyOn(Sentry, "captureMessage").mockImplementation(() => "event-id");
    });

    afterEach(() => {
        loggerError.mockRestore();
        captureMessage.mockRestore();
    });

    it("n'écrit pas le jeton de l'URL dans le journal d'erreur (exception fonctionnelle)", async () => {
        await request(app.getHttpServer()).post(`/plan-marketing/import/webhook?token=${JETON_FACTICE}`).expect(422);

        expect(loggerError).toHaveBeenCalled();
        expect(JSON.stringify(loggerError.mock.calls)).not.toContain(JETON_FACTICE);
    });

    it("n'écrit pas le jeton de l'URL dans le journal d'erreur ni vers Sentry (erreur inattendue)", async () => {
        await request(app.getHttpServer()).post(`/plan-marketing/import/panne?token=${JETON_FACTICE}`).expect(500);

        expect(loggerError).toHaveBeenCalled();
        expect(JSON.stringify(loggerError.mock.calls)).not.toContain(JETON_FACTICE);
        expect(captureMessage).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(captureMessage.mock.calls)).not.toContain(JETON_FACTICE);
    });

    it("garde la route dans le journal pour le diagnostic", async () => {
        await request(app.getHttpServer()).post(`/plan-marketing/import/webhook?token=${JETON_FACTICE}`).expect(422);

        expect(JSON.stringify(loggerError.mock.calls)).toContain("/plan-marketing/import/webhook");
    });
});
