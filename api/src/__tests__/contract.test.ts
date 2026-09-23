import crypto from "crypto";
import { Types } from "mongoose";
import request from "supertest";

import { YoungType, ROLES, PERMISSION_RESOURCES, PERMISSION_ACTIONS, ROLE_JEUNE } from "snu-lib";

import getAppHelper, { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import getNewContractFixture from "./fixtures/contract";
import { getNewApplicationFixture } from "./fixtures/application";
import getNewYoungFixture from "./fixtures/young";
import { createApplication, getApplicationByIdHelper } from "./helpers/application";
import { getYoungByIdHelper, createYoungHelper } from "./helpers/young";
import { expectContractToEqual, getContractByIdHelper, createContractHelper } from "./helpers/contract";
import { createStructureHelper } from "./helpers/structure";
import getNewStructureFixture from "./fixtures/structure";
import { ApplicationModel } from "../models";
import { PermissionModel } from "../models/permissions/permission";
import { addPermissionHelper } from "./helpers/permissions";

const { ObjectId } = Types;

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
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await PermissionModel.deleteMany({ roles: { $in: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.RESPONSIBLE, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLE_JEUNE] } });
  // Mêmes rôles que le seed de production (migration 20250624122150-seed-responsable-permissions)
  await addPermissionHelper(
    [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.RESPONSIBLE, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION],
    PERMISSION_RESOURCES.CONTRACT,
    PERMISSION_ACTIONS.FULL,
  );
  await addPermissionHelper([ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION], PERMISSION_RESOURCES.PATCH, PERMISSION_ACTIONS.READ);
  await addPermissionHelper([ROLE_JEUNE], PERMISSION_RESOURCES.CONTRACT, PERMISSION_ACTIONS.READ, [
    {
      where: [{ field: "youngId", source: "_id" }],
      blacklist: [],
      whitelist: [],
    },
  ]);
});
afterAll(dbClose);
afterEach(resetAppAuth);

