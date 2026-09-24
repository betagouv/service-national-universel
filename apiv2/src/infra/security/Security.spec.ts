import * as express from "express";
import * as request from "supertest";
import * as basicAuth from "express-basic-auth";
import { MemoryStore } from "express-rate-limit";

import { hostGuard, hotesAutorises } from "./HostGuard";
import { RATE_LIMITS, estRouteCouteuse, rateLimiter } from "./RateLimit";
import { bullBoardIpAllowlist, masquerSecrets } from "./BullBoardSecurity";

describe("HostGuard (L46)", () => {
    const app = express();
    app.use(hostGuard(hotesAutorises("https://api.snu.gouv.fr/v2", "api-bis.snu.gouv.fr")));
    app.use((_req, res) => res.json({ ok: true }));

    it("accepte l'hôte de APIV2_URL, avec ou sans port", async () => {
        await request(app).get("/v2/referent").set("Host", "api.snu.gouv.fr").expect(200);
        await request(app).get("/v2/referent").set("Host", "API.snu.gouv.fr:443").expect(200);
    });

    it("accepte les hôtes supplémentaires", async () => {
        await request(app).post("/v2/jeune/export").set("Host", "api-bis.snu.gouv.fr").expect(200);
    });

    it("refuse l'origine Clever Cloud en 421", async () => {
        const res = await request(app).get("/v2/referent").set("Host", "app-1234.cleverapps.io").expect(421);
        expect(res.body.code).toBe("MISDIRECTED_REQUEST");
    });

    it("laisse passer les sondes de disponibilité", async () => {
        await request(app).get("/").set("Host", "127.0.0.1:3001").expect(200);
        await request(app).get("/v2/health").set("Host", "127.0.0.1:3001").expect(200);
        await request(app).post("/").set("Host", "127.0.0.1:3001").expect(421);
    });
});

describe("RateLimit (M80)", () => {
    it("identifie les routes coûteuses", () => {
        const req = (method: string, path: string) => ({ method, path }) as express.Request;
        expect(estRouteCouteuse(req("POST", "/v2/jeune/export"))).toBe(true);
        expect(estRouteCouteuse(req("POST", "/v2/inscription/export/scolarises"))).toBe(true);
        expect(estRouteCouteuse(req("POST", "/v2/affectation/abc/simulation/hts"))).toBe(true);
        expect(estRouteCouteuse(req("POST", "/v2/affectation/abc/simulation/t1/valider/cle"))).toBe(true);
        expect(estRouteCouteuse(req("POST", "/v2/referentiel/import/ROUTES"))).toBe(true);
        expect(estRouteCouteuse(req("GET", "/v2/phase1/abc/simulations"))).toBe(false);
        expect(estRouteCouteuse(req("POST", "/v2/plan-marketing/import/webhook"))).toBe(false);
        expect(estRouteCouteuse(req("POST", "/v2/mission/exporter-quelque-chose"))).toBe(false);
    });

    it("renvoie 429 au-delà du quota des routes coûteuses, sans brider les autres", async () => {
        const app = express();
        app.use(
            rateLimiter({
                store: new MemoryStore(),
                ...RATE_LIMITS.couteux,
                skip: (req) => !estRouteCouteuse(req),
            }),
        );
        app.use((_req, res) => res.json({ ok: true }));

        for (let i = 0; i < RATE_LIMITS.couteux.limit; i++) {
            await request(app).post("/v2/jeune/export").expect(200);
        }
        const res = await request(app).post("/v2/jeune/export").expect(429);
        expect(res.body.code).toBe("TOO_MANY_REQUESTS");
        await request(app).get("/v2/referent").expect(200);
    });

    it("compte par clé : un autre utilisateur n'est pas bridé", async () => {
        const app = express();
        app.use(
            rateLimiter({
                store: new MemoryStore(),
                windowMs: 60_000,
                limit: 1,
                keyGenerator: (req) => String(req.headers["x-user"]),
            }),
        );
        app.use((_req, res) => res.json({ ok: true }));

        await request(app).get("/").set("x-user", "a").expect(200);
        await request(app).get("/").set("x-user", "a").expect(429);
        await request(app).get("/").set("x-user", "b").expect(200);
    });
});

describe("Bull Board (M79)", () => {
    it("masque les jetons des liens et les clés secrètes dans les données de job", () => {
        const data = {
            to: [{ email: "prof@example.org", name: "Prof" }],
            invitationUrl: "https://admin.snu.gouv.fr/creer-mon-compte?token=abc-123&x=1",
            nested: { invitationToken: "abc-123", apiKey: "k" },
            urls: ["https://admin.snu.gouv.fr/verifier-mon-compte?token=def"],
        };
        expect(masquerSecrets(data)).toEqual({
            to: [{ email: "prof@example.org", name: "Prof" }],
            invitationUrl: "https://admin.snu.gouv.fr/creer-mon-compte?token=[masqué]&x=1",
            nested: { invitationToken: "[masqué]", apiKey: "[masqué]" },
            urls: ["https://admin.snu.gouv.fr/verifier-mon-compte?token=[masqué]"],
        });
    });

    function bullBoardApp(ips: string, ouvert: boolean) {
        const app = express();
        app.use(
            "/queues",
            bullBoardIpAllowlist(ips, ouvert),
            rateLimiter({ store: new MemoryStore(), ...RATE_LIMITS.bullBoard, skipSuccessfulRequests: true }),
            basicAuth({ challenge: true, users: { admin: "secret" } }),
            (_req: express.Request, res: express.Response) => res.send("board"),
        );
        return app;
    }

    it("ferme le tableau de bord sans liste d'IP sur un environnement déployé", async () => {
        await request(bullBoardApp("", false)).get("/queues").auth("admin", "secret").expect(404);
    });

    it("n'accepte que les IP de la liste", async () => {
        await request(bullBoardApp("10.0.0.1", false)).get("/queues").auth("admin", "secret").expect(404);
        await request(bullBoardApp("127.0.0.1, ::1", false)).get("/queues").auth("admin", "secret").expect(200);
    });

    it("bloque la force brute de l'auth basique, sans compter les succès", async () => {
        const app = bullBoardApp("", true);
        for (let i = 0; i < 3; i++) {
            await request(app).get("/queues").auth("admin", "secret").expect(200);
        }
        for (let i = 0; i < RATE_LIMITS.bullBoard.limit; i++) {
            await request(app).get("/queues").auth("admin", `mauvais-${i}`).expect(401);
        }
        await request(app).get("/queues").auth("admin", "secret").expect(429);
    });
});
