/**
 * Lot V10 : emails officiels et textes libres (PM2, PM4, PM22).
 *
 * Les noms de mission, de structure et de jeune sont saisis par des tiers et recopiés dans les
 * paramètres des emails envoyés depuis l'expéditeur officiel : aucun balisage ne doit y figurer.
 * Chaque envoi est exercé par son vrai point d'entrée (cron ou service), avec Mongo, `sendTemplate`
 * seul étant remplacé. Chaque cas existe en deux versions : valeur balisée (rouge avant le correctif)
 * et valeur normale (non-régression : le texte légitime est transmis tel quel).
 */
import { APPLICATION_STATUS, MISSION_STATUS, ROLES, SENDINBLUE_TEMPLATES, SUB_ROLES, YOUNG_STATUS } from "snu-lib";

import { ApplicationModel, CohortModel, ContractModel, MissionModel, ReferentModel, StructureModel, YoungModel } from "../models";
import { dbConnect, dbClose } from "./helpers/db";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";
import getNewMissionFixture from "./fixtures/mission";
import { getNewApplicationFixture } from "./fixtures/application";
import getNewStructureFixture from "./fixtures/structure";
import getNewContractFixture from "./fixtures/contract";
import getNewCohortFixture from "./fixtures/cohort";
import { createReferentHelper } from "./helpers/referent";
import { createYoungHelper } from "./helpers/young";

const mockSendTemplate = jest.fn().mockResolvedValue(undefined);
jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendTemplate: (...args: any[]) => mockSendTemplate(...args),
}));
jest.mock("../slack", () => ({ success: jest.fn(), info: jest.fn(), error: jest.fn() }));
jest.mock("../utils/pdf-renderer", () => ({ generatePdfIntoBuffer: jest.fn().mockResolvedValue(Buffer.from("pdf")) }));

import { handler as missionOutdated, handlerNotice1Week as missionOutdatedNotice } from "../crons/missionOutdated";
// Ce module est un .ts qui exporte via `exports.` : ses handlers ne sont pas typés.
const { handlerNotice1Week: waitingNotice1Week, handlerNotice13Days: waitingNotice13Days } = require("../crons/applicationWaitingAcceptationOutdated");
import { handler as applicationPending } from "../crons/applicationPending";
import { handler as contratRelance } from "../crons/contratRelance";
import { sendNotificationsByStatus } from "../application/applicationService";
import { sendDocumentEmail } from "../young/youngSendDocumentEmailService";

const HOSTILE = '<a href="https://sosie.example">Cliquez ici</a>';
const NORMAL = "Aide aux devoirs";
const DAY = 24 * 60 * 60 * 1000;

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);
beforeEach(async () => {
  await Promise.all([ReferentModel, YoungModel, MissionModel, StructureModel, ApplicationModel, CohortModel, ContractModel].map((m: any) => m.deleteMany()));
  mockSendTemplate.mockClear();
});

/** Paramètres du premier envoi du gabarit demandé (les crons de ces tests n'en font qu'un). */
function paramsOf(template: string): Record<string, any> {
  const call = mockSendTemplate.mock.calls.find(([id]) => id === template);
  expect(call).toBeDefined();
  return call![1].params;
}

