/**
 * Lot C — anti-abus sur les routes d'authentification.
 *
 * Chaque test démontre un constat de l'audit du 21/09/2026 :
 *   M4  — brute force du mot de passe par requêtes concurrentes (compteur non atomique)
 *   M5  — contournement du plafond de 3 essais 2FA (même TOCTOU)
 *   L3  — contournement du plafond attemptsEmailValidation
 *   L27 — remise à zéro quotidienne des compteurs par le cron
 *   L21 — GET /signin/token accepte les comptes supprimés
 *   M6  — oracle d'existence d'email sur POST /young/email
 *   M42/M65 — aucun rate limiting sur les routes d'auth
 *   PM5 — le verrou de connexion ne doit dépendre ni du mot de passe soumis ni de l'existence du compte
 */
import request from "supertest";
import jwt from "jsonwebtoken";

import getAppHelper, { resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose, clearDatabase } from "./helpers/db";
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper } from "./helpers/young";
import { createReferentHelper } from "./helpers/referent";
import { getNewReferentFixture } from "./fixtures/referent";
import { ReferentModel, YoungModel } from "../models";
import { config } from "../config";
import { JWT_SIGNIN_VERSION, JWT_SIGNIN_MAX_AGE_SEC } from "../jwt-options";
import { ROLES } from "snu-lib";
import { sendTemplate } from "../brevo";
import bcrypt from "bcryptjs";
import { MAX_LOGIN_ATTEMPTS_BEFORE_DELAY, consumeLoginAttempt } from "../services/auth/attemptCounters";

const PASSWORD = "SuperSecret1234!";
const WRONG_PASSWORD = "WrongSecret1234!";

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
  // jest.fn (pas une flèche nue) : PM5 ci-dessous a besoin de contrôler la résolution par test
  // (jest.spyOn échoue à redéfinir une propriété non configurable, cf. mémoire projet).
  sendTemplate: jest.fn(() => Promise.resolve()),
  syncContact: () => Promise.resolve(),
  createContact: () => Promise.resolve(),
  updateContact: () => Promise.resolve(),
}));

let previous2FA;

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  previous2FA = config.ENABLE_2FA;
});

afterAll(async () => {
  (config as any).ENABLE_2FA = previous2FA;
  await dbClose();
});

afterEach(async () => {
  resetAppAuth();
  await clearDatabase();
});

jest.setTimeout(120000);

async function createYoung(fields: Record<string, any> = {}) {
  return createYoungHelper({ ...getNewYoungFixture(), password: PASSWORD, ...fields } as any);
}

// getAppHelper() monte l'intégralité des routes : une app par requête ferait de
// cette suite la plus gourmande du dépôt, or la suite api tient déjà tout juste
// dans les 4 Go de heap de la CI. Une rafale concurrente vise de toute façon un
// seul serveur — une app par cas de test est aussi plus fidèle.
function signin(app, email: string, password: string) {
  return request(app).post("/young/signin").send({ email, password });
}

// Le cookie `jwt_young` n'est posé que par une connexion réussie : un refus n'en pose jamais.
function opensSession(res: { headers: Record<string, any> }): boolean {
  const cookies = ([] as string[]).concat(res.headers["set-cookie"] ?? []);
  return cookies.some((cookie) => cookie.startsWith("jwt_young="));
}

describe("M4 — brute force du mot de passe par requêtes concurrentes", () => {
  it("compte les tentatives sous rafale sans en perdre, et n'en évalue pas plus que le plafond avant délai", async () => {
    const young = await createYoung();
    const app = getAppHelper();
    const BURST = 10;

    await Promise.all(Array.from({ length: BURST }, () => signin(app, young.email, WRONG_PASSWORD)));

    const after = await YoungModel.findById(young._id);
    // Avec un « lire, incrémenter, sauver » non atomique, les N requêtes lisent toutes loginAttempts=0
    // et le compteur finit à 1. Atomique, les tentatives s'enchaînent jusqu'au délai posé à la 6e ;
    // les suivantes trouvent le verrou posé et sont refusées sans rien consommer.
    expect(after!.loginAttempts).toBeGreaterThan(1);
    expect(after!.loginAttempts).toBeLessThanOrEqual(MAX_LOGIN_ATTEMPTS_BEFORE_DELAY + 1);
  });

  it("verrouille le compte après la rafale : même le bon mot de passe est refusé, sans session", async () => {
    const young = await createYoung();
    const app = getAppHelper();

    await Promise.all(Array.from({ length: 10 }, () => signin(app, young.email, WRONG_PASSWORD)));

    // Le plafond de 5 essais doit être atteint : la tentative suivante, même avec le bon mot de passe,
    // est refusée comme un mot de passe faux (le verrou ne se lit pas dans la réponse, cf. PM5 ci-dessous).
    const next = await signin(app, young.email, PASSWORD);
    expect(next.status).toBe(401);
    expect(next.body.code).toBe("EMAIL_OR_PASSWORD_INVALID");
    expect(opensSession(next)).toBe(false);
  });
});

