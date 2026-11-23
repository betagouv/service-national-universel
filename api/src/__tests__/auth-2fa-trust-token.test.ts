import request from "supertest";
import jwt from "jsonwebtoken";
import { ROLES } from "snu-lib";

import getAppHelper, { resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose, clearDatabase } from "./helpers/db";
import { getNewReferentFixture } from "./fixtures/referent";
import { createReferentHelper } from "./helpers/referent";
import { ReferentModel } from "../models";
import { config } from "../config";
import { JWT_SIGNIN_VERSION, JWT_SIGNIN_MAX_AGE_SEC } from "../jwt-options";

const PASSWORD = "SuperSecret1234!";

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
  sendTemplate: () => Promise.resolve(),
}));

let previous2FA;

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  previous2FA = config.ENABLE_2FA;
  (config as any).ENABLE_2FA = true;
});

afterAll(async () => {
  (config as any).ENABLE_2FA = previous2FA;
  await dbClose();
});

afterEach(async () => {
  resetAppAuth();
  await clearDatabase();
});

function signinReferent(email: string, cookies: string[] = []) {
  const req = request(getAppHelper()).post("/referent/signin");
  if (cookies.length) req.set("Cookie", cookies);
  return req.send({ email, password: PASSWORD });
}

function extractTrustTokenCookie(res, id: string): string | undefined {
  const cookies: string[] = res.headers["set-cookie"] || [];
  return cookies.find((c) => c.startsWith(`trust_token-${id}=`))?.split(";")[0];
}

/** Parcours nominal complet : signin -> 2FA -> "se souvenir de moi" -> trust token. */
async function getTrustTokenCookie(email: string) {
  const first = await signinReferent(email);
  expect(first.body.code).toBe("2FA_REQUIRED");

  const user = await ReferentModel.findOne({ email });
  const res = await request(getAppHelper())
    .post("/referent/signin-2fa")
    .send({ email, token_2fa: String(user!.token2FA), rememberMe: true });
  expect(res.status).toBe(200);

  const cookie = extractTrustTokenCookie(res, user!._id.toString());
  expect(cookie).toBeDefined();
  return cookie!;
}

jest.setTimeout(60000);

describe("2FA trust token binding (H6)", () => {
  async function createReferent() {
    const fixture = getNewReferentFixture();
    return await createReferentHelper({ ...fixture, email: fixture.email?.toLowerCase(), password: PASSWORD, role: ROLES.ADMIN });
  }

  it("signin without any trust token requires 2FA", async () => {
    const victim = await createReferent();
    const res = await signinReferent(victim.email as string);
    expect(res.status).toBe(200);
    expect(res.body.code).toBe("2FA_REQUIRED");
  });

  it("the victim's own trust token skips 2FA (le parcours 'se souvenir de moi' fonctionne toujours)", async () => {
    const victim = await createReferent();
    const cookie = await getTrustTokenCookie(victim.email);

    const res = await signinReferent(victim.email as string, [cookie]);
    expect(res.status).toBe(200);
    expect(res.body.code).not.toBe("2FA_REQUIRED");
    // La session passe par le seul cookie httpOnly : le JWT n'est plus renvoyé au JavaScript (FM16).
    expect(String(res.headers["set-cookie"])).toContain("jwt_ref=");
    expect(res.body.token).toBeUndefined();
  });

  it("H6 : un trust token émis pour le compte de l'attaquant ne passe pas le 2FA de la victime", async () => {
    const victim = await createReferent();
    const otherReferent = await createReferent();
    const cookie = await getTrustTokenCookie(otherReferent.email);
    const otherToken = cookie.split("=")[1];
    expect(otherReferent.id).not.toBe(victim.id);

    const res = await signinReferent(victim.email, [`trust_token-${victim._id}=${otherToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe("2FA_REQUIRED");
    expect(res.body.token).toBeUndefined();
  });

  it("H6 : un JWT de session n'est pas accepté comme trust token (confusion de type)", async () => {
    const victim = await createReferent();
    // Même compte : seul le type de jeton doit empêcher de passer le 2FA.
    const sessionToken = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: victim.id, lastLogoutAt: victim.lastLogoutAt, passwordChangedAt: victim.passwordChangedAt }, config.JWT_SECRET, {
      expiresIn: JWT_SIGNIN_MAX_AGE_SEC,
    });

    const res = await signinReferent(victim.email as string, [`trust_token-${victim._id}=${sessionToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe("2FA_REQUIRED");
    expect(res.body.token).toBeUndefined();
  });

  it("H6 : un trust token legacy (non lié, __v=0) est refusé", async () => {
    const victim = await createReferent();
    const legacyToken = jwt.sign({ __v: "0" }, config.JWT_SECRET, { expiresIn: 3600 });

    const res = await signinReferent(victim.email as string, [`trust_token-${victim._id}=${legacyToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe("2FA_REQUIRED");
  });

  it("un changement de mot de passe révoque le trust token", async () => {
    const victim = await createReferent();
    const cookie = await getTrustTokenCookie(victim.email);

    const fresh = await ReferentModel.findById(victim._id);
    fresh!.set({ password: PASSWORD, passwordChangedAt: new Date() });
    await fresh!.save();

    const res = await signinReferent(victim.email as string, [cookie]);
    expect(res.status).toBe(200);
    expect(res.body.code).toBe("2FA_REQUIRED");
  });
});
