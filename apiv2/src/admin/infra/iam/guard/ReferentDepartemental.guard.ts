import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { isReferentDep, isReferentReg } from "snu-lib";

@Injectable()
export class ReferentDepartementalGuard implements CanActivate {
    constructor() {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // TODO : request.user mapping
        if (isReferentDep({ role: request.user.role, subRole: request.user.sousRole })) {
            return true;
        }

        return false;
    }
}
