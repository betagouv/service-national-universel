/**
 * GOO-165 (P25b) : routes réservées exclusivement aux rôles CLE décommissionnés (ADMINISTRATEUR_CLE,
 * REFERENT_CLASSE) — citées par route dans la section 3 du ticket. Leurs seules gardes
 * (`canAllowSNU`, `canValidateMultipleYoungsInClass`) n'autorisaient QUE ces 2 rôles : une fois
 * corrigées pour toujours refuser, ces 3 routes doivent renvoyer 403 pour tout acteur.
 */
import request from "supertest";
import { Types } from "mongoose";
const { ObjectId } = Types;

import { ROLES, YOUNG_STATUS } from "snu-lib";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendTemplate: () => Promise.resolve(),
  sendEmail: () => Promise.resolve(),
  sync: () => Promise.resolve(),
  unsync: () => Promise.resolve(),
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);
afterEach(resetAppAuth);

describe("GOO-165 — canAllowSNU n'autorise plus aucun rôle", () => {
  it.each([ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE])("PUT /young-edition/ref-allow-snu refuse %s", async (role) => {
    const actor = { _id: new ObjectId().toString(), role };

    const res = await request(await getAppHelperWithAcl(actor as any))
      .put("/young-edition/ref-allow-snu")
      .send({ youngIds: [new ObjectId().toString()], consent: true });

    expect(res.statusCode).toEqual(403);
  });

  it.each([ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE])("PUT /young-edition/:id/ref-allow-snu refuse %s", async (role) => {
    const actor = { _id: new ObjectId().toString(), role };

    const res = await request(await getAppHelperWithAcl(actor as any))
      .put(`/young-edition/${new ObjectId().toString()}/ref-allow-snu`)
      .send({ consent: true, imageRights: true });

    expect(res.statusCode).toEqual(403);
  });
});

describe("GOO-165 — canValidateMultipleYoungsInClass n'autorise plus aucun rôle", () => {
  it.each([ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE])("PUT /referent/youngs refuse %s", async (role) => {
    const actor = { _id: new ObjectId().toString(), role };

    const res = await request(await getAppHelperWithAcl(actor as any))
      .put("/referent/youngs")
      .send({ youngIds: [new ObjectId().toString()], status: YOUNG_STATUS.VALIDATED });

    expect(res.statusCode).toEqual(403);
  });
});
