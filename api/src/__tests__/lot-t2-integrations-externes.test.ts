/**
 * Lot T2 — intégrations externes et routes publiques (audit du 21/09/2026).
 *
 *   M71 — GET /jeveuxaider/getToken : clé statique comparée en temps non constant, sans limiteur, et
 *         `token_jva` identique à un JWT de session (utilisable tel quel comme session admin)
 *   M64 — /preinscription/* : routes publiques sans appelant depuis #5358
 *   M40 — POST /waiting-list : relais d'emails public sans appelant
 *   L37 — GET /gouv.fr/api-education : proxy public injectable (ODSQL), sans appelant
 *   M72 — fonds des attestations (signatures des ministres) téléchargés dans le dossier servi en statique
 */
import path from "path";
import request from "supertest";
import jwt from "jsonwebtoken";
import { ROLES, ReferentStatus } from "snu-lib";

import getAppHelper, { resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose, clearDatabase } from "./helpers/db";
import getNewReferentFixture from "./fixtures/referent";
import getNewStructureFixture from "./fixtures/structure";
import { createReferentHelper } from "./helpers/referent";
import { createStructureHelper } from "./helpers/structure";
import { config } from "../config";
import { JWT_SIGNIN_VERSION, JWT_SIGNIN_MAX_AGE_SEC } from "../jwt-options";

const JVA_TOKEN = "cle-jva-de-test";

let previousJvaToken;

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  previousJvaToken = config.JVA_TOKEN;
  (config as any).JVA_TOKEN = JVA_TOKEN;
});

afterAll(async () => {
  (config as any).JVA_TOKEN = previousJvaToken;
  await dbClose();
});

afterEach(async () => {
  resetAppAuth();
  await clearDatabase();
});

jest.setTimeout(60000);

async function createJvaResponsible(fields: Record<string, any> = {}) {
  const structure = await createStructureHelper({ ...getNewStructureFixture(), isJvaStructure: "true" } as any);
  const referent = await createReferentHelper({
    ...getNewReferentFixture(),
    role: ROLES.RESPONSIBLE,
    status: ReferentStatus.ACTIVE,
    structureId: structure._id.toString(),
    ...fields,
  });
  return { structure, referent };
}

function sessionJwtFor(referent) {
  return jwt.sign(
    { __v: JWT_SIGNIN_VERSION, _id: referent._id.toString(), lastLogoutAt: referent.lastLogoutAt, passwordChangedAt: referent.passwordChangedAt },
    config.JWT_SECRET,
    { expiresIn: JWT_SIGNIN_MAX_AGE_SEC },
  );
}

