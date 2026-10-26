/**
 * Rate limiting d'apiv2 (M79 / M80 de l'audit du 21/09/2026).
 *
 * Équivalent v2 de api/src/middlewares/rateLimit.ts : les compteurs vivent dans le Redis du broker
 * pour que le quota soit partagé entre instances. Redis indisponible : la requête passe
 * (`passOnStoreError`), on préfère un limiteur inopérant à une API en panne.
 */
import { Request, Response } from "express";
import rateLimit, {
    ClientRateLimitInfo,
    MemoryStore,
    Options,
    RateLimitRequestHandler,
    Store,
} from "express-rate-limit";
import Redis from "ioredis";
import { lireCookie } from "../../admin/infra/iam/auth/AddUserToRequest.middleware";

/** Cookie httpOnly de session posé par la v1 (api/src/auth.ts) pour l'espace admin. */
const COOKIE_SESSION_ADMIN = "jwt_ref";

const MINUTE = 60 * 1000;

/**
 * Store Redis minimal : `SET NX PX` ouvre la fenêtre, `INCR` compte sans toucher au TTL.
 * Pas de script Lua à précharger : rien ne part en rejet non géré si Redis est absent au démarrage.
 */
export class RedisRateLimitStore implements Store {
    private windowMs = MINUTE;
    readonly localKeys = false;

    constructor(
        private readonly client: Redis,
        readonly prefix: string,
    ) {}

    init(options: Options): void {
        this.windowMs = options.windowMs;
    }

    private cle(key: string): string {
        return `${this.prefix}${key}`;
    }

    async get(key: string): Promise<ClientRateLimitInfo | undefined> {
        const [[, hits], [, ttl]] = (await this.client.multi().get(this.cle(key)).pttl(this.cle(key)).exec()) as [
            [Error | null, string | null],
            [Error | null, number],
        ];
        if (hits === null) {
            return undefined;
        }
        return { totalHits: Number(hits), resetTime: new Date(Date.now() + Math.max(ttl, 0)) };
    }

    async increment(key: string): Promise<ClientRateLimitInfo> {
        const cle = this.cle(key);
        const resultats =
            (await this.client.multi().set(cle, 0, "PX", this.windowMs, "NX").incr(cle).pttl(cle).exec()) ?? [];
        const erreur = resultats.find(([err]) => err)?.[0];
        if (erreur) {
            throw erreur;
        }
        const totalHits = Number(resultats[1][1]);
        const ttl = Number(resultats[2][1]);
        return { totalHits, resetTime: new Date(Date.now() + (ttl > 0 ? ttl : this.windowMs)) };
    }

    async decrement(key: string): Promise<void> {
        await this.client.decr(this.cle(key));
    }

    async resetKey(key: string): Promise<void> {
        await this.client.del(this.cle(key));
    }
}

let client: Redis | undefined;

function redisClient(brokerUrl: string): Redis {
    if (!client) {
        client = new Redis(brokerUrl, {
            // Sans file d'attente hors ligne, une commande échoue tout de suite quand Redis est
            // injoignable au lieu de suspendre la requête HTTP.
            enableOfflineQueue: false,
            maxRetriesPerRequest: 1,
        });
        client.on("error", () => {
            // Les erreurs de connexion sont déjà absorbées par passOnStoreError ; sans écouteur,
            // ioredis les journalise en « Unhandled error event » à chaque tentative.
        });
    }
    return client;
}

export type RateLimitStoreFactory = (prefix: string) => Store;

/** Redis hors tests ; compteur local au process en test. */
export function rateLimitStoreFactory(environment: string, brokerUrl: string): RateLimitStoreFactory {
    if (environment === "test") {
        return () => new MemoryStore();
    }
    return (prefix) => new RedisRateLimitStore(redisClient(brokerUrl), `rl:v2:${prefix}:`);
}

