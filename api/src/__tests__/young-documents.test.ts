import request from "supertest";
import getAppHelper from "./helpers/app";
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper, notExistingYoungId } from "./helpers/young";
import { dbConnect, dbClose } from "./helpers/db";
import { createCohesionCenter } from "./helpers/cohesionCenter";
import { getNewCohesionCenterFixture } from "./fixtures/cohesionCenter";
import { createCohortHelper } from "./helpers/cohort";
import getNewCohortFixture from "./fixtures/cohort";
import { createSessionPhase1 } from "./helpers/sessionPhase1";
import { getNewSessionPhase1Fixture } from "./fixtures/sessionPhase1";
import getNewContractFixture from "./fixtures/contract";
import { createContractHelper } from "./helpers/contract";
import { sendDocumentEmailTask } from "../queues/sendMailQueue";
import { getAllPdfTemplates } from "../utils/pdf-renderer";

// We mock node-fetch for PDF generation.
jest.mock("node-fetch", () =>
  jest.fn(() =>
    Promise.resolve({
      headers: {
        get: () => "",
      },
      body: {
        pipe: (res) => res.status(200).send({}),
        on: () => "",
      },
    }),
  ),
);

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
  sendTemplate: () => Promise.resolve(),
  // Les hooks `post("save")` des modèles synchronisent le contact chez Brevo : sans bouchon, chaque
  // création de volontaire part en HTTP réel, échoue et rejoue avec backoff (plusieurs dizaines de
  // secondes par test, jusqu'au dépassement du timeout).
  sync: () => Promise.resolve(),
  unsync: () => Promise.resolve(),
}));

// Les gabarits d'attestation ne sont pas versionnés : `getAllPdfTemplates()` les télécharge au
// démarrage de l'API (`main.js`). En test, on bouchonne la récupération par un PNG minimal valide,
// que pdfkit sait redimensionner au format de la page.
const PNG_1x1 = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  getFile: () => Promise.resolve({ Body: PNG_1x1 }),
}));

jest.mock("../queues/sendMailQueue", () => ({
  ...jest.requireActual("../queues/sendMailQueue"),
  sendDocumentEmailTask: jest.fn(() => Promise.resolve({ id: "job" })),
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await getAllPdfTemplates();
});
beforeEach(() => jest.clearAllMocks());
afterAll(dbClose);

describe("Young", () => {
  describe("POST young/:id/documents/certificate/:template", () => {
    it("should return 404 when young is not found", async () => {
      const res = await request(getAppHelper()).post("/young/" + notExistingYoungId + "/documents/certificate/1");
      expect(res.status).toEqual(404);
    });
    it("should return the certificate", async () => {
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const sessionPhase1 = await createSessionPhase1({ ...getNewSessionPhase1Fixture(), cohesionCenterId: cohesionCenter._id });
      const young = await createYoungHelper({ ...getNewYoungFixture(), sessionPhase1Id: sessionPhase1._id });
      await createCohortHelper({ ...getNewCohortFixture(), name: young.cohort });
      const certificates = ["1", "2", "3", "snu"];
      for (const certificate of certificates) {
        const res = await request(getAppHelper()).post("/young/" + young._id + "/documents/certificate/" + certificate);
        expect(res.status).toBe(200);
      }
    });
  });
  // Todo
  describe("POST young/:id/documents/:key", () => {
    it.skip("should return 200 and new record should be sinserted into the db", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper()).post(`/young/${young._id}/documents/cniFiles`);
      expect(res.status).toEqual(200);
      const res2 = await request(getAppHelper()).get(`/young/${young._id}/documents/cniFiles`);
      // expect(res2.body).toBe();
    });
  });
  describe("POST /young/:id/documents/certificate/:template/send-email", () => {
    it("should return 404 when young is not found", async () => {
      const res = await request(getAppHelper()).post("/young/" + notExistingYoungId + "/documents/certificate/1/send-email");
      expect(res.status).toEqual(404);
    });

    // todo : `const content = buffer.toString("base64");` doesnt work in test environment
    it.skip("should return the certificate", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const certificates = ["1", "2", "3", "snu"];
      for (const certificate of certificates) {
        const res = await request(getAppHelper())
          .post("/young/" + young._id + "/documents/certificate/" + certificate + "/send-email")
          .send({ fileName: "test" });
        expect(res.status).toBe(200);
      }
    });
  });

  describe("POST /young/:id/documents/contract/:template/send-email (H41)", () => {
    it("devrait renvoyer 404 quand le contrat n'appartient pas au jeune", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const autreJeune = await createYoungHelper(getNewYoungFixture());
      const contratDeLAutreJeune = await createContractHelper({ ...getNewContractFixture(), youngId: autreJeune._id.toString() });

      const res = await request(getAppHelper()).post(`/young/${young._id}/documents/contract/1/send-email`).send({ contract_id: contratDeLAutreJeune._id.toString() });

      expect(res.status).toBe(404);
      expect(sendDocumentEmailTask).not.toHaveBeenCalled();
    });

    it("devrait renvoyer 200 quand le contrat appartient au jeune", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const contrat = await createContractHelper({ ...getNewContractFixture(), youngId: young._id.toString() });

      const res = await request(getAppHelper()).post(`/young/${young._id}/documents/contract/1/send-email`).send({ contract_id: contrat._id.toString() });

      expect(res.status).toBe(200);
      expect(sendDocumentEmailTask).toHaveBeenCalled();
    });
  });
});
