import express from "express";
import request from "supertest";

import { config } from "../config";
import { corsOptionsDelegate } from "../cors-options";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require("cors");

/**
 * PL5 : le CORS à credentials de l'api v1 acceptait SUPPORT_URL (appel serveur à serveur,
 * jamais un navigateur), SUPPORT_FRONT_URL et KNOWLEDGEBASE_URL sur toutes les routes, et l'hôte
 * mort "https://inscription.snu.gouv.fr" (2021). KNOWLEDGEBASE_URL n'en garde que les deux routes
 * qui lisent la session pour la base de connaissance ; SUPPORT_FRONT_URL, une route publique sans cookie.
 */
describe("cors-options : origine du CORS à credentials réduite (PL5)", () => {
  function callDelegate(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      corsOptionsDelegate({ path } as any, (error: Error | null, options: any) => {
        if (error) return reject(error);
        resolve(options);
      });
    });
  }

  it("n'autorise que APP_URL et ADMIN_URL, avec credentials, sur les routes par défaut", async () => {
    const options = await callDelegate("/young/signin");

    expect(options.credentials).toBe(true);
    expect(options.origin).toEqual([config.APP_URL, config.ADMIN_URL]);
  });

  it("n'inclut plus SUPPORT_URL, SUPPORT_FRONT_URL, KNOWLEDGEBASE_URL ni l'hôte mort inscription.snu.gouv.fr par défaut", async () => {
    const options = await callDelegate("/young/signin");

    expect(options.origin).not.toContain(config.SUPPORT_URL);
    expect(options.origin).not.toContain(config.SUPPORT_FRONT_URL);
    expect(options.origin).not.toContain(config.KNOWLEDGEBASE_URL);
    expect(options.origin).not.toContain("https://inscription.snu.gouv.fr");
  });

  it("autorise KNOWLEDGEBASE_URL avec credentials sur GET /signin/token", async () => {
    const options = await callDelegate("/signin/token");

    expect(options.credentials).toBe(true);
    expect(options.origin).toBe(config.KNOWLEDGEBASE_URL);
  });

  it("autorise KNOWLEDGEBASE_URL avec credentials sur POST /signin/logout", async () => {
    const options = await callDelegate("/signin/logout");

    expect(options.credentials).toBe(true);
    expect(options.origin).toBe(config.KNOWLEDGEBASE_URL);
  });

  it("autorise SUPPORT_FRONT_URL sans credentials sur GET /cohort/public", async () => {
    const options = await callDelegate("/cohort/public");

    expect(options.credentials).toBe(false);
    expect(options.origin).toBe(config.SUPPORT_FRONT_URL);
  });
});

/**
 * Ce que le navigateur reçoit. La KB appelle /signin/token et /signin/logout avec
 * `credentials: "include"` (le cookie de session est la seule preuve du lecteur) : sans
 * `Access-Control-Allow-Credentials: true`, le navigateur rejette le preflight et la KB traite
 * chaque lecteur connecté en visiteur public. Les tests de routes passent par supertest, qui
 * n'applique pas le CORS : seul un test sur les en-têtes l'aurait vu.
 */
describe("cors-options : en-têtes CORS reçus par le navigateur", () => {
  const app = express();
  // Montage identique à main.js.
  app.use(cors(corsOptionsDelegate));
  app.all("*", (_req, res) => res.status(200).send({ ok: true }));

  const preflight = (path: string, origin: string, method = "GET") =>
    request(app).options(path).set("Origin", origin).set("Access-Control-Request-Method", method).set("Access-Control-Request-Headers", "content-type");

  it.each([
    ["/signin/token", "GET"],
    ["/signin/logout", "POST"],
  ])("accepte le preflight à credentials de la base de connaissance sur %s", async (path, method) => {
    const res = await preflight(path, config.KNOWLEDGEBASE_URL, method);

    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe(config.KNOWLEDGEBASE_URL);
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("renvoie aussi Access-Control-Allow-Credentials sur la réponse de GET /signin/token", async () => {
    const res = await request(app).get("/signin/token").set("Origin", config.KNOWLEDGEBASE_URL);

    expect(res.headers["access-control-allow-origin"]).toBe(config.KNOWLEDGEBASE_URL);
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("n'ouvre pas les autres routes de l'API à la base de connaissance", async () => {
    const res = await preflight("/referent/signin", config.KNOWLEDGEBASE_URL, "POST");

    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("n'ouvre pas /signin/token à une autre origine", async () => {
    const res = await preflight("/signin/token", "https://evil.example");

    expect(res.headers["access-control-allow-origin"]).not.toBe("https://evil.example");
  });

  it("garde /cohort/public sans credentials", async () => {
    const res = await preflight("/cohort/public", config.SUPPORT_FRONT_URL);

    expect(res.headers["access-control-allow-origin"]).toBe(config.SUPPORT_FRONT_URL);
    expect(res.headers["access-control-allow-credentials"]).toBeUndefined();
  });
});
