import { NextFunction, Request, Response } from "express";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";

/**
 * Sécurisation de Bull Board (M79 de l'audit du 21/09/2026).
 *
 * Le tableau de bord affiche le contenu des jobs : les emails d'invitation des référents de classe
 * y portent un lien `?token=` qui suffit à activer le compte. Trois protections s'ajoutent à
 * l'authentification basique : liste d'IP autorisées, limiteur d'échecs (cf. RateLimit.ts), et
 * masquage des secrets dans ce que l'interface renvoie.
 */

const MASQUE = "[masqué]";
const CLE_SECRETE = /token|secret|password|motdepasse|apikey/i;
const PARAMETRE_SECRET = /([?&](?:token|invitationToken|jeton)=)[^&#\s"]*/gi;

export function masquerSecrets(valeur: unknown, profondeur = 0): unknown {
    if (profondeur > 10) {
        return MASQUE;
    }
    if (typeof valeur === "string") {
        return valeur.replace(PARAMETRE_SECRET, `$1${MASQUE}`);
    }
    if (Array.isArray(valeur)) {
        return valeur.map((element) => masquerSecrets(element, profondeur + 1));
    }
    if (valeur && typeof valeur === "object") {
        return Object.fromEntries(
            Object.entries(valeur).map(([cle, contenu]) => [
                cle,
                CLE_SECRETE.test(cle) ? MASQUE : masquerSecrets(contenu, profondeur + 1),
            ]),
        );
    }
    return valeur;
}

/** Adaptateur BullMQ dont les données et résultats de jobs passent par `masquerSecrets`. */
export class MaskedBullMQAdapter extends BullMQAdapter {
    constructor(...args: ConstructorParameters<typeof BullMQAdapter>) {
        super(...args);
        this.setFormatter("data", (data) => masquerSecrets(data));
        this.setFormatter("returnValue", (data) => masquerSecrets(data));
    }
}

/**
 * Liste d'IP autorisées. `ouvert` : pas de liste exigée (dev, tests). Sur un environnement
 * déployé, une liste vide ferme le tableau de bord : on répond 404 pour ne pas en signaler
 * l'existence.
 */
export function bullBoardIpAllowlist(ipsAutorisees: string, ouvert: boolean) {
    const ips = new Set(
        ipsAutorisees
            .split(",")
            .map((ip) => ip.trim())
            .filter(Boolean),
    );
    return (req: Request, res: Response, next: NextFunction) => {
        if (ips.size === 0 && ouvert) {
            return next();
        }
        const ip = (req.ip ?? "").replace(/^::ffff:/, "");
        if (ips.has(ip)) {
            return next();
        }
        return res.status(404).end();
    };
}
