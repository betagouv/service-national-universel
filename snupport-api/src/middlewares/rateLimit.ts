// Limiteur de débit pour les routes de connexion agent (PM42, lot P18, audit du 25/09/2026).
//
// snupport-api n'a ni express-rate-limit, ni rate-limit-redis, ni client Redis (contrairement à
// api/src/middlewares/rateLimit.ts) : ce module en est un équivalent minimal, à fenêtre fixe et
// compteur en mémoire, sans nouvelle dépendance npm. Un compteur par process est acceptable ici :
// snupport-api tourne en une seule instance.
import { Request, Response, NextFunction } from "express";

const registries: Map<string, { count: number; resetAt: number }>[] = [];

type LimiterOptions = {
  /** Préfixe des clés, pour que chaque route ait son propre quota. */
  prefix: string;
  /** Fenêtre d'observation, en millisecondes. */
  windowMs: number;
  /** Nombre de requêtes autorisées par IP + email sur la fenêtre. */
  limit: number;
};

/**
 * Limite par couple (IP, email du corps de la requête). Une requête sans email connu (ex. un
 * appel malformé, ou une route qui n'en porte pas) retombe sur l'IP seule.
 */
export function ipEmailRateLimiter({ prefix, windowMs, limit }: LimiterOptions) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  registries.push(hits);

  return (req: Request, res: Response, next: NextFunction) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const key = `${prefix}:${req.ip}:${email}`;
    const now = Date.now();
    const bucket = hits.get(key);

    if (!bucket || bucket.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (bucket.count >= limit) {
      return res.status(429).send({ ok: false, code: "TOO_MANY_REQUESTS" });
    }

    bucket.count += 1;
    next();
  };
}

/** Vide tous les compteurs. Réservé aux tests, pour l'isolation entre cas. */
export function resetRateLimiters(): void {
  for (const hits of registries) hits.clear();
}
