import request from "supertest";
import { ROLES, COHORT_STATUS } from "snu-lib";
import getAppHelper from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { createFixtureMissionEquivalence } from "./fixtures/equivalence";
import { MissionEquivalenceModel, YoungModel, ReferentModel, CohortModel } from "../models";
import { TestScenarios } from "./fixtures/scenarios";
import { CohortBuilder } from "./fixtures/builders/CohortBuilder";
import { createReferentHelper } from "./helpers/referent";

jest.mock("../application/applicationNotificationService", () => ({
  notifyReferentsEquivalenceSubmitted: jest.fn(),
  notifyYoungEquivalenceSubmitted: jest.fn(),
  notifyYoungChangementStatutEquivalence: jest.fn(),
}));

beforeAll(() => dbConnect(__filename.slice(__dirname.length + 1, -3)));
afterAll(dbClose);
beforeEach(async () => {
  await MissionEquivalenceModel.deleteMany({});
  await YoungModel.deleteMany({});
  await ReferentModel.deleteMany({});
  await CohortModel.deleteMany({});
  jest.clearAllMocks();
});

/**
 * Matrice de tests exhaustive pour les équivalences MIG
 * Teste toutes les combinaisons de rôles, statuts de cohorte et présence de missions DONE
 */
describe("Equivalence Matrix Tests", () => {
  /**
   * Matrice de tests :
   * [Description, Role, Cohort Status, Has Mission Done, Expected HTTP Status, Expected Message]
   */
  const testMatrix: Array<[string, string, string, boolean, number, string?]> = [
    // ADMIN - Peut tout faire
    ["Admin avec cohorte publiée", ROLES.ADMIN, COHORT_STATUS.PUBLISHED, false, 200],
    ["Admin avec cohorte archivée partiellement", ROLES.ADMIN, COHORT_STATUS.ARCHIVED, false, 200],
    ["Admin avec cohorte totalement archivée", ROLES.ADMIN, COHORT_STATUS.FULLY_ARCHIVED, false, 200],
    
    // REFERENT_DEPARTMENT - Restrictions sur cohortes archivées
    ["Référent avec cohorte publiée", ROLES.REFERENT_DEPARTMENT, COHORT_STATUS.PUBLISHED, false, 200],
    ["Référent avec cohorte archivée sans mission done", ROLES.REFERENT_DEPARTMENT, COHORT_STATUS.ARCHIVED, false, 200, "Les référents peuvent créer des équivalences pour les cohortes partiellement archivées"],
    ["Référent avec cohorte archivée avec mission done", ROLES.REFERENT_DEPARTMENT, COHORT_STATUS.ARCHIVED, true, 200],
    ["Référent avec cohorte totalement archivée sans mission", ROLES.REFERENT_DEPARTMENT, COHORT_STATUS.FULLY_ARCHIVED, false, 403],
    ["Référent avec cohorte totalement archivée avec mission", ROLES.REFERENT_DEPARTMENT, COHORT_STATUS.FULLY_ARCHIVED, true, 403, "Les référents ne peuvent pas créer d'équivalence pour une cohorte totalement archivée"],
    
    // REFERENT_REGION - Mêmes règles que REFERENT_DEPARTMENT
    ["Référent régional avec cohorte publiée", ROLES.REFERENT_REGION, COHORT_STATUS.PUBLISHED, false, 200],
    ["Référent régional avec cohorte archivée sans mission", ROLES.REFERENT_REGION, COHORT_STATUS.ARCHIVED, false, 200, "Les référents peuvent créer des équivalences pour les cohortes partiellement archivées"],
    ["Référent régional avec cohorte archivée avec mission", ROLES.REFERENT_REGION, COHORT_STATUS.ARCHIVED, true, 200],
    ["Référent régional avec cohorte totalement archivée", ROLES.REFERENT_REGION, COHORT_STATUS.FULLY_ARCHIVED, false, 403],
  ];

  describe.each(testMatrix)(
    "%s",
    (description, role, cohortStatus, hasMissionDone, expectedStatus, expectedMessage) => {
      it(`should return ${expectedStatus}`, async () => {
        let context;
        
        // Setup en fonction de la configuration
        if (cohortStatus === COHORT_STATUS.PUBLISHED) {
          if (role === ROLES.ADMIN) {
            context = await TestScenarios.adminWithYoung(new CohortBuilder().published());
          } else if (role === ROLES.REFERENT_DEPARTMENT) {
            context = await TestScenarios.referentWithYoung(new CohortBuilder().published());
          } else if (role === ROLES.REFERENT_REGION) {
            context = await TestScenarios.referentRegionWithYoung(new CohortBuilder().published());
          }
        } else if (cohortStatus === COHORT_STATUS.ARCHIVED) {
          if (hasMissionDone) {
            context = await TestScenarios.youngInArchivedCohortWithMissionDone();
          } else {
            context = await TestScenarios.youngInArchivedCohortWithoutMissionDone();
          }
          
          // Créer l'utilisateur approprié
          if (role === ROLES.ADMIN) {
            context.admin = await createReferentHelper({
              role: ROLES.ADMIN,
              email: `admin-${Date.now()}@test.com`,
            });
          } else if (role === ROLES.REFERENT_DEPARTMENT) {
            context.referent = await createReferentHelper({
              role: ROLES.REFERENT_DEPARTMENT,
              department: context.young.department,
              email: `referent-dept-${Date.now()}@test.com`,
            });
          } else if (role === ROLES.REFERENT_REGION) {
            context.referent = await createReferentHelper({
              role: ROLES.REFERENT_REGION,
              region: context.young.region,
              email: `referent-region-${Date.now()}@test.com`,
            });
          }
        } else if (cohortStatus === COHORT_STATUS.FULLY_ARCHIVED) {
          context = await TestScenarios.youngInFullyArchivedCohort();
          
          if (role === ROLES.ADMIN) {
            context.admin = await createReferentHelper({
              role: ROLES.ADMIN,
              email: `admin-${Date.now()}@test.com`,
            });
          } else if (role === ROLES.REFERENT_DEPARTMENT) {
            context.referent = await createReferentHelper({
              role: ROLES.REFERENT_DEPARTMENT,
              department: context.young.department,
              email: `referent-dept-${Date.now()}@test.com`,
            });
          } else if (role === ROLES.REFERENT_REGION) {
            context.referent = await createReferentHelper({
              role: ROLES.REFERENT_REGION,
              region: context.young.region,
              email: `referent-region-${Date.now()}@test.com`,
            });
          }
        }

        const user = context.admin || context.referent;
        const body = createFixtureMissionEquivalence({ youngId: context.young._id.toString() });

        const res = await request(getAppHelper(user))
          .post(`/young/${context.young._id}/phase2/equivalence`)
          .send(body);

        expect(res.status).toEqual(expectedStatus);

        if (expectedStatus === 200) {
          expect(res.body.ok).toBe(true);
          expect(res.body.data.status).toEqual("VALIDATED");
        } else {
          expect(res.body.ok).toBe(false);
        }
      });
    }
  );

  describe("Edge cases", () => {
    it("should return 403 when admin tries to create equivalence for young who has not completed phase 1", async () => {
      const context = await TestScenarios.youngNotEligibleForPhase2();
      const admin = await createReferentHelper({
        role: ROLES.ADMIN,
        email: `admin-${Date.now()}@test.com`,
      });

      const body = createFixtureMissionEquivalence({ youngId: context.young._id.toString() });

      const res = await request(getAppHelper(admin))
        .post(`/young/${context.young._id}/phase2/equivalence`)
        .send(body);

      expect(res.status).toEqual(403);
      expect(res.body.ok).toBe(false);
    });

    it("should return 200 when admin creates equivalence for young with phase 2 validated", async () => {
      const context = await TestScenarios.youngWithPhase2Validated();
      const admin = await createReferentHelper({
        role: ROLES.ADMIN,
        email: `admin-${Date.now()}@test.com`,
      });

      const body = createFixtureMissionEquivalence({ youngId: context.young._id.toString() });

      const res = await request(getAppHelper(admin))
        .post(`/young/${context.young._id}/phase2/equivalence`)
        .send(body);

      expect(res.status).toEqual(200);
      expect(res.body.ok).toBe(true);
    });
  });
});