describe("Contract", () => {
  describe("POST /contract", () => {
    it("should return 400 when contract ID is not a valid ID", async () => {
      const res = await request(await getAppHelperWithAcl())
        .post("/contract")
        .send({ _id: "not-an-id" });
      expect(res.status).toBe(400);
    });
    it("should return 404 when application is not found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(await getAppHelperWithAcl())
        .post("/contract")
        .send({ ...getNewContractFixture(), youngId: young._id });
      expect(res.status).toBe(404);
    });
    it("should return 404 when young is not found", async () => {
      const application = await createApplication(getNewApplicationFixture());
      const res = await request(await getAppHelperWithAcl())
        .post("/contract")
        .send({ ...getNewContractFixture(), applicationId: application._id });
      expect(res.status).toBe(404);
    });
    describe("when it works", () => {
      async function createContract(options, initialYoung?: Partial<YoungType>) {
        const young = initialYoung || (await createYoungHelper(getNewYoungFixture()));
        const application = await createApplication({ ...getNewApplicationFixture(), status: "VALIDATED", youngId: young._id });
        const contractFixture = getNewContractFixture();
        contractFixture.youngId = young._id;
        contractFixture.applicationId = application._id;
        const res = await request(await getAppHelperWithAcl())
          .post("/contract")
          .send({ ...contractFixture, ...options });
        return { res, young, application, contractFixture };
      }
      it("should create contract and send it when setting sendMessage to true", async () => {
        const { res, young, contractFixture } = await createContract({ sendMessage: true });
        expect(res.status).toBe(200);
        expectContractToEqual(res.body.data, contractFixture);
        expect(res.body.data.invitationSent).toBe("true");
        const updatedYoung = await getYoungByIdHelper(young._id);
        expect(updatedYoung?.statusPhase2Contract[0]).toBe("SENT");
      });
      it("should create contract and not send it when setting sendMessage to false", async () => {
        const { res, young, contractFixture } = await createContract({ sendMessage: false });
        expect(res.status).toBe(200);
        expectContractToEqual(res.body.data, contractFixture);
        expect(res.body.data.invitationSent).not.toBe("true");
        const updatedYoung = await getYoungByIdHelper(young._id);
        expect(updatedYoung?.statusPhase2Contract[0]).toBe("DRAFT");
      });
      it("should create contract and draft it then send it", async () => {
        const { res, young, contractFixture } = await createContract({ sendMessage: false });
        expect(res.status).toBe(200);
        expect(res.body.data.invitationSent).not.toBe("true");
        const resAfter = await request(await getAppHelperWithAcl())
          .post("/contract")
          .send({ ...res.body.data, sendMessage: true });
        expect(resAfter.status).toBe(200);
        expectContractToEqual(resAfter.body.data, contractFixture);
        expect(resAfter.body.data.invitationSent).toBe("true");

        const updatedYoung = await getYoungByIdHelper(young._id);
        expect(updatedYoung?.statusPhase2Contract[0]).toBe("SENT");
      });

      const TOKEN_FIELDS = ["parent1Token", "projectManagerToken", "structureManagerToken", "parent2Token", "youngContractToken"];

      it("should create tokens for young (not adult) without returning them", async () => {
        const { res } = await createContract({ sendMessage: true });
        expect(res.status).toBe(200);
        const stored = await getContractByIdHelper(res.body.data._id);
        for (const field of TOKEN_FIELDS) {
          expect(stored?.[field]).toBeTruthy();
          expect(res.body.data[field]).toBeUndefined();
        }
      });

      it("should create tokens for young (adult) without returning them", async () => {
        const { res } = await createContract({ sendMessage: true, isYoungAdult: "true" });
        expect(res.status).toBe(200);
        const stored = await getContractByIdHelper(res.body.data._id);
        for (const field of TOKEN_FIELDS) {
          expect(stored?.[field]).toBeTruthy();
          expect(res.body.data[field]).toBeUndefined();
        }
      });

      it("should keep existing tokens when a contract is saved back without them", async () => {
        const { res } = await createContract({ sendMessage: true });
        const before = await getContractByIdHelper(res.body.data._id);
        const resAfter = await request(await getAppHelperWithAcl())
          .post("/contract")
          .send({ ...res.body.data, sendMessage: false });
        expect(resAfter.status).toBe(200);
        const after = await getContractByIdHelper(res.body.data._id);
        expect(after?.parent1Token).toBe(before?.parent1Token);
        expect(after?.projectManagerToken).toBe(before?.projectManagerToken);
      });

      it("should update young phase2NumberHoursEstimated, phase2NumberHoursDone and missionDuration", async () => {
        const young = await createYoungHelper(getNewYoungFixture());
        const application = await createApplication({
          ...getNewApplicationFixture(),
          youngId: young._id,
          status: "VALIDATED",
        });
        const contractFixture = getNewContractFixture();
        contractFixture.youngId = young._id;
        contractFixture.applicationId = application._id;
        contractFixture.missionDuration = "65";
        const res = await request(await getAppHelperWithAcl())
          .post("/contract")
          .send(contractFixture);
        expect(res.status).toBe(200);

        const updatedYoung = await getYoungByIdHelper(young._id);
        const updatedApplication = await getApplicationByIdHelper(application._id);
        expect(updatedApplication?.missionDuration).toBe("65");
        expect(updatedApplication?.status).toBe("VALIDATED");
        expect(updatedYoung?.phase2NumberHoursEstimated).toBe("65");
        expect(updatedYoung?.phase2NumberHoursDone).toBe("0");
      });
    });
  });
  describe("GET /contract/:id", () => {
    it("should return 404 not found", async () => {
      const res = await request(await getAppHelperWithAcl())
        .get(`/contract/${new ObjectId()}`)
        .send();
      expect(res.status).toBe(404);
    });
    it("should return 400 not an ID", async () => {
      const res = await request(await getAppHelperWithAcl())
        .get(`/contract/1`)
        .send();
      expect(res.status).toBe(400);
    });
    it("should return 200 when it works", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id });
      const contract = await createContractHelper({ ...getNewContractFixture(), youngId: young._id, applicationId: application._id });
      const res = await request(await getAppHelperWithAcl())
        .get(`/contract/${contract._id}`)
        .send();
      expect(res.status).toBe(200);
    });
    it("should not return tokens for referents", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id });
      const contract = await createContractHelper({
        ...getNewContractFixture(),
        youngId: young._id,
        applicationId: application._id,
        projectManagerToken: "foo",
        parent1Token: "bar",
        parent2Token: "baz",
        structureManagerToken: "qux",
        youngContractToken: "quux",
      });
      const res = await request(await getAppHelperWithAcl())
        .get(`/contract/${contract._id}`)
        .send();
      expect(res.status).toBe(200);
      expect(res.body.data.projectManagerToken).toBeUndefined();
      expect(res.body.data.structureManagerToken).toBeUndefined();
      expect(res.body.data.parent1Token).toBeUndefined();
      expect(res.body.data.parent2Token).toBeUndefined();
      expect(res.body.data.youngContractToken).toBeUndefined();
    });
    it("should not return tokens for young", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id });
      const contract = await createContractHelper({
        ...getNewContractFixture(),
        youngId: young._id,
        applicationId: application._id,
        projectManagerToken: "foo",
        parent1Token: "bar",
        parent2Token: "baz",
        structureManagerToken: "qux",
      });

      const res = await request(await getAppHelperWithAcl(young))
        .get(`/contract/${contract._id}`)
        .send();
      expect(res.status).toBe(200);
      expect(res.body.data.projectManagerToken).toBeUndefined();
      expect(res.body.structureManagerToken).toBeUndefined();
      expect(res.body.data.parent1Token).toBeUndefined();
      expect(res.body.data.parent2Token).toBeUndefined();
      expect(res.body.data.youngContractToken).toBeUndefined();
    });
    it("should return 403 when young tries to see a contract from someone else", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id });
      const contract = await createContractHelper({ ...getNewContractFixture(), youngId: young._id, applicationId: application._id });

      const secondYoung = await createYoungHelper(getNewYoungFixture());
      const res = await request(await getAppHelperWithAcl(secondYoung))
        .get(`/contract/${contract._id}`)
        .send();
      expect(res.status).toBe(403);
    });
  });

  describe("GET /contract/token/:token", () => {
    it("should return 404 not found", async () => {
      const resGet = await request(await getAppHelperWithAcl())
        .get(`/contract/token/${new ObjectId()}`)
        .send();
      expect(resGet.status).toBe(404);
    });
    it("should return 200 for each token", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id });
      const tokens = {
        projectManagerToken: crypto.randomBytes(40).toString("hex"),
        parent1Token: crypto.randomBytes(40).toString("hex"),
        parent2Token: crypto.randomBytes(40).toString("hex"),
        structureManagerToken: crypto.randomBytes(40).toString("hex"),
        youngContractToken: crypto.randomBytes(40).toString("hex"),
      };
      const contract = await createContractHelper({
        ...getNewContractFixture(),
        youngId: young._id,
        applicationId: application._id,
        ...tokens,
      });
      for (const token of Object.values(tokens)) {
        const res = await request(await getAppHelperWithAcl())
          .get(`/contract/token/${token}`)
          .send();
        expect(res.status).toBe(200);
        expect(res.body.data._id).toBe(contract._id.toString());
        expect(res.body.data.projectManagerToken).toBeUndefined();
        expect(res.body.data.structureManagerToken).toBeUndefined();
        expect(res.body.data.parent1Token).toBeUndefined();
        expect(res.body.data.parent2Token).toBeUndefined();
        expect(res.body.data.youngContractToken).toBeUndefined();
      }
    });
  });

  describe("POST /contract/token/:token", () => {
    it("should return 404 not found", async () => {
      const resGet = await request(await getAppHelperWithAcl())
        .post(`/contract/token/${new ObjectId()}`)
        .send();
      expect(resGet.status).toBe(404);
    });
    it("should return 200 for each token and validate status", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id });
      const tokens = {
        projectManagerToken: crypto.randomBytes(40).toString("hex"),
        parent1Token: crypto.randomBytes(40).toString("hex"),
        parent2Token: crypto.randomBytes(40).toString("hex"),
        structureManagerToken: crypto.randomBytes(40).toString("hex"),
        youngContractToken: crypto.randomBytes(40).toString("hex"),
      };
      const contract = await createContractHelper({
        ...getNewContractFixture(),
        youngId: young._id,
        applicationId: application._id,
        ...tokens,
      });
      for (const [key, token] of Object.entries(tokens)) {
        const res = await request(await getAppHelperWithAcl())
          .post(`/contract/token/${token}`)
          .send();
        expect(res.status).toBe(200);

        const updatedContract = await getContractByIdHelper(contract._id);
        expect(updatedContract?.[key.replace("Token", "Status")]).toBe("VALIDATED");
      }
    });
  });

  describe("POST /contract/:id/download", () => {
    it("should return 404 not found", async () => {
      const resDownload = await request(await getAppHelperWithAcl())
        .post(`/contract/${new ObjectId()}/download`)
        .send();
      expect(resDownload.status).toBe(404);
    });
    it("should return 400 when not an ID", async () => {
      const resDownload = await request(await getAppHelperWithAcl())
        .post(`/contract/2/download`)
        .send();
      expect(resDownload.status).toBe(400);
    });
    it("should return 200", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id });
      const contract = await createContractHelper({ ...getNewContractFixture(), youngId: young._id, applicationId: application._id });

      const resDownload = await request(await getAppHelperWithAcl())
        .post(`/contract/${contract._id}/download`)
        .send();
      expect(resDownload.status).toBe(200);
    });

    it("should return 403 when young tries to see a contract from someone else", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id });
      const contract = await createContractHelper({ ...getNewContractFixture(), youngId: young._id, applicationId: application._id });

      const secondYoung = await createYoungHelper(getNewYoungFixture());

      const resDownload = await request(await getAppHelperWithAcl(secondYoung))
        .post(`/contract/${contract._id}/download`)
        .send();
      expect(resDownload.status).toBe(403);
    });

    it("should return 200 when young tries to see their own contract", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id });
      const contract = await createContractHelper({ ...getNewContractFixture(), youngId: young._id, applicationId: application._id });

      const resDownload = await request(await getAppHelperWithAcl(young, "young"))
        .post(`/contract/${contract._id}/download`)
        .send();
      expect(resDownload.status).toBe(200);
    });
  });
});

