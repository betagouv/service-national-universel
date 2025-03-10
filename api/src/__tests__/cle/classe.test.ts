import request from "supertest";
import { Types } from "mongoose";
const { ObjectId } = Types;
import emailsEmitter from "../../emails";
import snuLib, { FUNCTIONAL_ERRORS, LIMIT_DATE_ESTIMATED_SEATS, SUB_ROLE_GOD } from "snu-lib";
import { ROLES, SUB_ROLES, STATUS_CLASSE, SENDINBLUE_TEMPLATES, CLE_COLORATION, TYPE_CLASSE, ERRORS, ClasseCertificateKeys } from "snu-lib";
import * as classeService from "../../cle/classe/classeService";
import { dbConnect, dbClose } from "../helpers/db";
import { mockEsClient } from "../helpers/es";
import getAppHelper, { resetAppAuth } from "../helpers/app";
import * as featureService from "../../featureFlag/featureFlagService";

// classe
import { createClasse } from "../helpers/classe";
import { createFixtureClasse } from "../fixtures/classe";

// etablissement
import { createFixtureEtablissement } from "../fixtures/etablissement";
import { createEtablissement } from "../helpers/etablissement";
import { ClasseModel, EtablissementModel, ReferentDocument, ReferentModel } from "../../models";

// young
import getNewYoungFixture from "../fixtures/young";
import { createYoungHelper } from "../helpers/young";
import { YoungModel } from "../../models";

// cohort
import getNewCohortFixture from "../fixtures/cohort";
import { createCohortHelper } from "../helpers/cohort";

// referent
import { getNewReferentFixture, getNewSignupReferentFixture } from "../fixtures/referent";
import { createReferentHelper } from "../helpers/referent";

beforeAll(() => dbConnect(__filename.slice(__dirname.length + 1, -3)));
afterAll(dbClose);
beforeEach(async () => {
  await ClasseModel.deleteMany({});
  await EtablissementModel.deleteMany({});
  await ReferentModel.deleteMany({});
});
afterEach(resetAppAuth);

mockEsClient({
  classe: [{ _id: "classeId", etablissementIds: ["etabId"], referentClasseIds: ["referentId"] }],
  etablissement: [{ _id: "etabId" }],
  referent: [{ _id: "referentId" }],
});

jest.mock("../../emails", () => ({
  emit: jest.fn(),
}));

class MockDate extends Date {
  constructor() {
    super(LIMIT_DATE_ESTIMATED_SEATS.getTime() - 24 * 60 * 60 * 1000);
  }
}

describe("GET /cle/classe/:id", () => {
  afterEach(resetAppAuth);
  it("should return 400 when id is invalid", async () => {
    const res = await request(getAppHelper()).get("/cle/classe/invalidId");
    expect(res.status).toBe(400);
  });

  it("should return 403 when user cannot update classes", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;

    const withDetails = true;
    const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE })).get(`/cle/classe/${validId}?withDetails=${withDetails}`);
    expect(res.status).toBe(403);
  });

  it("should return 400 when query params are invalid", async () => {
    const classeId = new ObjectId();
    const res = await request(getAppHelper()).get(`/cle/classe/${classeId}?withDetails=invalid`);
    expect(res.status).toBe(400);
  });

  it("should return 404 when class is not found", async () => {
    const nonExistingId = "104a49ba503555e4d8853003";
    const res = await request(getAppHelper()).delete(`/cle/classe/${nonExistingId}`).query({ type: "delete" }).send();
    expect(res.status).toBe(404);
  });

  it("should return 200 and class data without details when withDetails is false", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;
    const withDetails = false;
    const res = await request(getAppHelper()).get(`/cle/classe/${validId}?withDetails=${withDetails}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("_id", validId.toString());
    expect(res.body.data).not.toHaveProperty("etablissement");
    expect(res.body.data).not.toHaveProperty("cohortDetails");
  });

  it("should return 200 and class data with details when withDetails is true", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;
    const withDetails = true;
    const res = await request(getAppHelper()).get(`/cle/classe/${validId}?withDetails=${withDetails}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("_id", validId.toString());
    expect(res.body.data).toHaveProperty("etablissement");
    expect(res.body.data).toHaveProperty("referents");
    expect(res.body.data).toHaveProperty("cohortDetails");
  });
});

