import request from "supertest";
import getAppHelper from "../helpers/app";
import { ClasseCohortImportKey } from "../../cle/classe/import/classeCohortImport";
import { getFile } from "../../utils";
import { ClasseModel, CohortModel } from "../../models";
import { createFixtureClasse } from "../fixtures/classe";
import getNewCohortFixture from "../fixtures/cohort";
import passport from "passport";
import { ERRORS, FUNCTIONAL_ERRORS, ROLES, STATUS_CLASSE } from "snu-lib";
import { dbClose, dbConnect } from "../helpers/db";
import * as featureServiceModule from "../../featureFlag/featureFlagService";
import mongoose from "mongoose";

beforeAll(dbConnect);
afterAll(dbClose);

jest.mock("../../utils", () => ({
  ...jest.requireActual("../../utils"),
  getFile: jest.fn(),
  uploadFile: jest.fn(),
}));

jest.mock("passport");

beforeEach(async () => {
  await CohortModel.deleteMany();
  await ClasseModel.deleteMany();
  passport.user.role = ROLES.ADMIN;
  passport.user.subRole = "god";
  jest.spyOn(featureServiceModule, "isFeatureAvailable").mockImplementation(() => Promise.resolve(true));
});

describe("POST /cle/classe-import", () => {
  const filePath = "/path/to/file.csv";
  const classeCohortImportKey = ClasseCohortImportKey.SEPT_2024;
  const requestBody = {
    filePath: filePath,
    classeCohortImportKey: classeCohortImportKey,
  };

  it("should return 200 and the import results when the request is successful", async () => {
    const classe1 = await ClasseModel.create(createFixtureClasse({ estimatedSeats: 1 }));
    const classe2 = await ClasseModel.create(createFixtureClasse());
    const classe3 = await ClasseModel.create(createFixtureClasse());
    const cohort = await CohortModel.create(getNewCohortFixture({ name: "à venir", snuId: "A_VENIR" }));

    const notExistingClasseId = new mongoose.Types.ObjectId().toString();
    const notExistingCohortCode = "not-existing-cohort";

    const mockFileBody = `Identifiant de la classe engagée,Session formule,Effectif de jeunes concernés
${classe1?._id},${cohort?.snuId},42
${notExistingClasseId},${cohort?.snuId}
${classe2?._id},${notExistingCohortCode}
${classe3?._id},""
"",${cohort?.snuId}`;

    const mockFileBuffer = { Body: Buffer.from(mockFileBody) };
    (getFile as jest.Mock).mockResolvedValue(mockFileBuffer);

    const response = await request(getAppHelper()).post("/cle/classe/import/classe-cohort").send(requestBody);

    const expectedResponse = [
      {
        classeId: classe1._id.toString(),
        classeStatus: STATUS_CLASSE.ASSIGNED,
        classeEstimatedSeats: 42,
        cohortId: cohort._id.toString(),
        result: "success",
        cohortCode: cohort.snuId,
        cohortName: cohort.name,
      },
      {
        classeId: notExistingClasseId,
        cohortCode: cohort.snuId,
        result: "error",
        error: ERRORS.CLASSE_NOT_FOUND,
      },
      {
        classeId: classe2._id.toString(),
        cohortCode: notExistingCohortCode,
        result: "error",
        error: ERRORS.COHORT_NOT_FOUND,
      },
      {
        classeId: classe3._id.toString(),
        cohortCode: "",
        result: "error",
        error: FUNCTIONAL_ERRORS.NO_COHORT_CODE_PROVIDED,
      },
      {
        classeId: "",
        cohortCode: cohort.snuId,
        result: "error",
        error: FUNCTIONAL_ERRORS.NO_CLASSE_ID_PROVIDED,
      },
    ];
    expect(response.body.ok).toBe(true);
    expect(response.body.data).toEqual(expectedResponse);
  });

  it("should return 422 when unable to parse the CSV", async () => {
    const mockInvalidCSVBuffer = Buffer.from("one_header\nvalue1,value2"); // Missing one column
    (getFile as jest.Mock).mockResolvedValue({ Body: mockInvalidCSVBuffer });

    const response = await request(getAppHelper()).post("/cle/classe/import/classe-cohort").send(requestBody);

    expect(response.status).toEqual(422);
    expect(response.body.ok).toBe(false);

    expect(response.body.code).toEqual(ERRORS.CANNOT_PARSE_CSV);
  });

  it("should return 403 for non-superadmin role", async () => {
    passport.user.role = ROLES.VISITOR;
    const response = await request(getAppHelper()).post("/cle/classe/import/classe-cohort").send(requestBody);

    expect(response.status).toEqual(403);
    expect(response.body).toEqual({
      ok: false,
      code: ERRORS.OPERATION_UNAUTHORIZED,
    });
  });
});
