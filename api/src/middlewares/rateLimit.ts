/**
 * Rate limiting des routes d'authentification (M42 / M65 de l'audit du 21/09/2026).
 *
 * Les compteurs par compte (`loginAttempts`, `attempts2FA`…) ne freinent qu'un
 * attaquant qui s'acharne sur UN compte. Ils ne font rien contre l'énumération
 * d'emails, le password spraying sur des milliers de comptes, ni contre l'abus
 * des routes qui envoient un email ou réécrivent un token (`forgot_password`,
 * `signup_retry`, `email-validation`). C'est le rôle de ce limiteur par IP.
 *
 * Le compteur vit dans le Redis déjà utilisé par l'API : sans lui, chaque
 * instance appliquerait son propre quota, et le plafond effectif serait
 * multiplié par le nombre d'instances.
 */
import rateLimit, { Options, RateLimitRequestHandler, MemoryStore, Store } from "express-rate-limit";
import { RedisStore, RedisReply } from "rate-limit-redis";

import { getRedisClient } from "../redis";
import { capture } from "../sentry";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/**
 * Regroupe une adresse IPv6 par bloc /64 — le sous-réseau qu'un fournisseur alloue en général à un
 * seul client — pour qu'une rotation d'adresses dans le même bloc ne rouvre pas indéfiniment le
 * quota (PM26, 25/09/2026) : le keyGenerator par défaut d'express-rate-limit 7.5.1 est `request.ip`,
 * sans agrégation (`ipKeyGenerator` n'existe qu'en v8, non adopté ici). Une IPv4 (y compris une
 * IPv4-mappée `::ffff:a.b.c.d`) est renvoyée telle quelle. Une forme inattendue (ni 8 groupes ni
 * `::`) est renvoyée inchangée : mieux vaut un regroupement absent qu'un regroupement erroné.
 */
export function normaliserIp(ipBrute: string): string {
  const ip = ipBrute.split("%")[0]; // zone id (ex. fe80::1%eth0)
  if (!ip.includes(":")) {
    return ip;
  }
  const ipv4Mappee = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (ipv4Mappee) {
    return ipv4Mappee[1];
  }

  const [tete, queue = ""] = ip.split("::");
  const groupesTete = tete ? tete.split(":") : [];
  const groupesQueue = queue ? queue.split(":") : [];
  const manquants = ip.includes("::") ? Math.max(8 - groupesTete.length - groupesQueue.length, 0) : 0;
  const groupes = [...groupesTete, ...Array(manquants).fill("0"), ...groupesQueue];
  if (groupes.length !== 8) {
    return ip;
  }

  return `${groupes.slice(0, 4).join(":")}::/64`;
}

/**
 * Les limiteurs sont instanciés au chargement des modules de routes : un seul
 * jeu de compteurs par process, ce qui est le comportement attendu en
 * production mais isole mal les tests. On garde une référence sur les stores
 * pour pouvoir les vider entre deux cas (cf. resetRateLimiters).
 */
const stores: Store[] = [];

function buildStore(prefix: string): Store {
  try {
    const client = getRedisClient();
    if (client?.isReady) {
      const store = new RedisStore({
        prefix: `rl:${prefix}:`,
        sendCommand: (...args: string[]) => client.sendCommand(args) as Promise<RedisReply>,
      });
      stores.push(store);
      return store;
    }
  } catch (error) {
    capture(error);
  }
  // Dev, tests, ou Redis indisponible : compteur local à l'instance.
  const store = new MemoryStore();
  stores.push(store);
  return store;
}

/**
 * Vide tous les compteurs. Réservé aux tests.
 *
 * `shutdown()` coupe aussi l'intervalle de rotation de fenêtre du MemoryStore.
 * Cet intervalle est `unref`é — il n'empêche pas le process de sortir — mais il
 * garde une référence forte sur le store et ses tables de hits, qui survivraient
 * donc à la réinitialisation du registre de modules entre fichiers de test. Les
 * compteurs restent exploitables ensuite : c'est cette fonction qui les remet à
 * zéro, pas la rotation automatique.
 */
export function resetRateLimiters(): void {
  for (const store of stores) {
    store.resetAll?.();
    store.shutdown?.();
  }
}

type LimiterOptions = {
  /** Fenêtre d'observation. */
  windowMs: number;
  /** Nombre de requêtes autorisées par IP sur la fenêtre. */
  limit: number;
  /** Préfixe des clés Redis, pour que chaque route ait son propre quota. */
  prefix: string;
  /** Ne compter que les requêtes refusées (utile pour les routes de connexion). */
  skipSuccessfulRequests?: boolean;
  /** Avec `skipSuccessfulRequests` : ce qui compte comme un succès (par défaut, un statut < 400). */
  requestWasSuccessful?: Options["requestWasSuccessful"];
  /** Clé du compteur : l'IP par défaut. */
  keyGenerator?: Options["keyGenerator"];
};

export function authRateLimiter({ windowMs, limit, prefix, skipSuccessfulRequests = false, requestWasSuccessful, keyGenerator }: LimiterOptions): RateLimitRequestHandler {
  const options: Partial<Options> = {
    windowMs,
    limit,
    skipSuccessfulRequests,
    ...(requestWasSuccessful ? { requestWasSuccessful } : {}),
    // PM26 : sans keyGenerator explicite, on remplace le défaut d'express-rate-limit (`request.ip`
    // brut) par la même IP regroupée par /64 — jamais l'IP nue, même pour un appelant du module.
    keyGenerator: keyGenerator ?? ((req) => normaliserIp(req.ip ?? "")),
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).send({ ok: false, code: "TOO_MANY_REQUESTS" }),
    store: buildStore(prefix),
  };
  return rateLimit(options);
}

/** Connexion et 2FA : seules les tentatives refusées consomment du quota. */
export const signinRateLimiter = () => authRateLimiter({ prefix: "signin", windowMs: 15 * MINUTE, limit: 20, skipSuccessfulRequests: true });

/** Routes qui envoient un email ou réécrivent un token : quota plus serré. */
export const emailSendingRateLimiter = (prefix: string) => authRateLimiter({ prefix, windowMs: HOUR, limit: 10 });

/**
 * Routes authentifiées qui renseignent sur des comptes tiers (M70) : le quota suit le compte
 * appelant, pas l'IP, pour qu'un compte ne le contourne pas en changeant d'adresse. À monter
 * après l'authentification.
 */
export const userRateLimiter = ({ prefix, windowMs, limit }: { prefix: string; windowMs: number; limit: number }) =>
  authRateLimiter({
    prefix,
    windowMs,
    limit,
    keyGenerator: (req) => {
      const userId = (req as any).user?._id;
      return userId ? `user:${userId}` : `ip:${normaliserIp(req.ip ?? "")}`;
    },
  });