describe("GET /cle/classe/public/:id", () => {
  afterEach(resetAppAuth);
  it("should return 400 when id is invalid", async () => {
    const res = await request(getAppHelper()).get("/cle/classe/public/invalidId");
    expect(res.status).toBe(400);
  });

  it("should return 400 when query params are invalid", async () => {
    const classeId = new ObjectId();
    const res = await request(getAppHelper()).get(`/cle/classe/public/${classeId}?withDetails=invalid`);
    expect(res.status).toBe(400);
  });

  it("should return 404 when class is not found", async () => {
    const nonExistingId = "104a49ba503555e4d8853003";
    const res = await request(getAppHelper()).delete(`/cle/classe/public/${nonExistingId}`).query({ type: "delete" }).send();
    expect(res.status).toBe(404);
  });

  it("should return 200 and class data without details when withDetails is false", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;
    const withDetails = false;
    const res = await request(getAppHelper()).get(`/cle/classe/public/${validId}?withDetails=${withDetails}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("_id", validId.toString());
    expect(res.body.data).not.toHaveProperty("etablissement");
    expect(res.body.data).not.toHaveProperty("cohortDetails");
  });

  it("should return 200 and class data with details when withDetails is true", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;
    const withDetails = true;
    const res = await request(getAppHelper()).get(`/cle/classe/public/${validId}?withDetails=${withDetails}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("_id", validId.toString());
    expect(res.body.data).toHaveProperty("etablissement");
    expect(res.body.data).toHaveProperty("referents");
    expect(res.body.data).toHaveProperty("cohortDetails");
  });
});

describe("DELETE /cle/classe/:id", () => {
  it("should return 400 when id is invalid", async () => {
    const res = await request(getAppHelper()).delete("/cle/classe/invalidId?type=delete");
    expect(res.status).toBe(400);
  });

  it("should return 400 when type is invalid", async () => {
    const classeId = new ObjectId();
    const res = await request(getAppHelper()).delete(`/cle/classe/${classeId}`).query({ type: "invalidType" }).send();
    expect(res.status).toBe(400);
  });

  it("should return 403 when type is withdraw and user cannot withdraw classes", async () => {
    const classeId = new ObjectId();
    const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
      .delete(`/cle/classe/${classeId}`)
      .query({ type: "withdraw" })
      .send();
    expect(res.status).toBe(403);
  });

  it("should return 403 when type is delete and user cannot delete classes", async () => {
    const classeId = new ObjectId();
    const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
      .delete(`/cle/classe/${classeId}`)
      .query({ type: "delete" })
      .send();
    expect(res.status).toBe(403);
  });

  it("should return 404 when class is not found", async () => {
    const nonExistingId = "104a49ba503555e4d8853003";
    const res = await request(getAppHelper()).delete(`/cle/classe/${nonExistingId}`).query({ type: "delete" }).send();
    expect(res.status).toBe(404);
  });

  it("should return 200 when class is deleted successfully", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;
    const res = await request(getAppHelper()).delete(`/cle/classe/${validId}`).query({ type: "delete" }).send();
    expect(res.status).toBe(200);
  });

  it("should return 200 when class is withdrawn successfully", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;
    const res = await request(getAppHelper()).delete(`/cle/classe/${validId}`).query({ type: "withdraw" }).send();
    expect(res.status).toBe(200);
  });
});

