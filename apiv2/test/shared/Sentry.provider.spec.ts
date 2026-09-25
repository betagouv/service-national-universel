/**
 * Filet global de redaction côté Sentry (H78).
 *
 * `AllExceptionsFilter` n'est pas le seul appelant de Sentry dans apiv2 : un `captureException`
 * ou un breadcrumb posé ailleurs peut transporter un secret. On exige donc un `beforeSend`
 * de redaction au niveau de l'initialisation du SDK, comme le fait api/src/sentry.js.
 */
import { ConfigService } from "@nestjs/config";
import * as Sentry from "@sentry/nestjs";

import { SentryProvider } from "@infra/shared/Sentry.provider";

describe("SentryProvider - redaction avant envoi", () => {
    const configProduction = {
        get: (cle: string) =>
            ({
                environment: "production",
                "sentry.dsn": "https://clef@sentry.example.org/1",
                "sentry.debugMode": false,
                release: "test",
                "sentry.tracingSampleRate": 0,
            })[cle],
    } as unknown as ConfigService;

    let init: jest.SpyInstance;
    let infoLog: jest.SpyInstance;
    let log: jest.SpyInstance;

    beforeEach(() => {
        init = jest.spyOn(Sentry, "init").mockImplementation(() => undefined);
        infoLog = jest.spyOn(console, "info").mockImplementation(() => undefined);
        log = jest.spyOn(console, "log").mockImplementation(() => undefined);
    });

    afterEach(() => {
        init.mockRestore();
        infoLog.mockRestore();
        log.mockRestore();
    });

    const beforeSend = () => {
        (SentryProvider as any).useFactory(configProduction);
        expect(init).toHaveBeenCalledTimes(1);
        return init.mock.calls[0][0].beforeSend;
    };

    it("masque les secrets portés par un événement avant son envoi", () => {
        const evenement = beforeSend()({
            message: "erreur",
            extra: { headers: { authorization: "Bearer jeton-de-session" }, password: "Motdepasse!2026" },
        });

        expect(JSON.stringify(evenement)).not.toContain("jeton-de-session");
        expect(JSON.stringify(evenement)).not.toContain("Motdepasse!2026");
    });

    it("conserve l'événement pour le diagnostic", () => {
        const evenement = beforeSend()({ message: "erreur", extra: { correlationId: "abc-123" } });

        expect(evenement.extra.correlationId).toBe("abc-123");
    });
});
