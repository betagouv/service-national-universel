import { APPLICATION_STATUS, COHORT_STATUS, COHORT_TYPE, PHASE2_EXCEPTIONAL_VALIDATION, SENDINBLUE_TEMPLATES, YOUNG_STATUS, YOUNG_STATUS_PHASE2, YoungType } from "snu-lib";

import { handler } from "../../crons/autoValidatePhase2";
import { config } from "../../config";
import { sendTemplate } from "../../brevo";
import { ApplicationModel, CohortGroupModel, CohortModel, MissionEquivalenceModel, YoungModel } from "../../models";
import { recomputeYoungPhase2StatusAndHours, updateStatusPhase2 } from "../../utils";
import { clearDatabase, dbClose, dbConnect, mockTransaction } from "../helpers/db";
import getNewCohortFixture from "../fixtures/cohort";
import getNewYoungFixture from "../fixtures/young";
import { getNewApplicationFixture } from "../fixtures/application";
import { createFixtureMissionEquivalence } from "../fixtures/equivalence";

jest.mock("../../brevo", () => ({
  sendTemplate: jest.fn(),
  sync: jest.fn(),
  unsync: jest.fn(),
}));
jest.mock("../../sentry", () => ({ capture: jest.fn(), captureMessage: jest.fn() }));

const sendTemplateMock = jest.mocked(sendTemplate);
const originalConfig = {
  PHASE2_EXCEPTIONAL_VALIDATION_TEMPLATE_ID: config.PHASE2_EXCEPTIONAL_VALIDATION_TEMPLATE_ID,
  MAIL_TRANSPORT: config.MAIL_TRANSPORT,
  ENABLE_SENDINBLUE: config.ENABLE_SENDINBLUE,
};
let cohortId: string;
let cohortName: string;
let nowSpy: jest.SpyInstance;

async function createCohort(year = 2025, type: "VOLONTAIRE" | "CLE" = COHORT_TYPE.VOLONTAIRE) {
  const group = await CohortGroupModel.create({ name: `${type} ${year}`, year, type });
  return CohortModel.create(getNewCohortFixture({ name: `Session ${type} ${year}`, cohortGroupId: group._id.toString(), type, status: COHORT_STATUS.ARCHIVED }));
}

async function createYoung(fields: Partial<YoungType> = {}) {
  return YoungModel.create(
    getNewYoungFixture({
      cohortId,
      cohort: cohortName,
      status: YOUNG_STATUS.VALIDATED,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
      statusPhase2ValidatedAt: undefined,
      phase2NumberHoursDone: "42",
      ...fields,
    }),
  );
}

beforeAll(async () => {
  await dbConnect("autoValidatePhase2");
  // La CI utilise aussi un MongoDB autonome ; TEST_MONGO_TRANSACTIONS=true active les tests de replica set.
  if (process.env.TEST_MONGO_TRANSACTIONS !== "true") mockTransaction();
  nowSpy = jest.spyOn(Date, "now");
});

afterAll(async () => {
  nowSpy.mockRestore();
  Object.assign(config, originalConfig);
  await dbClose();
});

beforeEach(async () => {
  await clearDatabase();
  const cohort = await createCohort();
  cohortId = cohort._id.toString();
  cohortName = cohort.name;
  nowSpy.mockReturnValue(new Date(PHASE2_EXCEPTIONAL_VALIDATION.START_AT).getTime());
  config.PHASE2_EXCEPTIONAL_VALIDATION_TEMPLATE_ID = "900001";
  config.MAIL_TRANSPORT = "BREVO";
  config.ENABLE_SENDINBLUE = true;
  sendTemplateMock.mockReset().mockResolvedValue({ messageId: "test-message" });
});

