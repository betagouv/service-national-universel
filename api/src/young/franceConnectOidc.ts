import crypto from "crypto";
import { createRemoteJWKSet, jwtVerify, JWTPayload, JWTVerifyGetKey } from "jose";

import { config } from "../config";
import { getRedisClient } from "../redis";

/**
 * Flux OpenID Connect FranceConnect (constats M46 / M47 de l'audit du 21/09/2026).
 *
 * Avant ce module, `state` et `nonce` vivaient dans deux clés Redis indépendantes, 30 min, jamais
 * supprimées : rejouables, et rien ne les reliait entre elles ni au navigateur qui avait lancé le
 * flux. L'id_token était lu par `jwt.decode`, sans vérification : son `nonce` n'avait aucune valeur.
 *
 * Désormais :
 *  - une seule clé `state → { nonce, binding }`, 10 min, consommée par GETDEL (usage unique) ;
 *  - `binding` est l'empreinte d'un secret posé en cookie httpOnly sur le navigateur qui demande
 *    l'URL d'autorisation : un state généré par un tiers (lien piégé envoyé à un adulte) échoue ;
 *  - l'id_token est vérifié par signature (clés JWKS du fournisseur, ou client_secret en HS256),
 *    émetteur, audience et expiration, puis son `nonce` est comparé à celui du state.
 */

export const FRANCE_CONNECT_BINDING_COOKIE = "fc_binding";
export const FRANCE_CONNECT_STATE_TTL_SECONDS = 10 * 60;

const stateKey = (state: string) => `franceConnect:authState:${state}`;
const sha256 = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

type StoredAuthState = { nonce: string; binding: string };

export class FranceConnectVerificationError extends Error {}

/** Crée un couple state/nonce lié au navigateur. Le `binding` est à poser en cookie httpOnly. */
export async function createFranceConnectAuthState(): Promise<{ state: string; nonce: string; binding: string }> {
  const state = crypto.randomBytes(32).toString("hex");
  const nonce = crypto.randomBytes(32).toString("hex");
  const binding = crypto.randomBytes(32).toString("hex");
  const stored: StoredAuthState = { nonce, binding: sha256(binding) };
  await getRedisClient().setEx(stateKey(state), FRANCE_CONNECT_STATE_TTL_SECONDS, JSON.stringify(stored));
  return { state, nonce, binding };
}

/**
 * Consomme le state (GETDEL : un second appel avec le même state ne trouve plus rien) et vérifie
 * qu'il a été émis pour ce navigateur. Renvoie le nonce attendu dans l'id_token, ou `null`.
 */
export async function consumeFranceConnectAuthState(state: string, binding: string | undefined): Promise<string | null> {
  const raw = await getRedisClient().getDel(stateKey(state));
  if (!raw || !binding) return null;
  let stored: StoredAuthState;
  try {
    stored = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!stored?.nonce || !stored?.binding) return null;
  const expected = Buffer.from(stored.binding, "hex");
  const received = Buffer.from(sha256(binding), "hex");
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) return null;
  return stored.nonce;
}

const issuer = () => config.FRANCE_CONNECT_URL.replace(/\/+$/, "");

let remoteKeySet: JWTVerifyGetKey | null = null;

/**
 * Clé de vérification selon l'algorithme annoncé. Les algorithmes asymétriques ne sont vérifiés
 * qu'avec les clés publiques publiées par FranceConnect ; HS256 (proposé par FranceConnect) ne l'est
 * qu'avec le client_secret. Aucune confusion possible : une clé publique n'est jamais utilisée
 * comme secret HMAC.
 */
const getKey: JWTVerifyGetKey = async (header, token) => {
  if (header.alg === "HS256") return new TextEncoder().encode(config.FRANCE_CONNECT_CLIENT_SECRET);
  if (!remoteKeySet) remoteKeySet = createRemoteJWKSet(new URL(`${issuer()}/jwks`));
  return remoteKeySet(header, token);
};

const ALGORITHMS = ["ES256", "RS256", "HS256"];

async function verifyFranceConnectJwt(jwt: string, { idToken }: { idToken: boolean }): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(
      jwt,
      getKey,
      idToken
        ? { issuer: issuer(), audience: config.FRANCE_CONNECT_CLIENT_ID, algorithms: ALGORITHMS, requiredClaims: ["exp", "sub"], clockTolerance: 30 }
        : // Réponse userinfo signée : iss/aud y sont facultatifs (OIDC Core §5.3.2) ; la signature et
          // l'égalité du `sub` avec celui de l'id_token vérifié suffisent à la rattacher.
          { algorithms: ALGORITHMS, clockTolerance: 30 },
    );
    return payload;
  } catch (error) {
    throw new FranceConnectVerificationError(`JWT FranceConnect invalide : ${(error as Error)?.name}`);
  }
}

/** Vérifie l'id_token et son nonce. Lève `FranceConnectVerificationError` sinon. */
export async function verifyFranceConnectIdToken(idToken: string, expectedNonce: string): Promise<JWTPayload> {
  const payload = await verifyFranceConnectJwt(idToken, { idToken: true });
  if (typeof payload.nonce !== "string" || payload.nonce !== expectedNonce) {
    throw new FranceConnectVerificationError("nonce de l'id_token FranceConnect inattendu");
  }
  return payload;
}

/**
 * Lit la réponse du endpoint userinfo. FranceConnect v2 la renvoie signée (`application/jwt`) : sa
 * signature est alors vérifiée. Dans tous les cas, son `sub` doit être celui de l'id_token vérifié
 * (OpenID Connect Core, §5.3.2).
 */
export async function readFranceConnectUserInfo(response: { headers: { get(name: string): string | null }; text(): Promise<string> }, sub: string) {
  const body = await response.text();
  const contentType = response.headers.get("content-type") || "";
  const userInfo: any = contentType.includes("application/jwt") ? await verifyFranceConnectJwt(body.trim(), { idToken: false }) : JSON.parse(body);
  if (!userInfo || userInfo.sub !== sub) throw new FranceConnectVerificationError("sub du userinfo FranceConnect inattendu");
  return userInfo;
}