describe("PM5 — le verrou de connexion ne dépend jamais du mot de passe soumis", () => {
  beforeEach(() => {
    // Les cas de réussite ci-dessous veulent une session directe, sans étape 2FA (restauré en afterAll).
    (config as any).ENABLE_2FA = false;
  });

  const refusal = { ok: false, code: "EMAIL_OR_PASSWORD_INVALID" };
  const inThirtyMinutes = () => new Date(Date.now() + 30 * 60 * 1000);
  const inOneHour = () => new Date(Date.now() + 60 * 60 * 1000);
  const unknownEmail = () => `inconnu-${Date.now()}-${Math.random().toString(36).slice(2)}@example.org`;

  // C1, C2
  it("répond pareil (statut, code, corps) à un email inconnu, à un mauvais mot de passe, et à un compte différé ou bloqué avec le bon comme le mauvais mot de passe", async () => {
    const free = await createYoung();
    const delayed = await createYoung({ loginAttempts: MAX_LOGIN_ATTEMPTS_BEFORE_DELAY + 1, nextLoginAttemptIn: inThirtyMinutes() });
    const blocked = await createYoung({ loginAttempts: 13, nextLoginAttemptIn: inOneHour() });
    const app = getAppHelper();

    const responses = {
      unknown: await signin(app, unknownEmail(), WRONG_PASSWORD),
      wrongPassword: await signin(app, free.email, WRONG_PASSWORD),
      delayedWrongPassword: await signin(app, delayed.email, WRONG_PASSWORD),
      delayedRightPassword: await signin(app, delayed.email, PASSWORD),
      blockedWrongPassword: await signin(app, blocked.email, WRONG_PASSWORD),
      blockedRightPassword: await signin(app, blocked.email, PASSWORD),
    };

    for (const [name, res] of Object.entries(responses)) {
      expect({ name, status: res.status, body: res.body, session: opensSession(res) }).toEqual({ name, status: 401, body: refusal, session: false });
    }
  });

  // C2, sur la route des référents (même classe Auth, autre modèle)
  it("applique la même réponse sur /referent/signin : compte verrouillé avec le bon mot de passe == email inconnu", async () => {
    const referent = await createReferentHelper(
      getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT, password: PASSWORD, loginAttempts: MAX_LOGIN_ATTEMPTS_BEFORE_DELAY + 1, nextLoginAttemptIn: inThirtyMinutes() } as any),
    );
    const app = getAppHelper();

    const onLocked = await request(app).post("/referent/signin").send({ email: referent.email, password: PASSWORD });
    const onUnknown = await request(app).post("/referent/signin").send({ email: unknownEmail(), password: PASSWORD });

    expect(onUnknown.status).toBe(401);
    expect(onLocked.status).toBe(onUnknown.status);
    expect(onLocked.body).toEqual(onUnknown.body);
    expect(onLocked.body).toEqual(refusal);
    expect(onLocked.headers["set-cookie"]).toBeUndefined();
  });

  // C2 : parité de temps. Un chronométrage serait instable : on compte les comparaisons bcrypt.
  it("exécute une comparaison bcrypt, et une seule, quel que soit l'état du compte", async () => {
    const free = await createYoung();
    const locked = await createYoung({ loginAttempts: MAX_LOGIN_ATTEMPTS_BEFORE_DELAY + 1, nextLoginAttemptIn: inThirtyMinutes() });
    const app = getAppHelper();
    const compare = jest.spyOn(bcrypt, "compare");
    const calls: Record<string, number> = {};

    try {
      const scenarios: Record<string, () => Promise<unknown>> = {
        unknown: () => signin(app, unknownEmail(), WRONG_PASSWORD),
        wrongPassword: () => signin(app, free.email, WRONG_PASSWORD),
        lockedWrongPassword: () => signin(app, locked.email, WRONG_PASSWORD),
        lockedRightPassword: () => signin(app, locked.email, PASSWORD),
      };
      for (const [name, run] of Object.entries(scenarios)) {
        compare.mockClear();
        await run();
        calls[name] = compare.mock.calls.length;
      }
    } finally {
      compare.mockRestore();
    }

    expect(calls).toEqual({ unknown: 1, wrongPassword: 1, lockedWrongPassword: 1, lockedRightPassword: 1 });
  });

  // C3
  it("ne connecte jamais pendant un verrou, même avec le bon mot de passe (délai posé par les échecs, puis blocage dur)", async () => {
    const young = await createYoung();
    const app = getAppHelper();
    for (let i = 0; i < MAX_LOGIN_ATTEMPTS_BEFORE_DELAY + 1; i++) await signin(app, young.email, WRONG_PASSWORD);

    const duringDelay = await signin(app, young.email, PASSWORD);

    const hardBlocked = await createYoung({ loginAttempts: 13, nextLoginAttemptIn: inOneHour() });
    const duringBlock = await signin(app, hardBlocked.email, PASSWORD);

    for (const res of [duringDelay, duringBlock]) {
      expect({ status: res.status, body: res.body, session: opensSession(res) }).toEqual({ status: 401, body: refusal, session: false });
    }
  });

  // C4 : comportement à conserver
  it("ne consomme rien et ne prolonge pas le verrou pendant qu'il court", async () => {
    const until = inThirtyMinutes();
    const young = await createYoung({ loginAttempts: MAX_LOGIN_ATTEMPTS_BEFORE_DELAY + 2, nextLoginAttemptIn: until });
    const app = getAppHelper();

    await signin(app, young.email, WRONG_PASSWORD);
    await signin(app, young.email, PASSWORD);

    const after = await YoungModel.findById(young._id);
    expect(after!.loginAttempts).toBe(MAX_LOGIN_ATTEMPTS_BEFORE_DELAY + 2);
    expect(after!.nextLoginAttemptIn!.getTime()).toBe(until.getTime());
  });

  // C5
  it("le 6e essai avec le bon mot de passe se connecte : le délai posé pour la suivante ne refuse pas la tentative en cours", async () => {
    const young = await createYoung();
    const app = getAppHelper();
    for (let i = 0; i < MAX_LOGIN_ATTEMPTS_BEFORE_DELAY; i++) await signin(app, young.email, WRONG_PASSWORD);

    const sixth = await signin(app, young.email, PASSWORD);

    expect(sixth.status).toBe(200);
    expect(opensSession(sixth)).toBe(true);
    const after = await YoungModel.findById(young._id);
    expect(after!.loginAttempts).toBe(0);
    expect(after!.nextLoginAttemptIn).toBeNull();
  });

  it("un 6e essai avec un mauvais mot de passe est refusé comme les autres et pose le délai", async () => {
    const young = await createYoung();
    const app = getAppHelper();
    for (let i = 0; i < MAX_LOGIN_ATTEMPTS_BEFORE_DELAY; i++) await signin(app, young.email, WRONG_PASSWORD);

    const sixth = await signin(app, young.email, WRONG_PASSWORD);

    expect({ status: sixth.status, body: sixth.body }).toEqual({ status: 401, body: refusal });
    const after = await YoungModel.findById(young._id);
    expect(after!.loginAttempts).toBe(MAX_LOGIN_ATTEMPTS_BEFORE_DELAY + 1);
    expect(after!.nextLoginAttemptIn!.getTime()).toBeGreaterThan(Date.now());
  });

  // C3 sous concurrence : le verrou est décidé au moment de la consommation, pas sur le document lu avant.
  it("refuse le bon mot de passe quand le verrou a été posé entre la lecture du compte et la consommation de la tentative", async () => {
    const young = await createYoung({ loginAttempts: MAX_LOGIN_ATTEMPTS_BEFORE_DELAY, nextLoginAttemptIn: new Date(Date.now() - 1000) });
    // Document lu avant le verrou : il se croit libre.
    const stale = await YoungModel.findById(young._id);
    // Une requête sœur vient de poser le délai.
    await YoungModel.updateOne({ _id: young._id }, { $set: { loginAttempts: MAX_LOGIN_ATTEMPTS_BEFORE_DELAY + 1, nextLoginAttemptIn: inThirtyMinutes() } });
    const original = YoungModel.findOne.bind(YoungModel);
    const findOne = jest.spyOn(YoungModel, "findOne").mockImplementation(((filter: any, ...rest: any[]) =>
      filter?.email === young.email ? Promise.resolve(stale) : (original as any)(filter, ...rest)) as any);

    try {
      const res = await signin(getAppHelper(), young.email, PASSWORD);

      expect({ status: res.status, body: res.body, session: opensSession(res) }).toEqual({ status: 401, body: refusal, session: false });
    } finally {
      findOne.mockRestore();
    }
    const after = await YoungModel.findById(young._id);
    expect(after!.loginAttempts).toBe(MAX_LOGIN_ATTEMPTS_BEFORE_DELAY + 1);
  });
});

