/**
 * Authentification du webhook d'import Brevo (H77).
 *
 * Le webhook était protégé par un simple filtrage d'IP lu dans `X-Forwarded-For`, en-tête
 * fourni par le client : n'importe qui pouvait déclencher l'envoi immédiat d'une campagne
 * emailing en devinant un `processId` (entier séquentiel). L'URL de rappel étant construite
 * par nos soins et transmise à Brevo à chaque import, elle porte désormais un jeton signé.
 */
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";

import { PlanMarketingWebhookService } from "./PlanMarketingWebhook.service";

describe("PlanMarketingWebhookService", () => {
    const construire = async (jwtSecret: string) => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlanMarketingWebhookService,
                {
                    provide: ConfigService,
                    useValue: {
                        getOrThrow: (cle: string) =>
                            ({ "auth.jwtSecret": jwtSecret, "urls.apiv2": "https://api.snu.example.org/v2" })[cle],
                    },
                },
            ],
        }).compile();
        return module.get(PlanMarketingWebhookService);
    };

    it("construit une URL de rappel portant le jeton", async () => {
        const service = await construire("secret-de-test");

        const url = new URL(service.construireUrlWebhook());

        expect(url.pathname).toBe("/v2/plan-marketing/import/webhook");
        expect(url.searchParams.get("token")).toEqual(expect.any(String));
        expect(url.searchParams.get("token")).not.toBe("");
    });

    it("accepte le jeton qu'il a lui-même émis", async () => {
        const service = await construire("secret-de-test");
        const jeton = new URL(service.construireUrlWebhook()).searchParams.get("token")!;

        expect(service.verifierJeton(jeton)).toBe(true);
    });

    it("refuse un jeton absent", async () => {
        const service = await construire("secret-de-test");

        expect(service.verifierJeton(undefined)).toBe(false);
        expect(service.verifierJeton("")).toBe(false);
    });

    it("refuse un jeton dérivé d'un autre secret", async () => {
        const jetonAutreInstance = new URL(
            (await construire("un-autre-secret")).construireUrlWebhook(),
        ).searchParams.get("token")!;

        expect((await construire("secret-de-test")).verifierJeton(jetonAutreInstance)).toBe(false);
    });

    it("refuse un jeton de longueur différente sans lever d'exception", async () => {
        const service = await construire("secret-de-test");

        expect(service.verifierJeton("court")).toBe(false);
    });
});