describe("PUT /cle/classe/:id", () => {
  it("should return 400 when id is invalid", async () => {
    const res = await request(getAppHelper()).put("/cle/classe/invalidId").send({ name: "New Class" });
    expect(res.status).toBe(400);
  });

  it("should return 400 when required fields are missing", async () => {
    const classeId = new ObjectId();
    const res = await request(getAppHelper()).put(`/cle/classe/${classeId}`).send({ name: "New Class" });
    expect(res.status).toBe(400);
  });

  it("should return 403 when user cannot update classes", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;
    const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        name: "New Class",
      });
    expect(res.status).toBe(403);
  });

  it("should return 404 when class is not found", async () => {
    const nonExistingId = "104a49ba503555e4d8853003";
    const classe = createFixtureClasse();
    const res = await request(getAppHelper())
      .put(`/cle/classe/${nonExistingId}`)
      .send({
        ...classe,
        name: "New Class",
      });
    expect(res.status).toBe(404);
  });

  it("should return 403 when REFERENT_CLASSE tries to update a class they don't manage", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;

    const res = await request(getAppHelper({ role: ROLES.REFERENT_CLASSE, _id: new ObjectId().toString() }))
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        name: "New Class",
      });
    expect(res.status).toBe(403);
  });

  it("should return 404 when the associated etablissement does not exist", async () => {
    const userId = new ObjectId();
    const classe = createFixtureClasse({ etablissementId: new ObjectId().toString() });
    const validId = (await createClasse(classe))._id;
    jest.spyOn(EtablissementModel, "findById").mockResolvedValueOnce(null);
    const res = await request(getAppHelper({ role: ROLES.ADMINISTRATEUR_CLE, _id: userId.toString() }))
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        name: "Updated Class",
      });
    expect(res.status).toBe(404);
  });

  it("should return 403 when ADMINISTRATEUR_CLE is both referent and coordinateur", async () => {
    const userId = new ObjectId().toString();
    const etablissement = createFixtureEtablissement({ referentEtablissementIds: [userId], coordinateurIds: [userId] });
    const etablissementId = (await createEtablissement(etablissement))._id;
    const classe = createFixtureClasse({ etablissementId: etablissementId });
    const validId = (await createClasse(classe))._id;
    jest.spyOn(EtablissementModel, "findById").mockResolvedValueOnce(etablissement);
    const res = await request(getAppHelper({ _id: userId.toString(), role: ROLES.ADMINISTRATEUR_CLE }))
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        name: "Updated Class",
      });
    expect(res.status).toBe(403);
  });

  it("should return 404 when user try to change cohort that doesn't exist", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;
    const cohortId = new ObjectId().toString();
    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        cohortId: cohortId,
      });
    expect(res.status).toBe(404);
  });

  it("should return 403 when user cannot update the cohort", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture({ name: "CLE juin 2024" }));
    const userId = new ObjectId().toString();
    const etablissement = createFixtureEtablissement({ referentEtablissementIds: [userId] });
    const etablissementId = (await createEtablissement(etablissement))._id;
    const classe = createFixtureClasse({ etablissementId: etablissementId });
    const validId = (await createClasse(classe))._id;
    jest.spyOn(EtablissementModel, "findById").mockResolvedValueOnce(etablissement);
    const res = await request(getAppHelper({ role: ROLES.ADMINISTRATEUR_CLE }))
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        cohortId: cohort._id,
      });
    expect(res.status).toBe(403);
  });

  it("should return 403 when changing cohort is not allowed because young has validate his Phase1", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture());
    const classe = createFixtureClasse({});
    const validId = (await createClasse(classe))._id;
    const young = getNewYoungFixture({ classeId: validId, statusPhase1: "DONE" });
    await createYoungHelper(young);

    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        cohortId: cohort._id,
      });

    expect(res.status).toBe(403);
  });

  it("should return 403 when user can't edit estimatedSeats", async () => {
    const classe = createFixtureClasse({ estimatedSeats: 5 });
    const validId = (await createClasse(classe))._id;
    const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        estimatedSeats: 10,
      });
    expect(res.status).toBe(403);
  });

  it("should send mail if value.estimatedSeats > classe.estimatedSeats", async () => {
    const classeFixture = createFixtureClasse({ estimatedSeats: 5, totalSeats: 5 });
    const classe = await createClasse(classeFixture);
    // @ts-ignore
    global.Date = MockDate;
    const res = await request(getAppHelper())
      .put(`/cle/classe/${classe._id}`)
      .send({
        ...classeFixture,
        estimatedSeats: 10,
      });
    expect(res.status).toBe(200);
    expect(emailsEmitter.emit).toHaveBeenCalledWith(
      SENDINBLUE_TEMPLATES.CLE.CLASSE_INCREASE_OBJECTIVE,
      expect.objectContaining({
        estimatedSeats: 10,
        totalSeats: 10,
        _id: classe._id,
      }),
    );
    global.Date = Date;
  });

  it("should updte totalSeats when estimatedSeats change and date < LIMIT_DATE_ESTIMATED_SEATS", async () => {
    const classe = createFixtureClasse({ estimatedSeats: 5, totalSeats: 5 });
    const validId = (await createClasse(classe))._id;
    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        estimatedSeats: 10,
      });
    expect(res.status).toBe(200);
    expect(res.body.data.totalSeats).toBe(10);
  });

  it("should return 403 when user can't edit totalSeats", async () => {
    const classe = createFixtureClasse({ totalSeats: 5 });
    const validId = (await createClasse(classe))._id;
    const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        totalSeats: 10,
      });
    expect(res.status).toBe(403);
  });

  it("should return 400 when totalSeats > estimatedSeats", async () => {
    const classe = createFixtureClasse({ estimatedSeats: 1, totalSeats: 1 });
    const validId = (await createClasse(classe))._id;
    jest.spyOn(snuLib, "canEditTotalSeats").mockReturnValueOnce(true);
    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        totalSeats: 10,
      });
    expect(res.status).toBe(400);
  });

  it("should return 403 when changing cohort is not allowed because classe has a ligneID", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture());
    const classe = createFixtureClasse({ ligneId: "1234" });
    const validId = (await createClasse(classe))._id;

    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        cohortId: cohort._id,
      });

    expect(res.status).toBe(403);
  });

  it("should return 200 when class is updated successfully", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;

    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        name: "New Class",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("New Class");
  });

  it("should return 200 when class cohort is updated and related youngs are updated", async () => {
    const cohort = await createCohortHelper(getNewCohortFixture({ name: "CLE juin 2024" }));
    const classe = createFixtureClasse({});
    const validId = (await createClasse(classe))._id;
    const young = getNewYoungFixture({ classeId: validId, cohortId: cohort._id });
    await createYoungHelper(young);

    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}`)
      .send({
        ...classe,
        cohortId: cohort._id,
      });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(classe.name);

    const updatedYoungs = await YoungModel.find({ classeId: validId });
    updatedYoungs.forEach((y) => {
      expect(y.cohort).toBe(cohort.name);
      expect(y.sessionPhase1Id).toBeUndefined();
      expect(y.cohesionCenterId).toBeUndefined();
      expect(y.meetingPointId).toBeUndefined();
    });
  });
});

describe("PUT /cle/classe/:id/verify", () => {
  it("should return 400 when id is invalid", async () => {
    const res = await request(getAppHelper()).put("/cle/classe/invalidId/verify").send({ name: "New Class" });
    expect(res.status).toBe(400);
  });

  it("should return 400 when required fields are missing", async () => {
    const classeId = new ObjectId();
    const res = await request(getAppHelper()).put(`/cle/classe/${classeId}/verify`).send({ name: "New Class" });
    expect(res.status).toBe(400);
  });

  it("should return 403 when user cannot verify classes", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;
    const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
      .put(`/cle/classe/${validId}/verify`)
      .send({
        ...classe,
      });
    expect(res.status).toBe(403);
  });

  it("should return 404 when class is not found", async () => {
    const nonExistingId = "104a49ba503555e4d8853003";
    const classe = createFixtureClasse();
    const res = await request(getAppHelper())
      .put(`/cle/classe/${nonExistingId}/verify`)
      .send({
        ...classe,
      });
    expect(res.status).toBe(404);
  });

  it("should return 404 when class doesn't have a referent_classe", async () => {
    const classe = createFixtureClasse();
    const validId = (await createClasse(classe))._id;
    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}/verify`)
      .send({
        ...classe,
      });
    expect(res.status).toBe(404);
  });

  it("should return 404 when the associated etablissement does not exist", async () => {
    const referentId = (await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE })))._id;
    const classe = createFixtureClasse({ etablissementId: new ObjectId().toString(), referentClasseIds: [referentId] });
    const validId = (await createClasse(classe))._id;

    jest.spyOn(EtablissementModel, "findById").mockResolvedValueOnce(null);
    const res = await request(
      getAppHelper({
        role: ROLES.ADMINISTRATEUR_CLE,
        subRole: SUB_ROLES.referent_etablissement,
        _id: new ObjectId().toString(),
      }),
    )
      .put(`/cle/classe/${validId}/verify`)
      .send({
        ...classe,
      });
    expect(res.status).toBe(404);
  });

  it("should return 403 when REFERENT_ETABLISSEMENT tries to verify a class they don't manage", async () => {
    const referentId = (await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE })))._id;
    const etablissementId = (await createEtablissement(createFixtureEtablissement()))._id;
    const classe = createFixtureClasse({ etablissementId: etablissementId, referentClasseIds: [referentId] });
    const validId = (await createClasse(classe))._id;
    const res = await request(getAppHelper({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.referent_etablissement }))
      .put(`/cle/classe/${validId}/verify`)
      .send({
        ...classe,
      });
    expect(res.status).toBe(403);
  });

  it("should return 403 when REFERENT_DEPARTMENT tries to verify a class they don't manage", async () => {
    const referentId = (await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE })))._id;
    const classe = createFixtureClasse({ referentClasseIds: [referentId], department: "Nord" });
    const validId = (await createClasse(classe))._id;
    const res = await request(getAppHelper({ role: ROLES.REFERENT_DEPARTMENT, department: ["Loire"] }))
      .put(`/cle/classe/${validId}/verify`)
      .send({
        ...classe,
      });
    expect(res.status).toBe(403);
  });

  it("should return 403 when REFERENT_REGION tries to verify a class they don't manage", async () => {
    const referentId = (await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE })))._id;
    const classe = createFixtureClasse({ referentClasseIds: [referentId], region: "Normandie" });
    const validId = (await createClasse(classe))._id;
    const res = await request(
      getAppHelper({
        role: ROLES.REFERENT_REGION,
        region: "Bretagne",
      }),
    )
      .put(`/cle/classe/${validId}/verify`)
      .send({
        ...classe,
      });
    expect(res.status).toBe(403);
  });

  it("should return 200 when class is updated successfully", async () => {
    const referentId = (await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE })))._id;
    const classe = createFixtureClasse({ referentClasseIds: [referentId] });
    const validId = (await createClasse(classe))._id;

    const res = await request(getAppHelper())
      .put(`/cle/classe/${validId}/verify`)
      .send({
        ...classe,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe(STATUS_CLASSE.VERIFIED);
  });
});