describe("consumeLoginAttempt — le verrou est décidé dans l'opération atomique", () => {
  it("refuse sans rien consommer ni prolonger quand un verrou est déjà actif", async () => {
    const until = new Date(Date.now() + 30 * 60 * 1000);
    const young = await createYoung({ loginAttempts: MAX_LOGIN_ATTEMPTS_BEFORE_DELAY + 2, nextLoginAttemptIn: until });

    const attempt = await consumeLoginAttempt(YoungModel, young._id);

    expect(attempt.blocked).toBe(true);
    expect(attempt.nextLoginAttemptIn.getTime()).toBe(until.getTime());
    const after = await YoungModel.findById(young._id);
    expect(after!.loginAttempts).toBe(MAX_LOGIN_ATTEMPTS_BEFORE_DELAY + 2);
    expect(after!.nextLoginAttemptIn!.getTime()).toBe(until.getTime());
  });

  it("sous rafale, une seule tentative franchit le délai : les autres sont refusées sans rien consommer", async () => {
    // 5 échecs, dernier il y a une seconde : dans la fenêtre, la prochaine tentative est la 6e.
    const young = await createYoung({ loginAttempts: MAX_LOGIN_ATTEMPTS_BEFORE_DELAY, nextLoginAttemptIn: new Date(Date.now() - 1000) });

    const attempts = await Promise.all(Array.from({ length: 8 }, () => consumeLoginAttempt(YoungModel, young._id)));

    expect(attempts.filter((attempt) => !attempt.blocked)).toHaveLength(1);
    const after = await YoungModel.findById(young._id);
    expect(after!.loginAttempts).toBe(MAX_LOGIN_ATTEMPTS_BEFORE_DELAY + 1);
  });

  it("rend exactement l'état écrit en base à chaque transition (délai, plafond, blocage, fenêtre)", async () => {
    const young = await createYoung();
    const t0 = new Date("2026-01-01T10:00:00.000Z").getTime();
    // [secondes écoulées depuis t0, verrou déjà actif quand la tentative est présentée]
    const steps: Array<[number, boolean]> = [
      [0, false],
      [1, false],
      [2, false],
      [3, false],
      [4, false],
      [5, false], // 6e : pose le délai, reste évaluée
      [6, true], // pendant le délai
      [70, false],
      [140, false],
      [210, false],
      [280, false],
      [350, false],
      [420, false], // 12e
      [490, false], // 13e : plafond franchi, blocage d'une heure
      [500, true], // pendant le blocage
      [4100, false], // blocage échu
      [18500, false], // fenêtre échue : le compteur repart à 1
    ];

    for (const [seconds, lockedBefore] of steps) {
      const attempt = await consumeLoginAttempt(YoungModel, young._id, new Date(t0 + seconds * 1000));
      const stored = await YoungModel.findById(young._id);

      expect({ seconds, loginAttempts: attempt.loginAttempts, nextLoginAttemptIn: attempt.nextLoginAttemptIn.getTime() }).toEqual({
        seconds,
        loginAttempts: stored!.loginAttempts,
        nextLoginAttemptIn: stored!.nextLoginAttemptIn!.getTime(),
      });
      if (lockedBefore) expect({ seconds, blocked: attempt.blocked }).toEqual({ seconds, blocked: true });
    }
    expect((await YoungModel.findById(young._id))!.loginAttempts).toBe(1);
  });
});

