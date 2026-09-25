/**
 * Reproduction du constat C1 de l'audit sécurité du 21/09/2026.
 *
 * C1 GET /cle/classe/from-etablissement/:id : documents référents bruts (tokens d'invitation,
 *    de reset et 2FA) renvoyés pour n'importe quel établissement, `canViewClasse` ne contrôlant
 *    que le rôle.
 */
import request from "supertest";

import { ROLES, SUB_ROLES } from "snu-lib";

import { ClasseModel, EtablissementModel, ReferentModel } from "../models";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { createFixtureClasse } from "./fixtures/classe";
import { createFixtureEtablissement } from "./fixtures/etablissement";
import { getNewReferentFixture } from "./fixtures/referent";

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);
beforeEach(async () => {
  await ReferentModel.deleteMany();
  await ClasseModel.deleteMany();
  await EtablissementModel.deleteMany();
});
afterEach(resetAppAuth);

const SECRETS = ["invitationToken", "invitationExpires", "forgotPasswordResetToken", "forgotPasswordResetExpires", "token2FA", "token2FAExpires", "loginAttempts", "metadata"];

async function createEtablissementWithClasse(fields: Parameters<typeof createFixtureEtablissement>[0] = {}) {
  const etablissement = await EtablissementModel.create(createFixtureEtablissement(fields));
  const referentClasse = await ReferentModel.create(
    getNewReferentFixture({
      role: ROLES.REFERENT_CLASSE,
      invitationToken: "TOKEN-INVITATION-VICTIME",
      invitationExpires: new Date(Date.now() + 86400000),
      forgotPasswordResetToken: "TOKEN-RESET-VICTIME",
      token2FA: "123456",
    }),
  );
  const classe = await ClasseModel.create(createFixtureClasse({ etablissementId: etablissement._id.toString(), referentClasseIds: [referentClasse._id.toString()] }));
  return { etablissement, referentClasse, classe };
}

function getReferents(res) {
  return (res.body.data || []).flatMap((classe) => classe.referent || []).filter(Boolean);
}

describe("Sécurité classe CLE — audit 2026-09-21", () => {
  describe("C1 — GET /cle/classe/from-etablissement/:id", () => {
    it("refuse un établissement hors du périmètre d'un référent de classe", async () => {
      const { etablissement } = await createEtablissementWithClasse();
      const attaquant = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE }));

      const res = await request(await getAppHelperWithAcl(attaquant)).get(`/cle/classe/from-etablissement/${etablissement._id}`);

      expect(res.statusCode).toEqual(403);
    }, 30000);

    it("refuse un établissement hors du département d'un référent départemental", async () => {
      const { etablissement } = await createEtablissementWithClasse({ department: "Sarthe", region: "Pays de la Loire" });
      const attaquant = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Doubs"], region: "Bourgogne-Franche-Comté" }));

      const res = await request(await getAppHelperWithAcl(attaquant)).get(`/cle/classe/from-etablissement/${etablissement._id}`);

      expect(res.statusCode).toEqual(403);
    }, 30000);

    it("refuse un établissement rattaché à un autre administrateur CLE", async () => {
      const { etablissement } = await createEtablissementWithClasse();
      const attaquant = await ReferentModel.create(getNewReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.referent_etablissement }));

      const res = await request(await getAppHelperWithAcl(attaquant)).get(`/cle/classe/from-etablissement/${etablissement._id}`);

      expect(res.statusCode).toEqual(403);
    }, 30000);

    it("ne renvoie aucun secret du référent de classe à l'administrateur CLE de l'établissement", async () => {
      const chef = await ReferentModel.create(getNewReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.referent_etablissement }));
      const { etablissement } = await createEtablissementWithClasse({ referentEtablissementIds: [chef._id.toString()] });

      const res = await request(await getAppHelperWithAcl(chef)).get(`/cle/classe/from-etablissement/${etablissement._id}`);

      expect(res.statusCode).toEqual(200);
      const referents = getReferents(res);
      expect(referents).toHaveLength(1);
      for (const referent of referents) {
        for (const secret of SECRETS) {
          expect(referent).not.toHaveProperty(secret);
        }
      }
    }, 30000);

    it("renvoie les champs nécessaires au front (identité et contact)", async () => {
      const chef = await ReferentModel.create(getNewReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.referent_etablissement }));
      const { etablissement, referentClasse } = await createEtablissementWithClasse({ referentEtablissementIds: [chef._id.toString()] });

      const res = await request(await getAppHelperWithAcl(chef)).get(`/cle/classe/from-etablissement/${etablissement._id}`);

      expect(res.statusCode).toEqual(200);
      expect(getReferents(res)[0]).toMatchObject({
        _id: referentClasse._id.toString(),
        firstName: referentClasse.firstName,
        lastName: referentClasse.lastName,
        email: referentClasse.email,
      });
    }, 30000);

    it("autorise le référent de classe sur son propre établissement", async () => {
      const etablissement = await EtablissementModel.create(createFixtureEtablissement());
      const referentClasse = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE }));
      await ClasseModel.create(createFixtureClasse({ etablissementId: etablissement._id.toString(), referentClasseIds: [referentClasse._id.toString()] }));

      const res = await request(await getAppHelperWithAcl(referentClasse)).get(`/cle/classe/from-etablissement/${etablissement._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveLength(1);
    }, 30000);

    it("autorise le référent départemental sur un établissement de son département", async () => {
      const { etablissement } = await createEtablissementWithClasse({ department: "Sarthe", region: "Pays de la Loire" });
      const referent = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Sarthe"], region: "Pays de la Loire" }));

      const res = await request(await getAppHelperWithAcl(referent)).get(`/cle/classe/from-etablissement/${etablissement._id}`);

      expect(res.statusCode).toEqual(200);
    }, 30000);

    it("autorise l'admin sur n'importe quel établissement, sans secret", async () => {
      const { etablissement } = await createEtablissementWithClasse();
      const admin = await ReferentModel.create(getNewReferentFixture({ role: ROLES.ADMIN }));

      const res = await request(await getAppHelperWithAcl(admin)).get(`/cle/classe/from-etablissement/${etablissement._id}`);

      expect(res.statusCode).toEqual(200);
      for (const secret of SECRETS) {
        expect(getReferents(res)[0]).not.toHaveProperty(secret);
      }
    }, 30000);
  });

  describe("C1 — POST /cle/classe/export", () => {
    it("ne renvoie aucun secret des référents de classe", async () => {
      await createEtablissementWithClasse({ department: "Sarthe", region: "Pays de la Loire" });
      const referent = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Sarthe"], region: "Pays de la Loire" }));

      const res = await request(await getAppHelperWithAcl(referent))
        .post("/cle/classe/export?type=export-des-classes")
        .send({});

      expect(res.statusCode).toEqual(200);
      const referents = (res.body.data || []).flatMap((classe) => classe.referents || []);
      expect(referents.length).toBeGreaterThan(0);
      for (const leaked of referents) {
        for (const secret of SECRETS) {
          expect(leaked).not.toHaveProperty(secret);
        }
        expect(leaked).toHaveProperty("email");
      }
    }, 30000);
  });
});
