import { fakerFR as faker } from "@faker-js/faker";
import request from "supertest";
import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import getNewProgramFixture from "./fixtures/program";
import {
  getProgramsHelper,
  getProgramByIdHelper,
  deleteProgramByIdHelper,
  createProgramHelper,
  expectProgramToEqual,
  deleteAllProgram,
  notExisitingProgramId,
} from "./helpers/program";
import { dbConnect, dbClose } from "./helpers/db";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLES } from "snu-lib";
import { getNewReferentFixture } from "./fixtures/referent";
import { createReferentHelper } from "./helpers/referent";
import { PermissionModel } from "../models/permissions/permission";
import { addPermissionHelper } from "./helpers/permissions";

jest.mock("passport");

beforeAll(async () => {
  await dbConnect();
  await PermissionModel.deleteMany({ roles: { $in: [ROLES.ADMIN, ROLES.REFERENT_REGION] } });
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.PROGRAM, PERMISSION_ACTIONS.FULL);
  await addPermissionHelper([ROLES.REFERENT_REGION], PERMISSION_RESOURCES.PROGRAM, PERMISSION_ACTIONS.FULL, [
    {
      where: [{ field: "region", source: "region" }],
      blacklist: [],
      whitelist: [],
    },
  ]);
});
afterAll(dbClose);
afterEach(resetAppAuth);

