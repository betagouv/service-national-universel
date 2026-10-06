/**
 * Décommissionnement P25a, routes de consultation hors Elasticsearch : les gardes de rôle
 * (canViewCohesionCenter, canViewMeetingPoints, canViewDepartmentService, canExportConvoyeur,
 * ligneBusCanViewDemandeDeModification, canSearchSessionPhase1, canViewClasse, canViewEtablissement,
 * canSearchStudent) refusent les rôles retirés ; admin et référents départementaux/régionaux
 * gardent leur accès sur les vraies routes.
 */
import request from "supertest";
import { Types } from "mongoose";
const { ObjectId } = Types;
import { DECOMMISSIONED_ROLES, PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLES } from "snu-lib";

import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { addPermissionHelper } from "./helpers/permissions";
import { createSessionPhase1 } from "./helpers/sessionPhase1";
import { getNewSessionPhase1Fixture } from "./fixtures/sessionPhase1";
import getNewCohortFixture from "./fixtures/cohort";
import { getNewCohesionCenterFixture } from "./fixtures/cohesionCenter";
import getNewLigneBusFixture from "./fixtures/PlanDeTransport/ligneBus";
import getNewLigneToPointFixture from "./fixtures/PlanDeTransport/ligneToPoint";
import getNewPointDeRassemblementFixture from "./fixtures/PlanDeTransport/pointDeRassemblement";
import getPlanDeTransportFixture from "./fixtures/PlanDeTransport/planDeTransport";
import getBusTeamFixture from "./fixtures/busTeam";
import getNewDepartmentServiceFixture from "./fixtures/departmentService";
import { createFixtureClasse } from "./fixtures/classe";
import { createFixtureEtablissement } from "./fixtures/etablissement";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";
import {
  ClasseModel,
  CohesionCenterModel,
  CohortModel,
  DepartmentServiceModel,
  EtablissementModel,
  LigneBusModel,
  LigneToPointModel,
  ModificationBusModel,
  PlanTransportModel,
  PointDeRassemblementModel,
  ReferentModel,
  YoungModel,
} from "../models";

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendTemplate: () => Promise.resolve(),
  sendEmail: () => Promise.resolve(),
  sync: () => Promise.resolve(),
  unsync: () => Promise.resolve(),
}));

jest.setTimeout(60000);

const DEP = "Yvelines";
const REGION = "Île-de-France";

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await addPermissionHelper([ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ...DECOMMISSIONED_ROLES], PERMISSION_RESOURCES.LIGNE_BUS, PERMISSION_ACTIONS.READ);
});
afterAll(dbClose);
afterEach(resetAppAuth);

const acteur = (role: string) => ({
  _id: new ObjectId().toString(),
  role,
  department: role === ROLES.REFERENT_REGION ? [] : [DEP],
  region: REGION,
  firstName: "Acteur",
  lastName: role,
});
const AUTORISES = [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT];
const get = async (role: string, url: string) => request(await getAppHelperWithAcl(acteur(role) as any)).get(url);

async function verdicts(url: string, roles: readonly string[]) {
  const observes: string[] = [];
  for (const role of roles) {
    const res = await get(role, url);
    observes.push(`${role}: ${res.status}`);
  }
  return observes;
}
const tous = (roles: readonly string[], status: number) => roles.map((role) => `${role}: ${status}`);

