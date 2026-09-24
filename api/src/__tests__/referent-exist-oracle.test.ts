/**
 * M70 (audit sécurité du 21/09/2026) — POST /referent/exist : oracle d'existence d'email.
 *
 * La route dit si un email correspond à un compte. Ouverte aux superviseurs et sans limiteur, elle
 * permettait de balayer une liste d'emails. Elle est désormais réservée aux admins et référents
 * régionaux / départementaux, et limitée par compte appelant.
 */
import request from "supertest";

import { ROLES } from "snu-lib";

import { ReferentModel } from "../models";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { getNewReferentFixture } from "./fixtures/referent";
import { createReferentHelper } from "./helpers/referent";

const KNOWN_EMAIL = "compte.existant@example.org";
const UNKNOWN_EMAIL = "personne@example.org";

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  // Premier montage des routes (chargement des contrôleurs) : plusieurs secondes à froid.
  await getAppHelperWithAcl();
}, 60000);
afterAll(dbClose);
beforeEach(async () => {
  await ReferentModel.deleteMany();
  await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, email: KNOWN_EMAIL }));
});
afterEach(resetAppAuth);

async function appAs(role: string) {
  const user = await createReferentHelper(getNewReferentFixture({ role }));
  return getAppHelperWithAcl(user);
}

describe("M70 — POST /referent/exist", () => {
  it.each([ROLES.SUPERVISOR, ROLES.RESPONSIBLE, ROLES.HEAD_CENTER, ROLES.VISITOR])("refuse le rôle %s, que l'email existe ou non", async (role) => {
    const app = await appAs(role);

    const known = await request(app).post("/referent/exist").send({ email: KNOWN_EMAIL });
    const unknown = await request(app).post("/referent/exist").send({ email: UNKNOWN_EMAIL });

    expect(known.status).toBe(403);
    expect(unknown.status).toBe(403);
    expect(known.body).toEqual(unknown.body);
  });

  it.each([ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT])("répond au rôle %s", async (role) => {
    const app = await appAs(role);

    const known = await request(app).post("/referent/exist").send({ email: KNOWN_EMAIL.toUpperCase() });
    const unknown = await request(app).post("/referent/exist").send({ email: UNKNOWN_EMAIL });

    expect(known.status).toBe(200);
    expect(known.body.data).toBe(true);
    expect(unknown.status).toBe(200);
    expect(unknown.body.data).toBe(false);
  });

  it("exige un email : sans lui, la recherche partait sur {} et répondait true", async () => {
    const app = await appAs(ROLES.REFERENT_DEPARTMENT);

    const res = await request(app).post("/referent/exist").send({});

    expect(res.status).toBe(400);
  });

  it("limite le nombre d'appels par compte", async () => {
    const app = await appAs(ROLES.REFERENT_DEPARTMENT);

    const statuses: number[] = [];
    for (let i = 0; i < 30; i++) {
      const res = await request(app)
        .post("/referent/exist")
        .send({ email: `test${i}@example.org` });
      statuses.push(res.status);
    }

    expect(statuses.slice(0, 20).every((status) => status === 200)).toBe(true);
    expect(statuses.slice(20).every((status) => status === 429)).toBe(true);
  });
});