describe("GET /:id/notifyRef", () => {
  it("should return 400 when id is invalid", async () => {
    const res = await request(getAppHelper()).get("/cle/classe/invalidId/notifyRef");
    expect(res.status).toBe(400);
  });

  it("should return 403 when user cannot notify admin", async () => {
    const classeId = new ObjectId();
    const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE })).get(`/cle/classe/${classeId}/notifyRef`);
    expect(res.status).toBe(403);
  });

  it("should return 404 when class is not found", async () => {
    const nonExistingId = "104a49ba503555e4d8853003";
    const res = await request(getAppHelper()).get(`/cle/classe/${nonExistingId}/notifyRef`);
    expect(res.status).toBe(404);
  });

  it("should return 403 when REFERENT_REGION tries to notify a class they don't manage", async () => {
    const etablissementId = (await createEtablissement(createFixtureEtablissement()))._id;
    const classe = createFixtureClasse({ etablissementId: etablissementId, region: "Normandie" });
    const validId = (await createClasse(classe))._id;

    const res = await request(
      getAppHelper({
        role: ROLES.REFERENT_REGION,
        region: "Bretagne",
      }),
    ).get(`/cle/classe/${validId}/notifyRef`);
    expect(res.status).toBe(403);
  });

  it("should return 403 when REFERENT_DEPARTMENT tries to notify a class they don't manage", async () => {
    const etablissementId = (await createEtablissement(createFixtureEtablissement()))._id;
    const classe = createFixtureClasse({ etablissementId: etablissementId, department: "Nord" });
    const validId = (await createClasse(classe))._id;
    const res = await request(
      getAppHelper({
        role: ROLES.REFERENT_DEPARTMENT,
        department: ["Loire"],
      }),
    ).get(`/cle/classe/${validId}/notifyRef`);
    expect(res.status).toBe(403);
  });

  it("should return 200 when referents are notified successfully", async () => {
    const etablissementId = (await createEtablissement(createFixtureEtablissement()))._id;
    const classe = createFixtureClasse({ etablissementId: etablissementId });
    const validId = (await createClasse(classe))._id;

    const res = await request(getAppHelper()).get(`/cle/classe/${validId}/notifyRef`);

    expect(res.status).toBe(200);
  });
});