describe("GET /contract/:id/patches", () => {
  it("should return 404 if contract not found", async () => {
    const contractId = new ObjectId();
    const res = await request(await getAppHelperWithAcl())
      .get(`/contract/${contractId}/patches`)
      .send();
    expect(res.statusCode).toEqual(404);
  });
  it("should return 403 if not admin", async () => {
    const contract = await createContractHelper(getNewContractFixture());
    contract.youngFirstName = "MY NEW NAME";
    await contract.save();

    const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE }))
      .get(`/contract/${contract._id}/patches`)
      .send();
    expect(res.status).toBe(403);
  });
  it("should return 200 if contract found with patches", async () => {
    const contract = await createContractHelper(getNewContractFixture());
    contract.youngFirstName = "MY NEW NAME";
    await contract.save();
    const res = await request(await getAppHelperWithAcl())
      .get(`/contract/${contract._id}/patches`)
      .send();
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ops: expect.arrayContaining([expect.objectContaining({ op: "replace", path: "/youngFirstName", value: "MY NEW NAME" })]),
        }),
      ]),
    );
  });
  it("should be only accessible by referents", async () => {
    const passport = require("passport");
    const contractId = new ObjectId();
    await request(await getAppHelperWithAcl())
      .get(`/contract/${contractId}/patches`)
      .send();
    expect(passport.lastTypeCalledOnAuthenticate).toEqual("referent");
  });
});

