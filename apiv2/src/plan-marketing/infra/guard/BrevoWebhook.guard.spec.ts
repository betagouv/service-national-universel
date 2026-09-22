/**
 * Garde du webhook d'import Brevo (H77).
 *
 * L'ancien garde n'acceptait qu'une plage d'IP, mais lisait cette IP dans `X-Forwarded-For`,
 * en-tête fourni par le client : un anonyme pouvait la forger et déclencher l'envoi immédiat
 * d'une campagne emailing en devinant un `processId`. L'authentification repose désormais sur
 * le jeton signé que porte l'URL de rappel remise à Brevo.
 */
import { ExecutionContext } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ROLES, SUB_ROLE_GOD } from "snu-lib";

import { PlanMarketingWebhookService } from "@plan-marketing/core/service/PlanMarketingWebhook.service";
import { BrevoWebhookGuard } from "./BrevoWebhook.guard";

const JETON_VALIDE = "jeton-attendu";
const IP_BREVO = "1.179.112.5";

describe("BrevoWebhookGuard", () => {
    let guard: BrevoWebhookGuard;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BrevoWebhookGuard,
                {
                    provide: PlanMarketingWebhookService,
                    useValue: { verifierJeton: (jeton?: string) => jeton === JETON_VALIDE },
                },
            ],
        }).compile();

        guard = module.get<BrevoWebhookGuard>(BrevoWebhookGuard);
    });

    const contexte = ({
        token,
        ip,
        xForwardedFor,
        user,
    }: {
        token?: string;
        ip?: string;
        xForwardedFor?: string;
        user?: { role: string; sousRole?: string };
    }) =>
        ({
            switchToHttp: () => ({
                getRequest: () => ({
                    ip,
                    query: token === undefined ? {} : { token },
                    headers: { "x-forwarded-for": xForwardedFor },
                    user,
                }),
            }),
        }) as ExecutionContext;

    it("accepte une requête portant le jeton de l'URL de rappel", async () => {
        expect(await guard.canActivate(contexte({ token: JETON_VALIDE }))).toBe(true);
    });

    it("refuse une requête sans jeton", async () => {
        expect(await guard.canActivate(contexte({}))).toBe(false);
    });

    it("refuse un jeton erroné", async () => {
        expect(await guard.canActivate(contexte({ token: "jeton-devine" }))).toBe(false);
    });

    it("refuse une IP de la plage Brevo annoncée par le client dans X-Forwarded-For", async () => {
        expect(await guard.canActivate(contexte({ xForwardedFor: `${IP_BREVO}, 10.0.0.1` }))).toBe(false);
    });

    it("refuse une requête reçue depuis la plage Brevo sans jeton", async () => {
        expect(await guard.canActivate(contexte({ ip: IP_BREVO }))).toBe(false);
    });

    it("accepte un super-administrateur authentifié (rejeu manuel)", async () => {
        expect(
            await guard.canActivate(contexte({ user: { role: ROLES.ADMIN, sousRole: SUB_ROLE_GOD } })),
        ).toBe(true);
    });

    it("refuse un administrateur qui n'est pas super-administrateur", async () => {
        expect(await guard.canActivate(contexte({ user: { role: ROLES.ADMIN } }))).toBe(false);
    });
});
