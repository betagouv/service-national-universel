/**
 * Ce que le filtre d'exception envoie à Sentry (H78).
 *
 * `AllExceptionsFilter.procesAlert` transmettait `request.headers` (donc l'en-tête
 * `Authorization` porteur d'un JWT de session encore valide, et les cookies) ainsi que
 * `request.body` brut (mots de passe, PII de jeunes, contacts plan marketing) pour toute
 * réponse dont le statut n'est ni 401 ni 422 — un simple 403 de garde suffisait.
 *
 * On vérifie ici sur l'événement réellement remis à Sentry : aucun secret ne doit y figurer,
 * et les informations de diagnostic utiles (route, méthode, statut, correlationId) doivent rester.
 */
import { Body, Controller, ForbiddenException, INestApplication, Logger, Post } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import * as Sentry from "@sentry/nestjs";
import * as request from "supertest";

import { AllExceptionsFilter } from "@shared/infra/AllExceptions.filter";
import { CorrelationIdMiddleware } from "@shared/infra/CorrelationId.middleware";

// Jeton fabriqué pour le test, signé par personne. gitleaks:allow
const JETON_DE_SESSION = "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjY2MDAwMDAwMDAwMDAwMDAwMDAwMDBhYSJ9.signature-secrete"; // gitleaks:allow

@Controller("test-sentry")
class TestSentryController {
    @Post("interdit")
    interdit(@Body() _body: unknown) {
        throw new ForbiddenException();
    }
}

describe("AllExceptionsFilter - ce qui part vers Sentry", () => {
    let app: INestApplication;
    let captureMessage: jest.SpyInstance;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [TestSentryController],
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
        captureMessage = jest.spyOn(Sentry, "captureMessage").mockImplementation(() => "event-id");
    });

    afterEach(() => {
        captureMessage.mockRestore();
    });

    const declencher403 = () =>
        request(app.getHttpServer())
            .post("/test-sentry/interdit")
            .set("Authorization", `Bearer ${JETON_DE_SESSION}`)
            .set("Cookie", "jwt=cookie-de-session")
            .send({
                email: "jean.dupont@example.org",
                password: "Motdepasse!2026",
                invitationToken: "jeton-d-invitation",
                nom: "Dupont",
            })
            .expect(403);

    const evenementSerialise = () => {
        expect(captureMessage).toHaveBeenCalledTimes(1);
        return JSON.stringify(captureMessage.mock.calls[0]);
    };

    it("n'envoie pas l'en-tête Authorization du demandeur", async () => {
        await declencher403();
        const evenement = evenementSerialise();
        expect(evenement).not.toContain(JETON_DE_SESSION);
        expect(evenement.toLowerCase()).not.toContain("authorization");
    });

    it("n'envoie pas les cookies du demandeur", async () => {
        await declencher403();
        expect(evenementSerialise()).not.toContain("cookie-de-session");
    });

    it("n'envoie pas le mot de passe ni les jetons du corps de la requête", async () => {
        await declencher403();
        const evenement = evenementSerialise();
        expect(evenement).not.toContain("Motdepasse!2026");
        expect(evenement).not.toContain("jeton-d-invitation");
    });

    it("n'envoie pas l'email en clair du corps de la requête", async () => {
        await declencher403();
        expect(evenementSerialise()).not.toContain("jean.dupont@example.org");
    });

    it("conserve les informations de diagnostic", async () => {
        await declencher403();
        const [message, contexte] = captureMessage.mock.calls[0];
        expect(message).toContain("403");
        expect(message).toContain("POST");
        expect(contexte.extra.request.correlationId).toEqual(expect.any(String));
        expect(contexte.extra.request.originalUrl).toBe("/test-sentry/interdit");
    });
});
