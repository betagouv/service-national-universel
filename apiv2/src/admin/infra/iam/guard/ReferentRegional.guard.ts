import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { isReferentReg } from "snu-lib";

@Injectable()
export class ReferentRegionalGuard implements CanActivate {
    constructor() {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // TODO : request.user mapping
        if (isReferentReg({ role: request.user.role, subRole: request.user.sousRole })) {
            return true;
        }

        return false;
    }
}
