import request from "supertest";
import { Types } from "mongoose";
const ObjectId = Types.ObjectId;
import getAppHelper from "../helpers/app";
import { dbConnect, dbClose } from "../helpers/db";
import { createClasse } from "../helpers/classe";
import { createFixtureClasse } from "../fixtures/classe";
import getNewYoungFixture from "../fixtures/young";
import { createYoungHelper } from "../helpers/young";
import { ROLES } from "snu-lib";

beforeAll(dbConnect);
afterAll(dbClose);

describe("GET /cle/young/by-classe-stats/:id", () => {
  it("should return 400 when id is invalid", async () => {
    const res = await request(getAppHelper()).get("/cle/young/by-classe-stats/invalidId").send();
    expect(res.status).toBe(400);
  });
  it("should return 404 when id is not found", async () => {
    const res = await request(getAppHelper()).get(`/cle/young/by-classe-stats/${new ObjectId()}`).send();
    expect(res.status).toBe(404);
  });
});

describe("GET /cle/young/by-classe-historic/:id/patches", () => {
  it("should return 404 if classe not found", async () => {
    const classeId = new ObjectId();
    const res = await request(getAppHelper()).get(`/cle/young/by-classe-historic/${classeId}/patches`).send();
    expect(res.statusCode).toEqual(404);
  });
  it("should return 403 if not admin", async () => {
    const classe = await createClasse(createFixtureClasse());
    classe.name = "MY NEW NAME";
    await classe.save();

    const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
      .get(`/cle/young/by-classe-historic/${classe._id}/patches`)
      .send();
    expect(res.status).toBe(403);
  });
  it("should return 200 if classe found with young and patches", async () => {
    const classe = await createClasse(createFixtureClasse());
    const young = await createYoungHelper(getNewYoungFixture({ classeId: classe._id, status: "IN_PROGRESS" }));
    young.status = "VALIDATED";
    await young.save();
    const res = await request(getAppHelper({ role: ROLES.ADMIN }))
      .get(`/cle/young/by-classe-historic/${classe._id}/patches`)
      .send();
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ops: expect.arrayContaining([expect.objectContaining({ op: "replace", path: "/status", value: "VALIDATED" })]),
        }),
      ]),
    );
  });
  it("should be only accessible by referents", async () => {
    const passport = require("passport");
    const classeId = new ObjectId();
    await request(getAppHelper()).get(`/cle/young/by-classe-historic/${classeId}/patches`).send();
    expect(passport.lastTypeCalledOnAuthenticate).toEqual("referent");
  });
});
