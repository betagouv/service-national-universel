/**
 * GOO-5 : la désactivation d'un compte référent doit couper ses sessions en cours.
 *
 * La connexion refusait déjà un compte INACTIVE, mais un JWT émis avant la désactivation restait
 * accepté par la stratégie passport jusqu'à son expiration. `passport` est mocké dans la suite api :
 * on teste donc directement la fonction de vérification branchée sur la stratégie JWT.
 */
import { ROLES, ReferentStatus } from "snu-lib";

import { ReferentModel } from "../models";
import { validateUser } from "../passport";
import { JWT_SIGNIN_VERSION } from "../jwt-options";

import { dbConnect, dbClose } from "./helpers/db";
import { getNewReferentFixture } from "./fixtures/referent";
import { createReferentHelper } from "./helpers/referent";

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);
beforeEach(async () => {
  await ReferentModel.deleteMany();
});

function verify(payload: Record<string, unknown>): Promise<unknown> {
  return new Promise((resolve) => validateUser(ReferentModel, payload as any, (_error, user) => resolve(user)));
}

describe("GOO-5 — sessions d'un compte référent désactivé", () => {
  it("refuse après désactivation un JWT émis avant", async () => {
    const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, status: ReferentStatus.ACTIVE } as any));
    const payload = { __v: JWT_SIGNIN_VERSION, _id: referent._id.toString(), lastLogoutAt: null, passwordChangedAt: null };

    expect(await verify(payload)).toBeTruthy();

    await ReferentModel.updateOne({ _id: referent._id }, { $set: { status: ReferentStatus.INACTIVE } });

    expect(await verify(payload)).toBe(false);
  });
});
