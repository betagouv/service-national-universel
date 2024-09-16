// @ts-ignore
import request from "supertest";
import passport from "passport";
import mongoose from "mongoose";
// @ts-ignore
import emailsEmitter from "../../emails";
import { ERRORS, ROLES } from "snu-lib";
import { dbClose, dbConnect } from "../helpers/db";
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
      .send([{ classeId: classe._id.toString(), ...newReferent }]);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].classeId).toBe(classe._id.toString());
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
      .send([{ classeId: classe._id.toString(), ...newReferent }]);

    const expectedReport = [
      {
        classeId: classe._id.toString(),
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
        { classeId: classe._id.toString(), ...newReferent },
        { classeId: unknownId, ...newReferent },
      ]);

    const expectedReport = [
      {
        classeId: classe._id.toString(),
        updatedReferentClasse: newReferent,
        previousReferent: {
          firstName: previousReferent.firstName,
          lastName: previousReferent.lastName,
          email: previousReferent.email,
        },
      },
      {
        classeId: unknownId,
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

describe("PUT /update-referents-by-csv", () => {
  it("should return 400 when no file is provided", async () => {
    const res = await request(getAppHelper()).put("/cle/classes/update-referents-by-csv");
    expect(res.status).toBe(400);
    expect(res.body.code).toBe(ERRORS.INVALID_BODY);
  });

  it("should return 403 when user is not a super admin", async () => {
    passport.user.role = ROLES.RESPONSIBLE;
    const res = await request(getAppHelper()).put("/cle/classes/update-referents-by-csv");
    expect(res.status).toBe(403);
    expect(res.body.code).toBe(ERRORS.OPERATION_UNAUTHORIZED);
  });

  it("should return 400 when the CSV file is invalid", async () => {
    passport.user.role = ROLES.ADMIN;
    passport.user.subRole = "god";
    const res = await request(getAppHelper()).put("/cle/classes/update-referents-by-csv").attach("file", Buffer.from("invalid csv data"), "invalid.csv");
    expect(res.status).toBe(400);
    expect(res.body.code).toBe(ERRORS.INVALID_BODY);
  });

  it("should return 200 and update referents when the CSV file is valid", async () => {
    passport.user.role = ROLES.ADMIN;
    passport.user.subRole = "god";
    const classe = await createClasse(createFixtureClasse());
    const newReferent = { firstName: "New", lastName: "Referent", email: "new.referent@example.com" };
    const csvData = `classeId,firstName,lastName,email\n${classe._id.toString()},${newReferent.firstName},${newReferent.lastName},${newReferent.email}`;
    const res = await request(getAppHelper()).put("/cle/classes/update-referents-by-csv").attach("file", Buffer.from(csvData), "valid.csv");

    const expectedReport = {
      classeId: classe._id.toString(),
      updatedReferentClasse: newReferent,
    };

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].classeId).toBe(classe._id.toString());
    expect(res.body.data[0].updatedReferentClasse).toEqual(newReferent);

    expect(res.body.data[0]).toEqual(expectedReport);
  });
});