describe("M71 — GET /jeveuxaider/getToken", () => {
  it("refuse une clé d'API erronée ou absente (401)", async () => {
    const { referent } = await createJvaResponsible();
    const app = getAppHelper();

    const wrong = await request(app).get("/jeveuxaider/getToken").set("x-api-key", "mauvaise-cle").query({ email: referent.email });
    expect(wrong.status).toBe(401);

    const missing = await request(app).get("/jeveuxaider/getToken").query({ email: referent.email });
    expect(missing.status).toBe(401);
  });

  it("accepte la clé en en-tête x-api-key, et encore en query le temps que JVA migre", async () => {
    const { referent } = await createJvaResponsible();
    const app = getAppHelper();

    const header = await request(app).get("/jeveuxaider/getToken").set("x-api-key", JVA_TOKEN).query({ email: referent.email });
    expect(header.status).toBe(200);
    expect(header.body.data.token_jva).toBeDefined();

    const query = await request(app).get("/jeveuxaider/getToken").query({ email: referent.email, api_key: JVA_TOKEN });
    expect(query.status).toBe(200);
  });

  it("n'émet pas de jeton pour un compte INACTIVE ni hors structure JVA", async () => {
    const app = getAppHelper();
    const { referent: inactive } = await createJvaResponsible({ status: ReferentStatus.INACTIVE });
    const res = await request(app).get("/jeveuxaider/getToken").set("x-api-key", JVA_TOKEN).query({ email: inactive.email });
    expect(res.status).toBe(401);

    const structure = await createStructureHelper({ ...getNewStructureFixture(), isJvaStructure: "false" } as any);
    const outsider = await createReferentHelper({ ...getNewReferentFixture(), role: ROLES.RESPONSIBLE, structureId: structure._id.toString() });
    const res2 = await request(app).get("/jeveuxaider/getToken").set("x-api-key", JVA_TOKEN).query({ email: outsider.email });
    expect(res2.status).toBe(401);
  });

  it("le token_jva n'est pas un JWT de session : GET /signin/token le refuse", async () => {
    const { referent } = await createJvaResponsible();
    const app = getAppHelper();

    const { body } = await request(app).get("/jeveuxaider/getToken").set("x-api-key", JVA_TOKEN).query({ email: referent.email });
    const payload = jwt.decode(body.data.token_jva) as any;
    expect(payload.__v).not.toBe(JWT_SIGNIN_VERSION);
    expect(payload.exp - payload.iat).toBeLessThanOrEqual(5 * 60);

    const res = await request(app).get("/signin/token").set("Authorization", `JWT ${body.data.token_jva}`);
    expect(res.status).toBe(401);
  });

  it("limite les essais de clé d'API par IP (429), sans compter les emails inconnus", async () => {
    const app = getAppHelper();

    // Un email inconnu avec la bonne clé ne consomme pas de quota : le back JVA n'est pas bloqué.
    for (let i = 0; i < 25; i++) {
      const res = await request(app)
        .get("/jeveuxaider/getToken")
        .set("x-api-key", JVA_TOKEN)
        .query({ email: `inconnu${i}@example.com` });
      expect(res.status).toBe(401);
    }

    let last;
    for (let i = 0; i < 21; i++) {
      last = await request(app).get("/jeveuxaider/getToken").set("x-api-key", `mauvaise-cle-${i}`).query({ email: "x@example.com" });
    }
    expect(last.status).toBe(429);
  });
});

describe("M71 — GET /jeveuxaider/signin", () => {
  it("échange un token_jva contre une session et redirige vers l'admin", async () => {
    const { referent } = await createJvaResponsible();
    const app = getAppHelper();

    const { body } = await request(app).get("/jeveuxaider/getToken").set("x-api-key", JVA_TOKEN).query({ email: referent.email });
    const res = await request(app).get("/jeveuxaider/signin").query({ token_jva: body.data.token_jva });
    expect(res.status).toBe(302);
    expect(String(res.headers["set-cookie"])).toContain("jwt_ref=");
  });

  it("refuse un JWT de session présenté comme token_jva", async () => {
    const { referent } = await createJvaResponsible();
    const res = await request(getAppHelper())
      .get("/jeveuxaider/signin")
      .query({ token_jva: sessionJwtFor(referent) });
    expect(res.status).toBe(401);
  });

  it("refuse un token_jva émis avant une déconnexion", async () => {
    const { referent } = await createJvaResponsible();
    const app = getAppHelper();
    const { body } = await request(app).get("/jeveuxaider/getToken").set("x-api-key", JVA_TOKEN).query({ email: referent.email });

    referent.set({ lastLogoutAt: new Date() });
    await referent.save();

    const res = await request(app).get("/jeveuxaider/signin").query({ token_jva: body.data.token_jva });
    expect(res.status).toBe(401);
  });
});

describe("M64 / M40 / L37 — routes publiques supprimées", () => {
  it.each([
    ["post", "/preinscription/eligibilite"],
    ["post", "/preinscription/create-lead"],
    ["post", "/waiting-list"],
    ["get", "/gouv.fr/api-education?name=%22%3B%20DROP"],
  ])("%s %s → 404", async (method, url) => {
    const res = await request(getAppHelper())[method](url).send({ email: "a@example.com", mail: "a@example.com", birthdate: "2010-01-01" });
    expect(res.status).toBe(404);
  });
});

describe("M72 — fonds des attestations hors du dossier statique", () => {
  it("PDF_TEMPLATES_ROOTDIR n'est pas sous public/", () => {
    const publicDir = path.resolve(config.IMAGES_ROOTDIR, "..");
    const relative = path.relative(publicDir, path.resolve(config.PDF_TEMPLATES_ROOTDIR));
    expect(relative.startsWith("..")).toBe(true);
  });
});
