import { NextFunction, Request, Response } from "express";

/**
 * Contrôle d'hôte (L46 de l'audit du 21/09/2026).
 *
 * L'origine Clever Cloud d'apiv2 (`app-….cleverapps.io`) est joignable directement, sans passer
 * par le WAF. Refuser tout `Host` qui n'est pas celui de APIV2_URL ferme ce contournement côté
 * application ; restreindre l'origine au WAF reste à faire côté infrastructure.
 *
 * `GET /` et `GET /health` restent ouverts : ce sont les sondes de disponibilité (start-nginx.sh
 * interroge 127.0.0.1:3001) et elles ne renvoient rien de sensible.
 */
const ROUTES_DE_SONDE = new Set(["/", "/health", "/v2", "/v2/", "/v2/health"]);

export function hotesAutorises(apiv2Url: string, hotesSupplementaires: string): Set<string> {
    const hotes = new Set<string>([new URL(apiv2Url).hostname.toLowerCase()]);
    for (const hote of hotesSupplementaires.split(",")) {
        const nettoye = hote.trim().toLowerCase();
        if (nettoye) {
            hotes.add(nettoye);
        }
    }
    return hotes;
}

/** Hôte de la requête, sans port. `req.hostname` dépend de `trust proxy` : on lit l'en-tête brut. */
function hoteDeLaRequete(req: Request): string {
    const host = (req.headers.host ?? "").trim().toLowerCase();
    // IPv6 entre crochets : [::1]:8080
    if (host.startsWith("[")) {
        return host.slice(0, host.indexOf("]") + 1);
    }
    return host.split(":")[0];
}

export function hostGuard(hotes: Set<string>) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.method === "GET" && ROUTES_DE_SONDE.has(req.path)) {
            return next();
        }
        if (hotes.has(hoteDeLaRequete(req))) {
            return next();
        }
        return res.status(421).json({ ok: false, code: "MISDIRECTED_REQUEST" });
    };
}
