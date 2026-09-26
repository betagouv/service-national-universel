/**
 * PL16 (lot P32, audit du 25/09/2026) : originalUrl est journalisé sans redaction sur toutes les
 * routes apiv2, alors que le webhook Brevo (POST /v2/plan-marketing/import/webhook?token=<hmac>)
 * porte un jeton statique (HMAC du JWT_SECRET) dans sa query string. Contrairement à l'api v1
 * (loggingMiddleware.js, redactUrl), ce jeton finissait en clair dans les journaux à chaque rappel.
 */
import { Logger } from "@nestjs/common";
import { LoggerRequestMiddleware } from "./LoggerRequest.middleware";
import { CustomRequest } from "./CustomRequest";

describe("LoggerRequestMiddleware", () => {
    const buildRes = () => {
        let finishHandler: () => void = () => {};
        return {
            statusCode: 200,
            get: () => "0",
            on: (event: string, handler: () => void) => {
                if (event === "finish") finishHandler = handler;
            },
            emitFinish: () => finishHandler(),
        } as any;
    };

    it("redacte le jeton du webhook Brevo porté par la query string", () => {
        const logger = { log: jest.fn() } as unknown as Logger;
        const middleware = new LoggerRequestMiddleware(logger);
        const req = {
            method: "POST",
            originalUrl: "/v2/plan-marketing/import/webhook?token=abcdef0123456789abcdef0123456789", // gitleaks:allow (valeur factice de test)
            correlationId: "corr-1",
            user: undefined,
            get: () => "",
        } as unknown as CustomRequest;
        const res = buildRes();
        const next = jest.fn();

        middleware.use(req, res, next);
        expect(next).toHaveBeenCalled();
        res.emitFinish();

        expect(logger.log).toHaveBeenCalledTimes(1);
        const [message] = (logger.log as jest.Mock).mock.calls[0];
        expect(message).not.toContain("abcdef0123456789abcdef0123456789");
        expect(message).toContain("/v2/plan-marketing/import/webhook");
    });
});
