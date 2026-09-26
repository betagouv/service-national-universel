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
 */
import request from "supertest";
import jwt from "jsonwebtoken";

import getAppHelper, { resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose, clearDatabase } from "./helpers/db";
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper } from "./helpers/young";
import { createReferentHelper } from "./helpers/referent";
import { getNewReferentFixture } from "./fixtures/referent";
import { YoungModel } from "../models";
import { config } from "../config";
import { JWT_SIGNIN_VERSION, JWT_SIGNIN_MAX_AGE_SEC } from "../jwt-options";
import { ROLES } from "snu-lib";
import { sendTemplate } from "../brevo";

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

describe("M4 — brute force du mot de passe par requêtes concurrentes", () => {
  it("compte chaque tentative échouée, même lancées en parallèle", async () => {
    const young = await createYoung();
    const app = getAppHelper();
    const BURST = 10;

    await Promise.all(Array.from({ length: BURST }, () => signin(app, young.email, WRONG_PASSWORD)));

    const after = await YoungModel.findById(young._id);
    // Avec un « lire, incrémenter, sauver » non atomique, les N requêtes lisent
    // toutes loginAttempts=0 et le compteur finit à 1 au lieu de BURST.
    expect(after!.loginAttempts).toBe(BURST);
  });

  it("verrouille le compte après la rafale : même le bon mot de passe est refusé", async () => {
    const young = await createYoung();
    const app = getAppHelper();

    await Promise.all(Array.from({ length: 10 }, () => signin(app, young.email, WRONG_PASSWORD)));

    // Le plafond de 5 essais doit être atteint : la tentative suivante, même avec le bon mot de
    // passe, est refusée pour dépassement (PM5 : un mot de passe faux ne le révèle plus, cf. ci-dessous).
    const next = await signin(app, young.email, PASSWORD);
    expect(next.body.code).toBe("TOO_MANY_REQUESTS");
  });
});

describe("PM5 — oracle d'existence de compte sur /young|referent/signin (résiduel de M4)", () => {
  it("répond exactement pareil (code) à un email inconnu et à un compte verrouillé avec un mauvais mot de passe", async () => {
    const locked = await createYoung();
    const app = getAppHelper();

    await Promise.all(Array.from({ length: 10 }, () => signin(app, locked.email, WRONG_PASSWORD)));
    // Le compte est maintenant verrouillé (cf. test précédent) : un mot de passe faux ne doit plus
    // révéler TOO_MANY_REQUESTS, contrairement au comportement d'avant ce correctif.
    const onLocked = await signin(app, locked.email, WRONG_PASSWORD);
    const onUnknown = await signin(app, `inconnu-${Date.now()}@example.org`, WRONG_PASSWORD);

    expect(onLocked.status).toBe(onUnknown.status);
    expect(onLocked.body.code).toBe(onUnknown.body.code);
    expect(onLocked.body.code).toBe("EMAIL_OR_PASSWORD_INVALID");
  });

  it("ne révèle TOO_MANY_REQUESTS qu'à qui connaît le bon mot de passe", async () => {
    const young = await createYoung();
    const app = getAppHelper();

    await Promise.all(Array.from({ length: 10 }, () => signin(app, young.email, WRONG_PASSWORD)));

    const wrongPassword = await signin(app, young.email, WRONG_PASSWORD);
    const rightPassword = await signin(app, young.email, PASSWORD);

    expect(wrongPassword.body.code).toBe("EMAIL_OR_PASSWORD_INVALID");
    expect(rightPassword.body.code).toBe("TOO_MANY_REQUESTS");
  });

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
    expect(after!.loginAttempts).toBe(10);

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

describe("PL3 — rate limiting de /young/signup_verify et /young/signup_invite", () => {
  it("bloque une rafale de signup_verify venant de la même IP", async () => {
    const app = getAppHelper();
    const statuses: number[] = [];

    for (let i = 0; i < 25; i++) {
      const res = await request(app).post("/young/signup_verify").send({ invitationToken: `jeton-${i}` });
      statuses.push(res.status);
    }

    expect(statuses).toContain(429);
  });

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