describe("autoValidatePhase2 — périmètre", () => {
  it("ne fait rien avant le 9 novembre 2026 à minuit en heure de Paris", async () => {
    const young = await createYoung();
    nowSpy.mockReturnValue(new Date(PHASE2_EXCEPTIONAL_VALIDATION.START_AT).getTime() - 1);
    await handler();
    expect((await YoungModel.findById(young._id))!.statusPhase2).toBe(YOUNG_STATUS_PHASE2.IN_PROGRESS);
    expect(sendTemplateMock).not.toHaveBeenCalled();
  });

  it.each(["42", "42.5", "83", "84", "100", "1000"])("valide numériquement %s heures et conserve ce cumul", async (hours) => {
    const young = await createYoung({ phase2NumberHoursDone: hours });
    await handler();
    const updated = (await YoungModel.findById(young._id))!;
    expect(updated.statusPhase2).toBe(YOUNG_STATUS_PHASE2.VALIDATED);
    expect(updated.phase2NumberHoursDone).toBe(hours);
    expect(updated.phase2ExceptionalValidation!.hoursDone).toBe(Number(hours));
    expect(updated.phase2ExceptionalValidation!.validatedAt).toEqual(updated.statusPhase2ValidatedAt);
    expect(updated.phase2ExceptionalValidation!.cohortId).toBe(cohortId);
    expect(sendTemplateMock).toHaveBeenCalledTimes(1);
    expect(sendTemplateMock.mock.calls[0][0]).toBe("900001");
  });

  it.each([undefined, "", "0", "9", "41", "41.99", "invalid", "Infinity", "NaN"])("ignore un cumul insuffisant ou invalide : %s", async (hours) => {
    const young = await createYoung({ phase2NumberHoursDone: hours });
    await handler();
    const unchanged = (await YoungModel.findById(young._id))!;
    expect(unchanged.statusPhase2).toBe(YOUNG_STATUS_PHASE2.IN_PROGRESS);
    expect(unchanged.phase2ExceptionalValidation).toBeUndefined();
    expect(sendTemplateMock).not.toHaveBeenCalled();
  });

  it("inclut les CLE 2025 archivés et les anciens dossiers sans cohortId", async () => {
    const cle = await createCohort(2025, COHORT_TYPE.CLE);
    const young = await createYoung({ cohortId: undefined, cohort: cle.name });
    await handler();
    expect((await YoungModel.findById(young._id))!.statusPhase2).toBe(YOUNG_STATUS_PHASE2.VALIDATED);
  });

  it.each([2024, 2026])("exclut les cohortes %s même si leur nom contient 2025", async (year) => {
    const cohort = await createCohort(year);
    cohort.name = `2025 dans le nom, mais groupe ${year}`;
    await cohort.save();
    const young = await createYoung({ cohortId: cohort._id.toString(), cohort: cohort.name });
    await handler();
    expect((await YoungModel.findById(young._id))!.statusPhase2).toBe(YOUNG_STATUS_PHASE2.IN_PROGRESS);
    expect(sendTemplateMock).not.toHaveBeenCalled();
  });

  it.each([
    { status: YOUNG_STATUS.WITHDRAWN },
    { status: YOUNG_STATUS.DELETED },
    { anonymized: true },
    { statusPhase2: YOUNG_STATUS_PHASE2.WITHDRAWN },
    { statusPhase2: YOUNG_STATUS_PHASE2.VALIDATED },
  ])("exclut un jeune hors périmètre : %j", async (fields) => {
    const young = await createYoung(fields);
    await handler();
    expect((await YoungModel.findById(young._id))!.phase2ExceptionalValidation).toBeUndefined();
    expect(sendTemplateMock).not.toHaveBeenCalled();
  });
});

