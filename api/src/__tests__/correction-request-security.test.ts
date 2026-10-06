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

import { ERRORS, ROLES, YOUNG_STATUS } from "snu-lib";

import { ReferentModel, YoungModel } from "../models";
import { deleteFile } from "../utils";

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

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  deleteFile: jest.fn().mockResolvedValue(undefined),
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);
beforeEach(async () => {
  await ReferentModel.deleteMany();
  await YoungModel.deleteMany();
  mockSendTemplate.mockClear();
  (deleteFile as jest.Mock).mockClear();
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
async function jeuneEtReferentDuDepartement(status: string = YOUNG_STATUS.WAITING_VALIDATION) {
  const young = await createYoungHelper(
    getNewYoungFixture({
      department: "Paris",
      region: "Île-de-France",
      status,
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
      expect(deleteFile).not.toHaveBeenCalled();
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

    it("autorise une nouvelle demande alors que le dossier est déjà en attente de correction", async () => {
      const { young, referent } = await jeuneEtReferentDuDepartement(YOUNG_STATUS.WAITING_CORRECTION);

      const res = await request(await getAppHelperWithAcl(referent))
        .post(`/correction-request/${young._id}`)
        .send([{ cohort: "Juillet 2023", field: "lastName", reason: "MISSING", message: "", status: "PENDING" }]);

      expect(res.statusCode).toEqual(200);
      expect((await getYoungByIdHelper(young._id))?.status).toEqual(YOUNG_STATUS.WAITING_CORRECTION);
    });

    it.each([YOUNG_STATUS.VALIDATED, YOUNG_STATUS.REFUSED, YOUNG_STATUS.WITHDRAWN, YOUNG_STATUS.ABANDONED])(
      "refuse un dossier %s : PH5, canUpdateYoungStatus n'autorisait que les transitions VERS validé/terminé, jamais celle-ci",
      async (status) => {
        const { young, referent } = await jeuneEtReferentDuDepartement(status);

        const res = await request(await getAppHelperWithAcl(referent))
          .post(`/correction-request/${young._id}`)
          .send([{ cohort: "Juillet 2023", field: "lastName", reason: "MISSING", message: "", status: "PENDING" }]);

        expect(res.statusCode).toEqual(403);
        const apres = await getYoungByIdHelper(young._id);
        expect(apres?.status).toEqual(status);
        expect(apres?.correctionRequests).toEqual(DEMANDE_EN_COURS.map((r) => expect.objectContaining({ field: r.field, status: r.status })));
        expect(mockSendTemplate).not.toHaveBeenCalled();
      },
    );

    it("autorise toujours l'ADMIN, quel que soit le statut du dossier", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ status: YOUNG_STATUS.VALIDATED } as any));
      const admin = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN }));

      const res = await request(await getAppHelperWithAcl(admin))
        .post(`/correction-request/${young._id}`)
        .send([{ cohort: "Juillet 2023", field: "lastName", reason: "MISSING", message: "", status: "PENDING" }]);

      expect(res.statusCode).toEqual(200);
      expect((await getYoungByIdHelper(young._id))?.status).toEqual(YOUNG_STATUS.WAITING_CORRECTION);
    });
  });

  describe("POST /correction-request/:youngId — le contrôle du statut précède la suppression des pièces", () => {
    const RAISONS = ["UNREADABLE", "OTHER", "NOT_SUITABLE"];

    async function jeuneAvecPiecesEtReferent(status: string, role = ROLES.REFERENT_DEPARTMENT) {
      const young = await createYoungHelper(
        getNewYoungFixture({
          department: "Paris",
          region: "Île-de-France",
          status,
          files: {
            cniFiles: [
              { _id: new Types.ObjectId(), name: "recto.pdf", mimetype: "application/pdf", size: 10, category: "cniNew" },
              { _id: new Types.ObjectId(), name: "verso.pdf", mimetype: "application/pdf", size: 10, category: "cniNew" },
            ],
          },
          correctionRequests: DEMANDE_EN_COURS,
        } as any),
      );
      const referent = await createReferentHelper(getNewReferentFixture({ role, department: ["Paris"], region: "Île-de-France" }));
      return { young, referent };
    }

    const corps = (reason: string) => [{ cohort: "Juillet 2023", field: "cniFile", reason, message: "", status: "PENDING" }];

    describe.each([YOUNG_STATUS.VALIDATED, YOUNG_STATUS.REFUSED, YOUNG_STATUS.WITHDRAWN])("dossier %s", (status) => {
      it.each(RAISONS)("refuse la demande (raison %s) sans supprimer aucune pièce", async (reason) => {
        const { young, referent } = await jeuneAvecPiecesEtReferent(status);
        const idsAvant = young.files.cniFiles.map((f: any) => String(f._id));

        const res = await request(await getAppHelperWithAcl(referent))
          .post(`/correction-request/${young._id}`)
          .send(corps(reason));

        expect(res.statusCode).toEqual(403);
        expect(res.body.code).toEqual(ERRORS.OPERATION_UNAUTHORIZED);
        expect(deleteFile).not.toHaveBeenCalled();
        expect(mockSendTemplate).not.toHaveBeenCalled();
        const apres = await getYoungByIdHelper(young._id);
        expect(apres?.status).toEqual(status);
        expect(apres?.files.cniFiles.map((f: any) => String(f._id))).toEqual(idsAvant);
        expect(apres?.correctionRequests).toHaveLength(DEMANDE_EN_COURS.length);
      });
    });

    describe.each([YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION])("dossier %s", (status) => {
      it.each(RAISONS)("supprime toujours les pièces et enregistre la demande (raison %s)", async (reason) => {
        const { young, referent } = await jeuneAvecPiecesEtReferent(status);

        const res = await request(await getAppHelperWithAcl(referent))
          .post(`/correction-request/${young._id}`)
          .send(corps(reason));

        expect(res.statusCode).toEqual(200);
        expect(deleteFile).toHaveBeenCalledTimes(2);
        for (const file of young.files.cniFiles) {
          expect(deleteFile).toHaveBeenCalledWith(`app/young/${young._id}/cniFiles/${(file as any)._id}`);
        }
        const apres = await getYoungByIdHelper(young._id);
        expect(apres?.status).toEqual(YOUNG_STATUS.WAITING_CORRECTION);
        expect(apres?.files.cniFiles).toHaveLength(0);
        expect(apres?.correctionRequests?.find((r) => r.field === "cniFile")).toEqual(expect.objectContaining({ reason, status: "SENT" }));
      });
    });

    it("l'ADMIN garde la main sur un dossier validé : pièces supprimées et demande enregistrée", async () => {
      const { young } = await jeuneAvecPiecesEtReferent(YOUNG_STATUS.VALIDATED);
      const admin = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN }));

      const res = await request(await getAppHelperWithAcl(admin))
        .post(`/correction-request/${young._id}`)
        .send(corps("UNREADABLE"));

      expect(res.statusCode).toEqual(200);
      expect(deleteFile).toHaveBeenCalledTimes(2);
      const apres = await getYoungByIdHelper(young._id);
      expect(apres?.files.cniFiles).toHaveLength(0);
      expect(apres?.status).toEqual(YOUNG_STATUS.WAITING_CORRECTION);
      expect(apres?.correctionRequests?.find((r) => r.field === "cniFile")).toEqual(expect.objectContaining({ reason: "UNREADABLE", status: "SENT" }));
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