describe("POST /cle/classe", () => {
  const validBody = {
    etablissementId: new ObjectId(),
    coloration: CLE_COLORATION.ENVIRONMENT,
    estimatedSeats: 10,
    type: TYPE_CLASSE.FULL,
    name: "Classe Test",
    grades: ["1ereCAP"],
    filiere: "Enseignement adapté",
    referent: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
    },
  };
  it("should return 400 if the request body is invalid", async () => {
    const response = await request(getAppHelper()).post("/cle/classe").send({});
    expect(response.status).toBe(400);
  });

  it("should return 403 if the user is not authorized to create a classe", async () => {
    const response = await request(getAppHelper({ role: ROLES.VISITOR }))
      .post("/cle/classe")
      .send(validBody);
    expect(response.status).toBe(403);
  });

  it("should return 409 if a classe with the same uniqueKey, uniqueId, and etablissementId already exists", async () => {
    const etablissement = await createEtablissement(createFixtureEtablissement());
    await createClasse(createFixtureClasse({ name: "Classe 1", uniqueKey: "C-PDLL072", uniqueId: "0EE948" }));
    const response = await request(getAppHelper({ role: ROLES.ADMIN }))
      .post("/cle/classe")
      .send({ ...validBody, etablissementId: etablissement._id.toString() });
    expect(response.status).toBe(409);
    expect(response.body.code).toBe(ERRORS.ALREADY_EXISTS);
    expect(response.body.message).toBe("Classe already exists.");
  });

  it("should return 404 if etablissement is not found", async () => {
    const response = await request(getAppHelper({ role: ROLES.ADMIN }))
      .post("/cle/classe")
      .send(validBody);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Etablissement not found.");
  });

  it("should return 409 if the referent is already registered", async () => {
    const etablissement = await createEtablissement(createFixtureEtablissement());
    await createReferentHelper(getNewSignupReferentFixture({ email: validBody.referent.email }));
    const response = await request(getAppHelper({ role: ROLES.ADMIN }))
      .post("/cle/classe")
      .send({ ...validBody, etablissementId: etablissement._id.toString() });
    expect(response.status).toBe(409);
    expect(response.body.code).toBe(ERRORS.USER_ALREADY_REGISTERED);
  });

  it("should return 404 if the cohort is not found", async () => {
    jest.spyOn(featureService, "isFeatureAvailable").mockResolvedValueOnce(true);
    const etablissement = await createEtablissement(createFixtureEtablissement());
    const cohortId = new ObjectId().toString();
    const response = await request(getAppHelper({ role: ROLES.ADMIN }))
      .post("/cle/classe")
      .send({ ...validBody, cohortId: cohortId, etablissementId: etablissement._id.toString() });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Cohort not found.");
  });

  it("should return 200 if the classe is valid (with cohort but no FF)", async () => {
    const etablissement = await createEtablissement(createFixtureEtablissement());
    const cohort = await createCohortHelper(getNewCohortFixture());
    const response = await request(getAppHelper({ role: ROLES.ADMIN }))
      .post("/cle/classe")
      .send({ ...validBody, cohortId: cohort._id, etablissementId: etablissement._id.toString() });

    expect(response.status).toBe(400);
  });

  it("should return 200 if the classe is valid (with cohort and FF)", async () => {
    jest.spyOn(featureService, "isFeatureAvailable").mockResolvedValueOnce(true);
    const etablissement = await createEtablissement(createFixtureEtablissement());
    const cohort = await createCohortHelper(getNewCohortFixture());
    const response = await request(getAppHelper({ role: ROLES.ADMIN }))
      .post("/cle/classe")
      .send({ ...validBody, cohortId: cohort._id, etablissementId: etablissement._id.toString() });

    expect(response.status).toBe(200);
    const classe = await ClasseModel.findById(response.body.data._id).lean();
    expect(classe).toBeDefined();
    expect(classe?.name).toBe(validBody.name);
    expect(classe?.uniqueKey).toBe("C-PDLL072");
    expect(classe?.uniqueId).toBe("0EE948");
    expect(classe?.etablissementId).toBe(etablissement._id.toString());
    expect(classe?.cohort).toBe(cohort.name);
    expect(classe?.filiere).toBe(validBody.filiere);
    expect(classe?.grades).toStrictEqual(validBody.grades);
  });

  it("should return 200 if the classe is valid (without cohort)", async () => {
    const etablissement = await createEtablissement(createFixtureEtablissement());
    const response = await request(getAppHelper({ role: ROLES.ADMIN }))
      .post("/cle/classe")
      .send({ ...validBody, etablissementId: etablissement._id.toString() });

    expect(response.status).toBe(200);
    const classe = await ClasseModel.findById(response.body.data._id).lean();
    expect(classe).toBeDefined();
    expect(classe?.name).toBe(validBody.name);
    expect(classe?.uniqueKey).toBe("C-PDLL072");
    expect(classe?.uniqueId).toBe("0EE948");
    expect(classe?.etablissementId).toBe(etablissement._id.toString());
    expect(classe?.cohort).toBe(null);
    expect(classe?.filiere).toBe(validBody.filiere);
    expect(classe?.grades).toStrictEqual(validBody.grades);
  });
});

