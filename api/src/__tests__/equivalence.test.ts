import fetch from "node-fetch";

import request from "supertest";
import { ROLES, COHORTS, YOUNG_SOURCE, SENDINBLUE_TEMPLATES, ERRORS } from "snu-lib";
import getAppHelper, { resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { sendTemplate } from "../brevo";
import getNewCohortFixture from "./fixtures/cohort";
import { createCohortHelper } from "./helpers/cohort";
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper, notExistingYoungId } from "./helpers/young";
import { createMissionEquivalenceHelpers, notExistingMissionEquivalenceId } from "./helpers/equivalence";
import { createFixtureMissionEquivalence } from "./fixtures/equivalence";
import { MissionEquivalenceModel, YoungModel } from "../models";

beforeAll(() => dbConnect(__filename.slice(__dirname.length + 1, -3)));
afterAll(dbClose);
beforeEach(async () => {
  await MissionEquivalenceModel.deleteMany({});
  await YoungModel.deleteMany({});
});

describe("Equivalence Routes", () => {
  describe("POST /equivalence", () => {
    it("should return 200 when creating an equivalence", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Juillet 2023", dateEnd: new Date("2023-07-31"), dateStart: new Date("2023-07-01") }));
      const young = await createYoungHelper(
        getNewYoungFixture({ cohortId: cohort._id, cohort: "Juillet 2023", statusPhase2OpenedAt: new Date("2023-08-01"), statusPhase1: "DONE" }),
      );
      const body = createFixtureMissionEquivalence({
        youngId: young._id.toString(),
        type: "BAFA",
        structureName: "Test Structure",
        address: "123 Street",
        zip: "12345",
        city: "City",
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-01-02"),
        contactFullName: "John Doe",
        contactEmail: "john@example.com",
        files: ["file1.pdf"],
        missionDuration: 84,
      });
      const res = await request(getAppHelper(young)).post(`/young/${young._id}/phase2/equivalence`).send(body);
      expect(res.status).toEqual(200);
    });

    it("should return 400 when not creating an equivalence with missing required fields", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Juillet 2023", dateEnd: new Date("2023-07-31"), dateStart: new Date("2023-07-01") }));
      const young = await createYoungHelper(getNewYoungFixture({ cohortId: cohort._id, cohort: "Juillet 2023", statusPhase2OpenedAt: new Date("2023-08-01") }));

      const body = createMissionEquivalenceHelpers({
        youngId: young._id.toString(),
        type: "BAFA", // Missing 'structureName', 'address', etc.
      });

      const res = await request(getAppHelper(young)).post(`/young/${young._id}/phase2/equivalence`).send(body);

      expect(res.status).toEqual(400);
    });

    it("should return 404 when the user doesn't exist", async () => {
      const fakeYoung = notExistingYoungId;
      const young = await createYoungHelper(getNewYoungFixture({ cohort: "Juillet 2023", statusPhase2OpenedAt: new Date("2023-08-01") }));
      const body = createFixtureMissionEquivalence({
        youngId: young._id.toString(),
        type: "BAFA",
        structureName: "Test Structure",
        address: "123 Street",
        zip: "12345",
        city: "City",
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-01-02"),
        contactFullName: "John Doe",
        contactEmail: "john@example.com",
        files: ["file1.pdf"],
        missionDuration: 84,
      });
      const res = await request(getAppHelper(young)).post(`/young/${fakeYoung}/phase2/equivalence`).send(body);
      expect(res.status).toEqual(404);
    });

    it("should return 403 when the user is not allowed to create an equivalence", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Juillet 2023", dateEnd: new Date("2023-07-31"), dateStart: new Date("2023-07-01") }));
      const young = await createYoungHelper(getNewYoungFixture({ cohortId: cohort._id, cohort: "Juillet 2023", statusPhase1: "AFFECTED" }));
      const body = createFixtureMissionEquivalence({
        youngId: young._id.toString(),
        type: "BAFA",
        structureName: "Test Structure",
        address: "123 Street",
        zip: "12345",
        city: "City",
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-01-02"),
        contactFullName: "John Doe",
        contactEmail: "john@example.com",
        files: ["file1.pdf"],
        missionDuration: 84,
      });
      const res = await request(getAppHelper(young)).post(`/young/${young._id}/phase2/equivalence`).send(body);
      expect(res.status).toEqual(403);
    });
  });

  describe("PUT /equivalence/:idEquivalence", () => {
    it("should update an equivalence", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Juillet 2023", dateEnd: new Date("2023-07-31"), dateStart: new Date("2023-07-01") }));
      const young = await createYoungHelper(
        getNewYoungFixture({ cohortId: cohort._id, cohort: "Juillet 2023", statusPhase2OpenedAt: new Date("2023-08-01"), statusPhase1: "DONE" }),
      );
      const equivalence = await createMissionEquivalenceHelpers(
        createFixtureMissionEquivalence({
          youngId: young._id.toString(),
          type: "BAFA",
          structureName: "Test Structure",
          address: "123 Street",
          zip: "12345",
          city: "City",
          startDate: new Date("2025-01-01"),
          endDate: new Date("2025-01-02"),
          contactFullName: "John Doe",
          contactEmail: "john@example.com",
          files: ["file1.pdf"],
        }),
      );

      const updatedBody = { ...equivalence, address: "15 test ville" };

      const res = await request(getAppHelper(young)).put(`/young/${young._id}/phase2/equivalence/${equivalence._id}`).send(updatedBody);

      expect(res.status).toEqual(200);
    });

    it("should return 404 if equivalence not found on update", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture({ name: "Juillet 2023", dateEnd: new Date("2023-07-31"), dateStart: new Date("2023-07-01") }));
      const young = await createYoungHelper(
        getNewYoungFixture({ cohortId: cohort._id, cohort: "Juillet 2023", statusPhase2OpenedAt: new Date("2023-08-01"), statusPhase1: "DONE" }),
      );
      const equivalence = await createMissionEquivalenceHelpers(
        createFixtureMissionEquivalence({
          youngId: young._id.toString(),
          type: "BAFA",
          structureName: "Test Structure",
          address: "123 Street",
          zip: "12345",
          city: "City",
          startDate: new Date("2025-01-01"),
          endDate: new Date("2025-01-02"),
          contactFullName: "John Doe",
          contactEmail: "john@example.com",
          files: ["file1.pdf"],
        }),
      );

      const updatedBody = { ...equivalence, address: "15 test ville" };

      const res = await request(getAppHelper(young)).put(`/young/${young._id}/phase2/equivalence/${notExistingMissionEquivalenceId}`).send(updatedBody);

      expect(res.status).toEqual(404);
    });
  });

  describe("DELETE /equivalence/:idEquivalence", () => {
    it("should return 200 delete an equivalence", async () => {
      const young = await createYoungHelper(getNewYoungFixture());

      const equivalence = await createMissionEquivalenceHelpers({
        youngId: young._id.toString(),
        type: "BAFA",
        structureName: "Test Structure",
        address: "123 Street",
        zip: "12345",
        city: "City",
        status: "WAITING_VERIFICATION",
        startDate: "2025-01-01",
        endDate: "2025-01-02",
        contactFullName: "John Doe",
        contactEmail: "john@example.com",
        files: ["file1.pdf"],
      });

      const res = await request(getAppHelper(young)).delete(`/young/${young._id}/phase2/equivalence/${equivalence._id}`);

      expect(res.status).toEqual(200);
    });

    it("should return 403 when status is  wrong", async () => {
      const young = await createYoungHelper(getNewYoungFixture());

      const equivalence = await createMissionEquivalenceHelpers({
        youngId: young._id.toString(),
        structureName: "Test Structure",
        zip: "12345",
        city: "City",
        contactFullName: "John Doe",
        status: "WAITING_CORRECTION",
        files: ["file1.pdf"],
      });

      const res = await request(getAppHelper(young)).delete(`/young/${young._id}/phase2/equivalence/${equivalence._id}`);

      expect(res.status).toEqual(403);
    });

    it("should return 404 if equivalence not found on delete", async () => {
      const young = await createYoungHelper(getNewYoungFixture());

      // Essayer de supprimer une équivalence inexistante
      const res = await request(getAppHelper(young)).delete(`/young/${young._id}/phase2/equivalence/${notExistingMissionEquivalenceId}`);

      expect(res.status).toEqual(404);
    });
  });

  describe("GET /equivalences", () => {
    it("should return 200 to get all equivalences for a young", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const equivalence = await createMissionEquivalenceHelpers(
        createFixtureMissionEquivalence({
          youngId: young._id.toString(),
          type: "BAFA",
          structureName: "Test Structure",
          address: "123 Street",
          zip: "12345",
          city: "City",
          startDate: new Date("2025-01-01"),
          endDate: new Date("2025-01-02"),
          contactFullName: "John Doe",
          contactEmail: "john@example.com",
          files: ["file1.pdf"],
        }),
      );
      const res = await request(getAppHelper(young)).get(`/young/${young._id}/phase2/equivalences`).query({ id: young._id.toString() });

      expect(res.status).toEqual(200);
    });
  });

  describe("GET /equivalence/:idEquivalence", () => {
    it("should return 200 to get a specific equivalence", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const equivalence = await createMissionEquivalenceHelpers(
        createFixtureMissionEquivalence({
          youngId: young._id.toString(),
          type: "BAFA",
          structureName: "Test Structure",
          address: "123 Street",
          zip: "12345",
          city: "City",
          startDate: new Date("2025-01-01"),
          endDate: new Date("2025-01-02"),
          contactFullName: "John Doe",
          contactEmail: "john@example.com",
          files: ["file1.pdf"],
        }),
      );

      const res = await request(getAppHelper(young)).get(`/young/${young._id}/phase2/equivalence/${equivalence._id}`);

      expect(res.status).toEqual(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toMatchObject({ type: equivalence.type });
    });

    it("should return 404 if equivalence not found on GET", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper(young)).get(`/young/${young._id}/phase2/equivalence/${notExistingMissionEquivalenceId}`);

      expect(res.status).toEqual(404);
      expect(res.body.ok).toBe(false);
    });
  });
});
