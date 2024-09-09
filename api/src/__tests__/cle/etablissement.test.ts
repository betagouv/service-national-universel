import { Types } from "mongoose";
const { ObjectId } = Types;
import request from "supertest";
import passport from "passport";
import { ROLES, SUB_ROLES, ERRORS } from "snu-lib";
import { ClasseModel, ReferentModel, EtablissementModel } from "../../models";
import getAppHelper from "../helpers/app";
import { createEtablissement } from "../helpers/etablissement";
import { createFixtureEtablissement } from "../fixtures/etablissement";
import { createClasse } from "../helpers/classe";
import { createFixtureClasse } from "../fixtures/classe";
import { getNewReferentFixture, getNewSignupReferentFixture } from "../fixtures/referent";
import { createReferentHelper } from "../helpers/referent";

import { dbConnect, dbClose } from "../helpers/db";

import * as apiEducationModule from "../../services/gouv.fr/api-education";
import { getEtablissementsFromAnnuaire } from "../fixtures/providers/annuaireEtablissement";
import { Etablissement } from "../../../../admin/src/scenes/etablissement/Create/type";

beforeAll(dbConnect);
afterAll(dbClose);

describe("PUT /cle/etablissement/:id", () => {
  it("should return 400 when id is invalid", async () => {
    const res = await request(getAppHelper()).put("/cle/etablissement/invalidId").send({ name: "New Etablissement" });
    expect(res.status).toBe(400);
  });

  it("should return 400 when required fields are missing", async () => {
    const etablissementId = new ObjectId();
    const res = await request(getAppHelper()).put(`/cle/etablissement/${etablissementId}`).send({ name: "New Etablissement" });
    expect(res.status).toBe(400);
  });

  it("should return 403 when user cannot update etablissement", async () => {
    const etablissementId = new ObjectId();
    // @ts-ignore
    passport.user.role = ROLES.RESPONSIBLE;
    const res = await request(getAppHelper())
      .put(`/cle/etablissement/${etablissementId}`)
      .send({
        id: etablissementId,
        name: "New Etablissement",
        address: "12 rue de la paix",
        zip: "75000",
        city: "Paris",
        department: "75",
        region: "Ile de France",
        academy: "Paris",
        state: "inactive",
        schoolYears: ["2023-2024"],
        type: ["Lycée Général"],
        sector: ["Statut public"],
      });
    expect(res.status).toBe(403);
    // @ts-ignore
    // @ts-ignore
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 404 when etablissement is not found", async () => {
    const nonExistingId = "104a49ba503555e4d8853003";
    const res = await request(getAppHelper())
      .put(`/cle/etablissement/${nonExistingId}`)
      .send({
        id: "104a49ba503555e4d8853003",
        name: "New Etablissement",
        address: "12 rue de la paix",
        zip: "75000",
        city: "Paris",
        department: "75",
        region: "Ile de France",
        academy: "Paris",
        state: "inactive",
        schoolYears: ["2023-2024"],
        type: ["Lycée Général"],
        sector: ["Statut public"],
      });
    expect(res.status).toBe(404);
  });

  it("should return 200 when etablissement is updated successfully", async () => {
    const etablissement = createFixtureEtablissement();
    const validId = (await createEtablissement(etablissement))._id;

    const res = await request(getAppHelper())
      .put(`/cle/etablissement/${validId}`)
      .send({
        ...etablissement,
        state: "inactive",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(etablissement.name);
    expect(res.body.data.state).toBe("inactive");
  });

  it("should update academy when department is updated", async () => {
    const etablissement = createFixtureEtablissement({ department: "Paris", region: "Ile de france", academy: "Paris" });
    const validId = (await createEtablissement(etablissement))._id;

    const res = await request(getAppHelper())
      .put(`/cle/etablissement/${validId}`)
      .send({
        ...etablissement,
        region: "Bretagne",
        department: "Ille-et-Vilaine",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.region).toBe("Bretagne");
    expect(res.body.data.department).toBe("Ille-et-Vilaine");
    expect(res.body.data.academy).toBe("Rennes");
  });

  it("should update classe region,department,academy when etablissement is updated successfully", async () => {
    const etablissement = createFixtureEtablissement({ department: "Paris", region: "Ile de france", academy: "Paris" });
    const validId = (await createEtablissement(etablissement))._id;
    const classe = createFixtureClasse({ etablissementId: validId, department: etablissement.department, region: etablissement.region, academy: etablissement.academy });
    const classeId = (await createClasse(classe))._id;

    const res = await request(getAppHelper())
      .put(`/cle/etablissement/${validId}`)
      .send({
        ...etablissement,
        region: "Bretagne",
        department: "Ille-et-Vilaine",
      });

    const updatedClasse = await ClasseModel.findById(classeId);

    expect(res.status).toBe(200);
    expect(res.body.data.region).toBe("Bretagne");
    expect(res.body.data.department).toBe("Ille-et-Vilaine");
    expect(updatedClasse?.region).toBe(res.body.data.region);
    expect(updatedClasse?.department).toBe(res.body.data.department);
    expect(updatedClasse?.academy).toBe(res.body.data.academy);
  });
});

describe("GET /from-user", () => {
  it("should return 403 when user cannot view etablissement", async () => {
    // @ts-ignore
    passport.user.role = ROLES.RESPONSIBLE;
    const res = await request(getAppHelper()).get(`/cle/etablissement/from-user`);
    expect(res.status).toBe(403);
    // @ts-ignore
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 404 when referent_classe don't have classe", async () => {
    // @ts-ignore
    passport.user.role = ROLES.REFERENT_CLASSE;
    const res = await request(getAppHelper()).get(`/cle/etablissement/from-user`);
    expect(res.status).toBe(404);
    // @ts-ignore
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 404 when etablissement is not found", async () => {
    // @ts-ignore
    passport.user.role = ROLES.ADMINISTRATEUR_CLE;
    // @ts-ignore
    const previous = passport.user.subRole;
    // @ts-ignore
    passport.user.subRole = SUB_ROLES.referent_etablissement;
    const res = await request(getAppHelper()).get(`/cle/etablissement/from-user`);
    expect(res.status).toBe(404);
    // @ts-ignore
    passport.user.subRole = previous;
    // @ts-ignore
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 200 if coordinateur", async () => {
    const coordinatorId = (await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.coordinateur_cle })))._id;
    const etablissement = await createEtablissement(createFixtureEtablissement({ coordinateurIds: [coordinatorId] }));
    // @ts-ignore
    passport.user.role = ROLES.ADMINISTRATEUR_CLE;
    // @ts-ignore
    const previousSubRole = passport.user.subRole;
    // @ts-ignore
    const previousId = passport.user._id;
    // @ts-ignore
    passport.user._id = coordinatorId;
    // @ts-ignore
    passport.user.subRole = SUB_ROLES.coordinateur_cle;
    const res = await request(getAppHelper()).get(`/cle/etablissement/from-user`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(String(etablissement._id));
    expect(res.body.data.coordinateurIds).toStrictEqual([String(coordinatorId)]);
    expect(res.body.data.uniqueKey).toBe("C-PDLL072");
    // @ts-ignore
    passport.user.subRole = previousSubRole;
    // @ts-ignore
    passport.user.role = ROLES.ADMIN;
    // @ts-ignore
    passport.user._id = previousId;
  });

  it("should return 200 if ref etablissement", async () => {
    const referentId = (await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.referent_etablissement })))._id;
    const etablissement = await createEtablissement(createFixtureEtablissement({ referentEtablissementIds: [referentId] }));
    // @ts-ignore
    passport.user.role = ROLES.ADMINISTRATEUR_CLE;
    // @ts-ignore
    const previousSubRole = passport.user.subRole;
    // @ts-ignore
    const previousId = passport.user._id;
    // @ts-ignore
    passport.user._id = referentId;
    // @ts-ignore
    passport.user.subRole = SUB_ROLES.referent_etablissement;
    const res = await request(getAppHelper()).get(`/cle/etablissement/from-user`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(String(etablissement._id));
    expect(res.body.data.referentEtablissementIds).toStrictEqual([String(referentId)]);
    // @ts-ignore
    passport.user.subRole = previousSubRole;
    // @ts-ignore
    passport.user.role = ROLES.ADMIN;
    // @ts-ignore
    passport.user._id = previousId;
  });

  it("should return 200 and populate coordinateurs and referent", async () => {
    const referentId = (await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.referent_etablissement })))._id;
    const coordinatorId = (await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.coordinateur_cle })))._id;
    const etablissement = await createEtablissement(createFixtureEtablissement({ referentEtablissementIds: [referentId], coordinateurIds: [coordinatorId] }));
    // @ts-ignore
    passport.user.role = ROLES.ADMINISTRATEUR_CLE;
    // @ts-ignore
    const previousSubRole = passport.user.subRole;
    // @ts-ignore
    const previousId = passport.user._id;
    // @ts-ignore
    passport.user._id = referentId;
    // @ts-ignore
    passport.user.subRole = SUB_ROLES.referent_etablissement;
    const res = await request(getAppHelper()).get(`/cle/etablissement/from-user`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(String(etablissement._id));
    expect(res.body.data.coordinateurs.length).toBe(1);
    expect(res.body.data.coordinateurs[0]._id).toBe(String(coordinatorId));
    expect(res.body.data.referents.length).toBe(1);
    expect(res.body.data.referents[0]._id).toBe(String(referentId));
    // @ts-ignore
    passport.user.subRole = previousSubRole;
    // @ts-ignore
    passport.user.role = ROLES.ADMIN;
    // @ts-ignore
    passport.user._id = previousId;
  });

  it("should return 200 and populate with good classe if ref classe", async () => {
    const referentId = (await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE })))._id;
    const etablissement = await createEtablissement(createFixtureEtablissement({}));
    const classe = await createClasse(createFixtureClasse({ etablissementId: etablissement._id, referentClasseIds: [referentId] }));
    // @ts-ignore
    passport.user.role = ROLES.REFERENT_CLASSE;
    // @ts-ignore
    const previousId = passport.user._id;
    // @ts-ignore
    passport.user._id = referentId;
    const res = await request(getAppHelper()).get(`/cle/etablissement/from-user`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(String(etablissement._id));
    expect(res.body.data.classes.length).toBe(1);
    expect(res.body.data.classes[0]._id).toBe(String(classe._id));
    // @ts-ignore
    passport.user.role = ROLES.ADMIN;
    // @ts-ignore
    passport.user._id = previousId;
  });
});