describe("autoValidatePhase2 — effets et reprise", () => {
  it("nettoie les pièces militaires, annule uniquement les candidatures en attente et met les RL en copie", async () => {
    const young = await createYoung({
      parent1FirstName: "Parent",
      parent1LastName: "Un",
      parent1Email: "parent1@example.com",
      parent2FirstName: "Parent",
      parent2LastName: "Deux",
      parent2Email: "parent2@example.com",
      statusMilitaryPreparationFiles: "WAITING_VERIFICATION",
      files: { militaryPreparationFilesIdentity: [{ name: "identity.pdf" }], militaryPreparationFilesCensus: [{ name: "census.pdf" }] },
    });
    const applications = await Promise.all(
      [APPLICATION_STATUS.WAITING_VALIDATION, APPLICATION_STATUS.WAITING_VERIFICATION, APPLICATION_STATUS.IN_PROGRESS, APPLICATION_STATUS.DONE].map((status) =>
        ApplicationModel.create({ ...getNewApplicationFixture(), youngId: young._id.toString(), status, tutorId: undefined }),
      ),
    );
    await handler();
    const updated = (await YoungModel.findById(young._id))!;
    expect(updated.files.militaryPreparationFilesIdentity).toHaveLength(0);
    expect(updated.files.militaryPreparationFilesCensus).toHaveLength(0);
    expect(updated.files.militaryPreparationFilesAuthorization).toHaveLength(0);
    expect(updated.files.militaryPreparationFilesCertificate).toHaveLength(0);
    expect(updated.statusMilitaryPreparationFiles).toBeUndefined();
    expect(updated.statusPhase2UpdatedAt).toEqual(updated.statusPhase2ValidatedAt);
    const statuses = await Promise.all(applications.map(async (application) => (await ApplicationModel.findById(application._id))!.status));
    expect(statuses).toEqual([APPLICATION_STATUS.CANCEL, APPLICATION_STATUS.CANCEL, APPLICATION_STATUS.IN_PROGRESS, APPLICATION_STATUS.DONE]);
    expect(updated.phase2ApplicationStatus).toEqual(expect.arrayContaining(statuses));
    expect(sendTemplateMock).toHaveBeenCalledWith(
      "900001",
      expect.objectContaining({
        cc: [
          { name: "Parent Un", email: "parent1@example.com" },
          { name: "Parent Deux", email: "parent2@example.com" },
        ],
        params: expect.objectContaining({ cta: `${config.APP_URL}/phase2` }),
      }),
    );
  });

  it("une deuxième exécution ne revalide pas et ne renvoie pas l'email", async () => {
    const young = await createYoung();
    await handler();
    const first = (await YoungModel.findById(young._id))!;
    await handler();
    const second = (await YoungModel.findById(young._id))!;
    expect(second.statusPhase2ValidatedAt).toEqual(first.statusPhase2ValidatedAt);
    expect(second.phase2ExceptionalValidation!.notifiedAt).toEqual(first.phase2ExceptionalValidation!.notifiedAt);
    expect(sendTemplateMock).toHaveBeenCalledTimes(1);
  });

  it("attribue au cron les patches de prise de verrou et de notification réussie", async () => {
    const young = await createYoung();
    await handler();
    const patches = await YoungModel.db
      .model("YoungPatches")
      .find({ ref: young._id, "ops.path": /^\/phase2ExceptionalValidation\/(notificationLockedUntil|notifiedAt)$/ })
      .sort({ _id: 1 })
      .lean();
    expect(patches).toHaveLength(2);
    expect(patches.map((patch) => patch.user)).toEqual([{ firstName: "Cron autoValidatePhase2" }, { firstName: "Cron autoValidatePhase2" }]);
    expect(patches[0].ops).toEqual(expect.arrayContaining([expect.objectContaining({ op: "add", path: "/phase2ExceptionalValidation/notificationLockedUntil" })]));
    expect(patches[1].ops).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ op: "add", path: "/phase2ExceptionalValidation/notifiedAt" }),
        expect.objectContaining({ op: "remove", path: "/phase2ExceptionalValidation/notificationLockedUntil" }),
      ]),
    );
  });

  it("attribue aussi au cron le patch de libération du verrou après un échec d'envoi", async () => {
    const young = await createYoung();
    sendTemplateMock.mockResolvedValueOnce(undefined);
    await expect(handler()).rejects.toThrow("1 erreurs");
    const patches = await YoungModel.db.model("YoungPatches").find({ ref: young._id, "ops.path": "/phase2ExceptionalValidation/notificationLockedUntil" }).sort({ _id: 1 }).lean();
    expect(patches).toHaveLength(2);
    expect(patches.map((patch) => patch.user)).toEqual([{ firstName: "Cron autoValidatePhase2" }, { firstName: "Cron autoValidatePhase2" }]);
    expect(patches[1].ops).toEqual(expect.arrayContaining([expect.objectContaining({ op: "remove", path: "/phase2ExceptionalValidation/notificationLockedUntil" })]));
  });

  it("valide sans template, puis notifie quand le template est renseigné", async () => {
    config.PHASE2_EXCEPTIONAL_VALIDATION_TEMPLATE_ID = undefined;
    const young = await createYoung();
    await handler();
    const pending = (await YoungModel.findById(young._id))!;
    expect(pending.statusPhase2).toBe(YOUNG_STATUS_PHASE2.VALIDATED);
    expect(pending.phase2ExceptionalValidation!.notifiedAt).toBeUndefined();
    expect(sendTemplateMock).not.toHaveBeenCalled();
    config.PHASE2_EXCEPTIONAL_VALIDATION_TEMPLATE_ID = "900001";
    await handler();
    expect((await YoungModel.findById(young._id))!.phase2ExceptionalValidation!.notifiedAt).toBeDefined();
    expect(sendTemplateMock).toHaveBeenCalledTimes(1);
  });

  it("ne considère pas un transport désactivé comme un envoi réussi", async () => {
    config.ENABLE_SENDINBLUE = false;
    const young = await createYoung();
    await handler();
    expect((await YoungModel.findById(young._id))!.phase2ExceptionalValidation!.notifiedAt).toBeUndefined();
    expect(sendTemplateMock).not.toHaveBeenCalled();
  });

  it("reprend un échec Brevo silencieux sans revalider le jeune", async () => {
    const young = await createYoung();
    sendTemplateMock.mockResolvedValueOnce(undefined);
    await expect(handler()).rejects.toThrow("1 erreurs");
    const pending = (await YoungModel.findById(young._id))!;
    expect(pending.statusPhase2).toBe(YOUNG_STATUS_PHASE2.VALIDATED);
    expect(pending.phase2ExceptionalValidation!.notifiedAt).toBeUndefined();
    expect(pending.phase2ExceptionalValidation!.notificationLockedUntil).toBeUndefined();
    await handler();
    const notified = (await YoungModel.findById(young._id))!;
    expect(notified.phase2ExceptionalValidation!.notifiedAt).toBeDefined();
    expect(notified.statusPhase2ValidatedAt).toEqual(pending.statusPhase2ValidatedAt);
    expect(sendTemplateMock).toHaveBeenCalledTimes(2);
  });

  it("respecte un verrou d'envoi actif et reprend un verrou expiré", async () => {
    config.PHASE2_EXCEPTIONAL_VALIDATION_TEMPLATE_ID = undefined;
    const young = await createYoung();
    await handler();
    config.PHASE2_EXCEPTIONAL_VALIDATION_TEMPLATE_ID = "900001";
    await YoungModel.updateOne({ _id: young._id }, { $set: { "phase2ExceptionalValidation.notificationLockedUntil": new Date("2100-01-01") } });
    await handler();
    expect(sendTemplateMock).not.toHaveBeenCalled();
    await YoungModel.updateOne({ _id: young._id }, { $set: { "phase2ExceptionalValidation.notificationLockedUntil": new Date("2020-01-01") } });
    await handler();
    expect(sendTemplateMock).toHaveBeenCalledTimes(1);
  });

  it("traite plus d'un lot sans sauter de jeunes quand les résultats disparaissent", async () => {
    config.PHASE2_EXCEPTIONAL_VALIDATION_TEMPLATE_ID = undefined;
    await YoungModel.insertMany(
      Array.from({ length: 55 }, () =>
        getNewYoungFixture({
          cohortId,
          cohort: cohortName,
          phase2NumberHoursDone: "42",
          status: YOUNG_STATUS.VALIDATED,
          statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
        }),
      ),
    );
    await handler();
    expect(await YoungModel.countDocuments({ "phase2ExceptionalValidation.reason": PHASE2_EXCEPTIONAL_VALIDATION.REASON })).toBe(55);
  });
});