describe("Contrat - cloisonnement des lectures (C2)", () => {
  async function setupContract() {
    const structure = await createStructureHelper({ ...getNewStructureFixture(), networkId: "" });
    const young = await createYoungHelper({ ...getNewYoungFixture(), department: "Ain", region: "Auvergne-Rhône-Alpes" });
    const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id, structureId: structure._id });
    const contract = await createContractHelper({
      ...getNewContractFixture(),
      youngId: young._id,
      applicationId: application._id,
      structureId: structure._id,
      youngDepartment: "Ain",
      projectManagerToken: "tok-project-manager",
      structureManagerToken: "tok-structure-manager",
      parent1Token: "tok-parent1",
      parent2Token: "tok-parent2",
      youngContractToken: "tok-young",
    });
    await ApplicationModel.findByIdAndUpdate(application._id, { contractId: contract._id.toString() });
    return { structure, young, application, contract };
  }

  describe("GET /contract/:id", () => {
    it("devrait renvoyer 403 à un responsable d'une autre structure", async () => {
      const { contract } = await setupContract();
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: new ObjectId().toString() }))
        .get(`/contract/${contract._id}`)
        .send();
      expect(res.status).toBe(403);
    });

    it("devrait renvoyer 200 au responsable de la structure du contrat", async () => {
      const { contract, structure } = await setupContract();
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }))
        .get(`/contract/${contract._id}`)
        .send();
      expect(res.status).toBe(200);
    });

    it("devrait renvoyer 403 à un superviseur d'un autre réseau", async () => {
      const { contract } = await setupContract();
      const autreTete = await createStructureHelper({ ...getNewStructureFixture(), networkId: "" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.SUPERVISOR, structureId: autreTete._id.toString() }))
        .get(`/contract/${contract._id}`)
        .send();
      expect(res.status).toBe(403);
    });

    it("devrait renvoyer 200 au superviseur du réseau de la structure", async () => {
      const tete = await createStructureHelper({ ...getNewStructureFixture(), networkId: "" });
      const structure = await createStructureHelper({ ...getNewStructureFixture(), networkId: tete._id.toString() });
      const young = await createYoungHelper(getNewYoungFixture());
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id, structureId: structure._id });
      const contract = await createContractHelper({
        ...getNewContractFixture(),
        youngId: young._id,
        applicationId: application._id,
        structureId: structure._id.toString(),
      });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.SUPERVISOR, structureId: tete._id.toString() }))
        .get(`/contract/${contract._id}`)
        .send();
      expect(res.status).toBe(200);
    });

    it("devrait renvoyer 403 à un référent départemental hors du département du jeune", async () => {
      const { contract } = await setupContract();
      const res = await request(await getAppHelperWithAcl({ role: ROLES.REFERENT_DEPARTMENT, department: ["Nord"], region: "Hauts-de-France" }))
        .get(`/contract/${contract._id}`)
        .send();
      expect(res.status).toBe(403);
    });

    it("devrait renvoyer 200 au référent départemental du jeune", async () => {
      const { contract } = await setupContract();
      const res = await request(await getAppHelperWithAcl({ role: ROLES.REFERENT_DEPARTMENT, department: ["Ain"], region: "Auvergne-Rhône-Alpes" }))
        .get(`/contract/${contract._id}`)
        .send();
      expect(res.status).toBe(200);
    });

    it("devrait renvoyer 403 à un référent régional hors de la région du jeune", async () => {
      const { contract } = await setupContract();
      const res = await request(await getAppHelperWithAcl({ role: ROLES.REFERENT_REGION, department: [], region: "Hauts-de-France" }))
        .get(`/contract/${contract._id}`)
        .send();
      expect(res.status).toBe(403);
    });

    it("devrait renvoyer 200 au référent régional du jeune", async () => {
      const { contract } = await setupContract();
      const res = await request(await getAppHelperWithAcl({ role: ROLES.REFERENT_REGION, department: [], region: "Auvergne-Rhône-Alpes" }))
        .get(`/contract/${contract._id}`)
        .send();
      expect(res.status).toBe(200);
    });

    it("ne devrait pas exposer les jetons de signature à un responsable d'une autre structure", async () => {
      const { contract } = await setupContract();
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: new ObjectId().toString() }))
        .get(`/contract/${contract._id}`)
        .send();
      expect(res.body?.data?.projectManagerToken).toBeUndefined();
      expect(res.body?.data?.structureManagerToken).toBeUndefined();
      expect(res.body?.data?.parent1Token).toBeUndefined();
      expect(res.body?.data?.parent2Token).toBeUndefined();
      expect(res.body?.data?.youngContractToken).toBeUndefined();
    });
  });

  describe("POST /contract/:id/download", () => {
    it("devrait renvoyer 403 à un responsable d'une autre structure", async () => {
      const { contract } = await setupContract();
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: new ObjectId().toString() }))
        .post(`/contract/${contract._id}/download`)
        .send();
      expect(res.status).toBe(403);
    });

    it("devrait renvoyer 403 à un référent départemental hors du département du jeune", async () => {
      const { contract } = await setupContract();
      const res = await request(await getAppHelperWithAcl({ role: ROLES.REFERENT_DEPARTMENT, department: ["Nord"], region: "Hauts-de-France" }))
        .post(`/contract/${contract._id}/download`)
        .send();
      expect(res.status).toBe(403);
    });
  });

  describe("GET /application/:id/contract", () => {
    it("devrait renvoyer 403 à un responsable d'une autre structure", async () => {
      const { application } = await setupContract();
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: new ObjectId().toString() }))
        .get(`/application/${application._id}/contract`)
        .send();
      expect(res.status).toBe(403);
    });

    it("devrait renvoyer 200 au responsable de la structure du contrat", async () => {
      const { application, structure } = await setupContract();
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: structure._id.toString() }))
        .get(`/application/${application._id}/contract`)
        .send();
      expect(res.status).toBe(200);
    });
  });

  describe("GET /contract/:id/patches (M2)", () => {
    it("devrait renvoyer 403 à un référent départemental hors du département du jeune", async () => {
      const { contract } = await setupContract();
      contract.youngFirstName = "NOUVEAU PRENOM";
      await contract.save();
      const res = await request(await getAppHelperWithAcl({ role: ROLES.REFERENT_DEPARTMENT, department: ["Nord"], region: "Hauts-de-France" }))
        .get(`/contract/${contract._id}/patches`)
        .send();
      expect(res.status).toBe(403);
    });

    it("devrait renvoyer 200 au référent départemental du jeune", async () => {
      const { contract } = await setupContract();
      contract.youngFirstName = "NOUVEAU PRENOM";
      await contract.save();
      const res = await request(await getAppHelperWithAcl({ role: ROLES.REFERENT_DEPARTMENT, department: ["Ain"], region: "Auvergne-Rhône-Alpes" }))
        .get(`/contract/${contract._id}/patches`)
        .send();
      expect(res.status).toBe(200);
    });
  });
});