/** Les crons de relance lancent leur traitement sans l'attendre : on attend l'envoi. */
async function waitForTemplate(template: string) {
  for (let i = 0; i < 100; i++) {
    if (mockSendTemplate.mock.calls.some(([id]) => id === template)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

const expectClean = (value: unknown) => expect(String(value)).not.toMatch(/[<>]/);

describe.each([
  ["valeur balisée", HOSTILE, true],
  ["valeur normale", NORMAL, false],
])("%s", (_label, name, hostile) => {
  const check = (value: unknown) => {
    if (hostile) {
      expectClean(value);
      expect(String(value)).toContain("Cliquez ici");
    } else {
      expect(value).toEqual(NORMAL);
    }
  };

  async function tutor() {
    return createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE, department: ["Paris"] } as any));
  }

  describe("cron missionOutdated", () => {
    it("MISSION_ARCHIVED_AUTO : nom de mission et motif transmis aux volontaires", async () => {
      const mission = await MissionModel.create({ ...getNewMissionFixture(), name, statusComment: name, status: MISSION_STATUS.VALIDATED, endAt: new Date(Date.now() - DAY) } as any);
      const young = await createYoungHelper(getNewYoungFixture({ status: YOUNG_STATUS.VALIDATED } as any));
      await ApplicationModel.create({
        ...getNewApplicationFixture(),
        missionId: mission._id.toString(),
        youngId: young._id.toString(),
        status: APPLICATION_STATUS.WAITING_VALIDATION,
      });

      await missionOutdated();

      const params = paramsOf(SENDINBLUE_TEMPLATES.young.MISSION_ARCHIVED_AUTO);
      check(params.missionName);
      check(params.message);
      expect(params.cta).toMatch(/\/phase2$/);
    });

    it("MISSION_ARCHIVED : nom de mission transmis à la structure", async () => {
      const referent = await tutor();
      await MissionModel.create({ ...getNewMissionFixture(), name, tutorId: referent._id.toString(), status: MISSION_STATUS.VALIDATED, endAt: new Date(Date.now() - DAY) } as any);

      await missionOutdated();

      const params = paramsOf(SENDINBLUE_TEMPLATES.referent.MISSION_ARCHIVED);
      check(params.missionName);
      expect(params.cta).toMatch(/\/mission\/.+\/youngs$/);
    });

    it("MISSION_ARCHIVED_1_WEEK_NOTICE : nom de mission transmis à la structure", async () => {
      const referent = await tutor();
      const end = new Date(Date.now() + 7 * DAY);
      end.setUTCHours(12, 0, 0, 0);
      await MissionModel.create({ ...getNewMissionFixture(), name, tutorId: referent._id.toString(), status: MISSION_STATUS.VALIDATED, endAt: end } as any);

      await missionOutdatedNotice();

      const params = paramsOf(SENDINBLUE_TEMPLATES.referent.MISSION_ARCHIVED_1_WEEK_NOTICE);
      check(params.missionName);
      expect(params.ctaMission).toMatch(/\/mission\/[0-9a-f]{24}$/);
    });
  });

  describe("cron applicationWaitingAcceptationOutdated", () => {
    async function candidatureEnAttente(ageInDays: number) {
      const cohort = await CohortModel.create(getNewCohortFixture());
      const structure = await StructureModel.create({ ...getNewStructureFixture(), name } as any);
      const young = await createYoungHelper(getNewYoungFixture({ cohort: cohort.name, status: YOUNG_STATUS.VALIDATED } as any));
      const application = await ApplicationModel.create({
        ...getNewApplicationFixture(),
        missionName: name,
        structureId: structure._id.toString(),
        youngId: young._id.toString(),
        status: APPLICATION_STATUS.WAITING_ACCEPTATION,
      });
      await ApplicationModel.collection.updateOne({ _id: application._id }, { $set: { createdAt: new Date(Date.now() - ageInDays * DAY - DAY / 2) } });
    }

    it("J+7 : nom de mission et de structure transmis au volontaire", async () => {
      await candidatureEnAttente(7);

      await waitingNotice1Week();
      await waitForTemplate(SENDINBLUE_TEMPLATES.young.APPLICATION_CANCEL_1_WEEK_NOTICE);

      const params = paramsOf(SENDINBLUE_TEMPLATES.young.APPLICATION_CANCEL_1_WEEK_NOTICE);
      check(params.missionName);
      check(params.structureName);
    });

    it("J+13 : nom de mission et de structure transmis au volontaire", async () => {
      await candidatureEnAttente(13);

      await waitingNotice13Days();
      await waitForTemplate(SENDINBLUE_TEMPLATES.young.APPLICATION_CANCEL_13_DAY_NOTICE);

      const params = paramsOf(SENDINBLUE_TEMPLATES.young.APPLICATION_CANCEL_13_DAY_NOTICE);
      check(params.missionName);
      check(params.structureName);
    });
  });

  describe("cron applicationPending", () => {
    it("APPLICATION_REMINDER : nom de mission transmis au tuteur", async () => {
      const referent = await tutor();
      const application: any = await ApplicationModel.create({
        ...getNewApplicationFixture(),
        missionName: name,
        tutorId: referent._id.toString(),
        status: APPLICATION_STATUS.WAITING_VALIDATION,
      });
      // La création a déjà journalisé un patch daté d'aujourd'hui : tout l'historique est vieilli.
      await application.patches.updateMany({ ref: application._id }, { $set: { date: new Date(Date.now() - 10 * DAY) } });
      await application.patches.create({
        ref: application._id,
        date: new Date(Date.now() - 10 * DAY),
        ops: [{ op: "replace", path: "/status", value: "WAITING_VALIDATION" }],
      });

      await applicationPending();

      const params = paramsOf(SENDINBLUE_TEMPLATES.referent.APPLICATION_REMINDER);
      check(params.missionName);
      expect(params.cta).toMatch(/\/volontaire\//);
    });
  });

  describe("cron contratRelance", () => {
    it("CONTRACT_DRAFT : nom de mission et de jeune transmis aux référents", async () => {
      await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, subRole: SUB_ROLES.manager_phase2, department: ["Paris"] } as any));
      const contract = await ContractModel.create({
        ...getNewContractFixture(),
        youngDepartment: "Paris",
        missionName: name,
        youngFirstName: name,
        youngLastName: name,
        invitationSent: "false",
      } as any);
      await ContractModel.collection.updateOne({ _id: contract._id }, { $set: { updatedAt: new Date(Date.now() - DAY - DAY / 2) } });

      await contratRelance();
      await waitForTemplate(SENDINBLUE_TEMPLATES.referent.CONTRACT_DRAFT);

      const params = paramsOf(SENDINBLUE_TEMPLATES.referent.CONTRACT_DRAFT);
      check(params.missionName);
      check(params.youngFirstName);
      check(params.youngLastName);
      expect(params.cta).toMatch(/\/contrat$/);
    });
  });

  describe("changement de statut d'une candidature (getEmailParamsForStatus)", () => {
    it.each([APPLICATION_STATUS.VALIDATED, APPLICATION_STATUS.REFUSED, APPLICATION_STATUS.CANCEL])("%s : nom de mission transmis au volontaire", async (status) => {
      const referent = await tutor();
      const mission = await MissionModel.create({ ...getNewMissionFixture(), name, tutorId: referent._id.toString() } as any);
      const young = await createYoungHelper(getNewYoungFixture({ status: YOUNG_STATUS.VALIDATED } as any));
      const application = await ApplicationModel.create({ ...getNewApplicationFixture(), missionId: mission._id.toString(), youngId: young._id.toString(), status });

      await sendNotificationsByStatus(application as any, young as any, status);

      const templateId =
        status === APPLICATION_STATUS.VALIDATED
          ? SENDINBLUE_TEMPLATES.young.VALIDATE_APPLICATION
          : status === APPLICATION_STATUS.REFUSED
            ? SENDINBLUE_TEMPLATES.young.REFUSE_APPLICATION
            : SENDINBLUE_TEMPLATES.young.CANCEL_APPLICATION;
      const params = paramsOf(templateId);
      check(params.missionName);
    });
  });

  describe("envoi d'un document par email (sendDocumentEmail)", () => {
    it("contrat : nom de mission dans l'objet et le message", async () => {
      const young = await createYoungHelper(getNewYoungFixture({ status: YOUNG_STATUS.VALIDATED } as any));
      const contract = await ContractModel.create({ ...getNewContractFixture(), youngId: young._id.toString(), missionName: name } as any);

      await sendDocumentEmail({ young_id: young._id.toString(), type: "contract", template: "2", fileName: "contrat.pdf", switchToCle: false, contract_id: contract._id.toString() });

      const params = paramsOf(SENDINBLUE_TEMPLATES.young.DOCUMENT);
      if (hostile) {
        expectClean(params.object);
        expectClean(params.message);
        expect(params.object).toContain("Cliquez ici");
      } else {
        expect(params.object).toEqual(`Contrat de la mission ${NORMAL}`);
        expect(params.message).toEqual(`Vous trouverez en pièce-jointe de ce mail le contract de la mission ${NORMAL}.`);
      }
    });
  });
});
