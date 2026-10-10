import { Types } from "mongoose";
const { ObjectId } = Types;
import { ROLES } from "snu-lib";

import { dbConnect, dbClose } from "./helpers/db";
import { createSessionPhase1 } from "./helpers/sessionPhase1";
import { getNewSessionPhase1Fixture } from "./fixtures/sessionPhase1";
import { createEtablissement } from "./helpers/etablissement";
import { createFixtureEtablissement } from "./fixtures/etablissement";
import { createClasse } from "./helpers/classe";
import { createFixtureClasse } from "./fixtures/classe";
import { createYoungHelper } from "./helpers/young";
import getNewYoungFixture from "./fixtures/young";

import { canEditYoungInScope, isYoungInUserScope, isSessionPhase1InUserScope } from "../young/youngScope";
import { isEtablissementInUserScope } from "../cle/etablissement/etablissementScope";
import { isClasseInUserScope } from "../cle/classe/classeScope";
import { canActOnLigneBus } from "../services/sejourAccess";
import { isEmailInUserScope } from "../email/emailNotificationScope";
import { isReferentReadableByUser } from "../referent/referentScope";

/**
 * GOO-165 (P25b) : appels DIRECTS aux fonctions exportées de périmètre.
 *
 * `isDecommissionedRole()` (verrou P24, `api/src/auth.ts`/`passport.ts`) bloque déjà toute requête
 * HTTP authentifiée pour ces rôles : un test de route (supertest) ne voit donc aucune différence
 * avant/après ce ticket. Seul un appel direct à la fonction exportée révèle la branche de rôle
 * décommissionné encore active en profondeur — c'est l'objet de ce fichier.
 */

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);

describe("GOO-165 — chef de centre (HEAD_CENTER) retiré du périmètre volontaire", () => {
  it("canEditYoungInScope / isYoungInUserScope / isSessionPhase1InUserScope doivent refuser un chef de centre rattaché à la session du volontaire", async () => {
    const actorId = new ObjectId().toString();
    const session = await createSessionPhase1({ ...getNewSessionPhase1Fixture(), headCenterId: actorId });
    const actor = { _id: actorId, role: ROLES.HEAD_CENTER } as any;
    const young = { sessionPhase1Id: session._id.toString(), classeId: undefined, region: undefined, department: undefined, source: undefined } as any;

    expect(await canEditYoungInScope(actor, young)).toBe(false);
    expect(await isYoungInUserScope(actor, young)).toBe(false);
    expect(await isSessionPhase1InUserScope(actor, session._id.toString())).toBe(false);
  });
});

describe("GOO-165 — rôles CLE (ADMINISTRATEUR_CLE, REFERENT_CLASSE) retirés du périmètre établissement/classe", () => {
  it("isEtablissementInUserScope doit refuser un administrateur CLE coordinateur de l'établissement", async () => {
    const actorId = new ObjectId().toString();
    const etablissement = await createEtablissement(createFixtureEtablissement({ coordinateurIds: [actorId], referentEtablissementIds: [] }));
    const actor = { _id: actorId, role: ROLES.ADMINISTRATEUR_CLE } as any;

    expect(await isEtablissementInUserScope(actor, etablissement._id.toString())).toBe(false);
  });

  it("isClasseInUserScope et isEtablissementInUserScope doivent refuser un référent de classe rattaché à la classe", async () => {
    const actorId = new ObjectId().toString();
    const etablissement = await createEtablissement(createFixtureEtablissement({ coordinateurIds: [], referentEtablissementIds: [] }));
    const classe = await createClasse(createFixtureClasse({ etablissementId: etablissement._id.toString(), referentClasseIds: [actorId] }));
    const actor = { _id: actorId, role: ROLES.REFERENT_CLASSE } as any;

    expect(await isClasseInUserScope(actor, classe)).toBe(false);
    expect(await isEtablissementInUserScope(actor, etablissement._id.toString())).toBe(false);
  });
});

describe("GOO-165 — lecture d'une fiche référent (isReferentReadableByUser) retirée pour chef de centre et rôles CLE", () => {
  it("doit refuser un chef de centre dont la géographie recouvre celle de la cible", async () => {
    const actor = { _id: new ObjectId().toString(), role: ROLES.HEAD_CENTER, region: "Pays de la Loire", department: [] } as any;
    const target = { _id: new ObjectId().toString(), role: ROLES.REFERENT_DEPARTMENT, region: "Pays de la Loire", department: ["Sarthe"] } as any;

    expect(await isReferentReadableByUser(actor, target)).toBe(false);
  });

  it("doit refuser un administrateur CLE coordinateur de l'établissement d'un référent départemental du même département", async () => {
    const actorId = new ObjectId().toString();
    const etablissement = await createEtablissement(createFixtureEtablissement({ coordinateurIds: [actorId], referentEtablissementIds: [], department: "Sarthe" }));
    const actor = { _id: actorId, role: ROLES.ADMINISTRATEUR_CLE } as any;
    const target = { _id: new ObjectId().toString(), role: ROLES.REFERENT_DEPARTMENT, department: ["Sarthe"] } as any;

    expect(await isReferentReadableByUser(actor, target)).toBe(false);
  });
});

describe("GOO-165 — transporteur (TRANSPORTER) retiré du périmètre plan de transport", () => {
  it("canActOnLigneBus doit refuser un transporteur quelle que soit la ligne", async () => {
    const actor = { role: ROLES.TRANSPORTER } as any;

    expect(await canActOnLigneBus(actor, { centerId: new ObjectId().toString() })).toBe(false);
  });
});

describe("GOO-165 — rôles CLE (ADMINISTRATEUR_CLE, REFERENT_CLASSE) retirés du périmètre des notifications mail", () => {
  it("isEmailInUserScope doit refuser un administrateur CLE coordinateur de l'établissement du volontaire", async () => {
    const actorId = new ObjectId().toString();
    const etablissement = await createEtablissement(createFixtureEtablissement({ coordinateurIds: [actorId], referentEtablissementIds: [] }));
    const young = await createYoungHelper(getNewYoungFixture({ etablissementId: etablissement._id.toString() }));
    const actor = { _id: actorId, role: ROLES.ADMINISTRATEUR_CLE } as any;

    expect(await isEmailInUserScope(actor, young.email)).toBe(false);
  });

  it("isEmailInUserScope doit refuser un référent de classe rattaché à la classe du volontaire", async () => {
    const actorId = new ObjectId().toString();
    const etablissement = await createEtablissement(createFixtureEtablissement({ coordinateurIds: [], referentEtablissementIds: [] }));
    const classe = await createClasse(createFixtureClasse({ etablissementId: etablissement._id.toString(), referentClasseIds: [actorId] }));
    const young = await createYoungHelper(getNewYoungFixture({ classeId: classe._id.toString() }));
    const actor = { _id: actorId, role: ROLES.REFERENT_CLASSE } as any;

    expect(await isEmailInUserScope(actor, young.email)).toBe(false);
  });
});