describe("POST /contract - champs pilotés par le serveur (H21)", () => {
  it("ne devrait pas accepter les statuts et jetons de signature envoyés par le client", async () => {
    const young = await createYoungHelper(getNewYoungFixture());
    const application = await createApplication({ ...getNewApplicationFixture(), status: "VALIDATED", youngId: young._id });
    const creation = await request(await getAppHelperWithAcl())
      .post("/contract")
      .send({ ...getNewContractFixture(), youngId: young._id, applicationId: application._id, sendMessage: true });
    expect(creation.status).toBe(200);

    const contratInitial = await getContractByIdHelper(creation.body.data._id);
    expect(contratInitial?.projectManagerStatus).toBe("WAITING_VALIDATION");

    const res = await request(await getAppHelperWithAcl())
      .post("/contract")
      .send({
        ...creation.body.data,
        projectManagerStatus: "VALIDATED",
        structureManagerStatus: "VALIDATED",
        parent1Status: "VALIDATED",
        youngContractStatus: "VALIDATED",
        projectManagerToken: "jeton-forge",
        structureManagerToken: "jeton-forge",
        sendMessage: false,
      });
    expect(res.status).toBe(200);

    const contrat = await getContractByIdHelper(creation.body.data._id);
    expect(contrat?.projectManagerStatus).toBe("WAITING_VALIDATION");
    expect(contrat?.structureManagerStatus).toBe("WAITING_VALIDATION");
    expect(contrat?.parent1Status).toBe("WAITING_VALIDATION");
    expect(contrat?.projectManagerToken).not.toBe("jeton-forge");
    expect(contrat?.structureManagerToken).not.toBe("jeton-forge");
    expect(contrat?.projectManagerToken).toBe(contratInitial?.projectManagerToken);
  });
});

