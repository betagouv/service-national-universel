/**
 * Reproduction du lot « périmètre CLE » de l'audit sécurité du 21/09/2026,
 * vérifié sur origin/main après #5315 (décommissionnement de l'administration CLE) et #5336 (C1).
 *
 * H9  POST /cle/classe/export?type=export-des-classes : chefs d'établissement chargés sans projection.
 * H14 GET  /cle/etablissement/:id                     : aucun périmètre, contacts de n'importe quel établissement.
 * H18 POST /cle/referent/getMany                      : documents référents bruts (jetons d'invitation, reset, 2FA).
 * M7  GET  /cle/classe/:id                            : aucun périmètre.
 * M8  GET  /cle/classe/:id/patches                    : aucun périmètre.
 * M9  GET  /cle/young/by-classe-historic/:id/patches  : aucun rapprochement classe ↔ acteur.
 * L4  GET  /cle/classe/public/:id                     : projection publique minimale (régression).
 */
import request from "supertest";

import { PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLES, SUB_ROLES } from "snu-lib";

import { ClasseModel, EtablissementModel, ReferentModel, YoungModel } from "../models";
import { PermissionModel } from "../models/permissions/permission";
import { RoleModel } from "../models/permissions/role";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { addPermissionHelper } from "./helpers/permissions";
import { createFixtureClasse } from "./fixtures/classe";
import { createFixtureEtablissement } from "./fixtures/etablissement";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);
beforeEach(async () => {
  await ReferentModel.deleteMany();
  await ClasseModel.deleteMany();
  await EtablissementModel.deleteMany();
  await YoungModel.deleteMany();
  await PermissionModel.deleteMany();
  await RoleModel.deleteMany();
  // `PATCHES_READ` tel que seedé par api/migrations/20250801060707-916-permissions-supervisor.js :
  // sans policy, donc sans périmètre. Les rôles CLE en ont été retirés par #5315, on les remet ici
  // pour que le cloisonnement soit prouvé indépendamment de la liste de rôles du jour.
  await addPermissionHelper(
    [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.TRANSPORTER, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE],
    PERMISSION_RESOURCES.PATCH,
    PERMISSION_ACTIONS.READ,
  );
});
afterEach(resetAppAuth);

const SECRETS = ["invitationToken", "invitationExpires", "forgotPasswordResetToken", "forgotPasswordResetExpires", "token2FA", "token2FAExpires", "loginAttempts", "metadata"];

const TOKENS_REFERENT = {
  invitationToken: "TOKEN-INVITATION-VICTIME",
  invitationExpires: new Date(Date.now() + 86400000),
  forgotPasswordResetToken: "TOKEN-RESET-VICTIME",
  token2FA: "123456",
};

/** Établissement de la Sarthe (Pays de la Loire) avec chef, coordinateur, référent de classe et une classe. */
async function createEtablissementComplet(fields: Parameters<typeof createFixtureEtablissement>[0] = {}) {
  const chef = await ReferentModel.create(getNewReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.referent_etablissement, ...TOKENS_REFERENT }));
  const coordinateur = await ReferentModel.create(getNewReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE, subRole: SUB_ROLES.coordinateur_cle, ...TOKENS_REFERENT }));
  const referentClasse = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE, ...TOKENS_REFERENT }));
  const etablissement = await EtablissementModel.create(
    createFixtureEtablissement({
      referentEtablissementIds: [chef._id.toString()],
      coordinateurIds: [coordinateur._id.toString()],
      department: "Sarthe",
      region: "Pays de la Loire",
      ...fields,
    }),
  );
  const classe = await ClasseModel.create(
    createFixtureClasse({
      etablissementId: etablissement._id.toString(),
      referentClasseIds: [referentClasse._id.toString()],
      department: (fields.department as string) || "Sarthe",
      region: (fields.region as string) || "Pays de la Loire",
    }),
  );
  return { etablissement, chef, coordinateur, referentClasse, classe };
}

/** Acteurs hors périmètre : rattachés à un tout autre établissement / territoire. */
async function createAttaquants() {
  const autre = await createEtablissementComplet({ uai: "0352993N", department: "Doubs", region: "Bourgogne-Franche-Comté" });
  const referentDepartementAilleurs = await ReferentModel.create(
    getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Doubs"], region: "Bourgogne-Franche-Comté" }),
  );
  const referentRegionAilleurs = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_REGION, region: "Bourgogne-Franche-Comté" }));
  const transporteur = await ReferentModel.create(getNewReferentFixture({ role: ROLES.TRANSPORTER }));
  return [
    ["administrateur CLE d'un autre établissement", autre.chef],
    ["coordinateur d'un autre établissement", autre.coordinateur],
    ["référent d'une classe d'un autre établissement", autre.referentClasse],
    ["référent départemental d'un autre département", referentDepartementAilleurs],
    ["référent régional d'une autre région", referentRegionAilleurs],
    ["transporteur", transporteur],
  ] as const;
}

