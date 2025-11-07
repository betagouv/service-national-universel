import { ROLES } from "snu-lib";
import { YoungBuilder } from "./builders/YoungBuilder";
import { CohortBuilder } from "./builders/CohortBuilder";
import { createApplication } from "../helpers/application";
import { createMissionHelper } from "../helpers/mission";
import { createReferentHelper } from "../helpers/referent";
import getNewMissionFixture from "./mission";
import { getNewApplicationFixture } from "./application";
import { APPLICATION_PRESETS } from "./presets";

interface ScenarioContext {
  cohort: any;
  young: any;
  referent?: any;
  admin?: any;
  applications?: any[];
  missions?: any[];
}

/**
 * Scénarios métier réutilisables pour les tests
 */
export class TestScenarios {
  /**
   * Jeune éligible dans une cohorte archivée SANS mission DONE
   */
  static async youngInArchivedCohortWithoutMissionDone(): Promise<ScenarioContext> {
    const cohort = await new CohortBuilder().partiallyArchived().build();

    const young = await new YoungBuilder()
      .eligible()
      .inCohort(cohort._id.toString(), cohort.name)
      .build();

    return { cohort, young };
  }

  /**
   * Jeune éligible dans une cohorte archivée AVEC mission DONE
   */
  static async youngInArchivedCohortWithMissionDone(): Promise<ScenarioContext> {
    const cohort = await new CohortBuilder().partiallyArchived().build();

    const young = await new YoungBuilder()
      .eligible()
      .inCohort(cohort._id.toString(), cohort.name)
      .build();

    const mission = await createMissionHelper(getNewMissionFixture());

    const application = await createApplication({
      ...getNewApplicationFixture(),
      ...APPLICATION_PRESETS.done,
      youngId: young._id,
      missionId: mission._id,
    });

    return { cohort, young, missions: [mission], applications: [application] };
  }

  /**
   * Jeune dans une cohorte totalement archivée
   */
  static async youngInFullyArchivedCohort(): Promise<ScenarioContext> {
    const cohort = await new CohortBuilder().fullyArchived().build();

    const young = await new YoungBuilder()
      .eligible()
      .inCohort(cohort._id.toString(), cohort.name)
      .build();

    return { cohort, young };
  }

  /**
   * Jeune dans une cohorte publiée
   */
  static async youngInPublishedCohort(): Promise<ScenarioContext> {
    const cohort = await new CohortBuilder().published().build();

    const young = await new YoungBuilder()
      .eligible()
      .inCohort(cohort._id.toString(), cohort.name)
      .build();

    return { cohort, young };
  }

  /**
   * Référent départemental avec un jeune
   */
  static async referentWithYoung(cohortBuilder: CohortBuilder): Promise<ScenarioContext> {
    const cohort = await cohortBuilder.build();

    const young = await new YoungBuilder()
      .eligible()
      .inCohort(cohort._id.toString(), cohort.name)
      .withDepartment("Paris")
      .build();

    const referent = await createReferentHelper({
      role: ROLES.REFERENT_DEPARTMENT,
      department: young.department,
      email: `referent-${Date.now()}@test.com`,
    });

    return { cohort, young, referent };
  }

  /**
   * Référent régional avec un jeune
   */
  static async referentRegionWithYoung(cohortBuilder: CohortBuilder): Promise<ScenarioContext> {
    const cohort = await cohortBuilder.build();

    const young = await new YoungBuilder()
      .eligible()
      .inCohort(cohort._id.toString(), cohort.name)
      .withRegion("Île-de-France")
      .build();

    const referent = await createReferentHelper({
      role: ROLES.REFERENT_REGION,
      region: young.region,
      email: `referent-region-${Date.now()}@test.com`,
    });

    return { cohort, young, referent };
  }

  /**
   * Admin avec un jeune
   */
  static async adminWithYoung(cohortBuilder: CohortBuilder): Promise<ScenarioContext> {
    const cohort = await cohortBuilder.build();

    const young = await new YoungBuilder()
      .eligible()
      .inCohort(cohort._id.toString(), cohort.name)
      .build();

    const admin = await createReferentHelper({
      role: ROLES.ADMIN,
      email: `admin-${Date.now()}@test.com`,
    });

    return { cohort, young, admin };
  }

  /**
   * Jeune avec plusieurs missions DONE
   */
  static async youngWithMultipleMissionsDone(count: number = 2): Promise<ScenarioContext> {
    const cohort = await new CohortBuilder().partiallyArchived().build();

    const young = await new YoungBuilder()
      .eligible()
      .inCohort(cohort._id.toString(), cohort.name)
      .build();

    const applications: any[] = [];
    const missions: any[] = [];

    for (let i = 0; i < count; i++) {
      const mission = await createMissionHelper(getNewMissionFixture());
      missions.push(mission);

      const app = await createApplication({
        ...getNewApplicationFixture(),
        ...APPLICATION_PRESETS.done,
        youngId: young._id,
        missionId: mission._id,
      });
      applications.push(app);
    }

    return { cohort, young, missions, applications };
  }

  /**
   * Jeune non éligible (phase 1 non validée)
   */
  static async youngNotEligibleForPhase2(): Promise<ScenarioContext> {
    const cohort = await new CohortBuilder().published().build();

    const young = await new YoungBuilder()
      .notEligible()
      .inCohort(cohort._id.toString(), cohort.name)
      .build();

    return { cohort, young };
  }

  /**
   * Jeune avec phase 2 déjà validée
   */
  static async youngWithPhase2Validated(): Promise<ScenarioContext> {
    const cohort = await new CohortBuilder().published().build();

    const young = await new YoungBuilder()
      .phase2Validated()
      .inCohort(cohort._id.toString(), cohort.name)
      .build();

    return { cohort, young };
  }
}

