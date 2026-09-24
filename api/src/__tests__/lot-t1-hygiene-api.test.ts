/**
 * Lot T1 — api v1 : moniteur de tâches, endpoints techniques, configuration (audit du 21/09/2026).
 *
 *   M12 — Bull Board (app tasks) servi sans authentification par défaut
 *   L31 — /memory-stats, /testsentry, /error_for_baleen, /test_error_* publics
 *   L30 — bodyParser à 50 Mo sur toutes les routes, anonymes comprises
 *   L26 — cookies de session SameSite=Lax sur le domaine parent
 *   L7  — objets d'erreur (Mongo, Joi) et `error.message` renvoyés au client
 */
import fs from "fs";
import path from "path";
import express from "express";
import request from "supertest";

import getAppHelper, { resetAppAuth } from "./helpers/app";
import { config } from "../config";
import { CohortModel } from "../models";
import { toErrorCode } from "../utils/errorCode";
import { applyBodyParsers, handleError } from "../middlewares/httpHardening";

jest.mock("../sentry", () => ({ capture: jest.fn(), captureMessage: jest.fn() }));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getTaskMonitorAuth } = require("../mainJob");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { cookieOptions } = require("../cookie-options");

jest.setTimeout(60000);

afterEach(() => {
  resetAppAuth();
  jest.restoreAllMocks();
});

describe("M12 — moniteur de tâches", () => {
  const previous = { user: config.TASK_MONITOR_USER, secret: config.TASK_MONITOR_SECRET };
  afterEach(() => {
    (config as any).TASK_MONITOR_USER = previous.user;
    (config as any).TASK_MONITOR_SECRET = previous.secret;
  });

  it("n'est pas monté sans identifiants", () => {
    (config as any).TASK_MONITOR_USER = undefined;
    (config as any).TASK_MONITOR_SECRET = undefined;
    expect(getTaskMonitorAuth()).toBeNull();
  });

  it("n'est pas monté avec un utilisateur sans secret (ou l'inverse)", () => {
    (config as any).TASK_MONITOR_USER = "monitor";
    (config as any).TASK_MONITOR_SECRET = "";
    expect(getTaskMonitorAuth()).toBeNull();
    (config as any).TASK_MONITOR_USER = "";
    (config as any).TASK_MONITOR_SECRET = "secret";
    expect(getTaskMonitorAuth()).toBeNull();
  });

  it("est monté derrière l'authentification quand les deux sont renseignés", () => {
    (config as any).TASK_MONITOR_USER = "monitor";
    (config as any).TASK_MONITOR_SECRET = "secret";
    expect(getTaskMonitorAuth()).toEqual({ user: "monitor", secret: "secret" });
  });

  it("la variable TASK_MONITOR_ENABLE_AUTH n'existe plus : rien ne peut désactiver l'authentification", () => {
    expect(config).not.toHaveProperty("TASK_MONITOR_ENABLE_AUTH");
    const source = fs.readFileSync(path.join(__dirname, "../mainJob.js"), "utf8");
    expect(source).not.toContain("TASK_MONITOR_ENABLE_AUTH");
  });
});

describe("L31 — endpoints techniques", () => {
  it("main.js ne déclare plus les routes de diagnostic", () => {
    const source = fs.readFileSync(path.join(__dirname, "../main.js"), "utf8");
    for (const route of ["/memory-stats", "/testsentry", "/error_for_baleen", "/test_error_"]) {
      expect(source).not.toContain(route);
    }
  });

  it.each(["/memory-stats", "/testsentry", "/error_for_baleen", "/test_error_crash_app"])("GET %s → 404", async (route) => {
    const res = await request(getAppHelper()).get(route);
    expect(res.status).toBe(404);
  });
});

describe("L30 — taille des corps", () => {
  const twoMegabytes = "x".repeat(2 * 1024 * 1024);

  it("POST /young/signin avec un corps de 2 Mo → 413, code stable, aucun détail", async () => {
    const res = await request(getAppHelper())
      .post("/young/signin")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ email: "a@b.fr", password: twoMegabytes }));
    expect(res.status).toBe(413);
    expect(res.body).toEqual({ ok: false, code: "PAYLOAD_TOO_LARGE" });
  });

  it("corps urlencoded et ndjson plafonnés aussi", async () => {
    const app = express();
    applyBodyParsers(app);
    app.post("/echo", (req, res) => res.status(200).send({ ok: true }));
    app.use(handleError);

    const urlencoded = await request(app).post("/echo").set("Content-Type", "application/x-www-form-urlencoded").send(`a=${twoMegabytes}`);
    expect(urlencoded.status).toBe(413);
    const ndjson = await request(app).post("/echo").set("Content-Type", "application/x-ndjson").send(twoMegabytes);
    expect(ndjson.status).toBe(413);
    const small = await request(app)
      .post("/echo")
      .send({ a: "x".repeat(100 * 1024) });
    expect(small.status).toBe(200);
  });
});

describe("L26 — cookies de session", () => {
  const previous = config.ENVIRONMENT;
  afterEach(() => {
    (config as any).ENVIRONMENT = previous;
  });

  it.each(["production", "staging", "ci"])("%s : SameSite=Strict, httpOnly, secure", (environment) => {
    (config as any).ENVIRONMENT = environment;
    expect(cookieOptions(1000)).toMatchObject({ sameSite: "Strict", httpOnly: true, secure: true });
  });
});

describe("L7 — erreurs renvoyées au client", () => {
  it("toErrorCode garde les codes métier et masque tout autre message", () => {
    expect(toErrorCode(new Error("OPERATION_UNAUTHORIZED"))).toBe("OPERATION_UNAUTHORIZED");
    expect(toErrorCode(new Error("PDT_IMPORT_MISSING_COLUMN"))).toBe("PDT_IMPORT_MISSING_COLUMN");
    expect(toErrorCode(new Error('E11000 duplicate key error collection: snu.referents index: email_1 dup key: { email: "x@y.fr" }'))).toBe("SERVER_ERROR");
    expect(toErrorCode(new Error('"email" must be a valid email'))).toBe("SERVER_ERROR");
    expect(toErrorCode(new Error("Cast to ObjectId failed"), "INVALID_PARAMS")).toBe("INVALID_PARAMS");
    expect(toErrorCode(undefined)).toBe("SERVER_ERROR");
    expect(toErrorCode("NOT_FOUND")).toBe("SERVER_ERROR");
  });

  it("GET /cohort/public en erreur → 500 sans l'objet d'erreur", async () => {
    jest.spyOn(CohortModel, "find").mockReturnValue({
      lean: () => Promise.reject(new Error("connection 3 to snu-mongo.internal:27017 closed")),
    } as any);
    const res = await request(getAppHelper()).get("/cohort/public");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ ok: false, code: "SERVER_ERROR" });
  });

  it("gestionnaire global : ni nom, ni message, ni texte de l'erreur", async () => {
    const app = express();
    app.get("/boom", () => {
      throw Object.assign(new Error('E11000 dup key { email: "x@y.fr" }'), { name: "MongoServerError" });
    });
    app.get("/denied", (req, res, next) => next(Object.assign(new Error("Unauthorized"), { name: "AuthenticationError", status: 401 })));
    app.use(handleError);

    const boom = await request(app).get("/boom");
    expect(boom.status).toBe(500);
    expect(boom.body).toEqual({ ok: false, code: "SERVER_ERROR" });

    const denied = await request(app).get("/denied");
    expect(denied.status).toBe(401);
    expect(denied.body).toEqual({ ok: false, code: "OPERATION_UNAUTHORIZED" });
  });
});
