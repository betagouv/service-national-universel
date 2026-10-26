import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { PlanMarketingWebhookService } from "@plan-marketing/core/service/PlanMarketingWebhook.service";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { isSuperAdmin } from "snu-lib";

/**
 * Le webhook d'import Brevo s'authentifie par le jeton signé que porte l'URL de rappel
 * transmise à Brevo au moment de l'import.
 *
 * Le filtrage par plage d'IP qui le précédait lisait `X-Forwarded-For`, en-tête fourni par le
 * client : il suffisait de l'annoncer pour déclencher, sans aucune authentification, l'envoi
 * immédiat d'une campagne emailing (processId entier séquentiel, donc énumérable).
 */
@Injectable()
export class BrevoWebhookGuard implements CanActivate {
    constructor(private readonly planMarketingWebhookService: PlanMarketingWebhookService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<CustomRequest>();

        if (request.user?.role && isSuperAdmin({ role: request.user.role, subRole: request.user.sousRole })) {
            return true;
        }

        return this.planMarketingWebhookService.verifierJeton(request.query?.token as string | undefined);
    }
}