describe("PM5 — oracle d'existence de compte sur /young|referent/signin (résiduel de M4)", () => {
  it("ne bloque pas la réponse de forgot_password sur l'envoi Brevo (email existant)", async () => {
    const young = await createYoung();
    let resolveSend: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      resolveSend = resolve;
    });
    (sendTemplate as jest.Mock).mockImplementationOnce(() => pending);

    try {
      const res = await request(getAppHelper()).post("/young/forgot_password").send({ email: young.email });
      expect(res.status).toBe(200);
      // La promesse Brevo n'est toujours pas résolue : la réponse n'a pas pu l'attendre.
      expect(sendTemplate).toHaveBeenCalled();
    } finally {
      resolveSend();
    }
  });

  it("ne bloque pas la réponse de referent/signup_retry sur l'envoi Brevo (compte existant)", async () => {
    const referent = await createReferentHelper(getNewReferentFixture({ role: ROLES.REFERENT_DEPARTMENT } as any));
    let resolveSend: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      resolveSend = resolve;
    });
    (sendTemplate as jest.Mock).mockImplementationOnce(() => pending);

    try {
      const res = await request(getAppHelper()).post("/referent/signup_retry").send({ email: referent.email });
      expect(res.status).toBe(200);
      expect(sendTemplate).toHaveBeenCalled();
    } finally {
      resolveSend();
    }
  });
});