describe("Program", () => {
  describe("POST /program", () => {
    it("should create a new program", async () => {
      const programFixture = { ...getNewProgramFixture(), department: "Ain" };
      const programsBefore = await getProgramsHelper();
      const res = await request(await getAppHelperWithAcl())
        .post("/program")
        .send(programFixture);
      expect(res.statusCode).toEqual(200);
      expectProgramToEqual(programFixture, res.body.data);
      const programsAfter = await getProgramsHelper();
      expect(programsAfter.length).toEqual(programsBefore.length + 1);
      await deleteProgramByIdHelper(res.body.data._id);
    });
    it("should return 400 if program not validated", async () => {
      const programFixture = { ...getNewProgramFixture(), department: 1 };
      const res = await request(await getAppHelperWithAcl())
        .post("/program")
        .send(programFixture);
      expect(res.statusCode).toEqual(400);
    });
    it("should return 403 if user is referent department and create a program for another department", async () => {
      const referent = await createReferentHelper({ ...getNewReferentFixture(), role: ROLES.REFERENT_DEPARTMENT, department: "foo" });
      const programFixture = { ...getNewProgramFixture(), department: "bar" };
      const res = await request(await getAppHelperWithAcl(referent))
        .post("/program")
        .send(programFixture);
      expect(res.statusCode).toEqual(403);
    });
    it("should return 403 if user is referent region and create a program for another region", async () => {
      const referent = await createReferentHelper({ ...getNewReferentFixture(), role: ROLES.REFERENT_REGION, region: "foo" });

      const programFixture = { ...getNewProgramFixture(), region: "bar" };
      const res = await request(await getAppHelperWithAcl(referent))
        .post("/program")
        .send(programFixture);
      expect(res.statusCode).toEqual(403);
    });
  });
  describe("PUT /program/:id", () => {
    it("should update a program", async () => {
      const programFixture = getNewProgramFixture();
      let program = await createProgramHelper(programFixture);
      const modifiedProgram = { ...programFixture };
      modifiedProgram.url = faker.internet.url();
      modifiedProgram._id = program._id;
      const res = await request(await getAppHelperWithAcl())
        .put(`/program/${program._id}`)
        .send(modifiedProgram);
      expect(res.statusCode).toEqual(200);
      program = (await getProgramByIdHelper(program._id))!;
      expectProgramToEqual(program, modifiedProgram);
      await deleteProgramByIdHelper(program._id);
    });
    it("should return 404 if program does not exist", async () => {
      const res = await request(await getAppHelperWithAcl()).put("/program/" + notExisitingProgramId);
      expect(res.statusCode).toEqual(404);
    });
    it("should return 403 if user can not update program", async () => {
      const program = await createProgramHelper({ ...getNewProgramFixture(), department: "hip", region: "hop" });

      let res = await request(await getAppHelperWithAcl({ role: ROLES.REFERENT_DEPARTMENT })).put("/program/" + program._id);
      expect(res.statusCode).toEqual(403);

      res = await request(await getAppHelperWithAcl({ role: ROLES.REFERENT_REGION, region: "foo" })).put("/program/" + program._id);
      expect(res.statusCode).toEqual(403);
    });
  });

  describe("GET /program/:id", () => {
    it("should return the program", async () => {
      const programFixture = getNewProgramFixture();
      const program = await createProgramHelper(programFixture);
      const res = await request(await getAppHelperWithAcl()).get(`/program/${program._id}`);
      expect(res.statusCode).toEqual(200);
      expectProgramToEqual(programFixture, res.body.data);
      await deleteProgramByIdHelper(program._id);
    });
    it("should return 404 if program not found", async () => {
      const res = await request(await getAppHelperWithAcl()).get(`/program/${notExisitingProgramId}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  it("GET /program/ AS ADMIN", async () => {
    await deleteAllProgram();
    const programFixture = getNewProgramFixture();
    const program = await createProgramHelper(programFixture);
    const res = await request(await getAppHelperWithAcl()).get(`/program/`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toEqual(1);
    expectProgramToEqual(programFixture, res.body.data[0]);
    await deleteProgramByIdHelper(program._id);
  });

  it("GET /program/ AS HEAD_CENTER", async () => {
    await deleteAllProgram();
    let programFixtureHeadCenter = getNewProgramFixture();
    programFixtureHeadCenter.visibility = "HEAD_CENTER";
    const programHeadCenter = await createProgramHelper(programFixtureHeadCenter);
    const programFixture = getNewProgramFixture();
    const program = await createProgramHelper(programFixture);
    const res = await request(await getAppHelperWithAcl({ role: ROLES.HEAD_CENTER })).get(`/program/`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toEqual(1);
    expectProgramToEqual(programFixtureHeadCenter, res.body.data[0]);
    await deleteProgramByIdHelper(programHeadCenter._id);
    await deleteProgramByIdHelper(program._id);
  });

  it("GET /program/ AS STRUCTURE_MEMBER", async () => {
    await deleteAllProgram();
    let programFixtureRegionDepartment = getNewProgramFixture();
    const passport = require("passport");
    // @ts-ignore
    programFixtureRegionDepartment.region = passport.user.region;
    // @ts-ignore
    programFixtureRegionDepartment.department = passport.user.department[0];
    const programRegionDepartment = await createProgramHelper(programFixtureRegionDepartment);
    let programFixtureNoRegionAndDepartment = getNewProgramFixture();
    programFixtureNoRegionAndDepartment.region = "";
    programFixtureNoRegionAndDepartment.department = "";
    const programNoRegionAndDepartment = await createProgramHelper(programFixtureNoRegionAndDepartment);
    const res = await request(
      await getAppHelperWithAcl({ role: "structure_member", region: programFixtureRegionDepartment.region, department: [programFixtureRegionDepartment.department!] }),
    ).get(`/program/`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toEqual(1);
    expectProgramToEqual(programFixtureRegionDepartment, res.body.data[0]);
    await deleteProgramByIdHelper(programRegionDepartment._id);
    await deleteProgramByIdHelper(programNoRegionAndDepartment._id);
  });

  it("DELETE /program/:id", async () => {
    await deleteAllProgram();
    const programFixture = getNewProgramFixture();
    const program = await createProgramHelper(programFixture);
    const programsBefore = await getProgramsHelper();
    const res = await request(await getAppHelperWithAcl()).delete(`/program/${program._id}`);
    expect(res.statusCode).toEqual(200);
    const programsAfter = await getProgramsHelper();
    expect(programsAfter.length).toEqual(programsBefore.length - 1);
  });
});
