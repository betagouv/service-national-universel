import request from "supertest";
import passport from "passport";
import mongoose, { Types } from "mongoose";
const { ObjectId } = Types;
import emailsEmitter from "../../emails";
import snuLib, { ROLES, ERRORS } from "snu-lib";
import { dbConnect, dbClose } from "../helpers/db";
import { mockEsClient } from "../helpers/es";
import getAppHelper from "../helpers/app";
import { createClasse } from "../helpers/classe";
import { createFixtureClasse } from "../fixtures/classe";
import { ClasseModel, EtablissementModel, ReferentModel } from "../../models";
import { createReferentHelper } from "../helpers/referent";
import getNewReferentFixture from "../fixtures/referent";

beforeAll(dbConnect);
afterAll(dbClose);

jest.spyOn(emailsEmitter, "emit").mockImplementation(() => {});
let newReferent;
beforeEach(async () => {
  await ClasseModel.deleteMany({});
  await EtablissementModel.deleteMany({});
  await ReferentModel.deleteMany({});
  passport.user.role = ROLES.ADMIN;
  passport.user.subRole = "god";
  newReferent = {
    firstName: "New",
    lastName: "Referent",
    email: "new.referent@example.com",
  };
});

describe("PUT /classes/update-referents", () => {
  it("should return 400 when body is invalid", async () => {
    const res = await request(getAppHelper()).put("/cle/classes/update-referents");
    expect(res.status).toBe(400);
  });

  it("should return 403 when user cannot update classes", async () => {
    passport.user.role = ROLES.RESPONSIBLE;
    const res = await request(getAppHelper()).put(`/cle/classes/update-referents`);
    expect(res.status).toBe(403);
  });

  it("should return 200 when referent is updated without previous", async () => {
    const classe = await createClasse(createFixtureClasse());
    const res = await request(getAppHelper())
      .put(`/cle/classes/update-referents`)
      .send([{ idClasse: classe._id.toString(), ...newReferent }]);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].idClasse).toBe(classe._id.toString());
    expect(res.body.data[0].updatedReferentClasse).toEqual(newReferent);
    expect(res.body.data[0].previousReferent).toBeUndefined();
  });

  it("should return 200 when referent is updated with previous referent", async () => {
    const previousReferent = await createReferentHelper(getNewReferentFixture());
    const classe = await createClasse(createFixtureClasse({ referentClasseIds: [previousReferent._id.toString()] }));

    const newReferent = {
      firstName: "New",
      lastName: "Referent",
      email: "new.referent@example.com",
    };
    const res = await request(getAppHelper())
      .put(`/cle/classes/update-referents`)
      .send([{ idClasse: classe._id.toString(), ...newReferent }]);

    const expectedReport = [
      {
        idClasse: classe._id.toString(),
        updatedReferentClasse: newReferent,
        previousReferent: {
          firstName: previousReferent.firstName,
          lastName: previousReferent.lastName,
          email: previousReferent.email,
        },
      },
    ];

    const updatedClasse = await ClasseModel.findById(classe?._id);
    const updatedReferent = await ReferentModel.findById(updatedClasse?.referentClasseIds[0]);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toEqual(expectedReport);
    expect(updatedReferent?.firstName).toBe(newReferent.firstName);
    expect(updatedReferent?.lastName).toBe(newReferent.lastName);
    expect(updatedReferent?.email).toBe(newReferent.email);
  });

  it("should return 200 when referent and one class is unknown", async () => {
    const previousReferent = await createReferentHelper(getNewReferentFixture());
    const classe = await createClasse(createFixtureClasse({ referentClasseIds: [previousReferent._id.toString()] }));

    const newReferent = {
      firstName: "New",
      lastName: "Referent",
      email: "new.referent@example.com",
    };
    const unknownId = new mongoose.Types.ObjectId().toString();
    const res = await request(getAppHelper())
      .put(`/cle/classes/update-referents`)
      .send([
        { idClasse: classe._id.toString(), ...newReferent },
        { idClasse: unknownId, ...newReferent },
      ]);

    const expectedReport = [
      {
        idClasse: classe._id.toString(),
        updatedReferentClasse: newReferent,
        previousReferent: {
          firstName: previousReferent.firstName,
          lastName: previousReferent.lastName,
          email: previousReferent.email,
        },
      },
      {
        idClasse: unknownId,
        error: ERRORS.CLASSE_NOT_FOUND,
      },
    ];

    const updatedClasse = await ClasseModel.findById(classe?._id);
    const updatedReferent = await ReferentModel.findById(updatedClasse?.referentClasseIds[0]);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toEqual(expectedReport);
    expect(updatedReferent?.firstName).toBe(newReferent.firstName);
    expect(updatedReferent?.lastName).toBe(newReferent.lastName);
    expect(updatedReferent?.email).toBe(newReferent.email);
  });
});
