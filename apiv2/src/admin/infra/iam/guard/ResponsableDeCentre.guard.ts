import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { isResponsableDeCentre, isSupervisor } from "snu-lib";

@Injectable()
export class ResponsableDeCentreGuard implements CanActivate {
    constructor() {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // TODO : request.user mapping
        if (isResponsableDeCentre({ role: request.user.role, subRole: request.user.sousRole })) {
            return true;
        }

        return false;
    }
}
