/**
 * Reproduction des constats M46 / M47 de l'audit sécurité du 21/09/2026 (lot T3) :
 * flux FranceConnect non lié à une session.
 *
 *   M46  POST /young/france-connect/authorization-url — route publique sans limite de débit, deux
 *                                                        clés Redis de 30 min par appel
 *   M47  POST /young/france-connect/user-info         — state/nonce jamais consommés (rejouables),
 *                                                        id_token lu par `jwt.decode` sans vérification,
 *                                                        state utilisable depuis n'importe quel navigateur
 */
import fetch from "node-fetch";
import request from "supertest";
import jwt from "jsonwebtoken";
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair, KeyLike } from "jose";

import { config } from "../config";
import { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";

const mockRedisStore = new Map<string, { value: string; ttl: number }>();
jest.mock("../redis", () => {
  const client = {
    setEx: (key: string, ttl: number, value: string) => {
      mockRedisStore.set(key, { value, ttl });
      return Promise.resolve("OK");
    },
    get: (key: string) => Promise.resolve(mockRedisStore.get(key)?.value ?? null),
    getDel: (key: string) => {
      const entry = mockRedisStore.get(key);
      mockRedisStore.delete(key);
      return Promise.resolve(entry?.value ?? null);
    },
    del: (key: string) => Promise.resolve(mockRedisStore.delete(key) ? 1 : 0),
  };
  return { getRedisClient: () => client, initRedisClient: () => Promise.resolve(), closeRedisClient: () => Promise.resolve() };
});

// Les clés publiques de FranceConnect sont remplacées par un jeu local généré pour le test.
let mockKeySet: any;
jest.mock("jose", () => {
  const actual = jest.requireActual("jose");
  return { ...actual, createRemoteJWKSet: () => (header, token) => mockKeySet(header, token) };
});

jest.mock("node-fetch");
const mockedFetch = fetch as unknown as jest.Mock;

const CLIENT_ID = "snu-client-id-test";
const CLIENT_SECRET = "snu-client-secret-test-0123456789abcdef";
const SUB = "sub-franceconnect-de-la-mere";
const KID = "cle-fc-test";

let fcPrivateKey: KeyLike;
let attackerPrivateKey: KeyLike;
const originalConfig = { ...config };

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  Object.assign(config, { FRANCE_CONNECT_CLIENT_ID: CLIENT_ID, FRANCE_CONNECT_CLIENT_SECRET: CLIENT_SECRET });
  const fc = await generateKeyPair("ES256");
  fcPrivateKey = fc.privateKey;
  attackerPrivateKey = (await generateKeyPair("ES256")).privateKey;
  mockKeySet = createLocalJWKSet({ keys: [{ ...(await exportJWK(fc.publicKey)), kid: KID, alg: "ES256", use: "sig" }] });
});
afterAll(async () => {
  Object.assign(config, originalConfig);
  await dbClose();
});
beforeEach(() => {
  mockRedisStore.clear();
  mockedFetch.mockReset();
});
afterEach(resetAppAuth);

const issuer = () => config.FRANCE_CONNECT_URL.replace(/\/+$/, "");