const describeTransactions = process.env.TEST_MONGO_TRANSACTIONS === "true" ? describe : describe.skip;
describeTransactions("autoValidatePhase2 — transactions sur replica set", () => {
  it("annule aussi les changements de candidatures si la sauvegarde du jeune échoue", async () => {
    const young = await createYoung();
    const application = await ApplicationModel.create({ ...getNewApplicationFixture(), youngId: young._id.toString(), tutorId: undefined });
    const saveSpy = jest.spyOn(YoungModel.prototype, "save").mockRejectedValueOnce(new Error("Test save failure"));
    try {
      await expect(handler()).rejects.toThrow("1 erreurs");
      expect((await YoungModel.findById(young._id))!.statusPhase2).toBe(YOUNG_STATUS_PHASE2.IN_PROGRESS);
      expect((await ApplicationModel.findById(application._id))!.status).toBe(APPLICATION_STATUS.WAITING_VALIDATION);
      expect(sendTemplateMock).not.toHaveBeenCalled();
    } finally {
      saveSpy.mockRestore();
    }
    await handler();
    expect((await YoungModel.findById(young._id))!.statusPhase2).toBe(YOUNG_STATUS_PHASE2.VALIDATED);
  });

  it("deux exécutions concurrentes ne doublent pas la validation ni l'email", async () => {
    const young = await createYoung();
    await Promise.all([handler(), handler()]);
    expect((await YoungModel.findById(young._id))!.phase2ExceptionalValidation!.notifiedAt).toBeDefined();
    expect(sendTemplateMock).toHaveBeenCalledTimes(1);
  });
});

