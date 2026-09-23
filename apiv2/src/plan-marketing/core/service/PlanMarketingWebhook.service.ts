import { createHmac, timingSafeEqual } from "crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export const CHEMIN_WEBHOOK_IMPORT = "/plan-marketing/import/webhook";

/**
 * Jeton d'authentification du webhook d'import Brevo.
 *
 * L'URL de rappel est construite par nos soins et transmise à Brevo à chaque import : elle peut
 * donc porter un secret. Celui-ci est dérivé du secret JWT de l'application (pas de variable
 * d'environnement supplémentaire à provisionner, et rotation conjointe), et n'est jamais celui-ci.
 *
 * Il remplace le filtrage sur `X-Forwarded-For`, en-tête fourni par le client, qui laissait
 * n'importe quel anonyme déclencher l'envoi d'une campagne en devinant un `processId`.
 */
@Injectable()
export class PlanMarketingWebhookService {
    constructor(private readonly config: ConfigService) {}

    construireUrlWebhook(): string {
        const base = this.config.getOrThrow<string>("urls.apiv2");
        return `${base}${CHEMIN_WEBHOOK_IMPORT}?token=${this.jetonAttendu()}`;
    }

    verifierJeton(jeton?: string): boolean {
        if (!jeton) {
            return false;
        }
        const attendu = Buffer.from(this.jetonAttendu());
        const fourni = Buffer.from(jeton);
        // `timingSafeEqual` exige des longueurs égales : on les compare d'abord, sans révéler autre chose.
        return attendu.length === fourni.length && timingSafeEqual(attendu, fourni);
    }

    private jetonAttendu(): string {
        return createHmac("sha256", this.config.getOrThrow<string>("auth.jwtSecret"))
            .update(CHEMIN_WEBHOOK_IMPORT)
            .digest("hex");
    }
}
