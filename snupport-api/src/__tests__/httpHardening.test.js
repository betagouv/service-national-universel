// PL21 : toute route de snupport-api, y compris les routes inexistantes ou non authentifiées
// (/agent/signin, /agent/forgot_password…), analysait un corps JSON jusqu'à 10 Mo avant même
// l'authentification. Aligné sur BODY_SIZE_LIMIT de api/src/middlewares/httpHardening.ts (1mb) :
// aucun corps JSON légitime de snupport-api n'en approche, les pièces jointes passant par un
// parseur multipart dédié (middlewares/attachmentUpload.js).

const express = require("express");
const request = require("supertest");

const { applyJsonBodyParser, BODY_SIZE_LIMIT } = require("../middlewares/httpHardening");

const buildApp = () => {
  const app = express();
  applyJsonBodyParser(app);
  app.post("/echo", (req, res) => res.status(200).json(req.body));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => res.status(err.status || 500).json({ error: err.type || err.message }));
  return app;
};

describe("applyJsonBodyParser", () => {
  it(`rejette un corps JSON dépassant ${BODY_SIZE_LIMIT}`, async () => {
    const app = buildApp();
    const tooLarge = JSON.stringify({ data: "a".repeat(2 * 1024 * 1024) });
    const res = await request(app).post("/echo").set("Content-Type", "application/json").send(tooLarge);
    expect(res.status).toBe(413);
  });

  it("laisse passer un corps JSON normal", async () => {
    const app = buildApp();
    const res = await request(app).post("/echo").send({ ok: true });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
