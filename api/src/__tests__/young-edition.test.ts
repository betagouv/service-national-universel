import request from "supertest";
import { ROLES, YOUNG_STATUS } from "snu-lib";

import getAppHelper from "./helpers/app";
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper, notExistingYoungId } from "./helpers/young";
import { dbConnect, dbClose } from "./helpers/db";
import { createClasse } from "./helpers/classe";
import { createEtablissement } from "./helpers/etablissement";
import { createFixtureClasse } from "./fixtures/classe";
import { createFixtureEtablissement } from "./fixtures/etablissement";

import { YoungModel, ClasseModel } from "../models";

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendTemplate: () => Promise.resolve(),
}));

beforeAll(dbConnect);
afterAll(dbClose);

describe("PUT /young-edition/:id/ref-allow-snu", () => {
  beforeEach(async () => {
    await YoungModel.deleteMany();
    await ClasseModel.deleteMany();
  });

  it("should return 400 when id is invalid", async () => {
    const res = await request(getAppHelper({ role: ROLES.REFERENT_CLASSE }))
      .put(`/young-edition/invalid_id/ref-allow-snu`)
      .send({ consent: true, imageRights: true });
    expect(res.statusCode).toEqual(400);
  });

  it("should return 403 if the user is not an referent_classe", async () => {
    const res = await request(getAppHelper({ role: ROLES.ADMIN }))
      .put(`/young-edition/${notExistingYoungId}/ref-allow-snu`)
      .send({ consent: true, imageRights: true });
    expect(res.statusCode).toEqual(403);
  });

  it("should return 404 when young does not exist", async () => {
    const res = await request(getAppHelper({ role: ROLES.REFERENT_CLASSE }))
      .put(`/young-edition/${notExistingYoungId}/ref-allow-snu`)
      .send({ consent: true, imageRights: true });
    expect(res.statusCode).toEqual(404);
  });

  it("should return 403 if the young is not CLE", async () => {
    const young = await createYoungHelper(getNewYoungFixture());
    const res = await request(getAppHelper({ role: ROLES.REFERENT_CLASSE }))
      .put(`/young-edition/${young._id}/ref-allow-snu`)
      .send({ consent: true, imageRights: true });
    expect(res.statusCode).toEqual(403);
  });

  it("should return 400 if the request body is invalid", async () => {
    const young = await createYoungHelper(getNewYoungFixture());
    const res = await request(getAppHelper({ role: ROLES.ADMIN }))
      .put(`/young-edition/${young._id}/ref-allow-snu`)
      .send({ consent: "invalid", imageRights: "invalid" });

    expect(res.statusCode).toEqual(400);
  });

  it("should update the young and return 200", async () => {
    const userId = "123";
    const etablissement = await createEtablissement(createFixtureEtablissement());
    const classe = await createClasse(createFixtureClasse({ etablissementId: etablissement._id, referentClasseIds: [userId] }));
    const young = await createYoungHelper(getNewYoungFixture({ inscriptionStep2023: "WAITING_CONSENT", source: "CLE", classeId: classe._id }));
    const res = await request(getAppHelper({ role: ROLES.REFERENT_CLASSE, _id: userId }))
      .put(`/young-edition/${young._id}/ref-allow-snu`)
      .send({ consent: true, imageRights: true });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.inscriptionStep2023).toEqual("DONE");
    expect(res.body.data.status).toEqual("WAITING_VALIDATION");
    expect(res.body.data.parent1AllowImageRights).toEqual("true");
  });
});

