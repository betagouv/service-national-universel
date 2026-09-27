import { Logger } from "@nestjs/common";
import { LoggerRequestMiddleware } from "./LoggerRequest.middleware";
import { CustomRequest } from "./CustomRequest";

// PL16 (audit du 25/09/2026, régression H77) : ce middleware, monté sur toutes les routes,
// journalisait req.originalUrl brut — donc, entre autres, le jeton HMAC du webhook Brevo porté
// par POST /v2/plan-marketing/import/webhook?token=<hmac>, en clair dans les logs apiv2.
describe("LoggerRequestMiddleware", () => {
    it("journalise l'URL redactée, pas l'URL brute (token de webhook en query string)", () => {
        const logger = { log: jest.fn() } as unknown as Logger;
        const middleware = new LoggerRequestMiddleware(logger);

        const req = {
            method: "POST",
            originalUrl: "/v2/plan-marketing/import/webhook?token=abcd1234efgh5678", // gitleaks:allow
            correlationId: "corr-1",
            user: undefined,
            get: jest.fn().mockReturnValue("test-agent"),
        } as unknown as CustomRequest;

        let finishHandler: () => void = () => {};
        const res = {
            on: jest.fn((event, handler) => {
                if (event === "finish") finishHandler = handler;
            }),
            get: jest.fn().mockReturnValue("10"),
            statusCode: 200,
        } as any;

        middleware.use(req, res, jest.fn());
        finishHandler();

        expect(logger.log).toHaveBeenCalledTimes(1);
        const [message] = (logger.log as jest.Mock).mock.calls[0];
        expect(message).not.toContain("abcd1234efgh5678");
        expect(message).toContain("/v2/plan-marketing/import/webhook?token=**********");
    });
});
