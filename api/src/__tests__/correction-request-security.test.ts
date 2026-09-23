/**
 * Reproduction des constats H22 et H23 de l'audit sécurité du 21/09/2026.
 *
 * Les quatre routes de `/correction-request` (api/src/controllers/correction-request.ts) ne sont
 * protégées que par `passport.authenticate("referent")` : elles chargent le volontaire par son id
 * et agissent dessus sans aucun contrôle de rôle ni de périmètre.
 *
 *   - H22 : n'importe quel référent (y compris un responsable de structure ou un visiteur) crée des
 *     demandes de correction sur n'importe quel dossier, supprime les pièces d'identité stockées sur
 *     S3 (`deleteFile`, ligne 63) et bascule le dossier en `WAITING_CORRECTION`. `canUpdateYoungStatus`
 *     n'est pas une autorisation : il ne reçoit pas l'acteur (packages/lib/src/common.ts L103) et ne
 *     vérifie que la transition de statut elle-même.
 *   - H23 : les routes de relance renvoient `serializeYoung(young)`, soit le dossier complet de
 *     n'importe quel volontaire, et déclenchent l'envoi d'un email officiel à ses parents.
 *
 * `POST /:youngId/remind-cni` a depuis été supprimée avec le parcours des représentants légaux
 * (cf. representants-legaux-routes-supprimees.test.ts).
 */
import request from "supertest";
import { Types } from "mongoose";

import { ROLES, YOUNG_STATUS } from "snu-lib";

import { ReferentModel, YoungModel } from "../models";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";
import { createReferentHelper } from "./helpers/referent";
import { createYoungHelper, getYoungByIdHelper } from "./helpers/young";

const mockSendTemplate = jest.fn().mockResolvedValue(undefined);

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendTemplate: (...args: any[]) => mockSendTemplate(...args),
  sendEmail: () => Promise.resolve(),
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);
beforeEach(async () => {
  await ReferentModel.deleteMany();
  await YoungModel.deleteMany();
  mockSendTemplate.mockClear();
});
afterEach(resetAppAuth);

const DEMANDE_EN_COURS = [
  { cohort: "Juillet 2023", field: "firstName", reason: "MISSING", message: "", status: "SENT", moderatorId: new Types.ObjectId().toString(), sentAt: new Date() },
];

/** Un volontaire parisien et un référent d'un tout autre territoire. */
async function jeuneEtReferentHorsPerimetre(role = ROLES.REFERENT_DEPARTMENT) {
  const young = await createYoungHelper(
    getNewYoungFixture({
      department: "Paris",
      region: "Île-de-France",
      status: YOUNG_STATUS.WAITING_VALIDATION,
      correctionRequests: DEMANDE_EN_COURS,
    } as any),
  );
  const referent = await createReferentHelper(getNewReferentFixture({ role, department: ["Ardennes"], region: "Grand Est" }));
  return { young, referent };
}

/** Le référent départemental dont dépend réellement le volontaire. */
async function jeuneEtReferentDuDepartement() {
  const young = await createYoungHelper(
    getNewYoungFixture({
      department: "Paris",
      region: "Île-de-France",
      status: YOUNG_STATUS.WAITING_VALIDATION,
      correctionRequests: DEMANDE_EN_COURS,
    } as any),
  );
  const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, department: ["Paris"], region: "Île-de-France" }));
  return { young, referent };
}

describe("H22/H23 — périmètre des demandes de correction", () => {
  describe("POST /correction-request/:youngId", () => {
    it("refuse un référent départemental d'un autre département", async () => {
      const { young, referent } = await jeuneEtReferentHorsPerimetre();

      const res = await request(await getAppHelperWithAcl(referent))
        .post(`/correction-request/${young._id}`)
        .send([{ cohort: "Juillet 2023", field: "lastName", reason: "MISSING", message: "", status: "PENDING" }]);

      expect(res.statusCode).toEqual(403);
      const apres = await getYoungByIdHelper(young._id);
      expect(apres?.status).toEqual(YOUNG_STATUS.WAITING_VALIDATION);
      expect(mockSendTemplate).not.toHaveBeenCalled();
    });

    it("refuse un responsable de structure", async () => {
      const { young, referent } = await jeuneEtReferentHorsPerimetre(ROLES.RESPONSIBLE);

      const res = await request(await getAppHelperWithAcl(referent))
        .post(`/correction-request/${young._id}`)
        .send([{ cohort: "Juillet 2023", field: "lastName", reason: "MISSING", message: "", status: "PENDING" }]);

      expect(res.statusCode).toEqual(403);
      expect((await getYoungByIdHelper(young._id))?.status).toEqual(YOUNG_STATUS.WAITING_VALIDATION);
    });

    it("refuse un visiteur avant toute suppression de pièce d'identité", async () => {
      const { young, referent } = await jeuneEtReferentHorsPerimetre(ROLES.VISITOR);

      const res = await request(await getAppHelperWithAcl(referent))
        .post(`/correction-request/${young._id}`)
        .send([{ cohort: "Juillet 2023", field: "cniFile", reason: "UNREADABLE", message: "", status: "PENDING" }]);

      expect(res.statusCode).toEqual(403);
      expect((await getYoungByIdHelper(young._id))?.status).toEqual(YOUNG_STATUS.WAITING_VALIDATION);
    });

    it("autorise le référent départemental du volontaire", async () => {
      const { young, referent } = await jeuneEtReferentDuDepartement();

      const res = await request(await getAppHelperWithAcl(referent))
        .post(`/correction-request/${young._id}`)
        .send([{ cohort: "Juillet 2023", field: "lastName", reason: "MISSING", message: "", status: "PENDING" }]);

      expect(res.statusCode).toEqual(200);
      expect((await getYoungByIdHelper(young._id))?.status).toEqual(YOUNG_STATUS.WAITING_CORRECTION);
    });
  });

  describe("DELETE /correction-request/:youngId/:field", () => {
    it("refuse un référent hors périmètre et laisse la demande en l'état", async () => {
      const { young, referent } = await jeuneEtReferentHorsPerimetre();

      const res = await request(await getAppHelperWithAcl(referent)).delete(`/correction-request/${young._id}/firstName`);

      expect(res.statusCode).toEqual(403);
      const apres = await getYoungByIdHelper(young._id);
      expect(apres?.correctionRequests?.[0]?.status).toEqual("SENT");
    });
  });

  describe("POST /correction-request/:youngId/remind", () => {
    it("refuse un référent hors périmètre, sans relance ni fuite du dossier", async () => {
      const { young, referent } = await jeuneEtReferentHorsPerimetre();

      const res = await request(await getAppHelperWithAcl(referent))
        .post(`/correction-request/${young._id}/remind`)
        .send({});

      expect(res.statusCode).toEqual(403);
      expect(res.body.data).toBeUndefined();
      expect(mockSendTemplate).not.toHaveBeenCalled();
    });
  });
});
