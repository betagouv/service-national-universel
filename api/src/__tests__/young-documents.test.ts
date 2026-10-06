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
import { sendDocumentEmail } from "../young/youngSendDocumentEmailService";

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
      const young = await createYoungHelper({
        ...getNewYoungFixture(),
        sessionPhase1Id: sessionPhase1._id,
        statusPhase1: "DONE",
        statusPhase2: "VALIDATED",
        statusPhase3: "VALIDATED",
      });
      await createCohortHelper({ ...getNewCohortFixture(), name: young.cohort });
      const certificates = ["1", "2", "3", "snu"];
      for (const certificate of certificates) {
        const res = await request(getAppHelper()).post("/young/" + young._id + "/documents/certificate/" + certificate);
        expect(res.status).toBe(200);
      }
    });
  });

  // Chaque attestation ne doit sanctionner que la phase réellement terminée : avant GOO-159 (PM16),
  // le serveur ne contrôlait aucun statut et générait l'attestation quel que soit l'avancement réel
  // du volontaire.
  describe("Statut requis pour générer une attestation (GOO-159 : PM16)", () => {
    it("devrait renvoyer 403 pour l'attestation phase 1 si statusPhase1 n'est pas DONE", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture(), statusPhase1: "AFFECTED" });

      const res = await request(getAppHelper()).post(`/young/${young._id}/documents/certificate/1`);

      expect(res.status).toBe(403);
    });

    it("devrait renvoyer 403 pour l'attestation phase 2 si statusPhase2 n'est pas VALIDATED", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture(), statusPhase2: "IN_PROGRESS" });

      const res = await request(getAppHelper()).post(`/young/${young._id}/documents/certificate/2`);

      expect(res.status).toBe(403);
    });

    it("devrait renvoyer 403 pour l'attestation phase 3 si statusPhase3 n'est pas VALIDATED", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture(), statusPhase3: "WAITING_VALIDATION" });

      const res = await request(getAppHelper()).post(`/young/${young._id}/documents/certificate/3`);

      expect(res.status).toBe(403);
    });

    it("devrait renvoyer 403 pour l'attestation SNU si statusPhase1 n'est pas DONE, même phase 2 validée", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture(), statusPhase1: "AFFECTED", statusPhase2: "VALIDATED" });

      const res = await request(getAppHelper()).post(`/young/${young._id}/documents/certificate/snu`);

      expect(res.status).toBe(403);
    });

    it("devrait renvoyer 403 pour l'attestation SNU si statusPhase2 n'est pas VALIDATED, même phase 1 terminée", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture(), statusPhase1: "DONE", statusPhase2: "IN_PROGRESS" });

      const res = await request(getAppHelper()).post(`/young/${young._id}/documents/certificate/snu`);

      expect(res.status).toBe(403);
    });

    it("devrait renvoyer 200 pour l'attestation SNU d'un volontaire EXEMPTED de la phase 1 dont la phase 2 est VALIDATED", async () => {
      const young = await createYoungHelper({
        ...getNewYoungFixture(),
        statusPhase1: "EXEMPTED",
        statusPhase2: "VALIDATED",
        statusPhase2ValidatedAt: new Date(),
      });

      const res = await request(getAppHelper()).post(`/young/${young._id}/documents/certificate/snu`);

      expect(res.status).toBe(200);
    });

    it("devrait renvoyer 403 à l'envoi par mail de l'attestation phase 2 si statusPhase2 n'est pas VALIDATED, sans lancer de tâche", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture(), statusPhase2: "IN_PROGRESS" });

      const res = await request(getAppHelper()).post(`/young/${young._id}/documents/certificate/2/send-email`).send({ fileName: "attestation.pdf" });

      expect(res.status).toBe(403);
      expect(sendDocumentEmailTask).not.toHaveBeenCalled();
    });

    it("devrait renvoyer 200 à l'envoi par mail de l'attestation phase 3 si statusPhase3 est VALIDATED", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture(), statusPhase3: "VALIDATED", statusPhase3ValidatedAt: new Date() });

      const res = await request(getAppHelper()).post(`/young/${young._id}/documents/certificate/3/send-email`).send({ fileName: "attestation.pdf" });

      expect(res.status).toBe(200);
      expect(sendDocumentEmailTask).toHaveBeenCalled();
    });

    // La route POST .../send-email ne fait qu'enfiler sendDocumentEmailTask (mocké ci-dessus) : la
    // garde de generatePdfIntoStream, elle, est rejouée par le worker réel (sendMailQueue ->
    // youngSendDocumentEmailService.sendDocumentEmail -> generatePdfIntoBuffer), hors de ce
    // processus de requête. On exerce donc ce chemin directement, sans mock de pdf-renderer.
    describe("Garde rejouée par le worker réel (sendDocumentEmail)", () => {
      it("devrait rejeter l'envoi si le statut n'est plus valide au moment où le worker s'exécute", async () => {
        const young = await createYoungHelper({ ...getNewYoungFixture(), statusPhase3: "WAITING_VALIDATION" });

        await expect(
          sendDocumentEmail({ young_id: young._id.toString(), type: "certificate", template: "3", fileName: "attestation.pdf", switchToCle: false }),
        ).rejects.toThrow();
      });

      it("devrait générer et envoyer l'attestation quand le statut est valide au moment où le worker s'exécute", async () => {
        const young = await createYoungHelper({ ...getNewYoungFixture(), statusPhase3: "VALIDATED", statusPhase3ValidatedAt: new Date() });

        await expect(
          sendDocumentEmail({ young_id: young._id.toString(), type: "certificate", template: "3", fileName: "attestation.pdf", switchToCle: false }),
        ).resolves.not.toThrow();
      });
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

  // La convocation au séjour de cohésion n'est plus générée depuis la fermeture de la phase 1 : les
  // routes renvoyaient 500 (NOT_FOUND levé par le générateur), elles refusent désormais en 400 (GOO-51).
  describe("Documents non disponibles (GOO-51)", () => {
    it("devrait renvoyer 400 pour la convocation au séjour de cohésion", async () => {
      const young = await createYoungHelper(getNewYoungFixture());

      const res = await request(getAppHelper()).post(`/young/${young._id}/documents/convocation/cohesion`);

      expect(res.status).toBe(400);
    });

    it("devrait renvoyer 400 à l'envoi par mail de la convocation, sans lancer de tâche", async () => {
      const young = await createYoungHelper(getNewYoungFixture());

      const res = await request(getAppHelper()).post(`/young/${young._id}/documents/convocation/cohesion/send-email`).send({ fileName: "convocation.pdf" });

      expect(res.status).toBe(400);
      expect(sendDocumentEmailTask).not.toHaveBeenCalled();
    });

    it("devrait renvoyer 400 pour un gabarit inconnu d'un type connu", async () => {
      const young = await createYoungHelper(getNewYoungFixture());

      const res = await request(getAppHelper()).post(`/young/${young._id}/documents/certificate/4`);

      expect(res.status).toBe(400);
    });
  });

  describe("POST /young/:id/documents/contract/:template/send-email (H41)", () => {
    it("devrait renvoyer 404 quand le contrat n'appartient pas au jeune", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const autreJeune = await createYoungHelper(getNewYoungFixture());
      const contratDeLAutreJeune = await createContractHelper({ ...getNewContractFixture(), youngId: autreJeune._id.toString() });

      const res = await request(getAppHelper()).post(`/young/${young._id}/documents/contract/2/send-email`).send({ contract_id: contratDeLAutreJeune._id.toString() });

      expect(res.status).toBe(404);
      expect(sendDocumentEmailTask).not.toHaveBeenCalled();
    });

    it("devrait renvoyer 200 quand le contrat appartient au jeune", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const contrat = await createContractHelper({ ...getNewContractFixture(), youngId: young._id.toString() });

      const res = await request(getAppHelper()).post(`/young/${young._id}/documents/contract/2/send-email`).send({ contract_id: contrat._id.toString() });

      expect(res.status).toBe(200);
      expect(sendDocumentEmailTask).toHaveBeenCalled();
    });
  });
});
