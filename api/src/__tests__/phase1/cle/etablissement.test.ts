import { Types } from "mongoose";
const { ObjectId } = Types;
import request from "supertest";
import passport from "passport";
import { ROLES, SUB_ROLES } from "snu-lib";
import getAppHelper from "../helpers/app";
import { createEtablissement } from "../helpers/etablissement";
import { createFixtureEtablissement } from "../fixtures/etablissement";
import { createClasse } from "../helpers/classe";
import { createFixtureClasse } from "../fixtures/classe";
import { getNewReferentFixture } from "../fixtures/referent";
import { createReferentHelper } from "../helpers/referent";

import { dbConnect, dbClose, mockTransaction } from "../helpers/db";

beforeAll(() => dbConnect(__filename.slice(__dirname.length + 1, -3)));
afterAll(dbClose);
mockTransaction();

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