describe("PM6 — reset_password : compteur et verrou sur le mot de passe courant", () => {
  function resetPassword(app, password: string) {
    return request(app).post("/young/reset_password").send({ password, verifyPassword: PASSWORD + "Nouveau1", newPassword: PASSWORD + "Nouveau1" });
  }

  it("compte les échecs sur le mot de passe courant et verrouille au-delà du plafond", async () => {
    const young = await createYoung();
    const app = getAppHelper(young);

    await Promise.all(Array.from({ length: 10 }, () => resetPassword(app, WRONG_PASSWORD)));

    const after = await YoungModel.findById(young._id);
    // Les tentatives sont comptées sans perte, mais pas au-delà du délai posé à la 6e : les suivantes
    // trouvent le verrou et sont refusées sans rien consommer.
    expect(after!.loginAttempts).toBeGreaterThan(1);
    expect(after!.loginAttempts).toBeLessThanOrEqual(MAX_LOGIN_ATTEMPTS_BEFORE_DELAY + 1);

    // Le plafond de 5 essais est franchi : même le bon mot de passe courant est refusé.
    const next = await resetPassword(app, PASSWORD);
    expect(next.body.code).toBe("TOO_MANY_REQUESTS");
  });

  it("ne consomme aucune tentative quand le mot de passe courant est bon du premier coup", async () => {
    const young = await createYoung();
    const app = getAppHelper(young);

    const res = await resetPassword(app, PASSWORD);
    expect(res.status).toBe(200);

    const after = await YoungModel.findById(young._id);
    expect(after!.loginAttempts).toBe(0);
  });
});

describe("M5 — plafond de 3 essais 2FA", () => {
  it("ne laisse pas dépasser 3 essais de code 2FA en parallèle", async () => {
    (config as any).ENABLE_2FA = true;
    const young = await createYoung({
      token2FA: "123456",
      attempts2FA: 0,
      token2FAExpires: new Date(Date.now() + 10 * 60 * 1000),
    });
    const app = getAppHelper();
    const BURST = 10;

    await Promise.all(
      Array.from({ length: BURST }, () => request(app).post("/young/signin-2fa").send({ email: young.email, token_2fa: "000000", rememberMe: false })),
    );

    const after = await YoungModel.findById(young._id);
    // Le compteur doit saturer à 3 : au-delà, findOne({attempts2FA: {$lt: 3}})
    // ne renvoie plus rien et la route refuse sans consommer d'essai.
    expect(after!.attempts2FA).toBe(3);
  });
});

describe("L3 — plafond attemptsEmailValidation", () => {
  it("ne laisse pas dépasser 3 essais de code de validation d'email en parallèle", async () => {
    const young = await createYoung({
      emailVerified: "false",
      tokenEmailValidation: "123456",
      attemptsEmailValidation: 0,
      tokenEmailValidationExpires: new Date(Date.now() + 60 * 60 * 1000),
    });
    const BURST = 10;
    const app = getAppHelper(young as any, "young");

    await Promise.all(Array.from({ length: BURST }, () => request(app).post("/young/email-validation").send({ token_email_validation: "000000" })));

    const after = await YoungModel.findById(young._id);
    expect(after!.attemptsEmailValidation).toBe(3);
  });
});

