import request from "supertest";
import { ObjectId } from "mongodb";
import getAppHelper from "./helpers/app";
import getNewCohortFixture from "./fixtures/cohort";
import { createCohortHelper } from "./helpers/cohort";
import { createClasse } from "./helpers/classe";
import { createFixtureClasse } from "./fixtures/classe";
import { COHORT_TYPE, ERRORS, ROLES, STATUS_CLASSE, SUB_ROLE_GOD, COHORT_STATUS, formatDateTimeZone, setToEndOfDay, INSCRIPTION_GOAL_LEVELS } from "snu-lib";
import { dbConnect, dbClose } from "./helpers/db";
import { ClasseModel } from "../models";

jest.mock("../emails", () => ({
  emit: jest.fn(),
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(async () => {
  await dbClose();
});

describe("Cohort", () => {
  describe("PUT /:id/general", () => {
    const updatedData = {
      dateStart: new Date(),
      dateEnd: new Date(),
      status: COHORT_STATUS.PUBLISHED,
      cohortGroupId: "newGroup123",
      uselessInformation: {
        toolkit: "Updated toolkit",
        zones: "Updated zones",
        eligibility: "Updated eligibility",
      },
      specificSnuIdCohort: true,
    };
    it("should return 400 if cohort id is invalid", async () => {
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put("/cohort/invalidId/general")
        .send(updatedData);
      expect(res.status).toBe(400);
    });

    it("should return 400 if request body is invalid", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture());
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${cohort._id}/general`)
        .send({
          dateStart: "not-a-date",
          status: 123,
        });
      expect(res.status).toBe(400);
    });

    it("should return 403 if user is not an admin", async () => {
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);
      const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
        .put(`/cohort/${cohort._id}/general`)
        .send(updatedData);
      expect(res.status).toBe(403);
    });

    it("should return 403 if user is not a super admin", async () => {
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);

      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "NONgod" }))
        .put(`/cohort/${cohort._id}/general`)
        .send(updatedData);
      expect(res.status).toBe(403);
    });

    it("should return 404 if cohort is not found", async () => {
      const nonExistentId = new ObjectId();
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${nonExistentId}/general`)
        .send(updatedData);
      expect(res.status).toBe(404);
    });

    it("should return 200 when cohort general info is updated successfully", async () => {
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${cohort._id}/general`)
        .send({ ...updatedData, dateStart: now, dateEnd: tomorrow });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(updatedData.status);
      expect(res.body.data.cohortGroupId).toBe(updatedData.cohortGroupId);
      expect(res.body.data.uselessInformation.toolkit).toBe(updatedData.uselessInformation.toolkit);
      expect(res.body.data.specificSnuIdCohort).toBe(updatedData.specificSnuIdCohort);
      expect(new Date(res.body.data.dateStart).toISOString()).toBe(formatDateTimeZone(now).toISOString());
      const expectedEndDate = setToEndOfDay(tomorrow);
      expect(new Date(res.body.data.dateEnd).toISOString()).toBe(expectedEndDate.toISOString());
    });

    it("should handle date formatting correctly", async () => {
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);
      const startDate = new Date("2025-06-01T10:00:00Z");
      const endDate = new Date("2025-06-30T10:00:00Z");

      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${cohort._id}/general`)
        .send({ ...updatedData, dateStart: startDate, dateEnd: endDate });

      expect(res.status).toBe(200);
      // Check that the dates were formatted correctly
      expect(new Date(res.body.data.dateStart).toISOString()).toBe(formatDateTimeZone(startDate).toISOString());
      expect(new Date(res.body.data.dateEnd).toISOString()).toBe(setToEndOfDay(endDate).toISOString());
    });

    it("should accept FULLY_ARCHIVED status", async () => {
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${cohort._id}/general`)
        .send({ ...updatedData, status: COHORT_STATUS.FULLY_ARCHIVED, dateStart: now, dateEnd: tomorrow });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(COHORT_STATUS.FULLY_ARCHIVED);
    });
  });

  describe("PUT /:id/inscriptions", () => {
    const updatedData = {
      inscriptionStartDate: new Date(),
      inscriptionEndDate: new Date(),
      reInscriptionStartDate: null,
      reInscriptionEndDate: null,
      inscriptionModificationEndDate: new Date(),
      instructionEndDate: new Date(),
      objectifLevel: INSCRIPTION_GOAL_LEVELS.REGIONAL,
      youngHTSBasculeLPDisabled: true,
      inscriptionOpenForReferentClasse: true,
      inscriptionOpenForReferentRegion: false,
      inscriptionOpenForReferentDepartment: true,
      inscriptionOpenForAdministrateurCle: false,
    };

    it("should return 400 if cohort id is invalid", async () => {
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put("/cohort/invalidId/inscriptions")
        .send(updatedData);
      expect(res.status).toBe(400);
    });

    it("should return 400 if request body is invalid", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture());
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${cohort._id}/inscriptions`)
        .send({
          inscriptionStartDate: "not-a-date",
          instructionEndDate: 123,
        });
      expect(res.status).toBe(400);
    });

    it("should return 403 if user is not an admin", async () => {
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);
      const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
        .put(`/cohort/${cohort._id}/inscriptions`)
        .send(updatedData);
      expect(res.status).toBe(403);
    });

    it("should return 403 if user is not a super admin", async () => {
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);

      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "NONgod" }))
        .put(`/cohort/${cohort._id}/inscriptions`)
        .send(updatedData);
      expect(res.status).toBe(403);
    });

    it("should return 404 if cohort is not found", async () => {
      const nonExistentId = new ObjectId();
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${nonExistentId}/inscriptions`)
        .send(updatedData);
      expect(res.status).toBe(404);
    });

    it("should return 200 when cohort inscription info is updated successfully", async () => {
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date(now);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      const inscriptionData = {
        ...updatedData,
        inscriptionStartDate: now,
        inscriptionEndDate: tomorrow,
        inscriptionModificationEndDate: tomorrow,
        instructionEndDate: dayAfterTomorrow,
      };

      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${cohort._id}/inscriptions`)
        .send(inscriptionData);

      expect(res.status).toBe(200);
      expect(new Date(res.body.data.inscriptionStartDate).toISOString()).toBe(now.toISOString());
      expect(new Date(res.body.data.inscriptionEndDate).toISOString()).toBe(tomorrow.toISOString());
      expect(new Date(res.body.data.instructionEndDate).toISOString()).toBe(dayAfterTomorrow.toISOString());
      expect(res.body.data.objectifLevel).toBe(INSCRIPTION_GOAL_LEVELS.REGIONAL);
      expect(res.body.data.youngHTSBasculeLPDisabled).toBe(true);
      expect(res.body.data.inscriptionOpenForReferentClasse).toBe(true);
      expect(res.body.data.inscriptionOpenForReferentRegion).toBe(false);
      expect(res.body.data.inscriptionOpenForReferentDepartment).toBe(true);
      expect(res.body.data.inscriptionOpenForAdministrateurCle).toBe(false);
    });

    it("should OPEN classes status for CLE cohort when inscription dates change", async () => {
      const cohortFixture = getNewCohortFixture({ type: COHORT_TYPE.CLE });
      const cohort = await createCohortHelper(cohortFixture);

      const classe1 = createFixtureClasse({ cohort: cohort.name, cohortId: cohort._id, status: STATUS_CLASSE.CLOSED });
      const classe2 = createFixtureClasse({ cohort: cohort.name, cohortId: cohort._id, status: STATUS_CLASSE.ASSIGNED });
      const classe1Id = (await createClasse(classe1))._id;
      const classe2Id = (await createClasse(classe2))._id;

      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${cohort._id}/inscriptions`)
        .send({
          ...updatedData,
          inscriptionStartDate: now,
          inscriptionEndDate: tomorrow,
        });

      expect(res.status).toBe(200);
      const updatedClasse1 = await ClasseModel.findById(classe1Id);
      const updatedClasse2 = await ClasseModel.findById(classe2Id);
      expect(updatedClasse1?.status).toBe(STATUS_CLASSE.OPEN);
      expect(updatedClasse2?.status).toBe(STATUS_CLASSE.OPEN);
    });

    it("should CLOSE classes status for CLE cohort when inscription dates change", async () => {
      const cohortFixture = getNewCohortFixture({ type: COHORT_TYPE.CLE });
      const cohort = await createCohortHelper(cohortFixture);

      const classe1 = createFixtureClasse({ cohort: cohort.name, cohortId: cohort._id, status: STATUS_CLASSE.OPEN });
      const classe2 = createFixtureClasse({ cohort: cohort.name, cohortId: cohort._id, status: STATUS_CLASSE.OPEN });
      const classe1Id = (await createClasse(classe1))._id;
      const classe2Id = (await createClasse(classe2))._id;

      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${cohort._id}/inscriptions`)
        .send({
          ...updatedData,
          inscriptionStartDate: yesterday,
          inscriptionEndDate: now,
        });

      expect(res.status).toBe(200);
      const updatedClasse1 = await ClasseModel.findById(classe1Id);
      const updatedClasse2 = await ClasseModel.findById(classe2Id);
      expect(updatedClasse1?.status).toBe(STATUS_CLASSE.CLOSED);
      expect(updatedClasse2?.status).toBe(STATUS_CLASSE.CLOSED);
    });
  });

  describe("PUT /:id/preparation", () => {
    const updatedData = {
      sessionEditionOpenForReferentRegion: true,
      sessionEditionOpenForReferentDepartment: false,
      sessionEditionOpenForTransporter: true,
      repartitionSchemaCreateAndEditGroupAvailability: true,
      pdrEditionOpenForReferentRegion: false,
      pdrEditionOpenForReferentDepartment: true,
      pdrEditionOpenForTransporter: false,
      schemaAccessForReferentRegion: true,
      schemaAccessForReferentDepartment: false,
      repartitionSchemaDownloadAvailability: true,
      busEditionOpenForTransporter: false,
      isTransportPlanCorrectionRequestOpen: true,
      uselessInformation: {
        repartitionSchemaCreateAndEditGroupAvailabilityFrom: "2025-05-01",
        repartitionSchemaCreateAndEditGroupAvailabilityTo: "2025-05-30",
        repartitionSchemaDownloadAvailabilityFrom: "2025-06-01",
        repartitionSchemaDownloadAvailabilityTo: "2025-06-30",
        isTransportPlanCorrectionRequestOpenFrom: "2025-07-01",
        isTransportPlanCorrectionRequestOpenTo: "2025-07-15",
      },
      informationsConvoyage: {
        editionOpenForReferentRegion: true,
        editionOpenForReferentDepartment: false,
        editionOpenForHeadOfCenter: true,
      },
    };

    it("should return 400 if cohort id is invalid", async () => {
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put("/cohort/invalidId/preparation")
        .send(updatedData);
      expect(res.status).toBe(400);
    });

    it("should return 400 if request body is invalid", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture());
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${cohort._id}/preparation`)
        .send({
          sessionEditionOpenForReferentRegion: "not-a-boolean",
          informationsConvoyage: "not-an-object",
        });
      expect(res.status).toBe(400);
    });

    it("should return 403 if user is not an admin", async () => {
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);
      const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
        .put(`/cohort/${cohort._id}/preparation`)
        .send(updatedData);
      expect(res.status).toBe(403);
    });

    it("should return 403 if user is not a super admin", async () => {
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);

      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "NONgod" }))
        .put(`/cohort/${cohort._id}/preparation`)
        .send(updatedData);
      expect(res.status).toBe(403);
    });

    it("should return 404 if cohort is not found", async () => {
      const nonExistentId = new ObjectId();
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${nonExistentId}/preparation`)
        .send(updatedData);
      expect(res.status).toBe(404);
    });

    it("should return 200 when cohort preparation info is updated successfully", async () => {
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);

      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${cohort._id}/preparation`)
        .send(updatedData);

      expect(res.status).toBe(200);
      expect(res.body.data.sessionEditionOpenForReferentRegion).toBe(updatedData.sessionEditionOpenForReferentRegion);
      expect(res.body.data.sessionEditionOpenForReferentDepartment).toBe(updatedData.sessionEditionOpenForReferentDepartment);
      expect(res.body.data.sessionEditionOpenForTransporter).toBe(updatedData.sessionEditionOpenForTransporter);
      expect(res.body.data.repartitionSchemaCreateAndEditGroupAvailability).toBe(updatedData.repartitionSchemaCreateAndEditGroupAvailability);
      expect(res.body.data.pdrEditionOpenForReferentRegion).toBe(updatedData.pdrEditionOpenForReferentRegion);
      expect(res.body.data.pdrEditionOpenForReferentDepartment).toBe(updatedData.pdrEditionOpenForReferentDepartment);
      expect(res.body.data.pdrEditionOpenForTransporter).toBe(updatedData.pdrEditionOpenForTransporter);
      expect(res.body.data.schemaAccessForReferentRegion).toBe(updatedData.schemaAccessForReferentRegion);
      expect(res.body.data.schemaAccessForReferentDepartment).toBe(updatedData.schemaAccessForReferentDepartment);
      expect(res.body.data.repartitionSchemaDownloadAvailability).toBe(updatedData.repartitionSchemaDownloadAvailability);
      expect(res.body.data.busEditionOpenForTransporter).toBe(updatedData.busEditionOpenForTransporter);
      expect(res.body.data.isTransportPlanCorrectionRequestOpen).toBe(updatedData.isTransportPlanCorrectionRequestOpen);

      expect(res.body.data.uselessInformation.repartitionSchemaCreateAndEditGroupAvailabilityFrom).toBe(
        updatedData.uselessInformation.repartitionSchemaCreateAndEditGroupAvailabilityFrom,
      );
      expect(res.body.data.uselessInformation.repartitionSchemaCreateAndEditGroupAvailabilityTo).toBe(
        updatedData.uselessInformation.repartitionSchemaCreateAndEditGroupAvailabilityTo,
      );
      expect(res.body.data.uselessInformation.repartitionSchemaDownloadAvailabilityFrom).toBe(updatedData.uselessInformation.repartitionSchemaDownloadAvailabilityFrom);
      expect(res.body.data.uselessInformation.repartitionSchemaDownloadAvailabilityTo).toBe(updatedData.uselessInformation.repartitionSchemaDownloadAvailabilityTo);
      expect(res.body.data.uselessInformation.isTransportPlanCorrectionRequestOpenFrom).toBe(updatedData.uselessInformation.isTransportPlanCorrectionRequestOpenFrom);
      expect(res.body.data.uselessInformation.isTransportPlanCorrectionRequestOpenTo).toBe(updatedData.uselessInformation.isTransportPlanCorrectionRequestOpenTo);

      expect(res.body.data.informationsConvoyage.editionOpenForReferentRegion).toBe(updatedData.informationsConvoyage.editionOpenForReferentRegion);
      expect(res.body.data.informationsConvoyage.editionOpenForReferentDepartment).toBe(updatedData.informationsConvoyage.editionOpenForReferentDepartment);
      expect(res.body.data.informationsConvoyage.editionOpenForHeadOfCenter).toBe(updatedData.informationsConvoyage.editionOpenForHeadOfCenter);
    });
  });

  describe("PUT /:id/affectation", () => {
    const updatedData = {
      isAssignmentAnnouncementsOpenForYoung: true,
      manualAffectionOpenForAdmin: true,
      manualAffectionOpenForReferentRegion: false,
      manualAffectionOpenForReferentDepartment: true,
      pdrChoiceLimitDate: new Date("2025-06-15T12:30:00Z"),
      busListAvailability: true,
      youngCheckinForHeadOfCenter: false,
      youngCheckinForAdmin: true,
      youngCheckinForRegionReferent: false,
      youngCheckinForDepartmentReferent: true,
      daysToValidate: 7,
      uselessInformation: {
        isAssignmentAnnouncementsOpenForYoungFrom: "2025-05-01",
        isAssignmentAnnouncementsOpenForYoungTo: "2025-05-30",
        manualAffectionOpenForAdminFrom: "2025-05-01",
        manualAffectionOpenForAdminTo: "2025-05-30",
        manualAffectionOpenForReferentRegionFrom: "2025-05-01",
        manualAffectionOpenForReferentRegionTo: "2025-05-30",
        manualAffectionOpenForReferentDepartmentFrom: "2025-05-01",
        manualAffectionOpenForReferentDepartmentTo: "2025-05-30",
        busListAvailabilityFrom: "2025-06-01",
        busListAvailabilityTo: "2025-06-30",
        youngCheckinForHeadOfCenterFrom: "2025-06-01",
        youngCheckinForHeadOfCenterTo: "2025-06-30",
        youngCheckinForAdminFrom: "2025-06-01",
        youngCheckinForAdminTo: "2025-06-30",
        youngCheckinForRegionReferentFrom: "2025-06-01",
        youngCheckinForRegionReferentTo: "2025-06-30",
        youngCheckinForDepartmentReferentFrom: "2025-06-01",
        youngCheckinForDepartmentReferentTo: "2025-06-30",
      },
    };

    it("should return 400 if cohort id is invalid", async () => {
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put("/cohort/invalidId/affectation")
        .send(updatedData);
      expect(res.status).toBe(400);
    });

    it("should return 400 if request body is invalid", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture());
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${cohort._id}/affectation`)
        .send({
          isAssignmentAnnouncementsOpenForYoung: "not-a-boolean",
          daysToValidate: "not-a-number",
        });
      expect(res.status).toBe(400);
    });

    it("should return 403 if user is not an admin", async () => {
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);
      const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
        .put(`/cohort/${cohort._id}/affectation`)
        .send(updatedData);
      expect(res.status).toBe(403);
    });

    it("should return 403 if user is not a super admin", async () => {
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);

      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "NONgod" }))
        .put(`/cohort/${cohort._id}/affectation`)
        .send(updatedData);
      expect(res.status).toBe(403);
    });

    it("should return 404 if cohort is not found", async () => {
      const nonExistentId = new ObjectId();
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${nonExistentId}/affectation`)
        .send(updatedData);
      expect(res.status).toBe(404);
    });

    it("should return 200 when cohort affectation info is updated successfully", async () => {
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);

      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${cohort._id}/affectation`)
        .send(updatedData);

      expect(res.status).toBe(200);
      expect(res.body.data.isAssignmentAnnouncementsOpenForYoung).toBe(updatedData.isAssignmentAnnouncementsOpenForYoung);
      expect(res.body.data.manualAffectionOpenForAdmin).toBe(updatedData.manualAffectionOpenForAdmin);
      expect(res.body.data.manualAffectionOpenForReferentRegion).toBe(updatedData.manualAffectionOpenForReferentRegion);
      expect(res.body.data.manualAffectionOpenForReferentDepartment).toBe(updatedData.manualAffectionOpenForReferentDepartment);
      expect(res.body.data.busListAvailability).toBe(updatedData.busListAvailability);
      expect(res.body.data.youngCheckinForHeadOfCenter).toBe(updatedData.youngCheckinForHeadOfCenter);
      expect(res.body.data.youngCheckinForAdmin).toBe(updatedData.youngCheckinForAdmin);
      expect(res.body.data.youngCheckinForRegionReferent).toBe(updatedData.youngCheckinForRegionReferent);
      expect(res.body.data.youngCheckinForDepartmentReferent).toBe(updatedData.youngCheckinForDepartmentReferent);
      expect(res.body.data.daysToValidate).toBe(updatedData.daysToValidate);

      Object.keys(updatedData.uselessInformation).forEach((key) => {
        expect(res.body.data.uselessInformation[key]).toBe(updatedData.uselessInformation[key]);
      });
    });

    it("should format pdrChoiceLimitDate correctly to end of day (23:59:59)", async () => {
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);

      const limitDate = new Date("2025-06-15T12:30:00Z");
      const expectedEndOfDay = new Date(limitDate);
      expectedEndOfDay.setHours(23, 59, 59, 999);

      const data = {
        ...updatedData,
        pdrChoiceLimitDate: limitDate,
      };

      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${cohort._id}/affectation`)
        .send(data);

      expect(res.status).toBe(200);

      const returnedDate = new Date(res.body.data.pdrChoiceLimitDate);
      expect(returnedDate.getHours()).toBe(23);
      expect(returnedDate.getMinutes()).toBe(59);
      expect(returnedDate.getSeconds()).toBe(59);
      expect(returnedDate.toISOString()).toBe(formatDateTimeZone(expectedEndOfDay).toISOString());
    });
  });

  describe("PUT /:id/cleSetting", () => {
    const toFromDateMock = {
      from: new Date("2025-05-01"),
      to: new Date("2025-05-31"),
    };

    const updatedData = {
      cleUpdateCohortForReferentRegion: true,
      cleUpdateCohortForReferentRegionDate: toFromDateMock,
      cleUpdateCohortForReferentDepartment: false,
      cleUpdateCohortForReferentDepartmentDate: toFromDateMock,
      cleDisplayCohortsForAdminCLE: true,
      cleDisplayCohortsForAdminCLEDate: toFromDateMock,
      cleDisplayCohortsForReferentClasse: false,
      cleDisplayCohortsForReferentClasseDate: toFromDateMock,
      cleUpdateCentersForReferentRegion: true,
      cleUpdateCentersForReferentRegionDate: toFromDateMock,
      cleUpdateCentersForReferentDepartment: false,
      cleUpdateCentersForReferentDepartmentDate: toFromDateMock,
      cleDisplayCentersForAdminCLE: true,
      cleDisplayCentersForAdminCLEDate: toFromDateMock,
      cleDisplayCentersForReferentClasse: false,
      cleDisplayCentersForReferentClasseDate: toFromDateMock,
      cleDisplayPDRForAdminCLE: true,
      cleDisplayPDRForAdminCLEDate: toFromDateMock,
      cleDisplayPDRForReferentClasse: false,
      cleDisplayPDRForReferentClasseDate: toFromDateMock,
    };

    it("should return 400 if cohort id is invalid", async () => {
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put("/cohort/invalidId/cleSetting")
        .send(updatedData);
      expect(res.status).toBe(400);
    });

    it("should return 400 if request body is invalid", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture());
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${cohort._id}/cleSetting`)
        .send({
          cleUpdateCohortForReferentRegion: "not-a-boolean",
          cleUpdateCohortForReferentRegionDate: {
            from: "not-a-date",
            to: 123,
          },
        });
      expect(res.status).toBe(400);
    });

    it("should return 403 if user is not an admin", async () => {
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);
      const res = await request(getAppHelper({ role: ROLES.RESPONSIBLE }))
        .put(`/cohort/${cohort._id}/cleSetting`)
        .send(updatedData);
      expect(res.status).toBe(403);
    });

    it("should return 403 if user is not a super admin", async () => {
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);

      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "NONgod" }))
        .put(`/cohort/${cohort._id}/cleSetting`)
        .send(updatedData);
      expect(res.status).toBe(403);
    });

    it("should return 404 if cohort is not found", async () => {
      const nonExistentId = new ObjectId();
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${nonExistentId}/cleSetting`)
        .send(updatedData);
      expect(res.status).toBe(404);
    });

    it("should return 200 when cohort CLE settings are updated successfully", async () => {
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);

      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put(`/cohort/${cohort._id}/cleSetting`)
        .send(updatedData);

      expect(res.status).toBe(200);

      expect(res.body.data.cleUpdateCohortForReferentRegion).toBe(updatedData.cleUpdateCohortForReferentRegion);
      expect(res.body.data.cleUpdateCohortForReferentDepartment).toBe(updatedData.cleUpdateCohortForReferentDepartment);
      expect(res.body.data.cleDisplayCohortsForAdminCLE).toBe(updatedData.cleDisplayCohortsForAdminCLE);
      expect(res.body.data.cleDisplayCohortsForReferentClasse).toBe(updatedData.cleDisplayCohortsForReferentClasse);
      expect(res.body.data.cleUpdateCentersForReferentRegion).toBe(updatedData.cleUpdateCentersForReferentRegion);
      expect(res.body.data.cleUpdateCentersForReferentDepartment).toBe(updatedData.cleUpdateCentersForReferentDepartment);
      expect(res.body.data.cleDisplayCentersForAdminCLE).toBe(updatedData.cleDisplayCentersForAdminCLE);
      expect(res.body.data.cleDisplayCentersForReferentClasse).toBe(updatedData.cleDisplayCentersForReferentClasse);
      expect(res.body.data.cleDisplayPDRForAdminCLE).toBe(updatedData.cleDisplayPDRForAdminCLE);
      expect(res.body.data.cleDisplayPDRForReferentClasse).toBe(updatedData.cleDisplayPDRForReferentClasse);

      expect(new Date(res.body.data.cleUpdateCohortForReferentRegionDate.from).toISOString()).toBe(toFromDateMock.from.toISOString());
      expect(new Date(res.body.data.cleUpdateCohortForReferentRegionDate.to).toISOString()).toBe(toFromDateMock.to.toISOString());
      expect(new Date(res.body.data.cleDisplayCohortsForAdminCLEDate.from).toISOString()).toBe(toFromDateMock.from.toISOString());
      expect(new Date(res.body.data.cleDisplayCohortsForAdminCLEDate.to).toISOString()).toBe(toFromDateMock.to.toISOString());
    });
  });

  describe("PUT /:id/eligibility", () => {
    it("should return 400 if cohort ID is invalid", async () => {
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
        .put("/cohort/invalid_id/eligibility")
        .send({
          zones: ["zone1"],
          schoolLevels: ["level1"],
          bornAfter: "2000-01-01",
          bornBefore: "2010-01-01",
        });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe(ERRORS.INVALID_PARAMS);
    });

    it("should return 400 if request body is invalid", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture());
      const res = await request(getAppHelper())
        .put(`/cohort/${encodeURIComponent(cohort._id)}/eligibility`)
        .send({ zones: "invalid_zone" });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe(ERRORS.INVALID_BODY);
    });

    it("should return 403 if user is not a super admin", async () => {
      const cohortFixture = getNewCohortFixture();
      const cohort = await createCohortHelper(cohortFixture);

      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "nonGOD" }))
        .put(`/cohort/${encodeURIComponent(cohort._id)}/eligibility`)
        .send({
          zones: ["zone1"],
          schoolLevels: ["level1"],
          bornAfter: "2000-01-01",
          bornBefore: "2010-01-01",
        });
      expect(res.status).toBe(403);
      expect(res.body.code).toBe(ERRORS.OPERATION_NOT_ALLOWED);
    });

    it("should return 404 if cohort is not found", async () => {
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: SUB_ROLE_GOD }))
        .put("/cohort/507f1f77bcf86cd799439011/eligibility")
        .send({
          zones: ["zone1"],
          schoolLevels: ["level1"],
          bornAfter: "2000-01-01",
          bornBefore: "2010-01-01",
        });
      expect(res.status).toBe(404);
      expect(res.body.code).toBe(ERRORS.NOT_FOUND);
    });

    it("should return 200 when cohort is updated successfully", async () => {
      const cohort = await createCohortHelper(getNewCohortFixture());
      const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: SUB_ROLE_GOD }))
        .put(`/cohort/${encodeURIComponent(cohort._id)}/eligibility`)
        .send({
          zones: ["Sarthe"],
          schoolLevels: ["3eme"],
          bornAfter: "2000-01-01",
          bornBefore: "2010-01-01",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.eligibility.zones).toEqual(["Sarthe"]);
      expect(res.body.data.eligibility.schoolLevels).toEqual(["3eme"]);
      expect(new Date(res.body.data.eligibility.bornAfter)).toEqual(new Date("2000-01-01"));
      expect(new Date(res.body.data.eligibility.bornBefore)).toEqual(new Date("2010-01-01"));
    });
  });
});