describe("PUT /young-edition/ref-allow-snu", () => {
  beforeEach(async () => {
    await YoungModel.deleteMany();
    await ClasseModel.deleteMany();
  });

  it("should return 400 when id is invalid", async () => {
    const res = await request(getAppHelper({ role: ROLES.REFERENT_CLASSE }))
      .put(`/young-edition/ref-allow-snu`)
      .send({ youngIds: ["invalidId"], consent: true, imageRights: true });
    expect(res.statusCode).toEqual(400);
  });

  it("should return 403 if the user is not an referent_classe", async () => {
    const res = await request(getAppHelper({ role: ROLES.ADMIN }))
      .put(`/young-edition/ref-allow-snu`)
      .send({ youngIds: [notExistingYoungId], consent: true, imageRights: true });
    expect(res.statusCode).toEqual(403);
  });

  it("should return 404 when young does not exist", async () => {
    const res = await request(getAppHelper({ role: ROLES.REFERENT_CLASSE }))
      .put(`/young-edition/ref-allow-snu`)
      .send({ youngIds: [notExistingYoungId], consent: true, imageRights: true });
    expect(res.statusCode).toEqual(404);
  });

  it("should return 403 if the young is not CLE", async () => {
    const young = await createYoungHelper(getNewYoungFixture());
    const res = await request(getAppHelper({ role: ROLES.REFERENT_CLASSE }))
      .put(`/young-edition/ref-allow-snu`)
      .send({ youngIds: [young._id], consent: true, imageRights: true });
    expect(res.statusCode).toEqual(404);
  });

  it("should return 400 if the request body is invalid", async () => {
    const young = await createYoungHelper(getNewYoungFixture());
    let res = await request(getAppHelper({ role: ROLES.ADMIN }))
      .put(`/young-edition/ref-allow-snu`)
      .send({ youngs: [young._id], consent: "invalid", imageRights: "invalid" });
    expect(res.statusCode).toEqual(400);

    res = await request(getAppHelper({ role: ROLES.ADMIN }))
      .put(`/young-edition/ref-allow-snu`)
      .send({ youngs: [], consent: true });
    expect(res.statusCode).toEqual(400);

    res = await request(getAppHelper({ role: ROLES.ADMIN }))
      .put(`/young-edition/ref-allow-snu`)
      .send({ imageRights: false });
    expect(res.statusCode).toEqual(400);
  });

  it("should update the youngs consent (true) and return 200", async () => {
    const userId = "123";
    const etablissement = await createEtablissement(createFixtureEtablissement());
    const classe = await createClasse(createFixtureClasse({ etablissementId: etablissement._id, referentClasseIds: [userId] }));
    const young = await createYoungHelper(getNewYoungFixture({ status: YOUNG_STATUS.IN_PROGRESS, inscriptionStep2023: "WAITING_CONSENT", source: "CLE", classeId: classe._id }));
    const youngIds = [young._id.toString()];
    const res = await request(getAppHelper({ role: ROLES.REFERENT_CLASSE, _id: userId }))
      .put(`/young-edition/ref-allow-snu`)
      .send({ youngIds, consent: true });

    expect(res.statusCode).toEqual(200);
    for (const updatedYoungId of res.body.data) {
      expect(youngIds.includes(updatedYoungId)).toBe(true);
      const updatedYoung = await YoungModel.findById(updatedYoungId);
      expect(updatedYoung?.inscriptionStep2023).toEqual("DONE");
      expect(updatedYoung?.status).toEqual("WAITING_VALIDATION");
    }
  });

  it("should update the youngs consent (false) and return 200", async () => {
    const userId = "123";
    const etablissement = await createEtablissement(createFixtureEtablissement());
    const classe = await createClasse(createFixtureClasse({ etablissementId: etablissement._id, referentClasseIds: [userId] }));
    const young = await createYoungHelper(getNewYoungFixture({ status: YOUNG_STATUS.IN_PROGRESS, inscriptionStep2023: "WAITING_CONSENT", source: "CLE", classeId: classe._id }));
    const youngIds = [young._id.toString()];
    const res = await request(getAppHelper({ role: ROLES.REFERENT_CLASSE, _id: userId }))
      .put(`/young-edition/ref-allow-snu`)
      .send({ youngIds, consent: false });

    expect(res.statusCode).toEqual(200);
    for (const updatedYoungId of res.body.data) {
      expect(youngIds.includes(updatedYoungId)).toBe(true);
      const updatedYoung = await YoungModel.findById(updatedYoungId);
      expect(updatedYoung?.inscriptionStep2023).toEqual("WAITING_CONSENT");
      expect(updatedYoung?.status).toEqual(YOUNG_STATUS.IN_PROGRESS);
    }
  });

  it("should update the youngs imageRights (true) and return 200", async () => {
    const userId = "123";
    const etablissement = await createEtablissement(createFixtureEtablissement());
    const classe = await createClasse(createFixtureClasse({ etablissementId: etablissement._id, referentClasseIds: [userId] }));
    const young = await createYoungHelper(getNewYoungFixture({ status: YOUNG_STATUS.IN_PROGRESS, inscriptionStep2023: "WAITING_CONSENT", source: "CLE", classeId: classe._id }));
    const youngIds = [young._id.toString()];
    const res = await request(getAppHelper({ role: ROLES.REFERENT_CLASSE, _id: userId }))
      .put(`/young-edition/ref-allow-snu`)
      .send({ youngIds, imageRights: true });

    expect(res.statusCode).toEqual(200);
    for (const updatedYoungId of res.body.data) {
      expect(youngIds.includes(updatedYoungId)).toBe(true);
      const updatedYoung = await YoungModel.findById(updatedYoungId);
      expect(updatedYoung?.parent1AllowImageRights).toEqual("true");
      expect(updatedYoung?.status).toEqual(YOUNG_STATUS.IN_PROGRESS);
    }
  });

  it("should update the youngs imageRights (false) and return 200", async () => {
    const userId = "123";
    const etablissement = await createEtablissement(createFixtureEtablissement());
    const classe = await createClasse(createFixtureClasse({ etablissementId: etablissement._id, referentClasseIds: [userId] }));
    const young = await createYoungHelper(getNewYoungFixture({ status: YOUNG_STATUS.IN_PROGRESS, inscriptionStep2023: "WAITING_CONSENT", source: "CLE", classeId: classe._id }));
    const youngIds = [young._id.toString()];
    const res = await request(getAppHelper({ role: ROLES.REFERENT_CLASSE, _id: userId }))
      .put(`/young-edition/ref-allow-snu`)
      .send({ youngIds, imageRights: false });

    expect(res.statusCode).toEqual(200);
    for (const updatedYoungId of res.body.data) {
      expect(youngIds.includes(updatedYoungId)).toBe(true);
      const updatedYoung = await YoungModel.findById(updatedYoungId);
      expect(updatedYoung?.parent1AllowImageRights).toBeUndefined();
      expect(updatedYoung?.status).toEqual(YOUNG_STATUS.IN_PROGRESS);
    }
  });
});
