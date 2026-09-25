import { ROLES, ReferentStatus } from "snu-lib";

import { ReferentModel } from "../../models";
import { handler } from "../../crons/syncReferentSupport";
import { dbConnect, dbClose } from "../helpers/db";
import { getNewReferentFixture } from "../fixtures/referent";
import { createReferentHelper } from "../helpers/referent";

jest.mock("../../brevo", () => ({ sync: jest.fn(), unsync: jest.fn() }));
jest.mock("../../sentry", () => ({ capture: jest.fn(), captureMessage: jest.fn() }));
jest.mock("../../slack", () => ({ error: jest.fn(), info: jest.fn() }));
jest.mock("../../SNUpport", () => ({ api: jest.fn() }));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const SNUpport = require("../../SNUpport");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const slack = require("../../slack");

const callBody = (path: string) => {
  const call = SNUpport.api.mock.calls.find((c: any[]) => c[0] === path);
  return call ? JSON.parse(call[1].body) : undefined;
};

beforeAll(async () => await dbConnect(__filename.slice(__dirname.length + 1, -3)));
afterAll(async () => await dbClose());

beforeEach(async () => {
  jest.clearAllMocks();
  await ReferentModel.deleteMany({});
  SNUpport.api.mockImplementation(async (path: string) => (path === "/v0/referent/reconcile" ? { ok: true, data: { revokedReferentIds: [] } } : { ok: true }));
});

describe("syncReferentSupport (GOO-13)", () => {
  it("ne garde habilités au support que les référents départementaux et régionaux actifs", async () => {
    const department = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT }));
    const region = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_REGION }));
    const inactive = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, status: ReferentStatus.INACTIVE }));
    const formerReferent = await createReferentHelper(getNewReferentFixture({ role: ROLES.RESPONSIBLE }));

    await handler();

    const { activeReferentIds } = callBody("/v0/referent/reconcile");
    expect(activeReferentIds.sort()).toEqual([department._id.toString(), region._id.toString()].sort());
    expect(activeReferentIds).not.toContain(inactive._id.toString());
    expect(activeReferentIds).not.toContain(formerReferent._id.toString());
  });

  it("ne synchronise plus un référent inactif", async () => {
    const inactive = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, status: ReferentStatus.INACTIVE }));
    await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT }));

    await handler();

    const { referents } = callBody("/v0/referent");
    expect(referents).toHaveLength(1);
    expect(referents.map((referent: any) => referent.id)).not.toContain(inactive._id.toString());
  });

  it("considère actif un référent sans statut (documents antérieurs au champ)", async () => {
    const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_REGION }));
    await ReferentModel.collection.updateOne({ _id: referent._id }, { $unset: { status: "" } });

    await handler();

    expect(callBody("/v0/referent/reconcile").activeReferentIds).toEqual([referent._id.toString()]);
  });

  it("n'appelle pas la réconciliation sans aucun référent habilité, qui révoquerait tout le monde", async () => {
    await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN }));

    await handler();

    expect(callBody("/v0/referent/reconcile")).toBeUndefined();
  });

  it("signale les comptes révoqués", async () => {
    await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT }));
    SNUpport.api.mockImplementation(async (path: string) => (path === "/v0/referent/reconcile" ? { ok: true, data: { revokedReferentIds: ["abc"] } } : { ok: true }));

    await handler();

    expect(slack.info).toHaveBeenCalledWith(expect.objectContaining({ text: expect.stringContaining("abc") }));
  });
});