/** Interroge la même route pour chaque acteur hors périmètre et compare tous les verdicts d'un coup. */
async function verdicts(attaquants: Awaited<ReturnType<typeof createAttaquants>>, appel: (user: any) => Promise<{ statusCode: number }>) {
  const observes: string[] = [];
  for (const [nom, attaquant] of attaquants) {
    const res = await appel(attaquant);
    observes.push(`${nom}: ${res.statusCode}`);
  }
  return observes;
}

const tousRefuses = (attaquants: Awaited<ReturnType<typeof createAttaquants>>) => attaquants.map(([nom]) => `${nom}: 403`);

describe("Périmètre CLE — audit 2026-09-21", () => {
  describe("H14 — GET /cle/etablissement/:id", () => {
    it("refuse un établissement hors du périmètre (6 rôles)", async () => {
      const { etablissement } = await createEtablissementComplet();
      const attaquants = await createAttaquants();

      const observes = await verdicts(attaquants, async (user) => request(await getAppHelperWithAcl(user)).get(`/cle/etablissement/${etablissement._id}`));

      expect(observes).toEqual(tousRefuses(attaquants));
    }, 60000);

    it("autorise le chef d'établissement sur son établissement", async () => {
      const { etablissement, chef } = await createEtablissementComplet();

      const res = await request(await getAppHelperWithAcl(chef)).get(`/cle/etablissement/${etablissement._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.referents).toHaveLength(1);
      expect(res.body.data.coordinateurs).toHaveLength(1);
    }, 30000);

    it("autorise le référent départemental du département de l'établissement", async () => {
      const { etablissement } = await createEtablissementComplet();
      const referent = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Sarthe"], region: "Pays de la Loire" }));

      const res = await request(await getAppHelperWithAcl(referent)).get(`/cle/etablissement/${etablissement._id}`);

      expect(res.statusCode).toEqual(200);
    }, 30000);

    it("autorise le référent de classe sur l'établissement de sa classe", async () => {
      const { etablissement, referentClasse } = await createEtablissementComplet();

      const res = await request(await getAppHelperWithAcl(referentClasse)).get(`/cle/etablissement/${etablissement._id}`);

      expect(res.statusCode).toEqual(200);
    }, 30000);

    it("autorise l'admin sur n'importe quel établissement, sans secret", async () => {
      const { etablissement } = await createEtablissementComplet();
      const admin = await ReferentModel.create(getNewReferentFixture({ role: ROLES.ADMIN }));

      const res = await request(await getAppHelperWithAcl(admin)).get(`/cle/etablissement/${etablissement._id}`);

      expect(res.statusCode).toEqual(200);
      for (const referent of [...res.body.data.referents, ...res.body.data.coordinateurs]) {
        for (const secret of SECRETS) {
          expect(referent).not.toHaveProperty(secret);
        }
      }
    }, 30000);
  });

  describe("H18 — POST /cle/referent/getMany", () => {
    it("ne renvoie aucun secret des référents demandés", async () => {
      const { chef, referentClasse } = await createEtablissementComplet();
      const admin = await ReferentModel.create(getNewReferentFixture({ role: ROLES.ADMIN }));

      const res = await request(await getAppHelperWithAcl(admin))
        .post("/cle/referent/getMany")
        .send({ ids: [chef._id.toString(), referentClasse._id.toString()] });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveLength(2);
      for (const referent of res.body.data) {
        for (const secret of SECRETS) {
          expect(referent).not.toHaveProperty(secret);
        }
      }
    }, 30000);

    it("renvoie les champs nécessaires au front (identité et contact)", async () => {
      const { chef } = await createEtablissementComplet();
      const admin = await ReferentModel.create(getNewReferentFixture({ role: ROLES.ADMIN }));

      const res = await request(await getAppHelperWithAcl(admin))
        .post("/cle/referent/getMany")
        .send({ ids: [chef._id.toString()] });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data[0]).toMatchObject({
        _id: chef._id.toString(),
        firstName: chef.firstName,
        lastName: chef.lastName,
        email: chef.email,
        role: ROLES.ADMINISTRATEUR_CLE,
      });
      const autorises = ["_id", "id", "fullName", "firstName", "lastName", "email", "phone", "role", "subRole", "status"];
      expect(Object.keys(res.body.data[0]).filter((cle) => !autorises.includes(cle))).toEqual([]);
    }, 30000);
  });

  describe("H9 — POST /cle/classe/export?type=export-des-classes", () => {
    it("ne renvoie aucun secret des chefs d'établissement", async () => {
      await createEtablissementComplet();
      const referent = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Sarthe"], region: "Pays de la Loire" }));

      const res = await request(await getAppHelperWithAcl(referent))
        .post("/cle/classe/export?type=export-des-classes")
        .send({});

      expect(res.statusCode).toEqual(200);
      const chefs = (res.body.data || []).flatMap((classe) => classe.referentEtablissement || []);
      expect(chefs.length).toBeGreaterThan(0);
      for (const chef of chefs) {
        for (const secret of SECRETS) {
          expect(chef).not.toHaveProperty(secret);
        }
      }
    }, 30000);

    it("projette les chefs d'établissement sur les mêmes champs que les référents de classe", async () => {
      await createEtablissementComplet();
      const referent = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Sarthe"], region: "Pays de la Loire" }));

      const res = await request(await getAppHelperWithAcl(referent))
        .post("/cle/classe/export?type=export-des-classes")
        .send({});

      expect(res.statusCode).toEqual(200);
      const chefs = (res.body.data || []).flatMap((classe) => classe.referentEtablissement || []);
      expect(chefs.length).toBeGreaterThan(0);
      // `id` et `fullName` sont des virtuels dérivés de champs déjà projetés.
      const autorises = ["_id", "id", "fullName", "firstName", "lastName", "email", "phone", "role", "subRole", "status"];
      for (const chef of chefs) {
        expect(Object.keys(chef).filter((cle) => !autorises.includes(cle))).toEqual([]);
      }
    }, 30000);
  });

  describe("M7 — GET /cle/classe/:id", () => {
    it("refuse une classe hors du périmètre (6 rôles)", async () => {
      const { classe } = await createEtablissementComplet();
      const attaquants = await createAttaquants();

      const observes = await verdicts(attaquants, async (user) => request(await getAppHelperWithAcl(user)).get(`/cle/classe/${classe._id}`));

      expect(observes).toEqual(tousRefuses(attaquants));
    }, 60000);

    it("autorise le référent de la classe", async () => {
      const { classe, referentClasse } = await createEtablissementComplet();

      const res = await request(await getAppHelperWithAcl(referentClasse)).get(`/cle/classe/${classe._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data._id).toEqual(classe._id.toString());
    }, 30000);

    it("autorise le chef d'établissement et le référent départemental du territoire", async () => {
      const { classe, chef } = await createEtablissementComplet();
      const referentDep = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Sarthe"], region: "Pays de la Loire" }));
      const admin = await ReferentModel.create(getNewReferentFixture({ role: ROLES.ADMIN }));

      for (const user of [chef, referentDep, admin]) {
        const res = await request(await getAppHelperWithAcl(user)).get(`/cle/classe/${classe._id}`);
        expect([user.role, res.statusCode]).toEqual([user.role, 200]);
      }
    }, 30000);
  });

  describe("M8 — GET /cle/classe/:id/patches", () => {
    it("refuse une classe hors du périmètre (6 rôles)", async () => {
      const { classe } = await createEtablissementComplet();
      const attaquants = await createAttaquants();

      const observes = await verdicts(attaquants, async (user) => request(await getAppHelperWithAcl(user)).get(`/cle/classe/${classe._id}/patches`));

      expect(observes).toEqual(tousRefuses(attaquants));
    }, 60000);

    it("autorise le référent de la classe", async () => {
      const { classe, referentClasse } = await createEtablissementComplet();

      const res = await request(await getAppHelperWithAcl(referentClasse)).get(`/cle/classe/${classe._id}/patches`);

      expect(res.statusCode).toEqual(200);
    }, 30000);
  });

  describe("M9 — GET /cle/young/by-classe-historic/:idClasse/patches", () => {
    it("refuse une classe hors du périmètre (6 rôles)", async () => {
      const { classe } = await createEtablissementComplet();
      await YoungModel.create(getNewYoungFixture({ classeId: classe._id.toString() }));
      const attaquants = await createAttaquants();

      const observes = await verdicts(attaquants, async (user) => request(await getAppHelperWithAcl(user)).get(`/cle/young/by-classe-historic/${classe._id}/patches`));

      expect(observes).toEqual(tousRefuses(attaquants));
    }, 60000);

    it("refuse la route old-student hors du périmètre (6 rôles)", async () => {
      const { classe } = await createEtablissementComplet();
      const attaquants = await createAttaquants();

      const observes = await verdicts(attaquants, async (user) => request(await getAppHelperWithAcl(user)).get(`/cle/young/by-classe-historic/${classe._id}/patches/old-student`));

      expect(observes).toEqual(tousRefuses(attaquants));
    }, 60000);

    it("autorise le référent de la classe", async () => {
      const { classe, referentClasse } = await createEtablissementComplet();
      await YoungModel.create(getNewYoungFixture({ classeId: classe._id.toString() }));

      const res = await request(await getAppHelperWithAcl(referentClasse)).get(`/cle/young/by-classe-historic/${classe._id}/patches`);

      expect(res.statusCode).toEqual(200);
    }, 30000);
  });

  describe("L4 — GET /cle/classe/public/:id", () => {
    it("ne renvoie que la projection publique, sans authentification", async () => {
      const { classe } = await createEtablissementComplet();

      const res = await request(await getAppHelperWithAcl(null)).get(`/cle/classe/public/${classe._id}`);

      expect(res.statusCode).toEqual(200);
      for (const referent of res.body.data.referents || []) {
        expect(Object.keys(referent).sort()).toEqual(["_id", "firstName", "fullName", "id", "lastName"]);
      }
      expect(res.body.data.etablissement).not.toHaveProperty("referentEtablissementIds");
      expect(res.body.data.etablissement).not.toHaveProperty("coordinateurIds");
    }, 30000);
  });
});