function signIdToken({
  nonce,
  key = fcPrivateKey,
  audience = CLIENT_ID,
  iss = issuer(),
  expiresIn = "5m",
}: {
  nonce: string;
  key?: KeyLike;
  audience?: string;
  iss?: string;
  expiresIn?: string;
}) {
  return new SignJWT({ nonce, given_name: "Marie", family_name: "DUPONT" })
    .setProtectedHeader({ alg: "ES256", kid: KID })
    .setSubject(SUB)
    .setIssuer(iss)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

/** Réponses de FranceConnect : /token renvoie l'id_token donné, /userinfo une identité JSON. */
function mockFranceConnect(idToken: string, userInfo: Record<string, any> = { sub: SUB, given_name: "Marie", family_name: "DUPONT", email: "marie.dupont@example.org" }) {
  mockedFetch.mockImplementation((url: string) => {
    if (url.endsWith("/token")) return Promise.resolve({ status: 200, json: () => Promise.resolve({ access_token: "access-token-fc", id_token: idToken }) });
    if (url.endsWith("/userinfo")) {
      return Promise.resolve({ status: 200, headers: { get: () => "application/json" }, text: () => Promise.resolve(JSON.stringify(userInfo)) });
    }
    return Promise.reject(new Error(`URL inattendue : ${url}`));
  });
}

/** Lance le flux comme le navigateur du parent : URL d'autorisation + cookie de liaison. */
async function startFlow(app) {
  const res = await request(app).post("/young/france-connect/authorization-url").send({ callback: "representants-legaux/france-connect-callback" });
  expect(res.statusCode).toEqual(200);
  const url = new URL(res.body.data.url);
  const cookie = (res.headers["set-cookie"] as unknown as string[]).find((c) => c.startsWith("fc_binding="))!;
  return { state: url.searchParams.get("state")!, nonce: url.searchParams.get("nonce")!, cookie: cookie.split(";")[0] };
}

function userInfo(app, state: string, cookie?: string) {
  const req = request(app).post("/young/france-connect/user-info");
  if (cookie) req.set("Cookie", cookie);
  return req.send({ code: "code-fc", callback: "representants-legaux/france-connect-callback", state });
}

describe("POST /young/france-connect/authorization-url (M46)", () => {
  it("stocke state → nonce dans une seule clé Redis de 10 min, sous un préfixe dédié", async () => {
    const app = await getAppHelperWithAcl();
    const { state, nonce } = await startFlow(app);

    expect([...mockRedisStore.keys()]).toEqual([`franceConnect:authState:${state}`]);
    const entry = mockRedisStore.get(`franceConnect:authState:${state}`)!;
    expect(entry.ttl).toEqual(600);
    expect(JSON.parse(entry.value).nonce).toEqual(nonce);
  });

  it("limite le débit par IP", async () => {
    const app = await getAppHelperWithAcl();
    for (let i = 0; i < 60; i++) {
      const res = await request(app).post("/young/france-connect/authorization-url").send({ callback: "cb" });
      expect(res.statusCode).toEqual(200);
    }
    const res = await request(app).post("/young/france-connect/authorization-url").send({ callback: "cb" });
    expect(res.statusCode).toEqual(429);
  });
});

describe("POST /young/france-connect/user-info (M47)", () => {
  it("échange le code quand state, cookie, signature et nonce concordent", async () => {
    const app = await getAppHelperWithAcl();
    const { state, nonce, cookie } = await startFlow(app);
    mockFranceConnect(await signIdToken({ nonce }));

    const res = await userInfo(app, state, cookie);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.email).toEqual("marie.dupont@example.org");
    expect(res.body.franceConnectTicket).toEqual(expect.any(String));
    expect(mockRedisStore.has(`franceConnect:authState:${state}`)).toBe(false);
  });

  it("refuse un state inconnu sans appeler FranceConnect", async () => {
    const app = await getAppHelperWithAcl();
    const { cookie } = await startFlow(app);

    const res = await userInfo(app, "state-jamais-emis", cookie);

    expect(res.statusCode).toEqual(403);
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it("refuse le rejeu d'un state déjà consommé", async () => {
    const app = await getAppHelperWithAcl();
    const { state, nonce, cookie } = await startFlow(app);
    mockFranceConnect(await signIdToken({ nonce }));

    expect((await userInfo(app, state, cookie)).statusCode).toEqual(200);
    const replay = await userInfo(app, state, cookie);

    expect(replay.statusCode).toEqual(403);
  });

  it("refuse un id_token dont la signature n'est pas celle de FranceConnect", async () => {
    const app = await getAppHelperWithAcl();
    const { state, nonce, cookie } = await startFlow(app);
    mockFranceConnect(await signIdToken({ nonce, key: attackerPrivateKey }));

    const res = await userInfo(app, state, cookie);

    expect(res.statusCode).toEqual(403);
    expect(res.body.franceConnectTicket).toBeUndefined();
  });

  it("refuse un id_token non signé, même au bon nonce (jwt.decode ne suffit plus)", async () => {
    const app = await getAppHelperWithAcl();
    const { state, nonce, cookie } = await startFlow(app);
    const b64 = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
    const exp = Math.floor(Date.now() / 1000) + 300;
    const unsigned = `${b64({ alg: "none", typ: "JWT" })}.${b64({ nonce, sub: SUB, aud: CLIENT_ID, iss: issuer(), exp })}.`;
    mockFranceConnect(unsigned);

    expect((await userInfo(app, state, cookie)).statusCode).toEqual(403);
  });

  it("refuse un id_token signé en HS256 avec une autre clé que le client_secret", async () => {
    const app = await getAppHelperWithAcl();
    const { state, nonce, cookie } = await startFlow(app);
    mockFranceConnect(jwt.sign({ nonce, sub: SUB }, "mysecretkey", { audience: CLIENT_ID, issuer: issuer(), expiresIn: "5m" }));

    expect((await userInfo(app, state, cookie)).statusCode).toEqual(403);
  });

  it("accepte un id_token HS256 signé avec le client_secret", async () => {
    const app = await getAppHelperWithAcl();
    const { state, nonce, cookie } = await startFlow(app);
    mockFranceConnect(jwt.sign({ nonce, sub: SUB }, CLIENT_SECRET, { audience: CLIENT_ID, issuer: issuer(), expiresIn: "5m" }));

    expect((await userInfo(app, state, cookie)).statusCode).toEqual(200);
  });

  it("refuse un id_token dont le nonce n'est pas celui du state", async () => {
    const app = await getAppHelperWithAcl();
    const first = await startFlow(app);
    const second = await startFlow(app);
    mockFranceConnect(await signIdToken({ nonce: second.nonce }));

    expect((await userInfo(app, first.state, first.cookie)).statusCode).toEqual(403);
  });

  it("refuse un id_token émis pour un autre client, par un autre émetteur, ou expiré", async () => {
    const app = await getAppHelperWithAcl();
    for (const overrides of [{ audience: "autre-client" }, { iss: "https://idp.example.org" }, { expiresIn: "-10m" }]) {
      const { state, nonce, cookie } = await startFlow(app);
      mockFranceConnect(await signIdToken({ nonce, ...overrides }));
      expect((await userInfo(app, state, cookie)).statusCode).toEqual(403);
    }
  });

  it("refuse un state émis pour un autre navigateur (lien FranceConnect piégé)", async () => {
    const app = await getAppHelperWithAcl();
    const victim = await startFlow(app);

    // Le navigateur de la victime n'a pas de cookie de liaison pour ce state, ou celui d'un autre flux.
    const withoutCookie = await startFlow(app);
    mockFranceConnect(await signIdToken({ nonce: withoutCookie.nonce }));
    expect((await userInfo(app, withoutCookie.state)).statusCode).toEqual(403);

    const withOtherCookie = await startFlow(app);
    mockFranceConnect(await signIdToken({ nonce: withOtherCookie.nonce }));
    expect((await userInfo(app, withOtherCookie.state, victim.cookie)).statusCode).toEqual(403);

    expect(mockedFetch).not.toHaveBeenCalled();
    // Un state présenté depuis le mauvais navigateur est brûlé : le lien piégé ne sert plus.
    expect(mockRedisStore.has(`franceConnect:authState:${withoutCookie.state}`)).toBe(false);
  });

  it("refuse une réponse userinfo dont le sub n'est pas celui de l'id_token", async () => {
    const app = await getAppHelperWithAcl();
    const { state, nonce, cookie } = await startFlow(app);
    mockFranceConnect(await signIdToken({ nonce }), { sub: "autre-sub", given_name: "X", family_name: "Y", email: "x@example.org" });

    expect((await userInfo(app, state, cookie)).statusCode).toEqual(403);
  });
});
