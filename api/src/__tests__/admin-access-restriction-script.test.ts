import { Effect, Exit } from "effect";
import { FeatureFlagName, ROLES } from "snu-lib";

import { program, parseCommand } from "../scripts/adminAccessRestriction.effect";
import { FeatureFlagModel } from "../models";
import { getNewReferentFixture } from "./fixtures/referent";
import { createReferentHelper } from "./helpers/referent";
import { dbConnect, dbClose } from "./helpers/db";

const loadFlag = () => FeatureFlagModel.findOne({ name: FeatureFlagName.ADMIN_ACCESS_RESTRICTED }).lean();

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(async () => {
  await dbClose();
});
afterEach(async () => {
  await FeatureFlagModel.deleteMany({ name: FeatureFlagName.ADMIN_ACCESS_RESTRICTED });
});

describe("script adminAccessRestriction", () => {
  it("ajoute des référents par email, sans doublon, en stockant leurs identifiants", async () => {
    const a = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN }));
    const b = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN }));

    await Effect.runPromise(program({ action: "allow", emails: [a.email, b.email] }));
    await Effect.runPromise(program({ action: "allow", emails: [a.email] }));

    const flag = await loadFlag();
    expect(flag?.enabled).toBe(false);
    expect([...(flag?.allowedReferentIds || [])].sort()).toEqual([a._id.toString(), b._id.toString()].sort());
  });

  it("n'écrit rien si un email ne correspond à aucun référent", async () => {
    const a = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN }));

    const exit = await Effect.runPromiseExit(program({ action: "allow", emails: [a.email, "inconnu@example.org"] }));

    expect(Exit.isFailure(exit)).toBe(true);
    expect(await loadFlag()).toBeNull();
  });

  it("refuse d'activer le verrouillage sur une liste vide", async () => {
    const exit = await Effect.runPromiseExit(program({ action: "enable" }));

    expect(Exit.isFailure(exit)).toBe(true);
    expect(await loadFlag()).toBeNull();
  });

  it("active, retire et lève le verrouillage", async () => {
    const a = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN }));
    const b = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN }));
    await Effect.runPromise(program({ action: "allow", emails: [a.email, b.email] }));

    await Effect.runPromise(program({ action: "enable" }));
    expect((await loadFlag())?.enabled).toBe(true);

    await Effect.runPromise(program({ action: "revoke", emails: [b.email] }));
    expect((await loadFlag())?.allowedReferentIds).toEqual([a._id.toString()]);

    await Effect.runPromise(program({ action: "disable" }));
    const flag = await loadFlag();
    expect(flag?.enabled).toBe(false);
    expect(flag?.allowedReferentIds).toEqual([a._id.toString()]);
  });

  it("n'écrit rien en dry-run", async () => {
    const a = await createReferentHelper(getNewReferentFixture({ role: ROLES.ADMIN }));

    await Effect.runPromise(program({ action: "allow", emails: [a.email] }, true));

    expect(await loadFlag()).toBeNull();
  });

  it("normalise les emails et ignore les lignes vides", async () => {
    const command = await Effect.runPromise(parseCommand(["allow", " A@Example.org ", "", "a@example.org", "--dry-run"]));
    expect(command).toEqual({ action: "allow", emails: ["a@example.org"] });
  });

  it("rejette une commande inconnue", async () => {
    const exit = await Effect.runPromiseExit(parseCommand(["purge"]));
    expect(Exit.isFailure(exit)).toBe(true);
  });
});
