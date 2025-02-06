import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { isAdmin } from "snu-lib";
import { JeuneDepartementGuard } from "./JeuneDepartement.guard";
import { JeuneGuardService } from "./JeuneGuard.service";
import { JeuneRegionGuard } from "./JeuneRegion.guard";

@Injectable()
export class JeuneReferentGuard implements CanActivate {
    constructor(
        private readonly jeuneDepartementGuard: JeuneDepartementGuard,
        private readonly jeuneRegionGuard: JeuneRegionGuard,
        private readonly jeuneGuardService: JeuneGuardService,
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<CustomRequest>();
        request.jeune = await this.jeuneGuardService.findJeune(request);

        // TODO : request.user mapping
        if (isAdmin({ role: request.user.role })) {
            return true;
        }

        return (
            (await this.jeuneDepartementGuard.canActivate(context)) ||
            (await this.jeuneRegionGuard.canActivate(context))
        );
    }
}