async function createLigne() {
  const cohort = await CohortModel.create({
    ...getNewCohortFixture(),
    name: `p25a-${new ObjectId()}`,
    pdrEditionOpenForReferentRegion: true,
    pdrEditionOpenForReferentDepartment: true,
    isTransportPlanCorrectionRequestOpen: true,
    informationsConvoyage: { editionOpenForReferentRegion: true, editionOpenForReferentDepartment: true },
  });
  const center = await CohesionCenterModel.create({ ...getNewCohesionCenterFixture(), department: DEP, region: REGION });
  const pdr = await PointDeRassemblementModel.create({ ...getNewPointDeRassemblementFixture(), cohorts: [cohort.name], department: DEP, region: REGION });
  const bus = await LigneBusModel.create(
    getNewLigneBusFixture({ cohort: cohort.name, centerId: center._id.toString(), meetingPointsIds: [pdr._id.toString()], team: [getBusTeamFixture({ mail: "convoyeur-p25a@example.com" })] as any }),
  );
  await LigneToPointModel.create({ ...getNewLigneToPointFixture(), lineId: bus._id.toString(), meetingPointId: pdr._id.toString(), meetingHour: "08:00" });
  await PlanTransportModel.create({
    ...getPlanDeTransportFixture({ cohort: cohort.name, centerId: center._id.toString() }),
    _id: bus._id,
    pointDeRassemblements: [{ ...pdr.toObject(), meetingPointId: pdr._id.toString(), transportType: "bus", meetingHour: "08:00", busArrivalHour: "08:30", departureHour: "09:00", returnHour: "18:00" }],
  } as any);
  return { cohort, center, pdr, bus };
}