type LimiterOptions = {
    store: Store;
    windowMs: number;
    limit: number;
    /** Clé de comptage ; par défaut l'IP du client (cf. `trust proxy`). */
    keyGenerator?: Options["keyGenerator"];
    /** Ne pas compter la requête (route hors périmètre du limiteur). */
    skip?: Options["skip"];
    /** Ne compter que les requêtes refusées (statut >= 400). */
    skipSuccessfulRequests?: boolean;
};

export function rateLimiter({
    store,
    windowMs,
    limit,
    keyGenerator,
    skip,
    skipSuccessfulRequests = false,
}: LimiterOptions): RateLimitRequestHandler {
    return rateLimit({
        windowMs,
        limit,
        store,
        skipSuccessfulRequests,
        passOnStoreError: true,
        standardHeaders: "draft-7",
        legacyHeaders: false,
        ...(keyGenerator ? { keyGenerator } : {}),
        ...(skip ? { skip } : {}),
        handler: (_req: Request, res: Response) => res.status(429).json({ ok: false, code: "TOO_MANY_REQUESTS" }),
    });
}

/**
 * Routes coûteuses : exports, simulations, validations de simulation et imports. Chacune lance
 * une requête lourde en base, une génération de fichier ou une tâche de fond.
 * Insensible à la casse (PM26, 25/09/2026) : sans le drapeau `i`, `/V2/Export/...` échappait au
 * limiteur couteux alors que la route répond identiquement (le routage Express est lui-même
 * insensible à la casse par défaut).
 */
const ROUTE_COUTEUSE = /\/(export|simulation|valider|import|importer)(\/|$)/i;
/** Appelée par Brevo à la fin d'un import : elle a son propre jeton et ne doit pas être bridée. */
const WEBHOOK_BREVO = /\/plan-marketing\/import\/webhook$/;

/**
 * Regroupe une adresse IPv6 par bloc /64 — le sous-réseau qu'un fournisseur alloue en général à un
 * seul client — pour qu'une rotation d'adresses dans le même bloc ne rouvre pas indéfiniment le
 * quota (PM26, 25/09/2026) : express-rate-limit 7.5.1 n'agrège pas nativement (`ipKeyGenerator`
 * n'existe qu'en v8, non adopté ici). Une IPv4 (y compris une IPv4-mappée `::ffff:a.b.c.d`) est
 * renvoyée telle quelle. Une forme inattendue (ni 8 groupes ni `::`) est renvoyée inchangée : mieux
 * vaut un regroupement absent qu'un regroupement erroné.
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

export function estRouteCouteuse(req: Request): boolean {
    return req.method === "POST" && ROUTE_COUTEUSE.test(req.path) && !WEBHOOK_BREVO.test(req.path);
}

/**
 * Jeton de session admin porté par le cookie httpOnly `jwt_ref`, pour la clé du rate limiter
 * (PM41, 25/09/2026). L'admin s'authentifie surtout par ce cookie depuis GOO-16 (le JWT n'est plus
 * posé en localStorage) : sans ce repli, la clé de comptage retombait systématiquement sur l'IP
 * pour lui, jamais sur son identifiant. Même restriction d'origine que
 * `AddUserToRequestMiddleware.extraireJeton` (le cookie est partagé par tous les sous-domaines :
 * une autre origine ne doit pas pouvoir s'en réclamer).
 */
export function jetonCookieAdmin(req: Pick<Request, "headers">, urlAdmin: string): string | undefined {
    if (req.headers.origin !== urlAdmin) {
        return undefined;
    }
    return lireCookie(req.headers.cookie, COOKIE_SESSION_ADMIN);
}

export const RATE_LIMITS = {
    /** Plafond global, large : l'admin enchaîne beaucoup d'appels par page. */
    global: { windowMs: 5 * MINUTE, limit: 3000 },
    /** Exports et simulations : une dizaine par quart d'heure couvre l'usage réel. */
    couteux: { windowMs: 15 * MINUTE, limit: 10 },
    /** Bull Board : échecs d'authentification basique. */
    bullBoard: { windowMs: 15 * MINUTE, limit: 20 },
};
