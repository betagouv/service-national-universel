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

/** Vide tous les compteurs. Réservé aux tests. */
export function resetRateLimiters(): void {
  for (const store of stores) {
    store.resetAll?.();
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
};

export function authRateLimiter({ windowMs, limit, prefix, skipSuccessfulRequests = false }: LimiterOptions): RateLimitRequestHandler {
  const options: Partial<Options> = {
    windowMs,
    limit,
    skipSuccessfulRequests,
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