describe("L27 — expiration des compteurs", () => {
  it("ne déverrouille pas un compte attaqué à l'instant lors du nettoyage quotidien", async () => {
    // Blocage dur (>12) et dernière tentative il y a 10 minutes : la fenêtre d'une
    // minute est passée, mais le compte est manifestement sous attaque.
    const young = await createYoung({ loginAttempts: 13, nextLoginAttemptIn: new Date(Date.now() - 10 * 60 * 1000) });

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const loginAttemptsCron = require("../crons/loginAttempts");
    await loginAttemptsCron.handler();

    const after = await YoungModel.findById(young._id);
    // Le nettoyage ne doit purger que les compteurs dormants, pas offrir un
    // budget de tentatives neuf à 1h du matin à tout compte attaqué.
    expect(after!.loginAttempts).toBe(13);
  });

  it("purge les compteurs dormants", async () => {
    const young = await createYoung({ loginAttempts: 3, nextLoginAttemptIn: new Date(Date.now() - 48 * 60 * 60 * 1000) });

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const loginAttemptsCron = require("../crons/loginAttempts");
    await loginAttemptsCron.handler();

    const after = await YoungModel.findById(young._id);
    expect(after!.loginAttempts).toBe(0);
  });

  // GOO-97 : un `Model.updateMany` déclenche les hooks de mongoose-patch-history, qui
  // chargent en mémoire TOUS les comptes visés, deux fois. En prod, TASKS mourait en
  // OOM chaque nuit. Le cron ne doit charger aucun document.
  it("purge sans charger les comptes en mémoire", async () => {
    const dormant = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const young = await createYoung({ loginAttempts: 3, nextLoginAttemptIn: dormant });
    const referent = await createReferentHelper({ ...getNewReferentFixture(), loginAttempts: 5, nextLoginAttemptIn: dormant } as any);
    const youngFind = jest.spyOn(YoungModel, "find");
    const referentFind = jest.spyOn(ReferentModel, "find");

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const loginAttemptsCron = require("../crons/loginAttempts");
      await loginAttemptsCron.handler();

      expect(youngFind).not.toHaveBeenCalled();
      expect(referentFind).not.toHaveBeenCalled();
    } finally {
      youngFind.mockRestore();
      referentFind.mockRestore();
    }

    expect((await YoungModel.findById(young._id))!.loginAttempts).toBe(0);
    const referentAfter = await ReferentModel.findById(referent._id);
    expect(referentAfter!.loginAttempts).toBe(0);
    expect(referentAfter!.nextLoginAttemptIn).toBeNull();
  });
});

describe("L21 — GET /signin/token et comptes supprimés", () => {
  it("refuse un jeton porté par un compte supprimé", async () => {
    const young = await createYoung({ status: "DELETED" });
    const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: young._id.toString(), lastLogoutAt: null, passwordChangedAt: null }, config.JWT_SECRET, {
      expiresIn: JWT_SIGNIN_MAX_AGE_SEC,
    });

    const res = await request(getAppHelper()).get("/signin/token").set("Authorization", `JWT ${token}`);

    expect(res.status).toBe(401);
  });

  it("refuse un jeton porté par un compte anonymisé", async () => {
    const young = await createYoung({ anonymized: "true" });
    const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: young._id.toString(), lastLogoutAt: null, passwordChangedAt: null }, config.JWT_SECRET, {
      expiresIn: JWT_SIGNIN_MAX_AGE_SEC,
    });

    const res = await request(getAppHelper()).get("/signin/token").set("Authorization", `JWT ${token}`);

    expect(res.status).toBe(401);
  });
});

describe("M6 — oracle d'existence d'email", () => {
  it("vérifie le mot de passe avant de révéler qu'un email est déjà utilisé", async () => {
    const victim = await createYoung();
    const attacker = await createYoung();

    const res = await request(getAppHelper(attacker as any, "young")).post("/young/email").send({ email: victim.email, password: WRONG_PASSWORD });

    // Sans le bon mot de passe, la réponse ne doit rien dire de l'email visé.
    expect(res.body.code).not.toBe("EMAIL_ALREADY_USED");
    expect(res.status).toBe(400);
  });
});