describe("GET /:id", () => {
  it("should return 400 when id is invalid", async () => {
    const res = await request(getAppHelper()).get("/cle/etablissement/invalidId");
    expect(res.status).toBe(400);
  });

  it("should return 403 when user cannot view etablissement", async () => {
    // @ts-ignore
    passport.user.role = ROLES.RESPONSIBLE;
    const validId = new ObjectId();
    const res = await request(getAppHelper()).get(`/cle/etablissement/${validId}`);
    expect(res.status).toBe(403);
    // @ts-ignore
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 404 when etablissement is not found", async () => {
    const nonExistingId = "104a49ba503555e4d8853003";
    const res = await request(getAppHelper()).get(`/cle/etablissement/${nonExistingId}`);
    expect(res.status).toBe(404);
  });

  it("should return 200 and etablissement when successful", async () => {
    const etablissement = createFixtureEtablissement();
    const validId = (await createEtablissement(etablissement))._id;
    const res = await request(getAppHelper()).get(`/cle/etablissement/${validId}`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(String(validId));
    expect(res.body.data.name).toBe(etablissement.name);
    expect(res.body.data.uniqueKey).toBe("C-PDLL072");
  });

  it("should return 200 and populate referent and coordinator  when successful", async () => {
    const coordinatorId = (await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.coordinateur_cle })))._id;
    const referentId = (await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.referent_etablissement })))._id;
    const etablissement = await createEtablissement(createFixtureEtablissement({ coordinateurIds: [coordinatorId], referentEtablissementIds: [referentId] }));
    const res = await request(getAppHelper()).get(`/cle/etablissement/${etablissement._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(String(etablissement._id));
    expect(res.body.data.coordinateurs.length).toBe(1);
    expect(res.body.data.coordinateurs[0]._id).toBe(String(coordinatorId));
    expect(res.body.data.referents.length).toBe(1);
    expect(res.body.data.referents[0]._id).toBe(String(referentId));
  });
});

describe("PUT /cle/etablissement/:id/referents", () => {
  it("should return 400 if the request body is invalid", async () => {
    let res = await request(getAppHelper({ role: ROLES.ADMIN }))
      .put(`/cle/etablissement/${new ObjectId()}/referents`)
      .send({ referentEtablissementIds: "invalid" });
    expect(res.statusCode).toEqual(400);

    res = await request(getAppHelper({ role: ROLES.ADMIN }))
      .put(`/cle/etablissement/${new ObjectId()}/referents`)
      .send({ referentEtablissementIds: [new ObjectId().toString(), new ObjectId().toString()] });
    expect(res.statusCode).toEqual(400);
  });

  it("should return 403 if the user is not an admin", async () => {
    const res = await request(getAppHelper({ role: ROLES.VISITOR }))
      .put(`/cle/etablissement/${new ObjectId()}/referents`)
      .send({ referentEtablissementIds: [new ObjectId().toString()] });

    expect(res.statusCode).toEqual(403);
  });

  it("should return 404 if the etablissement is not found", async () => {
    const res = await request(getAppHelper({ role: ROLES.ADMIN }))
      .put(`/cle/etablissement/${new ObjectId()}/referents`)
      .send({ referentEtablissementIds: [new ObjectId().toString()] });

    expect(res.statusCode).toEqual(404);
  });

  it("should update the referents of an etablissement", async () => {
    const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.referent_etablissement }));
    const etablissement = await createEtablissement(createFixtureEtablissement({ referentEtablissementIds: [referent._id] }));
    const res = await request(getAppHelper({ role: ROLES.ADMIN }))
      .put(`/cle/etablissement/${etablissement._id}/referents`)
      .send({ referentEtablissementIds: [] });

    expect(res.statusCode).toEqual(200);
    const updatedEtablissement = await EtablissementModel.findById(etablissement._id).lean();
    expect(updatedEtablissement?.referentEtablissementIds).toEqual([]);
  });
});

describe("DELETE /cle/etablissement/:id/referents", () => {
  it("should return 400 if the request body is invalid", async () => {
    let res = await request(getAppHelper()).delete(`/cle/etablissement/${new ObjectId()}/referents`).send({ invalid: "body" });
    expect(res.statusCode).toEqual(400);
    res = await request(getAppHelper()).delete(`/cle/etablissement/${new ObjectId()}/referents`).send({ referentIds: "body" });
    expect(res.statusCode).toEqual(400);
    res = await request(getAppHelper()).delete(`/cle/etablissement/${new ObjectId()}/referents`).send({ referentIds: [] });
    expect(res.statusCode).toEqual(400);
  });

  it("should return 403 if the user is not a chef etablissement", async () => {
    const res = await request(getAppHelper({ role: ROLES.REFERENT_CLASSE }))
      .delete(`/cle/etablissement/${new ObjectId()}/referents`)
      .send({ referentIds: [new ObjectId().toString()] });
    expect(res.statusCode).toEqual(403);
  });

  it("should return 404 if the etablissement is not found", async () => {
    const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.coordinateur_cle }));
    const res = await request(getAppHelper({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.referent_etablissement }))
      .delete(`/cle/etablissement/${new ObjectId()}/referents`)
      .send({ referentIds: [referent._id] });
    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 if any of the referents do not exist", async () => {
    const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.coordinateur_cle }));
    const etablissement = await createEtablissement(createFixtureEtablissement({ coordinateurIds: [referent._id] }));
    const res = await request(getAppHelper({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.referent_etablissement }))
      .delete(`/cle/etablissement/${etablissement._id}/referents`)
      .send({ referentIds: [referent._id, new ObjectId().toString()] });

    expect(res.statusCode).toEqual(404);
  });

  it("should return 404 if any of the referents are not coordinateur de l'établissement", async () => {
    const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.coordinateur_cle }));
    const etablissement = await createEtablissement(createFixtureEtablissement({ coordinateurIds: [] }));
    const res = await request(getAppHelper({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.referent_etablissement }))
      .delete(`/cle/etablissement/${etablissement._id}/referents`)
      .send({ referentIds: [referent._id] });

    expect(res.statusCode).toEqual(404);
  });

  it("should return 403 when not cooridinateur on this etablissement", async () => {
    const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.coordinateur_cle }));
    const etablissement = await createEtablissement(createFixtureEtablissement({ coordinateurIds: [referent._id] }));
    const etablissement2 = await createEtablissement(createFixtureEtablissement({ coordinateurIds: [] }));
    await createClasse(createFixtureClasse({ etablissementId: etablissement._id, referentClasseIds: [referent._id] }));

    const res = await request(getAppHelper({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.referent_etablissement }))
      .delete(`/cle/etablissement/${etablissement2._id}/referents`)
      .send({ referentIds: [referent._id] });

    expect(res.statusCode).toEqual(403);
  });

  it("should update the role of the referent if they are also a referent de classe", async () => {
    const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.coordinateur_cle }));
    const etablissement = await createEtablissement(createFixtureEtablissement({ coordinateurIds: [referent._id] }));
    await createClasse(createFixtureClasse({ etablissementId: etablissement._id, referentClasseIds: [referent._id] }));

    const res = await request(getAppHelper({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.referent_etablissement }))
      .delete(`/cle/etablissement/${etablissement._id}/referents`)
      .send({ referentIds: [referent._id] });

    expect(res.statusCode).toEqual(200);
    expect(res.body.ok).toBe(true);

    const updatedReferent = await ReferentModel.findById(referent._id);
    expect(updatedReferent?.role).toEqual(ROLES.REFERENT_CLASSE);
    expect(updatedReferent?.subRole).toEqual(SUB_ROLES.none);
    const updatedEtablissement = await EtablissementModel.findById(etablissement._id).lean();
    expect(updatedEtablissement?.coordinateurIds).toEqual([]);
  });

  it("should delete the referent if they are not a referent de classe", async () => {
    const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.coordinateur_cle }));
    const etablissement = await createEtablissement(createFixtureEtablissement({ coordinateurIds: [referent._id] }));

    const res = await request(getAppHelper({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.referent_etablissement }))
      .delete(`/cle/etablissement/${etablissement._id}/referents`)
      .send({ referentIds: [referent._id] });

    expect(res.statusCode).toEqual(200);
    expect(res.body.ok).toBe(true);

    const updatedReferent = await ReferentModel.findById(referent._id);
    expect(updatedReferent?.role).toEqual(ROLES.ADMINISTRATEUR_CLE);
    expect(updatedReferent?.subRole).toEqual(SUB_ROLES.coordinateur_cle);
    expect(updatedReferent?.deletedAt).toBeDefined();
    const updatedEtablissement = await EtablissementModel.findById(etablissement._id).lean();
    expect(updatedEtablissement?.coordinateurIds).toEqual([]);
  });
});

describe("POST /cle/etablissement", () => {
  beforeEach(async () => {
    await EtablissementModel.deleteMany({});
    await ReferentModel.deleteMany({});
  });
  const validBody = {
    uai: "UAI_42",
    email: "test@osef.fr",
    refLastName: "Doe",
    refFirstName: "John",
  };
  it("should return 400 if the request body is invalid", async () => {
    const response = await request(getAppHelper()).post("/cle/etablissement").send({});
    expect(response.status).toBe(400);
  });

  it("should return 403 if the user is not authorized to create an etablissement", async () => {
    const response = await request(getAppHelper({ role: ROLES.VISITOR }))
      .post("/cle/etablissement")
      .send(validBody);
    expect(response.status).toBe(403);
    // @ts-ignore
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 409 if UAI is already in the platform", async () => {
    await createEtablissement(createFixtureEtablissement({ uai: validBody.uai }));

    const response = await request(getAppHelper()).post("/cle/etablissement").send(validBody);
    expect(response.status).toBe(409);
    expect(response.body.code).toBe(ERRORS.ALREADY_EXISTS);
  });

  it("should return 404 if UAIdoesn't exist in apiEducation", async () => {
    const apiEductionMock = jest.spyOn(apiEducationModule, "apiEducation");
    apiEductionMock.mockResolvedValue([]);

    const response = await request(getAppHelper()).post("/cle/etablissement").send(validBody);
    expect(response.status).toBe(404);
    expect(response.body.code).toBe(ERRORS.NOT_FOUND);
    expect(apiEductionMock).toHaveBeenCalledWith({ filters: [{ key: "uai", value: validBody.uai }], page: 0, size: -1 });
  });

  it("should return 409 if the referent is already registered", async () => {
    const apiEductionMock = jest.spyOn(apiEducationModule, "apiEducation");
    apiEductionMock.mockImplementation(() => Promise.resolve(getEtablissementsFromAnnuaire()));
    await createReferentHelper(getNewSignupReferentFixture({ email: validBody.email }));

    const response = await request(getAppHelper({ role: ROLES.ADMIN }))
      .post("/cle/etablissement")
      .send(validBody);
    expect(response.status).toBe(409);
    expect(response.body.code).toBe(ERRORS.USER_ALREADY_REGISTERED);
  });

  it("should return 200 if the etablissement is created successfully", async () => {
    const apiEductionMock = jest.spyOn(apiEducationModule, "apiEducation");
    apiEductionMock.mockImplementation(() => Promise.resolve(getEtablissementsFromAnnuaire()));

    const response = await request(getAppHelper({})).post("/cle/etablissement").send(validBody);
    expect(response.status).toBe(200);
    expect(response.body.data.uai).toBe(validBody.uai);
  });
});
