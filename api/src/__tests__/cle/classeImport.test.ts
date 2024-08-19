import request from "supertest";
import getAppHelper from "../helpers/app";
import { ClasseCohortImportKey } from "../../cle/classe/import/classeCohortImport";
import { getFile } from "../../utils";
import { ClasseModel, CohortModel } from "../../models";
import { createFixtureClasse } from "../fixtures/classe";
import getNewCohortFixture from "../fixtures/cohort";
import passport from "passport";
import { ERRORS, ROLES } from "snu-lib";
import { dbClose, dbConnect } from "../helpers/db";
import * as featureServiceModule from "../../featureFlag/featureFlagService";
import mongoose from "mongoose";

beforeAll(dbConnect);
afterAll(dbClose);

jest.mock("../../utils", () => ({
  ...jest.requireActual("../../utils"),
  getFile: jest.fn(),
}));

jest.mock("passport");

beforeEach(() => {
  passport.user.role = ROLES.ADMIN;
  passport.user.subRole = "god";
  jest.spyOn(featureServiceModule, "isFeatureAvailable").mockImplementation(() => Promise.resolve(true));
});

describe("POST /cle/classe-import", () => {
  const mockFilePath = "/path/to/mock/file.csv";
  const mockClasseCohortImportKey = ClasseCohortImportKey.SEPT_2024;
  const mockBody = {
    filePath: mockFilePath,
    classeCohortImportKey: mockClasseCohortImportKey,
  };

  it("should return 200 and the import results when the request is successful", async () => {
    const classe1 = await ClasseModel.create(createFixtureClasse());
    const classe2 = await ClasseModel.create(createFixtureClasse());
    const cohort = await CohortModel.create(getNewCohortFixture({ name: "à venir" }));

    const notExistingClasseId = new mongoose.Types.ObjectId().toString();
    const notExistingCohortId = new mongoose.Types.ObjectId().toString();

    const mockFileBody = `classe,cohort\n${classe1?._id},${cohort?._id}\n${notExistingClasseId},${cohort?._id}\n${classe2?._id},${notExistingCohortId}`;
    const mockFileBuffer = { Body: Buffer.from(mockFileBody) };
    (getFile as jest.Mock).mockResolvedValue(mockFileBuffer);

    const response = await request(getAppHelper()).post("/cle/classe/import/classe-cohort").send(mockBody);

    const expectedResponse = [
      {
        classeId: classe1._id.toString(),
        cohortId: cohort._id.toString(),
        result: "success",
        cohortName: "à venir",
      },
      {
        classeId: notExistingClasseId,
        cohortId: cohort?._id.toString(),
        result: "error",
        error: ERRORS.CLASSE_NOT_FOUND,
      },
      {
        classeId: classe2._id.toString(),
        cohortId: notExistingCohortId,
        result: "error",
        error: ERRORS.COHORT_NOT_FOUND,
      },
    ];
    expect(response.body.ok).toBe(true);
    expect(response.body.data).toEqual(expectedResponse);
  });

  it("should return 422 when unable to parse the CSV", async () => {
    const mockInvalidCSVBuffer = Buffer.from("one_header\nvalue1,value2"); // Missing one column
    (getFile as jest.Mock).mockResolvedValue({ Body: mockInvalidCSVBuffer });

    const response = await request(getAppHelper()).post("/cle/classe/import/classe-cohort").send(mockBody);

    expect(response.status).toEqual(422);
    expect(response.body.ok).toBe(false);

    expect(response.body.code).toEqual(ERRORS.CANNOT_PARSE_CSV);
  });

  it("should return 403 for non-superadmin role", async () => {
    passport.user.role = ROLES.VISITOR;
    const response = await request(getAppHelper()).post("/cle/classe/import/classe-cohort").send(mockBody);

    expect(response.status).toEqual(403);
    expect(response.body).toEqual({
      ok: false,
      code: ERRORS.OPERATION_UNAUTHORIZED,
    });
  });
});