describe("POST /contract/token/:token - rejeu du jeton (L9)", () => {
  it("ne devrait pas rejouer une signature déjà validée", async () => {
    const young = await createYoungHelper(getNewYoungFixture());
    const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id });
    const token = crypto.randomBytes(40).toString("hex");
    const contract = await createContractHelper({
      ...getNewContractFixture(),
      youngId: young._id,
      applicationId: application._id,
      projectManagerToken: token,
      projectManagerStatus: "WAITING_VALIDATION",
    });

    const premiere = await request(await getAppHelperWithAcl())
      .post(`/contract/token/${token}`)
      .send();
    expect(premiere.status).toBe(200);

    const apresPremiere = await getContractByIdHelper(contract._id);
    expect(apresPremiere?.projectManagerStatus).toBe("VALIDATED");
    const dateDeSignature = apresPremiere?.projectManagerValidationDate;

    // la signature doit rester tracée dans l'historique du contrat
    const historique = await request(await getAppHelperWithAcl())
      .get(`/contract/${contract._id}/patches`)
      .send();
    expect(historique.status).toBe(200);
    expect(historique.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ops: expect.arrayContaining([expect.objectContaining({ op: "replace", path: "/projectManagerStatus", value: "VALIDATED" })]),
        }),
      ]),
    );
    const nombreDeRevisions = historique.body.data.length;

    const seconde = await request(await getAppHelperWithAcl())
      .post(`/contract/token/${token}`)
      .send();
    expect(seconde.status).toBe(200);

    const apresSeconde = await getContractByIdHelper(contract._id);
    expect(apresSeconde?.projectManagerValidationDate?.toISOString()).toBe(dateDeSignature?.toISOString());

    const historiqueApresRejeu = await request(await getAppHelperWithAcl())
      .get(`/contract/${contract._id}/patches`)
      .send();
    expect(historiqueApresRejeu.body.data.length).toBe(nombreDeRevisions);
  });

  it("ne devrait valider que la signature du porteur du jeton", async () => {
    const young = await createYoungHelper(getNewYoungFixture());
    const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id });
    const token = crypto.randomBytes(40).toString("hex");
    const contract = await createContractHelper({
      ...getNewContractFixture(),
      youngId: young._id,
      applicationId: application._id,
      parent1Token: token,
      parent1Status: "WAITING_VALIDATION",
      projectManagerToken: crypto.randomBytes(40).toString("hex"),
      projectManagerStatus: "WAITING_VALIDATION",
    });

    const res = await request(await getAppHelperWithAcl())
      .post(`/contract/token/${token}`)
      .send();
    expect(res.status).toBe(200);

    const misAJour = await getContractByIdHelper(contract._id);
    expect(misAJour?.parent1Status).toBe("VALIDATED");
    expect(misAJour?.projectManagerStatus).toBe("WAITING_VALIDATION");
  });
});