describe("POST /elasticsearch/cle/classe/export", () => {
  it("should return 403 when user is not admin", async () => {
    const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
      .post("/elasticsearch/cle/classe/export")
      .send();
    expect(res.status).toBe(403);
  });
  it("should return 200 when export is successful", async () => {
    const res = await request(getAppHelper())
      .post("/elasticsearch/cle/classe/export")
      .send({ filters: {}, exportFields: ["name", "uniqueKeyAndId"] });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe("POST /elasticsearch/cle/etablissement/export", () => {
  it("should return 403 when user is not admin", async () => {
    const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
      .post("/elasticsearch/cle/etablissement/export")
      .send();
    expect(res.status).toBe(403);
  });
  it("should return 200 when export is successful", async () => {
    const res = await request(getAppHelper())
      .post("/elasticsearch/cle/etablissement/export")
      .send({ filters: {}, exportFields: ["name", "uai"] });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe("PUT /cle/classe/:id/referent", () => {
  it("should create a new referent then link its id to classe", async () => {
    const referent = await createReferentHelper(getNewReferentFixture({ email: "a@a.com", role: ROLES.REFERENT_CLASSE }));
    const classe = await createClasse(createFixtureClasse({ status: STATUS_CLASSE.CREATED, referentClasseIds: [referent?._id] }));

    const newReferentDetails = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
    };

    const res = await request(getAppHelper()).put(`/cle/classe/${classe._id}/referent`).send(newReferentDetails); // sending new referent data
    const updatedReferent: ReferentDocument = (await ReferentModel.findOne({ email: newReferentDetails.email }))!;

    expect(updatedReferent).toBeTruthy();
    expect(updatedReferent.firstName).toBe(newReferentDetails.firstName);
    expect(updatedReferent.lastName).toBe(newReferentDetails.lastName);
    expect(updatedReferent.email).toBe(newReferentDetails.email);
    expect(updatedReferent.metadata.isFirstInvitationPending).toBe(true);
    expect(res.status).toBe(200);
  });

  it("should update the link of the new referent to classe", async () => {
    const referent = await createReferentHelper(getNewReferentFixture({ email: "a@a.com", role: ROLES.REFERENT_CLASSE }));
    const referent2 = await createReferentHelper(getNewReferentFixture({ email: "b@b.com", role: ROLES.REFERENT_CLASSE }));
    const classe1 = await createClasse(createFixtureClasse({ status: STATUS_CLASSE.CREATED, referentClasseIds: [referent?._id] }));

    const newReferentDetails = {
      firstName: "John",
      lastName: "Doe",
      email: "b@b.com",
    };

    const res = await request(getAppHelper()).put(`/cle/classe/${classe1._id}/referent`).send(newReferentDetails); // sending new referent data
    const referentId = (await ClasseModel.findById(classe1._id))?.referentClasseIds[0];
    const updatedReferent: ReferentDocument = (await ReferentModel.findById(referentId))!;

    expect(updatedReferent).toBeTruthy();
    expect(updatedReferent.firstName).toBe(newReferentDetails.firstName);
    expect(updatedReferent.lastName).toBe(newReferentDetails.lastName);
    expect(updatedReferent.email).toBe(newReferentDetails.email);
    expect(res.status).toBe(200);
  });

  it("should return 422 if classe is not CREATED for non super admin", async () => {
    const referent = await createReferentHelper(getNewReferentFixture({ email: "a@a.com", role: ROLES.REFERENT_CLASSE }));
    const classe1 = await createClasse(createFixtureClasse({ status: STATUS_CLASSE.VERIFIED, referentClasseIds: [referent?._id] }));

    const newReferentDetails = {
      firstName: "John",
      lastName: "Doe",
      email: "b@b.com",
    };

    const res = await request(getAppHelper()).put(`/cle/classe/${classe1._id}/referent`).send(newReferentDetails); // sending new referent data

    expect(res.ok).toBe(false);
    expect(res.text).toContain(FUNCTIONAL_ERRORS.CANNOT_BE_ADDED_AS_A_REFERENT_CLASSE);
    expect(res.status).toBe(422);
  });

  it("should create a new referent if classe is not CREATED for super admin", async () => {
    const referent = await createReferentHelper(getNewReferentFixture({ email: "a@a.com", role: ROLES.REFERENT_CLASSE }));
    const classe = await createClasse(createFixtureClasse({ status: STATUS_CLASSE.CREATED, referentClasseIds: [referent?._id] }));
    const newReferentDetails = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
    };

    const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: SUB_ROLE_GOD }))
      .put(`/cle/classe/${classe._id}/referent`)
      .send(newReferentDetails); // sending new referent data
    const updatedReferent: ReferentDocument = (await ReferentModel.findOne({ email: newReferentDetails.email }))!;

    expect(updatedReferent).toBeTruthy();
    expect(updatedReferent.firstName).toBe(newReferentDetails.firstName);
    expect(updatedReferent.lastName).toBe(newReferentDetails.lastName);
    expect(updatedReferent.email).toBe(newReferentDetails.email);
    expect(updatedReferent.metadata.isFirstInvitationPending).toBe(true);
    expect(res.status).toBe(200);
  });

  it("should throw an error if role not referent nor admin cle", async () => {
    const referent = await createReferentHelper(getNewReferentFixture({ email: "a@a.com", role: ROLES.REFERENT_CLASSE }));
    await createReferentHelper(getNewReferentFixture({ email: "b@b.com", role: ROLES.VISITOR }));
    const classe1 = await createClasse(createFixtureClasse({ referentClasseIds: [referent?._id] }));

    const newReferentDetails = {
      firstName: "John",
      lastName: "Doe",
      email: "b@b.com",
    };

    const res = await request(getAppHelper()).put(`/cle/classe/${classe1._id}/referent`).send(newReferentDetails); // sending new referent data

    expect(res.ok).toBe(false);
    expect(res.text).toContain(FUNCTIONAL_ERRORS.CANNOT_BE_ADDED_AS_A_REFERENT_CLASSE);
    expect(res.status).toBe(422);
  });

  it("should return 403 if the user is not authorized to update the referent classe", async () => {
    const referent = await createReferentHelper(getNewReferentFixture({ email: "a@a.com", role: ROLES.REFERENT_CLASSE }));
    const classe = await createClasse(createFixtureClasse({ status: STATUS_CLASSE.CREATED, referentClasseIds: [referent?._id] }));
    const newReferentDetails = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
    };
    // Assuming this role is not authorized to update the referent classe
    const res = await request(getAppHelper({ role: ROLES.REFERENT_CLASSE }))
      .put(`/cle/classe/${classe._id}/referent`)
      .send(newReferentDetails); // sending new referent data
    expect(res.ok).toBe(false);
    expect(res.text).toContain(ERRORS.OPERATION_UNAUTHORIZED);
    expect(res.status).toBe(403);
  });
});

describe("POST /:id/certificate/:key", () => {
  it("should return 400 when id is invalid", async () => {
    const invalidId = "invalidId";
    const res = await request(getAppHelper()).post(`/cle/classe/${invalidId}/certificate/IMAGE`);
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.code).toBe(ERRORS.INVALID_PARAMS);
  });

  it("should return 400 when certificate key is invalid", async () => {
    const validId = new ObjectId();
    const invalidKey = "invalidKey";
    const res = await request(getAppHelper()).post(`/cle/classe/${validId}/certificate/${invalidKey}`);
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.code).toBe(ERRORS.INVALID_PARAMS);
  });

  it("should return 403 when the user is not authorized to download certificates", async () => {
    const validId = new ObjectId();
    const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.DSNJ }));
    const res = await request(getAppHelper(referent)).post(`/cle/classe/${validId}/certificate/${ClasseCertificateKeys.CONVOCATION}`);
    expect(res.status).toBe(403);
    expect(res.body.ok).toBe(false);
    expect(res.body.code).toBe(ERRORS.OPERATION_NOT_ALLOWED);
  });

  it("should return 404 when class is not found", async () => {
    const nonExistingId = "104a49ba503555e4d8853003";
    const res = await request(getAppHelper()).post(`/cle/classe/${nonExistingId}/certificate/${ClasseCertificateKeys.CONVOCATION}`);
    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
    expect(res.body.code).toBe(ERRORS.NOT_FOUND);
  });

  it("should return 500 if an error occurs during certificate generation", async () => {
    const validId = (await createClasse(createFixtureClasse()))._id;
    const key = ClasseCertificateKeys.CONSENT;
    const generateConsentementSpy = jest.spyOn(classeService, "generateConsentementByClasseId").mockRejectedValue(new Error("Test Error"));

    const res = await request(getAppHelper()).post(`/cle/classe/${validId}/certificate/${key}`);
    expect(res.status).toBe(500);
    expect(res.body.ok).toBe(false);
    expect(res.body.code).toBe("Test Error");

    generateConsentementSpy.mockRestore();
  });

  it("should return 200 and send the convocations when request is successful", async () => {
    const validId = (await createClasse(createFixtureClasse()))._id;
    const key = ClasseCertificateKeys.CONVOCATION;

    const mockCertificate = Buffer.from("PDF content");
    const generateConvocationsSpy = jest.spyOn(classeService, "generateConvocationsByClasseId").mockResolvedValue(mockCertificate);

    const res = await request(getAppHelper()).post(`/cle/classe/${validId}/certificate/${key}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockCertificate);

    generateConvocationsSpy.mockRestore();
  });

  it("should return 200 and send the consentements when request is successful", async () => {
    const validId = (await createClasse(createFixtureClasse()))._id;
    const key = ClasseCertificateKeys.CONSENT;

    const mockCertificate = Buffer.from("PDF content");
    const generateConsentementsSpy = jest.spyOn(classeService, "generateConsentementByClasseId").mockResolvedValue(mockCertificate);

    const res = await request(getAppHelper()).post(`/cle/classe/${validId}/certificate/${key}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockCertificate);

    generateConsentementsSpy.mockRestore();
  });

  it("should return 200 and send the imageRight when request is successful", async () => {
    const validId = (await createClasse(createFixtureClasse()))._id;
    const key = ClasseCertificateKeys.IMAGE;

    const mockCertificate = Buffer.from("PDF content");
    const generateImageRightSpy = jest.spyOn(classeService, "generateImageRightByClasseId").mockResolvedValue(mockCertificate);

    const res = await request(getAppHelper()).post(`/cle/classe/${validId}/certificate/${key}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockCertificate);

    generateImageRightSpy.mockRestore();
  });
});

describe("GET /cle/classe/:id/patches", () => {
  it("should return 404 if classe not found", async () => {
    const classeId = new ObjectId();
    const res = await request(getAppHelper()).get(`/cle/classe/${classeId}/patches`).send();
    expect(res.statusCode).toEqual(404);
  });
  it("should return 403 if not admin", async () => {
    const classe = await createClasse(createFixtureClasse());
    classe.name = "MY NEW NAME";
    await classe.save();

    const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
      .get(`/cle/classe/${classe._id}/patches`)
      .send();
    expect(res.status).toBe(403);
  });
  it("should return 200 if classe found with patches", async () => {
    const classe = await createClasse(createFixtureClasse());
    classe.name = "MY NEW NAME";
    await classe.save();
    const res = await request(getAppHelper()).get(`/cle/classe/${classe._id}/patches`).send();
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ops: expect.arrayContaining([expect.objectContaining({ op: "replace", path: "/name", value: "MY NEW NAME" })]),
        }),
      ]),
    );
  });
  it("should be only accessible by referents", async () => {
    const passport = require("passport");
    const classeId = new ObjectId();
    await request(getAppHelper()).get(`/cle/classe/${classeId}/patches`).send();
    expect(passport.lastTypeCalledOnAuthenticate).toEqual("referent");
  });
});
