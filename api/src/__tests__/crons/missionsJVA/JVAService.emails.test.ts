/**
 * Lot V10 : emails de la synchronisation JVA. Le titre d'une mission importée est saisi côté JVA et
 * recopié dans les emails envoyés depuis l'expéditeur officiel : aucun balisage ne doit y figurer.
 * Même technique de mock que JVAService.test.ts ; seuls les accès base et `sendTemplate` sont
 * remplacés, `syncMission` et `cancelOldMissions` sont les vraies fonctions.
 */
jest.mock("../../../application/applicationService", () => ({
  __esModule: true,
  updateApplicationTutor: jest.fn(),
  updateApplicationStatus: jest.fn(),
}));

jest.mock("../../../crons/missionsJVA/JVARepository", () => ({
  __esModule: true,
  fetchMissions: jest.fn(),
  fetchStructureById: jest.fn(),
}));

jest.mock("../../../brevo", () => ({
  __esModule: true,
  sendTemplate: jest.fn(),
}));

jest.mock("../../../slack", () => ({
  __esModule: true,
  default: { info: jest.fn() },
}));

jest.mock("../../../models", () => ({
  ApplicationModel: { countDocuments: jest.fn() },
  MissionModel: { findOne: jest.fn(), find: jest.fn(), create: jest.fn() },
  StructureModel: { findOne: jest.fn() },
  ReferentModel: { findOne: jest.fn(), exists: jest.fn(), find: jest.fn() },
}));

import { jest } from "@jest/globals";
import { MISSION_STATUS, SENDINBLUE_TEMPLATES } from "snu-lib";

import { cancelOldMissions, syncMission } from "../../../crons/missionsJVA/JVAService";
import { sendTemplate } from "../../../brevo";
import { ApplicationModel, MissionModel, ReferentModel, StructureModel } from "../../../models";

const HOSTILE = '<a href="https://sosie.example">Cliquez ici</a>';
const NORMAL = "Aide aux devoirs";

const JVA_MISSION = {
  clientId: "123",
  organizationClientId: "456",
  startAt: "2026-09-01T00:00:00.000Z",
  endAt: "2026-09-30T00:00:00.000Z",
  descriptionHtml: "Description",
  domain: "health",
  snuPlaces: 1,
  schedule: "Flexible",
  addresses: [
    {
      postalCode: "75001",
      street: "1 rue de Rivoli",
      city: "Paris",
      departmentName: "Paris",
      region: "Île-de-France",
      country: "FR",
      location: { lat: 48.8566, lon: 2.3522 },
    },
  ],
  updatedAt: new Date().toISOString(),
  postedAt: new Date().toISOString(),
  _id: "jva-mission-id",
};

const referent = { id: "referent-id", _id: "referent-id", status: "ACTIVE", firstName: "Jeanne", lastName: "Martin", email: "jeanne.martin@exemple.fr" };

function paramsOf(template: string): Record<string, any> {
  const call = (sendTemplate as any).mock.calls.find(([id]) => id === template);
  expect(call).toBeDefined();
  return call[1].params;
}

describe.each([
  ["valeur balisée", HOSTILE, true],
  ["valeur normale", NORMAL, false],
])("%s", (_label, title, hostile) => {
  const check = (value: unknown) => {
    if (hostile) {
      expect(String(value)).not.toMatch(/[<>]/);
      expect(String(value)).toContain("Cliquez ici");
    } else {
      expect(value).toEqual(NORMAL);
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-01T00:00:00.000Z"));
    (ApplicationModel.countDocuments as any).mockResolvedValue(0);
    (sendTemplate as any).mockResolvedValue(undefined);
    (ReferentModel.find as any).mockResolvedValue([]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("syncMission, nouvelle mission : titre transmis au responsable", async () => {
    (MissionModel.findOne as any).mockResolvedValue(null);
    (StructureModel.findOne as any).mockResolvedValue({ _id: "structure-id", id: "structure-id", jvaStructureId: "456" });
    (ReferentModel.exists as any).mockResolvedValue(true);
    (ReferentModel.findOne as any).mockResolvedValue(referent);
    (MissionModel.create as any).mockImplementation(async (data: any) => ({ ...data, _id: "snu-mission-id" }));

    await syncMission({ ...JVA_MISSION, title } as any);

    expect(MissionModel.create).toHaveBeenCalledWith(expect.objectContaining({ status: MISSION_STATUS.WAITING_VALIDATION }));
    check(paramsOf(SENDINBLUE_TEMPLATES.referent.MISSION_WAITING_VALIDATION).missionName);
  });

  it("cancelOldMissions : titre transmis au responsable de la mission annulée", async () => {
    (MissionModel.find as any).mockResolvedValue([
      { name: title, tutorId: "referent-id", jvaMissionId: "123", set: jest.fn(), save: (jest.fn() as any).mockResolvedValue(null) },
    ]);
    (ReferentModel.findOne as any).mockResolvedValue(referent);

    await cancelOldMissions(new Date("2026-05-01T00:00:00.000Z"));

    check(paramsOf(SENDINBLUE_TEMPLATES.referent.MISSION_CANCEL).missionName);
  });
});