describe("M3 — oracle à l'inscription", () => {
  // L'inscription en ligne est fermée : /preinscription redirige vers
  // snu.gouv.fr/inscriptions-cloturees et plus aucun appelant de /young/signup
  // ne subsiste dans le dépôt. Une route d'inscription publique ne peut pas se
  // protéger d'un oracle d'énumération par un simple code d'erreur — « compte
  // créé » contre « compte pas créé » reste discriminant. On ferme la route.
  const payload = {
    email: "nouveau@example.org",
    password: PASSWORD,
    phone: "0612345678",
    phoneZone: "FRANCE",
    firstName: "Camille",
    lastName: "DURAND",
    birthdateAt: "2008-05-05",
    frenchNationality: "true",
    schooled: "true",
    grade: "3eme",
    cohort: "Juillet 2023",
  };

  it("refuse l'inscription volontaire", async () => {
    const res = await request(getAppHelper()).post("/young/signup").send(payload);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("OPERATION_NOT_ALLOWED");
    expect(await YoungModel.countDocuments({ email: payload.email })).toBe(0);
  });

  it("refuse l'inscription CLE", async () => {
    const res = await request(getAppHelper())
      .post("/young/signup")
      .send({ ...payload, source: "CLE", classeId: "6555dc6dd0b9b4b5b3b3a3a3" });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("OPERATION_NOT_ALLOWED");
  });

  it("répond la même chose pour une personne inscrite et une inconnue", async () => {
    const existing = await createYoung({ firstName: "Camille", lastName: "DURAND" });
    const app = getAppHelper();

    const known = await request(app)
      .post("/young/signup")
      .send({ ...payload, firstName: existing.firstName, lastName: existing.lastName, birthdateAt: existing.birthdateAt });
    const unknown = await request(app)
      .post("/young/signup")
      .send({ ...payload, firstName: "Inconnu", lastName: "PERSONNE", birthdateAt: "2008-01-01" });

    expect(known.status).toBe(unknown.status);
    expect(known.body.code).toBe(unknown.body.code);
  });
});

describe("M42/M65 — rate limiting des routes d'auth", () => {
  it("bloque une rafale de signin venant de la même IP", async () => {
    const app = getAppHelper();
    const statuses: number[] = [];

    for (let i = 0; i < 25; i++) {
      // Emails inexistants : aucun compteur par compte ne peut freiner l'attaquant.
      const res = await request(app).post("/young/signin").send({ email: `inconnu-${i}@example.org`, password: WRONG_PASSWORD });
      statuses.push(res.status);
    }

    expect(statuses).toContain(429);
  });
});

describe("PL3 — rate limiting de /young/signup_invite", () => {
  // M43 : /young/signup_verify est supprimée (voir young.test.ts), le test de rafale sur cette
  // route n'a plus d'objet ; celui sur signup_invite, route sœur partageant le même
  // youngSigninLimiter, reste la non-régression de PL3.
  it("bloque une rafale de signup_invite venant de la même IP", async () => {
    const app = getAppHelper();
    const statuses: number[] = [];

    for (let i = 0; i < 25; i++) {
      const res = await request(app)
        .post("/young/signup_invite")
        .set("Content-Type", "application/json")
        .send({ invitationToken: `jeton-${i}`, email: `x-${i}@example.org`, password: WRONG_PASSWORD });
      statuses.push(res.status);
    }

    expect(statuses).toContain(429);
  });
});

describe("PM31 — requireJsonBody sur les routes d'activation (login CSRF résiduel)", () => {
  it("refuse young/signup_invite en dehors de application/json", async () => {
    const res = await request(getAppHelper()).post("/young/signup_invite").type("form").send({ invitationToken: "x", email: "x@example.org", password: "x" });

    expect(res.status).toBe(415);
  });

  it("accepte young/signup_invite en JSON (avant l'échec métier attendu sur un jeton invalide)", async () => {
    const res = await request(getAppHelper()).post("/young/signup_invite").set("Content-Type", "application/json").send({ invitationToken: "x", email: "x@example.org", password: "x" });

    expect(res.status).not.toBe(415);
  });

  it("refuse referent/signup_invite en dehors de application/json", async () => {
    const res = await request(getAppHelper())
      .post("/referent/signup_invite")
      .type("form")
      .send({ invitationToken: "x", email: "x@example.org", password: "x", acceptCGU: "true" });

    expect(res.status).toBe(415);
  });

  it("accepte referent/signup_invite en JSON (avant l'échec métier attendu sur un jeton invalide)", async () => {
    const res = await request(getAppHelper())
      .post("/referent/signup_invite")
      .set("Content-Type", "application/json")
      .send({ invitationToken: "x", email: "x@example.org", password: "x", acceptCGU: "true" });

    expect(res.status).not.toBe(415);
  });
});