describe("Décommissionnement P25a — routes de consultation hors Elasticsearch", () => {
  it("GET /session-phase1/:id/cohesion-center (canViewCohesionCenter)", async () => {
    const { cohort, center } = await createLigne();
    const session = await createSessionPhase1({ ...getNewSessionPhase1Fixture(), cohort: cohort.name, cohortId: cohort._id.toString(), cohesionCenterId: center._id.toString(), department: DEP, region: REGION });
    const url = `/session-phase1/${session._id}/cohesion-center`;
    expect(await verdicts(url, AUTORISES)).toEqual(tous(AUTORISES, 200));
    expect(await verdicts(url, DECOMMISSIONED_ROLES)).toEqual(tous(DECOMMISSIONED_ROLES, 403));
  });

  it("GET /point-de-rassemblement/:id et /:id/in-schema (canViewMeetingPoints)", async () => {
    const { pdr } = await createLigne();
    for (const url of [`/point-de-rassemblement/${pdr._id}`, `/point-de-rassemblement/${pdr._id}/in-schema`]) {
      expect([url, ...(await verdicts(url, AUTORISES))]).toEqual([url, ...tous(AUTORISES, 200)]);
      expect([url, ...(await verdicts(url, DECOMMISSIONED_ROLES))]).toEqual([url, ...tous(DECOMMISSIONED_ROLES, 403)]);
    }
  });

  it("GET /department-service et /department-service/:department (canViewDepartmentService)", async () => {
    await DepartmentServiceModel.deleteMany({});
    await DepartmentServiceModel.create({ ...getNewDepartmentServiceFixture(), department: DEP });
    const roles = [...AUTORISES, ROLES.RESPONSIBLE, ROLES.SUPERVISOR];
    for (const url of ["/department-service", `/department-service/${DEP}`]) {
      expect([url, ...(await verdicts(url, roles))]).toEqual([url, ...tous(roles, 200)]);
      expect([url, ...(await verdicts(url, DECOMMISSIONED_ROLES))]).toEqual([url, ...tous(DECOMMISSIONED_ROLES, 403)]);
    }
  });

  it("GET /demande-de-modification/ligne/:id (ligneBusCanViewDemandeDeModification)", async () => {
    const { bus } = await createLigne();
    await ModificationBusModel.create({
      lineId: bus._id.toString(),
      lineName: bus.busId,
      cohort: bus.cohort,
      requestMessage: "demande",
      requestUserId: "x",
      requestUserName: "x",
      requestUserRole: ROLES.ADMIN,
    });
    const url = `/demande-de-modification/ligne/${bus._id}`;
    expect(await verdicts(url, AUTORISES)).toEqual(tous(AUTORISES, 200));
    expect(await verdicts(url, DECOMMISSIONED_ROLES)).toEqual(tous(DECOMMISSIONED_ROLES, 403));
  });

  it("GET /ligne-de-bus/cohort/:cohort (canExportConvoyeur : admin seul)", async () => {
    const { cohort } = await createLigne();
    const url = `/ligne-de-bus/cohort/${cohort.name}`;
    expect(await verdicts(url, [ROLES.ADMIN])).toEqual(tous([ROLES.ADMIN], 200));
    const refuses = [ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ...DECOMMISSIONED_ROLES];
    expect(await verdicts(url, refuses)).toEqual(tous(refuses, 403));
  });

  it("GET /referent/:id/session-phase1 (canSearchSessionPhase1) reste lisible par admin et référents", async () => {
    const { cohort, center } = await createLigne();
    const cible = await ReferentModel.create(getNewReferentFixture({ role: ROLES.HEAD_CENTER }));
    await createSessionPhase1({
      ...getNewSessionPhase1Fixture(),
      cohort: cohort.name,
      cohortId: cohort._id.toString(),
      cohesionCenterId: center._id.toString(),
      headCenterId: cible._id.toString(),
      department: DEP,
      region: REGION,
    });
    const url = `/referent/${cible._id}/session-phase1`;
    for (const role of AUTORISES) {
      const res = await get(role, url);
      expect([role, res.status, res.body.data?.length]).toEqual([role, 200, 1]);
    }
    expect(await verdicts(url, DECOMMISSIONED_ROLES)).toEqual(tous(DECOMMISSIONED_ROLES, 403));
  });

  describe("consultation CLE (canViewClasse, canViewEtablissement, canSearchStudent)", () => {
    async function createEtablissementComplet() {
      await ClasseModel.deleteMany();
      await EtablissementModel.deleteMany();
      await YoungModel.deleteMany();
      const chef = await ReferentModel.create(getNewReferentFixture({ role: ROLES.ADMINISTRATEUR_CLE }));
      const referentClasse = await ReferentModel.create(getNewReferentFixture({ role: ROLES.REFERENT_CLASSE }));
      const etablissement = await EtablissementModel.create(createFixtureEtablissement({ referentEtablissementIds: [chef._id.toString()], department: DEP, region: REGION }));
      const classe = await ClasseModel.create(
        createFixtureClasse({ etablissementId: etablissement._id.toString(), referentClasseIds: [referentClasse._id.toString()], department: DEP, region: REGION }),
      );
      await YoungModel.create(getNewYoungFixture({ classeId: classe._id.toString() }));
      return { etablissement, classe };
    }

    it("GET /cle/classe/from-etablissement/:id", async () => {
      const { etablissement } = await createEtablissementComplet();
      const url = `/cle/classe/from-etablissement/${etablissement._id}`;
      expect(await verdicts(url, AUTORISES)).toEqual(tous(AUTORISES, 200));
      expect(await verdicts(url, DECOMMISSIONED_ROLES)).toEqual(tous(DECOMMISSIONED_ROLES, 403));
    });

    it("GET /cle/etablissement/:id", async () => {
      const { etablissement } = await createEtablissementComplet();
      const url = `/cle/etablissement/${etablissement._id}`;
      expect(await verdicts(url, AUTORISES)).toEqual(tous(AUTORISES, 200));
      expect(await verdicts(url, DECOMMISSIONED_ROLES)).toEqual(tous(DECOMMISSIONED_ROLES, 403));
    });

    it("GET /cle/etablissement/from-user refuse les rôles retirés", async () => {
      await createEtablissementComplet();
      expect(await verdicts("/cle/etablissement/from-user", DECOMMISSIONED_ROLES)).toEqual(tous(DECOMMISSIONED_ROLES, 403));
    });

    it("GET /cle/young/by-classe-stats/:idClasse", async () => {
      const { classe } = await createEtablissementComplet();
      const url = `/cle/young/by-classe-stats/${classe._id}`;
      expect(await verdicts(url, AUTORISES)).toEqual(tous(AUTORISES, 200));
      expect(await verdicts(url, DECOMMISSIONED_ROLES)).toEqual(tous(DECOMMISSIONED_ROLES, 403));
    });
  });
});