describe("validation ordinaire et recalculs", () => {
  it("cumule les missions terminées et les équivalences validées, puis conserve la date exceptionnelle", async () => {
    const young = await createYoung({ phase2NumberHoursDone: "0" });
    await ApplicationModel.create({ ...getNewApplicationFixture(), youngId: young._id.toString(), status: APPLICATION_STATUS.DONE, missionDuration: "22" });
    await MissionEquivalenceModel.create(createFixtureMissionEquivalence({ youngId: young._id.toString(), status: "VALIDATED", missionDuration: 20 }));
    await recomputeYoungPhase2StatusAndHours(young, {});
    expect(young.phase2NumberHoursDone).toBe("42");
    expect(young.statusPhase2).not.toBe(YOUNG_STATUS_PHASE2.VALIDATED);
    expect(sendTemplateMock).not.toHaveBeenCalled();
    await handler();
    const validated = (await YoungModel.findById(young._id))!;
    const validatedAt = validated.statusPhase2ValidatedAt;
    await recomputeYoungPhase2StatusAndHours(validated, {});
    await updateStatusPhase2(validated, {});
    expect(validated.statusPhase2).toBe(YOUNG_STATUS_PHASE2.VALIDATED);
    expect(validated.statusPhase2ValidatedAt).toEqual(validatedAt);
    expect(sendTemplateMock).toHaveBeenCalledTimes(1);
  });

  it.each(["recompute", "updateStatus"])("conserve le seuil de 84 h et l'ancien template pour %s", async (method) => {
    const young = await createYoung({ phase2NumberHoursDone: "83" });
    const application = await ApplicationModel.create({ ...getNewApplicationFixture(), youngId: young._id.toString(), status: APPLICATION_STATUS.DONE, missionDuration: "83" });
    const update = method === "recompute" ? recomputeYoungPhase2StatusAndHours : updateStatusPhase2;
    await update(young, {});
    expect(young.statusPhase2).not.toBe(YOUNG_STATUS_PHASE2.VALIDATED);
    expect(sendTemplateMock).not.toHaveBeenCalled();
    application.missionDuration = "84";
    await application.save();
    young.phase2NumberHoursDone = "84";
    await update(young, {});
    expect(young.statusPhase2).toBe(YOUNG_STATUS_PHASE2.VALIDATED);
    expect(young.phase2ExceptionalValidation).toBeUndefined();
    expect(sendTemplateMock).toHaveBeenCalledWith(SENDINBLUE_TEMPLATES.young.PHASE_2_VALIDATED, expect.anything());
  });
});
